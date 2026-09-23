import type { Severity } from "../types";
import fallbackData from "../data/drugSafetyFallback.json";
import { coreDrugName } from "../lib/drugNames";

const RXNAV_BASE = "https://rxnav.nlm.nih.gov/REST";
const OPENFDA_BASE = "https://api.fda.gov/drug/label.json";

export class DrugApiError extends Error {}

interface ApproxCandidate {
  rxcui?: string;
  name?: string;
  rank?: string;
}

function cleanName(raw: string): string {
  const base =
    raw.toUpperCase() === raw ? raw.replace(/\w\S*/g, (w) => w.charAt(0) + w.slice(1).toLowerCase()) : raw;
  return base.charAt(0).toUpperCase() + base.slice(1);
}

async function safeFetch(url: string, signal?: AbortSignal): Promise<Response> {
  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new DrugApiError("Couldn't reach the live drug database.");
  }
  return res;
}

/** Live medication name lookup against the NIH's RxNorm database (no API key required). */
export async function searchMedicationNames(term: string, signal?: AbortSignal): Promise<string[]> {
  const trimmed = term.trim();
  if (trimmed.length < 2) return [];

  const url = `${RXNAV_BASE}/approximateTerm.json?term=${encodeURIComponent(trimmed)}&maxEntries=20`;
  const res = await safeFetch(url, signal);
  if (!res.ok) throw new DrugApiError(`RxNorm lookup failed (${res.status})`);

  const data = await res.json();
  const candidates: ApproxCandidate[] = data?.approximateGroup?.candidate ?? [];

  const byRxcui = new Map<string, { name: string; rank: number }>();
  for (const c of candidates) {
    if (!c.rxcui || !c.name) continue;
    const rank = Number(c.rank ?? 999);
    const existing = byRxcui.get(c.rxcui);
    const name = cleanName(c.name);
    if (!existing || name.length < existing.name.length) {
      byRxcui.set(c.rxcui, { name, rank: existing ? Math.min(existing.rank, rank) : rank });
    }
  }

  return Array.from(byRxcui.values())
    .sort((a, b) => a.rank - b.rank)
    .map((v) => v.name)
    .slice(0, 8);
}

export interface LabelSection {
  key: "boxed_warning" | "contraindications" | "drug_interactions" | "warnings" | "warnings_and_cautions" | "precautions" | "otc_interactions";
  label: string;
  text: string;
  severity: Severity;
}

export interface DrugSafetyInfo {
  queriedName: string;
  displayName: string;
  brandNames: string[];
  genericName?: string;
  sections: LabelSection[];
  /** Whether this came from a live openFDA call or the bundled offline snapshot. */
  source: "live" | "offline";
}

function firstNonEmpty(arr?: string[]): string | undefined {
  const text = arr?.join(" ").trim();
  return text ? text : undefined;
}

function parseLabel(queriedName: string, result: any): DrugSafetyInfo {
  const openfda = result.openfda ?? {};
  const sections: LabelSection[] = [];

  const add = (key: LabelSection["key"], label: string, text: string | undefined, severity: Severity) => {
    if (text) sections.push({ key, label, text, severity });
  };

  add("boxed_warning", "Boxed warning", firstNonEmpty(result.boxed_warning), "major");
  add("contraindications", "Contraindications", firstNonEmpty(result.contraindications), "major");
  add("drug_interactions", "Drug interactions", firstNonEmpty(result.drug_interactions), "moderate");
  add("warnings", "Warnings", firstNonEmpty(result.warnings), "minor");
  add("warnings_and_cautions", "Warnings and cautions", firstNonEmpty(result.warnings_and_cautions), "minor");
  add("precautions", "Precautions", firstNonEmpty(result.precautions), "minor");
  add(
    "otc_interactions",
    "Interaction guidance",
    firstNonEmpty(result.ask_doctor_or_pharmacist) ?? firstNonEmpty(result.do_not_use),
    "minor",
  );

  const genericName: string | undefined = openfda.generic_name?.[0];
  const brandNames: string[] = openfda.brand_name ?? [];

  return {
    queriedName,
    displayName: cleanName(genericName ?? brandNames[0] ?? queriedName),
    brandNames,
    genericName,
    sections,
    source: "live",
  };
}

