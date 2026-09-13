import type { Medication, Allergy, Condition } from "../types";

export const MEDICATIONS: Medication[] = [
  { id: "loratadine", name: "Loratadine", dosage: "1 x 5mg oral tablet", frequency: "Once daily" },
  { id: "erythromycin", name: "Erythromycin", dosage: "1 x 500mg oral tablet", frequency: "twice daily" },
  { id: "omeprazole", name: "Omeprazole", dosage: "1 x 20mg oral tablet", frequency: "twice daily" },
  { id: "prednisone", name: "Prednisone", dosage: "1 x 200mg oral tablet", frequency: "thrice daily" },
  { id: "hydroxychloroquine", name: "Hydroxychloroquine", dosage: "1 x 200mg oral tablet", frequency: "twice daily" },
  { id: "sertraline", name: "Sertraline", dosage: "1 x 50mg oral tablet", frequency: "Once daily" },
];

export const ALLERGIES: Allergy[] = [
  {
    id: "sulfa",
    name: "Sulfa drug",
    severityLabel: "Severe — Anaphylaxis",
    reactionName: "Rash and swelling",
    reactionSeverity: "Severe reaction",
    changedAgo: "Active allergy — changed 2 days ago",
    flagged: [
      { name: "Trimethoprim-sulfamethoxazole", note: "Major interaction - not added" },
      { name: "Sulfasalazine", note: "Major interaction - not added" },
    ],
    history: [
      { label: "Flagged against Sulfasalazine — not added", date: "Mar 14, 2026" },
      { label: "Flagged against Trimethoprim-sulfamethoxazole — not added", date: "Jun 2, 2026" },
      { label: "Added to profile", date: "Jul 20, 2026" },
    ],
  },
  {
    id: "immunosuppressant",
    name: "Azathioprine",
    severityLabel: "Severe — Past bad reaction",
    reactionName: "Fever and nausea",
    reactionSeverity: "Severe reaction",
    changedAgo: "Active allergy — changed 4 months ago",
    flagged: [],
    history: [{ label: "Added to profile", date: "Mar 2, 2026" }],
  },
];

export const CONDITIONS: Condition[] = [
  {
    id: "lupus",
    name: "Lupus (SLE)",
    statusLabel: "Active — diagnosed 2019",
    diagnosisName: "Systemic lupus erythematosus",
    diagnosedYear: "Diagnosed 2019",
    treatedWith: [{ name: "Hydroxychloroquine", dosage: "1 x 200mg oral tablet — twice daily" }],
    flagged: [
      { name: "Ibuprofen (NSAIDS)", note: "Increased risk with lupus nephritis - currently taking" },
    ],
    history: [
      { label: "Flagged Ibuprofen (NSAIDS) — currently taking", date: "Mar 14, 2026" },
      { label: "Added to profile", date: "Jul 20, 2026" },
    ],
  },
  {
    id: "depression",
    name: "Clinical depression",
    statusLabel: "Managed — diagnosed 2021",
    diagnosisName: "Major depressive disorder",
    diagnosedYear: "Diagnosed 2021",
    treatedWith: [{ name: "Sertraline", dosage: "1 x 50mg oral tablet — once daily" }],
    flagged: [],
    history: [{ label: "Added to profile", date: "Jul 20, 2026" }],
  },
];

export const MEDICATION_CATALOG = [
  "Amoxicillin",
  "Amoxicillin / Clavulanate",
  "Amoxicillin / Vonoprazan",
  "Ibuprofen",
  "Loratadine",
  "Erythromycin",
  "Omeprazole",
  "Prednisone",
  "Hydroxychloroquine",
  "Sertraline",
  "Trimethoprim-Sulfamethoxazole",
];

export const SEVERITY_OPTIONS = ["Mild", "Moderate", "Severe"];
export const CONDITION_STATUS_OPTIONS = ["Active", "Managed", "Resolved"];
