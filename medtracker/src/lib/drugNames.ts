import classData from "../data/drugClasses.json";

const FORM_WORDS = new Set([
  "pill", "pills", "tablet", "tablets", "oral", "capsule", "capsules", "injection", "injectable", "solution",
  "suspension", "chewable", "product", "ophthalmic", "topical", "cream", "ointment", "gel", "patch",
  "extended", "release", "delayed", "er", "xr", "sr", "dr", "cr", "film", "coated", "disintegrating",
  "powder", "liquid", "syrup", "drops", "spray", "inhaler", "inhalation", "otic", "nasal", "rectal",
  "suppository", "kit", "pack", "vial", "syringe", "prefilled", "hcl", "hydrochloride", "sodium",
  "potassium", "sulfate", "mg", "mcg", "ml",
]);

const ALIASES = classData.aliases as Record<string, string>;
const CLASS_DEFS = classData.classes as Record<string, { label: string; terms: string[] }>;
const DRUG_CLASSES = classData.drugs as Record<string, string[]>;

/** "Warfarin Oral Tablet" or "Aspirin 81 MG Pill" becomes "warfarin" / "aspirin", so lookups and label matching work on the drug itself. */
export function coreDrugName(name: string): string {
  const words = name
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !/^\d+(\.\d+)?$/.test(w) && !FORM_WORDS.has(w));
  const core = words.join(" ").trim() || name.trim().toLowerCase();
  return ALIASES[core] ?? ALIASES[words[0] ?? ""] ?? core;
}

export interface DrugClass {
  key: string;
  label: string;
  terms: string[];
}

export function classesFor(name: string): DrugClass[] {
  const core = coreDrugName(name);
  const keys = DRUG_CLASSES[core] ?? DRUG_CLASSES[core.split(" ")[0]] ?? [];
  return keys.filter((k) => CLASS_DEFS[k]).map((k) => ({ key: k, ...CLASS_DEFS[k] }));
}