interface FallbackEntry extends DrugSafetyInfo {
  aliases: string[];
}

const FALLBACK = fallbackData as unknown as Record<string, FallbackEntry>;

/**
 * A small set of ~90 common medications' real FDA label data, fetched once at
 * build time and bundled with the app (see scripts/build-drug-fallback — the
 * data itself is genuine openFDA output, not fabricated). Used when the live
 * call can't complete — e.g. offline, or a hosting sandbox that blocks
 * outbound requests — so the checker still works for common medications
 * instead of just failing.
 */
function lookupBundledFallback(name: string): DrugSafetyInfo | null {
  const key = name.trim().toLowerCase();
  if (!key) return null;
  const match =
    FALLBACK[key] ?? Object.values(FALLBACK).find((entry) => entry.aliases.includes(key));
  if (!match) return null;
  const { aliases: _aliases, ...info } = match;
  return { ...info, source: "offline" };
}

/**
 * openFDA text search matches substrings, so searching "lisinopril" can return
 * a combination product like "Lisinopril and Hydrochlorothiazide" ahead of
 * plain lisinopril. Prefer a result whose generic_name is a single ingredient
 * that actually matches the query, falling back progressively rather than
 * blindly taking whatever comes back first.
 */
function pickBestResult(results: any[], queried: string, field: string): any | null {
  const q = queried.trim().toUpperCase();
  const qFirstWord = q.split(/\s+/)[0];
  const buckets: any[][] = [[], [], [], []]; // exact, startsWith, containsWord, anySingle

  for (const r of results) {
    const names: string[] | undefined = r?.openfda?.[field];
    if (!names || names.length !== 1) continue;
    const name = names[0];
    if (/ AND | WITH |\/|,/.test(name)) continue;
    buckets[3].push(r);
    if (name === q) buckets[0].push(r);
    else if (name.startsWith(qFirstWord)) buckets[1].push(r);
    else if (name.split(/\s+/).includes(qFirstWord)) buckets[2].push(r);
  }

  for (const bucket of buckets) {
    if (bucket.length > 0) return bucket[0];
  }
  return results[0] ?? null;
}

async function fetchFromLiveApi(trimmed: string, signal?: AbortSignal): Promise<DrugSafetyInfo | null> {
  const fields = ["generic_name", "brand_name", "substance_name"];
  for (const field of fields) {
    const query = `openfda.${field}:"${trimmed}"`;
    const url = `${OPENFDA_BASE}?search=${encodeURIComponent(query)}&limit=15`;
    const res = await safeFetch(url, signal);
    if (res.status === 404) continue;
    if (!res.ok) throw new DrugApiError(`openFDA lookup failed (${res.status})`);
    const data = await res.json();
    const results = data?.results;
    if (!results || results.length === 0) continue;
    const best = pickBestResult(results, trimmed, field === "substance_name" ? "generic_name" : field);
    if (!best) continue;
    return parseLabel(trimmed, best);
  }
  return null;
}

/**
 * Drug-safety lookup against the FDA's openFDA drug label API (no API key
 * required), falling back to a bundled snapshot of real FDA data for common
 * medications if the live call fails (e.g. offline, or blocked by a hosting
 * sandbox's network policy). Returns null only when neither source has a
 * label on file for this name — a real, expected outcome for less common
 * names, not an error.
 */
export async function fetchDrugSafetyInfo(name: string, signal?: AbortSignal): Promise<DrugSafetyInfo | null> {
  const trimmed = coreDrugName(name).replace(/"/g, "");
  if (!trimmed) return null;

  try {
    const live = await fetchFromLiveApi(trimmed, signal);
    return live ?? lookupBundledFallback(trimmed);
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    const fallback = lookupBundledFallback(trimmed);
    if (fallback) return fallback;
    throw err;
  }
}
