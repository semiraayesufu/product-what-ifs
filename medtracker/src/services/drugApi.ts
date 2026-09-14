import type { Severity } from "../types";

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
    throw new DrugApiError("Couldn't reach the live drug database — check your connection.");
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
  key: "boxed_warning" | "contraindications" | "drug_interactions" | "warnings" | "otc_interactions";
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
  };
}

/**
 * Live drug-safety lookup against the FDA's openFDA drug label API (no API key required).
 * Returns null when the API responded but has no label on file for this name — a real,
 * expected outcome for less common names, not an error.
 */
export async function fetchDrugSafetyInfo(name: string, signal?: AbortSignal): Promise<DrugSafetyInfo | null> {
  const trimmed = name.trim().replace(/"/g, "");
  if (!trimmed) return null;

  const fields = ["generic_name", "brand_name", "substance_name"];
  for (const field of fields) {
    const query = `openfda.${field}:"${trimmed}"`;
    const url = `${OPENFDA_BASE}?search=${encodeURIComponent(query)}&limit=1`;
    const res = await safeFetch(url, signal);
    if (res.status === 404) continue;
    if (!res.ok) throw new DrugApiError(`openFDA lookup failed (${res.status})`);
    const data = await res.json();
    const result = data?.results?.[0];
    if (!result) continue;
    return parseLabel(name, result);
  }
  return null;
}

export function excerptAround(text: string, needle: string, radius = 150): string {
  const idx = text.toLowerCase().indexOf(needle.toLowerCase());
  if (idx === -1) return text.length > radius * 2 ? `${text.slice(0, radius * 2)}…` : text;
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + needle.length + radius);
  let excerpt = text.slice(start, end).trim();
  if (start > 0) excerpt = `…${excerpt}`;
  if (end < text.length) excerpt = `${excerpt}…`;
  return excerpt;
}
