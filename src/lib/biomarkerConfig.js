export const BIOMARKER_REGISTRY = [
  // IRON / ANEMIA / HAIR SHEDDING
  { name: "Ferritin", unit: "ng/mL", direction: "higher_until_limit", min: 24, max: 336, target_min: 70, target_max: 150, category: "hair_support", importance: "core" },
  { name: "Serum Iron", unit: "μmol/L", direction: "middle_range", min: 7, max: 30, target_min: 14, target_max: 26, category: "hair_support", importance: "core" },
  { name: "Transferrin Saturation", unit: "%", direction: "middle_range", min: 20, max: 50, target_min: 25, target_max: 45, category: "hair_support", importance: "core" },
  { name: "TIBC", unit: "μmol/L", direction: "middle_range", min: 45, max: 75, target_min: 50, target_max: 70, category: "hair_support", importance: "important" },
  { name: "UIBC", unit: "μmol/L", direction: "middle_range", min: 30, max: 60, target_min: 35, target_max: 55, category: "hair_support", importance: "important" },
  { name: "Transferrin", unit: "g/L", direction: "middle_range", min: 2, max: 3.6, target_min: 2.2, target_max: 3.4, category: "hair_support", importance: "important" },
  { name: "Hemoglobin", unit: "g/dL", direction: "middle_range", min: 12, max: 17.5, target_min: 13, target_max: 16.5, category: "hair_support", importance: "core" },
  { name: "Hematocrit", unit: "%", direction: "middle_range", min: 36, max: 50, target_min: 38, target_max: 48, category: "hair_support", importance: "core" },
  { name: "RBC Count", unit: "M/μL", direction: "middle_range", min: 4, max: 6, target_min: 4.2, target_max: 5.8, category: "hair_support", importance: "core" },
  { name: "MCV", unit: "fL", direction: "middle_range", min: 80, max: 100, target_min: 85, target_max: 95, category: "hair_support", importance: "important" },
  { name: "MCH", unit: "pg", direction: "middle_range", min: 27, max: 33, target_min: 28, target_max: 32, category: "hair_support", importance: "important" },
  { name: "MCHC", unit: "g/dL", direction: "middle_range", min: 32, max: 36, target_min: 32.5, target_max: 35.5, category: "hair_support", importance: "important" },
  { name: "RDW", unit: "%", direction: "lower_is_better", min: 11.5, max: 14.5, target_min: 11.5, target_max: 13, category: "hair_support", importance: "important" },
  { name: "Reticulocyte Count", unit: "%", direction: "middle_range", min: 0.5, max: 2.5, target_min: 0.8, target_max: 2, category: "hair_support", importance: "advanced" },

  // CORE VITAMINS / MINERALS
  { name: "25-OH Vitamin D", unit: "ng/mL", direction: "higher_until_limit", min: 20, max: 100, target_min: 50, target_max: 80, category: "hair_support", importance: "core" },
  { name: "Vitamin B12", unit: "pg/mL", direction: "higher_until_limit", min: 200, max: 900, target_min: 400, target_max: 800, category: "hair_support", importance: "core" },
  { name: "Folate", unit: "ng/mL", direction: "higher_until_limit", min: 2.7, max: 17, target_min: 7, target_max: 15, category: "hair_support", importance: "core" },
  { name: "Zinc", unit: "μg/dL", direction: "higher_until_limit", min: 70, max: 150, target_min: 85, target_max: 130, category: "hair_support", importance: "core" },
  { name: "Copper", unit: "μg/dL", direction: "middle_range", min: 70, max: 170, target_min: 85, target_max: 150, category: "skin_recovery", importance: "important" },
  { name: "Copper / Zinc Ratio", unit: "ratio", direction: "middle_range", min: 0.7, max: 1.5, target_min: 0.8, target_max: 1.3, category: "energy_wellness", importance: "advanced" },
  { name: "Magnesium", unit: "mg/dL", direction: "middle_range", min: 1.7, max: 2.2, target_min: 1.8, target_max: 2.1, category: "energy_wellness", importance: "important" },
  { name: "Selenium", unit: "μg/L", direction: "higher_until_limit", min: 90, max: 190, target_min: 120, target_max: 170, category: "skin_recovery", importance: "important" },
  { name: "Vitamin A", unit: "μg/dL", direction: "middle_range", min: 20, max: 100, target_min: 30, target_max: 90, category: "skin_recovery", importance: "important" },
  { name: "Vitamin E", unit: "mg/L", direction: "higher_until_limit", min: 5.5, max: 20, target_min: 8, target_max: 18, category: "skin_recovery", importance: "important" },
  { name: "Vitamin C", unit: "mg/L", direction: "higher_until_limit", min: 4, max: 20, target_min: 8, target_max: 18, category: "skin_recovery", importance: "important" },
  { name: "Biotin", unit: "pg/mL", direction: "higher_until_limit", min: 100, max: 800, target_min: 300, target_max: 700, category: "hair_support", importance: "advanced" },

  // THYROID
  { name: "TSH", unit: "mIU/L", direction: "middle_range", min: 0.4, max: 4, target_min: 1, target_max: 2.5, category: "hormonal_balance", importance: "core" },
  { name: "Free T4", unit: "ng/dL", direction: "middle_range", min: 0.8, max: 1.8, target_min: 1, target_max: 1.6, category: "hormonal_balance", importance: "core" },
  { name: "Free T3", unit: "pg/mL", direction: "middle_range", min: 2.3, max: 4.2, target_min: 3, target_max: 4, category: "hormonal_balance", importance: "important" },
  { name: "Reverse T3", unit: "ng/dL", direction: "lower_is_better", min: 8, max: 25, target_min: 8, target_max: 15, category: "hormonal_balance", importance: "advanced" },
  { name: "TPO Antibodies", unit: "IU/mL", direction: "lower_is_better", min: 0, max: 35, target_min: 0, target_max: 15, category: "hormonal_balance", importance: "important" },
  { name: "Thyroglobulin Antibodies (TgAb)", unit: "IU/mL", direction: "lower_is_better", min: 0, max: 40, target_min: 0, target_max: 10, category: "hormonal_balance", importance: "important" },

  // SEX HORMONES / HAIR / SKIN / ACNE
  { name: "Total Testosterone", unit: "ng/dL", direction: "middle_range", min: 15, max: 70, target_min: 35, target_max: 65, category: "hormonal_balance", importance: "important" },
  { name: "Free Testosterone", unit: "pg/mL", direction: "middle_range", min: 1, max: 10, target_min: 2, target_max: 8, category: "hormonal_balance", importance: "important" },
  { name: "Bioavailable Testosterone", unit: "ng/dL", direction: "middle_range", min: 5, max: 40, target_min: 10, target_max: 35, category: "hair_support", importance: "important" },
  { name: "SHBG", unit: "nmol/L", direction: "middle_range", min: 13, max: 100, target_min: 20, target_max: 80, category: "hormonal_balance", importance: "important" },
  { name: "DHT", unit: "pg/mL", direction: "middle_range", min: 15, max: 90, target_min: 30, target_max: 75, category: "hair_support", importance: "advanced" },
  { name: "DHEA-S", unit: "μg/dL", direction: "middle_range", min: 35, max: 430, target_min: 100, target_max: 350, category: "hormonal_balance", importance: "important" },
  { name: "Androstenedione", unit: "ng/dL", direction: "middle_range", min: 20, max: 100, target_min: 40, target_max: 90, category: "hair_support", importance: "advanced" },
  { name: "Estradiol", unit: "pg/mL", direction: "middle_range", min: 10, max: 50, target_min: 20, target_max: 40, category: "hormonal_balance", importance: "important" },
  { name: "Progesterone", unit: "ng/mL", direction: "middle_range", min: 0.1, max: 30, target_min: 2, target_max: 25, category: "hormonal_balance", importance: "important" },
  { name: "LH", unit: "mIU/mL", direction: "middle_range", min: 1, max: 12, target_min: 2, target_max: 10, category: "hormonal_balance", importance: "important" },
  { name: "FSH", unit: "mIU/mL", direction: "middle_range", min: 1, max: 10, target_min: 2, target_max: 8, category: "hormonal_balance", importance: "important" },
  { name: "Prolactin", unit: "ng/mL", direction: "middle_range", min: 2, max: 25, target_min: 5, target_max: 20, category: "hormonal_balance", importance: "important" },
  { name: "AMH", unit: "ng/mL", direction: "higher_until_limit", min: 0.1, max: 10, target_min: 1, target_max: 8, category: "hormonal_balance", importance: "advanced" },
  { name: "Cortisol AM", unit: "μg/dL", direction: "middle_range", min: 5, max: 25, target_min: 10, target_max: 20, category: "hormonal_balance", importance: "important" },

  // INFLAMMATION / IMMUNE
  { name: "hs-CRP", unit: "mg/L", direction: "lower_is_better", min: 0, max: 10, target_min: 0, target_max: 3, category: "inflammation", importance: "core" },
  { name: "CRP", unit: "mg/L", direction: "lower_is_better", min: 0, max: 10, target_min: 0, target_max: 3, category: "inflammation", importance: "core" },
  { name: "ESR", unit: "mm/h", direction: "lower_is_better", min: 0, max: 30, target_min: 0, target_max: 10, category: "inflammation", importance: "important" },
  { name: "WBC Count", unit: "K/μL", direction: "middle_range", min: 4.5, max: 11, target_min: 5, target_max: 10, category: "inflammation", importance: "core" },
  { name: "Neutrophils", unit: "%", direction: "middle_range", min: 50, max: 70, target_min: 55, target_max: 65, category: "inflammation", importance: "important" },
  { name: "Lymphocytes", unit: "%", direction: "middle_range", min: 20, max: 40, target_min: 25, target_max: 38, category: "inflammation", importance: "important" },
  { name: "Monocytes", unit: "%", direction: "middle_range", min: 3, max: 10, target_min: 4, target_max: 8, category: "inflammation", importance: "important" },
  { name: "Eosinophils", unit: "%", direction: "middle_range", min: 0, max: 5, target_min: 1, target_max: 4, category: "inflammation", importance: "important" },
  { name: "Basophils", unit: "%", direction: "middle_range", min: 0, max: 2, target_min: 0, target_max: 1, category: "inflammation", importance: "important" },
  { name: "Neutrophil / Lymphocyte Ratio", unit: "ratio", direction: "lower_is_better", min: 0.8, max: 3, target_min: 0.8, target_max: 2, category: "inflammation", importance: "advanced" },
  { name: "ANA", unit: "titer", direction: "lower_is_better", min: 0, max: 1000, target_min: 0, target_max: 80, category: "inflammation", importance: "important" },
  { name: "Rheumatoid Factor", unit: "IU/mL", direction: "lower_is_better", min: 0, max: 100, target_min: 0, target_max: 15, category: "inflammation", importance: "important" },

  // METABOLIC / ENERGY / INSULIN
  { name: "Fasting Glucose", unit: "mg/dL", direction: "middle_range", min: 70, max: 100, target_min: 80, target_max: 95, category: "cardiometabolic", importance: "core" },
  { name: "HbA1c", unit: "%", direction: "lower_is_better", min: 4, max: 6.5, target_min: 4.5, target_max: 5.5, category: "cardiometabolic", importance: "core" },
  { name: "Fasting Insulin", unit: "μIU/mL", direction: "lower_is_better", min: 0, max: 25, target_min: 1, target_max: 5, category: "hormonal_balance", importance: "important" },
  { name: "HOMA-IR", unit: "index", direction: "lower_is_better", min: 0.2, max: 5, target_min: 0.2, target_max: 1.5, category: "cardiometabolic", importance: "important" },
  { name: "Uric Acid", unit: "mg/dL", direction: "middle_range", min: 3.5, max: 7.2, target_min: 4, target_max: 6.5, category: "cardiometabolic", importance: "important" },
  { name: "Total Protein", unit: "g/dL", direction: "middle_range", min: 6, max: 8.3, target_min: 6.5, target_max: 8, category: "medical_safety", importance: "important" },
  { name: "Albumin", unit: "g/dL", direction: "higher_until_limit", min: 3.5, max: 5.5, target_min: 4, target_max: 5.2, category: "medical_safety", importance: "important" },
  { name: "Globulin", unit: "g/dL", direction: "middle_range", min: 2, max: 3.5, target_min: 2.3, target_max: 3.2, category: "medical_safety", importance: "advanced" },
  { name: "A/G Ratio", unit: "ratio", direction: "middle_range", min: 1, max: 2.5, target_min: 1.2, target_max: 2.3, category: "medical_safety", importance: "advanced" },

  // LIPIDS / CARDIOMETABOLIC
  { name: "Total Cholesterol", unit: "mg/dL", direction: "lower_is_better", min: 125, max: 200, target_min: 125, target_max: 180, category: "cardiometabolic", importance: "core" },
  { name: "LDL Cholesterol", unit: "mg/dL", direction: "lower_is_better", min: 50, max: 130, target_min: 50, target_max: 100, category: "cardiometabolic", importance: "core" },
  { name: "HDL Cholesterol", unit: "mg/dL", direction: "higher_until_limit", min: 35, max: 120, target_min: 50, target_max: 100, category: "cardiometabolic", importance: "core" },
  { name: "Triglycerides", unit: "mg/dL", direction: "lower_is_better", min: 0, max: 200, target_min: 0, target_max: 100, category: "cardiometabolic", importance: "core" },
  { name: "Non-HDL Cholesterol", unit: "mg/dL", direction: "lower_is_better", min: 50, max: 130, target_min: 50, target_max: 110, category: "cardiometabolic", importance: "important" },
  { name: "ApoB", unit: "mg/dL", direction: "lower_is_better", min: 40, max: 130, target_min: 40, target_max: 100, category: "cardiometabolic", importance: "advanced" },
  { name: "Lipoprotein(a) (Lp(a))", unit: "mg/dL", direction: "lower_is_better", min: 0, max: 200, target_min: 0, target_max: 50, category: "cardiometabolic", importance: "advanced" },

  // LIVER / MEDICAL SAFETY
  { name: "ALT", unit: "U/L", direction: "lower_is_better", min: 7, max: 56, target_min: 7, target_max: 35, category: "medical_safety", importance: "core" },
  { name: "AST", unit: "U/L", direction: "lower_is_better", min: 10, max: 40, target_min: 10, target_max: 30, category: "medical_safety", importance: "core" },
  { name: "GGT", unit: "U/L", direction: "lower_is_better", min: 0, max: 65, target_min: 0, target_max: 40, category: "medical_safety", importance: "important" },
  { name: "ALP", unit: "U/L", direction: "middle_range", min: 44, max: 147, target_min: 50, target_max: 130, category: "medical_safety", importance: "important" },
  { name: "Total Bilirubin", unit: "mg/dL", direction: "lower_is_better", min: 0.1, max: 1.2, target_min: 0.1, target_max: 0.9, category: "medical_safety", importance: "important" },
  { name: "Direct Bilirubin", unit: "mg/dL", direction: "lower_is_better", min: 0, max: 0.3, target_min: 0, target_max: 0.2, category: "medical_safety", importance: "advanced" },
  { name: "Indirect Bilirubin", unit: "mg/dL", direction: "lower_is_better", min: 0.1, max: 1, target_min: 0.1, target_max: 0.8, category: "medical_safety", importance: "advanced" },

  // KIDNEY / HYDRATION / ELECTROLYTES
  { name: "Creatinine", unit: "mg/dL", direction: "middle_range", min: 0.6, max: 1.2, target_min: 0.7, target_max: 1.1, category: "medical_safety", importance: "core" },
  { name: "eGFR", unit: "mL/min/1.73m²", direction: "higher_until_limit", min: 60, max: 120, target_min: 90, target_max: 120, category: "medical_safety", importance: "core" },
  { name: "Urea / BUN", unit: "mg/dL", direction: "middle_range", min: 7, max: 20, target_min: 8, target_max: 18, category: "medical_safety", importance: "important" },
  { name: "Sodium", unit: "mEq/L", direction: "middle_range", min: 136, max: 145, target_min: 138, target_max: 144, category: "medical_safety", importance: "important" },
  { name: "Potassium", unit: "mEq/L", direction: "middle_range", min: 3.5, max: 5, target_min: 3.8, target_max: 4.8, category: "medical_safety", importance: "important" },
  { name: "Chloride", unit: "mEq/L", direction: "middle_range", min: 98, max: 107, target_min: 100, target_max: 106, category: "medical_safety", importance: "important" },
  { name: "Calcium", unit: "mg/dL", direction: "middle_range", min: 8.5, max: 10.2, target_min: 9, target_max: 10, category: "energy_wellness", importance: "important" },
  { name: "Phosphate", unit: "mg/dL", direction: "middle_range", min: 2.5, max: 4.5, target_min: 3, target_max: 4.3, category: "medical_safety", importance: "important" },

  // COMPLETE BLOOD COUNT (some duplicates with iron section, but included for completeness)
  { name: "Platelets", unit: "K/μL", direction: "middle_range", min: 150, max: 400, target_min: 180, target_max: 380, category: "medical_safety", importance: "important" },
  { name: "MPV", unit: "fL", direction: "middle_range", min: 7.5, max: 11.5, target_min: 8.5, target_max: 11, category: "medical_safety", importance: "advanced" },

  // ADVANCED / OPTIONAL BEAUTY & LONGEVITY
  { name: "Omega-3 Index", unit: "%", direction: "higher_until_limit", min: 4, max: 12, target_min: 8, target_max: 12, category: "advanced", importance: "advanced" },
  { name: "Homocysteine", unit: "μmol/L", direction: "lower_is_better", min: 5, max: 15, target_min: 5, target_max: 10, category: "advanced", importance: "advanced" },
  { name: "IGF-1", unit: "ng/mL", direction: "middle_range", min: 50, max: 350, target_min: 100, target_max: 300, category: "energy_wellness", importance: "advanced" },
  { name: "CoQ10", unit: "μg/mL", direction: "higher_until_limit", min: 0.5, max: 5, target_min: 1.5, target_max: 4.5, category: "advanced", importance: "advanced" },
  { name: "Adiponectin", unit: "μg/mL", direction: "higher_until_limit", min: 2, max: 30, target_min: 8, target_max: 25, category: "energy_wellness", importance: "advanced" },
  { name: "Leptin", unit: "ng/mL", direction: "middle_range", min: 1, max: 30, target_min: 5, target_max: 20, category: "energy_wellness", importance: "advanced" },
  { name: "Adiponectin / Leptin Ratio", unit: "ratio", direction: "higher_until_limit", min: 0.2, max: 20, target_min: 1, target_max: 15, category: "advanced", importance: "advanced" },
];

