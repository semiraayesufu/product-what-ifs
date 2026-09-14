/**
 * Offline fallback only — medication search otherwise uses the live NIH RxNorm
 * API. This list exists for when that network call is unavailable (offline,
 * or a hosting sandbox that blocks outbound requests) so search still works
 * for common medications; it is not meant to be exhaustive the way RxNorm is.
 */
export const MEDICATION_CATALOG = [
  // Pain / inflammation
  "Ibuprofen", "Naproxen", "Acetaminophen", "Aspirin", "Celecoxib", "Diclofenac",
  "Meloxicam", "Tramadol", "Gabapentin", "Pregabalin", "Cyclobenzaprine",
  // Antibiotics
  "Amoxicillin", "Amoxicillin / Clavulanate", "Azithromycin", "Erythromycin",
  "Ciprofloxacin", "Levofloxacin", "Doxycycline", "Cephalexin", "Clindamycin",
  "Trimethoprim-Sulfamethoxazole", "Metronidazole", "Nitrofurantoin", "Penicillin V",
  // Cardiovascular
  "Lisinopril", "Losartan", "Amlodipine", "Metoprolol", "Atenolol", "Carvedilol",
  "Hydrochlorothiazide", "Furosemide", "Spironolactone", "Atorvastatin",
  "Simvastatin", "Rosuvastatin", "Warfarin", "Clopidogrel", "Apixaban",
  "Rivaroxaban", "Digoxin", "Diltiazem", "Verapamil", "Nitroglycerin",
  // Diabetes
  "Metformin", "Glipizide", "Glimepiride", "Insulin Glargine", "Insulin Lispro",
  "Sitagliptin", "Empagliflozin", "Semaglutide", "Liraglutide",
  // GI
  "Omeprazole", "Esomeprazole", "Pantoprazole", "Ranitidine", "Famotidine",
  "Ondansetron", "Loperamide", "Docusate", "Polyethylene Glycol", "Sucralfate",
  // Respiratory / allergy
  "Albuterol", "Fluticasone", "Montelukast", "Loratadine", "Cetirizine",
  "Diphenhydramine", "Budesonide", "Ipratropium", "Guaifenesin",
  // Psychiatric / neuro
  "Sertraline", "Fluoxetine", "Escitalopram", "Citalopram", "Bupropion",
  "Venlafaxine", "Duloxetine", "Trazodone", "Amitriptyline", "Mirtazapine",
  "Alprazolam", "Lorazepam", "Clonazepam", "Diazepam", "Zolpidem",
  "Quetiapine", "Risperidone", "Aripiprazole", "Lithium", "Lamotrigine",
  "Levetiracetam", "Topiramate", "Carbamazepine", "Valproic Acid",
  // Steroids / immune / autoimmune
  "Prednisone", "Prednisolone", "Methylprednisolone", "Dexamethasone",
  "Hydroxychloroquine", "Methotrexate", "Azathioprine", "Sulfasalazine",
  "Adalimumab", "Etanercept",
  // Thyroid / hormones
  "Levothyroxine", "Methimazole", "Testosterone", "Estradiol", "Progesterone",
  // Urology / other
  "Tamsulosin", "Finasteride", "Sildenafil", "Oxybutynin",
  // Topical
  "Hydrocortisone", "Clotrimazole", "Mupirocin", "Benzoyl Peroxide", "Tretinoin",
];

/**
 * Offline fallback only — the Medical conditions search flow otherwise uses
 * the live NIH ICD-10-CM API. Not meant to be exhaustive.
 */
export const CONDITION_CATALOG = [
  // Cardiometabolic
  "Essential hypertension", "Type 2 diabetes mellitus", "Type 1 diabetes mellitus",
  "Hyperlipidemia", "Coronary artery disease", "Congestive heart failure",
  "Atrial fibrillation", "Obesity", "Metabolic syndrome",
  // Respiratory
  "Asthma", "Chronic obstructive pulmonary disease", "Sleep apnea",
  "Seasonal allergic rhinitis", "Chronic sinusitis",
  // Autoimmune / rheumatologic
  "Lupus", "Rheumatoid arthritis", "Psoriatic arthritis", "Psoriasis",
  "Osteoarthritis", "Fibromyalgia", "Ankylosing spondylitis", "Sjögren syndrome",
  // Endocrine
  "Hypothyroidism", "Hyperthyroidism", "Polycystic ovary syndrome",
  "Adrenal insufficiency",
  // GI
  "Gastroesophageal reflux disease", "Irritable bowel syndrome",
  "Crohn's disease", "Ulcerative colitis", "Celiac disease", "Peptic ulcer disease",
  // Renal / urologic
  "Chronic kidney disease", "Kidney stones", "Benign prostatic hyperplasia",
  "Urinary tract infection, recurrent",
  // Neuro / psych
  "Migraine", "Epilepsy", "Major depressive disorder", "Generalized anxiety disorder",
  "Bipolar disorder", "ADHD", "Insomnia", "Peripheral neuropathy",
  "Multiple sclerosis", "Parkinson's disease",
  // Other chronic
  "Osteoporosis", "Anemia", "Eczema", "Glaucoma", "Chronic pain syndrome",
  "Anxiety disorder", "PTSD",
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
