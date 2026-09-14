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

/** Offline fallback only — the Medical conditions search flow otherwise uses the live ICD-10-CM API. */
export const CONDITION_CATALOG = [
  "Lupus",
  "Type 2 diabetes mellitus",
  "Essential hypertension",
  "Asthma",
  "Rheumatoid arthritis",
  "Chronic kidney disease",
  "Hypothyroidism",
  "Major depressive disorder",
  "Generalized anxiety disorder",
  "Migraine",
];

export const SEVERITY_OPTIONS = ["Mild", "Moderate", "Severe"];
export const CONDITION_STATUS_OPTIONS = ["Active", "Managed", "Resolved"];

export const MEDICATION_STATUS_OPTIONS = ["Currently taking", "Not taking anymore", "As needed"];
export const MEDICATION_FORM_OPTIONS = [
  "Oral tablet",
  "Capsule",
  "Liquid",
  "Injection",
  "Inhaler",
  "Topical",
];
export const MEDICATION_STRENGTH_OPTIONS = [
  "5mg",
  "10mg",
  "20mg",
  "50mg",
  "100mg",
  "200mg",
  "500mg",
];
export const MEDICATION_QUANTITY_OPTIONS = ["1", "2", "3", "4"];
export const MEDICATION_FREQUENCY_OPTIONS = [
  "Once daily",
  "Twice daily",
  "Thrice daily",
  "As needed",
];