export const DISPLAY_CATEGORIES = {
  hair_support: { label: "Hair Support", order: 1, color: "#c4aa8b" },
  skin_recovery: { label: "Skin & Glow", order: 2, color: "#d4a574" },
  energy_wellness: { label: "Energy & Recovery", order: 3, color: "#b8956a" },
  hormonal_balance: { label: "Hormonal Balance", order: 4, color: "#9b8b7e" },
  inflammation: { label: "Inflammation", order: 5, color: "#8b7d70" },
  medical_safety: { label: "Medical Safety", order: 6, color: "#7c6f63" },
  cardiometabolic: { label: "Cardiometabolic", order: 7, color: "#6d6157" },
  advanced: { label: "Advanced", order: 8, color: "#5e534b" },
};

export const IMPORTANCE_LEVELS = {
  core: { label: "Core", badge: "★", order: 1 },
  important: { label: "Important", badge: "★★", order: 2 },
  advanced: { label: "Advanced", badge: "★★★", order: 3 },
};

export function getCategoryLabel(catKey) {
  return DISPLAY_CATEGORIES[catKey]?.label || catKey;
}

export function getImportanceLabel(impKey) {
  return IMPORTANCE_LEVELS[impKey]?.label || impKey;
}

export function getTestableMarkers() {
  return BIOMARKER_REGISTRY.map(b => b.name);
}

export function getMarkerByName(name) {
  return BIOMARKER_REGISTRY.find(b => b.name === name);
}