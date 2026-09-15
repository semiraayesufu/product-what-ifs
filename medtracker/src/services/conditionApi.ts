const ICD10_SEARCH_URL = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search";

export class ConditionApiError extends Error {}

export interface ConditionMatch {
  code: string;
  name: string;
}

/**
 * Live diagnosis/condition name search against the NIH's ICD-10-CM clinical
 * tables service (no API key required) — the same public coding system
 * clinics use, so results are real diagnosis names, not a curated demo list.
 */
export async function searchConditionNames(term: string, signal?: AbortSignal): Promise<ConditionMatch[]> {
  const trimmed = term.trim();
  if (trimmed.length < 2) return [];

  const url = `${ICD10_SEARCH_URL}?sf=code,name&terms=${encodeURIComponent(trimmed)}&maxList=10`;
  let res: Response;
  try {
    res = await fetch(url, { signal });
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    throw new ConditionApiError("Couldn't reach the live condition database. Check your connection.");
  }
  if (!res.ok) throw new ConditionApiError(`ICD-10 lookup failed (${res.status})`);

  const data = await res.json();
  const rows: [string, string][] = data?.[3] ?? [];

  const seen = new Set<string>();
  const matches: ConditionMatch[] = [];
  for (const [code, name] of rows) {
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    matches.push({ code, name });
  }
  return matches.slice(0, 8);
}
