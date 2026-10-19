// Per-marker explanations + relevance to hair, skin, energy
export const BIOMARKER_EXPLANATIONS = {
  "Ferritin": {
    what: "Ferritin is the body's main iron storage protein. It tells us how much iron is being held in reserve in your cells.",
    hair: "Low ferritin is one of the most common and treatable causes of hair shedding. Hair follicles are iron-hungry — when stores drop, the body redirects iron away from hair to prioritise vital organs.",
    skin: "Adequate iron stores help skin cells regenerate properly and maintain a healthy, non-pale complexion.",
    energy: "When ferritin is low, your body struggles to produce enough energy at the cellular level, leading to persistent fatigue even if haemoglobin is normal.",
  },
  "Serum Iron": {
    what: "This measures the actual amount of iron currently circulating in your blood — your 'in-transit' iron.",
    hair: "Low circulating iron can starve hair follicles of the mineral they need to produce strong, healthy strands.",
    energy: "Iron is essential for oxygen transport. Low serum iron reduces the oxygen available to muscles and the brain, causing tiredness and brain fog.",
  },
  "Transferrin Saturation": {
    what: "This shows what percentage of your iron-carrying protein (transferrin) is actually loaded with iron — a key marker of whether iron is reaching tissues.",
    hair: "When saturation is low, iron isn't being delivered efficiently to follicles, even if total iron isn't dangerously low.",
    energy: "Low saturation means your body's iron transport system is under-utilised, which impacts oxygen delivery and energy levels.",
  },
  "TIBC": {
    what: "Total Iron Binding Capacity — measures how much iron your blood could carry if all binding sites were full. High TIBC often signals iron deficiency.",
    hair: "Elevated TIBC is a classic sign of iron-deficiency, which is directly linked to telogen effluvium (diffuse hair shedding).",
  },
  "UIBC": {
    what: "Unsaturated Iron Binding Capacity — the 'unfilled' portion of TIBC. High UIBC means your body is hungry for more iron.",
    hair: "High UIBC alongside low ferritin confirms that the body is prioritising iron elsewhere, reducing what reaches the hair follicle.",
  },
  "Transferrin": {
    what: "Transferrin is the protein that physically carries iron in the blood. Its level reflects how the body is managing iron transport.",
    hair: "Elevated transferrin is the body's way of trying to capture more iron — often seen when hair-feeding iron stores are running low.",
  },
  "Hemoglobin": {
    what: "Haemoglobin is the protein inside red blood cells that carries oxygen. Low haemoglobin means clinical anaemia.",
    hair: "Severe anaemia deprives follicles of oxygen, pushing hairs into a resting phase and causing noticeable shedding.",
    skin: "Low haemoglobin can give skin a dull, pale, or sallow appearance.",
    energy: "Haemoglobin is the backbone of oxygen delivery — when it drops, fatigue, breathlessness and weakness follow.",
  },
  "Hematocrit": {
    what: "Haematocrit is the percentage of your blood that is made up of red blood cells.",
    energy: "Low haematocrit reduces the blood's oxygen-carrying capacity, causing tiredness and reduced physical performance.",
  },
  "RBC Count": {
    what: "The total number of red blood cells per volume of blood — directly reflects the body's capacity to deliver oxygen.",
    energy: "Fewer red blood cells means less oxygen reaches muscles and organs, contributing to fatigue and poor recovery.",
  },
  "MCV": {
    what: "Mean Corpuscular Volume — the average size of your red blood cells. Small cells often indicate iron deficiency; large cells can mean B12 or folate deficiency.",
    hair: "Both small and large RBCs indicate nutritional deficiencies that affect hair follicle health and growth cycles.",
    energy: "Abnormal cell size reduces the efficiency of oxygen transport, affecting stamina and energy.",
  },
  "MCH": {
    what: "Mean Corpuscular Haemoglobin — the average amount of haemoglobin per red blood cell. Low MCH usually signals iron deficiency.",
    hair: "Low MCH is a downstream marker of iron deficiency anaemia, which is closely linked to hair loss.",
  },
  "MCHC": {
    what: "Mean Corpuscular Haemoglobin Concentration — how densely packed with haemoglobin your red blood cells are.",
    energy: "Low MCHC reduces each cell's oxygen-carrying efficiency, contributing to fatigue.",
  },
  "RDW": {
    what: "Red Cell Distribution Width — measures variation in red blood cell size. High RDW suggests the body is producing inconsistent cells, often due to mixed deficiencies.",
    hair: "Elevated RDW alongside low iron or B12 markers points to nutritional deficiency — a key driver of hair thinning.",
  },
  "Reticulocyte Count": {
    what: "Reticulocytes are immature red blood cells freshly released from bone marrow. This count shows how actively your body is making new red blood cells.",
    energy: "Low reticulocyte count alongside anaemia may suggest the bone marrow isn't responding adequately, which impacts energy recovery.",
  },
  "25-OH Vitamin D": {
    what: "The active storage form of Vitamin D. Most people are deficient and don't know it — it affects hundreds of bodily processes.",
    hair: "Vitamin D receptors are found in hair follicles. Deficiency has been linked to alopecia areata and diffuse hair thinning.",
    skin: "Vitamin D plays a role in skin cell renewal, wound healing, and reducing inflammatory skin conditions.",
    energy: "Vitamin D is involved in muscle function, mood regulation, and immune health — deficiency is strongly linked to fatigue and low mood.",
  },
  "Vitamin B12": {
    what: "B12 is essential for DNA synthesis, red blood cell production, and nerve function. It cannot be made by the body and must come from diet or supplements.",
    hair: "B12 deficiency leads to macrocytic anaemia and impaired cell division in hair follicles, slowing growth and causing shedding.",
    skin: "Low B12 can cause hyperpigmentation, dry skin, and slow wound healing.",
    energy: "B12 is critical for energy metabolism at the cellular level. Deficiency causes extreme fatigue, brain fog, and weakness.",
  },
  "Folate": {
    what: "Folate (Vitamin B9) is vital for cell division and DNA production — two processes hair follicles depend on heavily.",
    hair: "Folate deficiency slows the rapid cell division needed for hair growth, and contributes to anaemia-related shedding.",
    skin: "Folate supports skin cell renewal — low levels can slow healing and contribute to a dull complexion.",
    energy: "Like B12, folate is essential for red blood cell formation and energy production.",
  },
  "Zinc": {
    what: "Zinc is a trace mineral involved in hundreds of enzymatic processes — from protein synthesis to immune function.",
    hair: "Zinc is required for the structural proteins that make up hair. Deficiency is directly linked to hair thinning, breakage, and shedding.",
    skin: "Zinc has anti-inflammatory properties and is key to skin healing, acne control, and barrier function.",
    energy: "Zinc supports immune health, hormone production, and metabolic function — all of which affect energy levels.",
  },
  "Copper": {
    what: "Copper works with iron in haemoglobin production and is involved in melanin synthesis (the pigment in hair and skin).",
    hair: "Copper helps produce melanin — low levels can contribute to premature greying and weakened hair structure.",
    skin: "Copper is involved in collagen and elastin synthesis, making it important for skin firmness and wound healing.",
  },
  "Copper / Zinc Ratio": {
    what: "This ratio reflects the balance between two competing minerals. An imbalance — particularly high copper relative to zinc — is associated with inflammation and hormonal disruption.",
    hair: "An unfavourable ratio can worsen inflammation at the scalp level and disrupt hair follicle cycles.",
    energy: "Excess copper with low zinc is linked to oestrogen dominance, fatigue, anxiety, and poor stress resilience.",
  },
  "Magnesium": {
    what: "Magnesium is involved in over 300 enzymatic reactions — it's one of the most important and commonly depleted minerals.",
    hair: "Magnesium helps regulate DHT (a hormone that drives hair loss) and supports protein synthesis in follicles.",
    skin: "Magnesium plays a role in reducing inflammation and supporting skin barrier function.",
    energy: "Magnesium is essential for ATP (cellular energy) production. Deficiency is one of the most common causes of fatigue, muscle cramps, and poor sleep.",
  },
  "Selenium": {
    what: "Selenium is a powerful antioxidant mineral that protects cells from oxidative damage.",
    hair: "Selenium is needed for thyroid hormone conversion — and thyroid function is tightly linked to hair growth cycles.",
    skin: "Selenium protects skin cells from UV damage and oxidative stress, and helps maintain elasticity.",
    energy: "Selenium supports thyroid function, which governs metabolic rate and energy levels throughout the day.",
  },
  "Vitamin A": {
    what: "Vitamin A regulates cell growth and differentiation. Both deficiency and excess can be harmful.",
    hair: "Vitamin A helps produce sebum (scalp oil) that keeps the scalp moisturised. However, excess Vitamin A can actually cause hair loss.",
    skin: "Vitamin A is the foundation of retinoid skin therapy — it promotes cell turnover, reduces acne, and improves texture and tone.",
    energy: "Vitamin A supports immune function and red blood cell production, indirectly affecting vitality.",
  },
  "Vitamin E": {
    what: "Vitamin E is a fat-soluble antioxidant that protects cell membranes from oxidative damage.",
    hair: "Vitamin E supports scalp circulation and protects follicle cells from oxidative stress — both important for hair density.",
    skin: "One of the most studied vitamins for skin — it protects against UV damage, reduces inflammation, and supports wound healing.",
    energy: "Vitamin E supports immune health and helps protect against the cellular fatigue caused by oxidative stress.",
  },
  "Vitamin C": {
    what: "Vitamin C is a water-soluble antioxidant essential for collagen synthesis and immune function.",
    hair: "Vitamin C helps absorb iron from plant-based foods, and is required for collagen production — a key structural protein in the hair follicle.",
    skin: "Vitamin C is crucial for collagen production, skin brightening, and protection against UV-induced damage. It's one of the most evidence-backed skin nutrients.",
    energy: "Vitamin C supports iron absorption and immune resilience, both of which affect energy and recovery.",
  },
  "Biotin": {
    what: "Biotin (Vitamin B7) is involved in fatty acid synthesis and keratin production — the protein that makes up hair, skin, and nails.",
    hair: "True biotin deficiency causes hair thinning and loss. However, most people have adequate levels — supplementation only helps if you're genuinely deficient.",
    skin: "Biotin deficiency can cause a scaly, red rash around the eyes, nose, and mouth.",
  },
  "TSH": {
    what: "Thyroid Stimulating Hormone — the pituitary's signal to the thyroid to produce more hormone. High TSH often means an underactive thyroid.",
    hair: "Thyroid imbalances are a major cause of hair loss. Both over- and under-active thyroid disrupt hair growth cycles.",
    skin: "Hypothyroidism (high TSH) causes dry, rough, pale skin. Hyperthyroidism (low TSH) can cause excess sweating and skin thinning.",
    energy: "TSH is the most reliable indicator of thyroid function — which governs your entire metabolic rate and energy output.",
  },
  "Free T4": {
    what: "Free T4 is the inactive form of thyroid hormone circulating in the blood. The body converts it to the active T3 form in tissues.",
    hair: "Low Free T4 indicates insufficient thyroid hormone production, contributing to hair shedding and slow regrowth.",
    energy: "Free T4 is a direct marker of thyroid output — low levels slow every metabolic process, causing fatigue and weight gain.",
  },
  "Free T3": {
    what: "Free T3 is the active form of thyroid hormone that directly affects cellular metabolism.",
    hair: "T3 drives the active phase of hair growth (anagen). Low T3 shortens this phase, leading to thinner, slower-growing hair.",
    skin: "Low T3 slows skin cell turnover, contributing to dullness and dryness.",
    energy: "T3 is the hormone that actually powers your cells. Low T3 is strongly associated with fatigue, low mood, weight gain, and brain fog.",
  },
  "Reverse T3": {
    what: "Reverse T3 is an inactive form produced when the body diverts T4 away from active T3 — often a response to chronic stress, illness, or caloric restriction.",
    hair: "High Reverse T3 blocks active thyroid hormone from reaching follicles, mimicking hypothyroidism even when standard tests look normal.",
    energy: "Elevated Reverse T3 is a key marker of 'cellular hypothyroidism' — the body appears to have enough hormone but it isn't being used, causing fatigue and poor recovery.",
  },
  "TPO Antibodies": {
    what: "Thyroid Peroxidase Antibodies — their presence signals an autoimmune attack on the thyroid (Hashimoto's thyroiditis).",
    hair: "Hashimoto's is one of the most common autoimmune causes of hair loss in women.",
    energy: "Autoimmune thyroid disease causes fluctuating hormone levels that lead to cycles of fatigue, brain fog, and poor stress tolerance.",
  },
  "Thyroglobulin Antibodies (TgAb)": {
    what: "Another autoimmune marker for thyroid — elevated levels alongside TPO antibodies strongly suggest Hashimoto's disease.",
    hair: "Like TPO antibodies, high TgAb is associated with autoimmune hair loss.",
    energy: "Chronic thyroid autoimmunity disrupts energy regulation and immune resilience.",
  },
  "Total Testosterone": {
    what: "The total amount of testosterone in the blood, including both bound (inactive) and free (active) portions.",
    hair: "In women, elevated total testosterone is associated with androgenic alopecia (pattern hair loss). In men, it's a more complex relationship.",
    skin: "High testosterone can stimulate sebaceous glands, increasing oil production and contributing to acne.",
  },
  "Free Testosterone": {
    what: "The small fraction of testosterone that is unbound to proteins and biologically active.",
    hair: "Free testosterone is converted to DHT — the hormone most responsible for androgenic hair loss at the follicle level.",
    skin: "Free testosterone directly influences sebaceous gland activity, a key driver of oily skin and acne.",
  },
  "Bioavailable Testosterone": {
    what: "The combined amount of free testosterone plus testosterone loosely bound to albumin — the portion the body can actually use.",
    hair: "This is a more accurate measure of androgenic activity at the follicle than total testosterone alone.",
  },
  "SHBG": {
    what: "Sex Hormone Binding Globulin — a protein that binds sex hormones and renders them inactive. High SHBG lowers free testosterone; low SHBG increases it.",
    hair: "Low SHBG means more free testosterone and DHT are available, which can accelerate androgenic hair loss.",
    energy: "SHBG imbalances affect the availability of sex hormones that regulate mood, libido, and energy.",
  },
  "DHT": {
    what: "Dihydrotestosterone — a potent androgen derived from testosterone via the enzyme 5-alpha reductase.",
    hair: "DHT is the primary hormonal driver of androgenic alopecia. It binds to receptors in follicles and miniaturises them over time, causing progressive thinning.",
    skin: "DHT stimulates sebaceous gland activity, contributing to oily skin and acne.",
  },
  "DHEA-S": {
    what: "Dehydroepiandrosterone Sulphate — a precursor to both oestrogen and testosterone produced by the adrenal glands.",
    hair: "Elevated DHEA-S can increase androgen levels at the follicle, contributing to hair thinning — particularly in women.",
    energy: "DHEA-S plays a role in stress resilience, immune function, and overall vitality. It naturally declines with age.",
  },
  "Androstenedione": {
    what: "A steroid hormone that is a precursor to both testosterone and oestrogens.",
    hair: "Elevated androstenedione can convert to testosterone and DHT, potentially worsening androgenic hair loss.",
  },
  "Estradiol": {
    what: "The primary and most potent form of oestrogen in the body.",
    hair: "Oestrogen prolongs the anagen (growth) phase of hair. Low oestrogen — as seen in menopause or post-partum — is a common trigger for diffuse hair shedding.",
    skin: "Oestrogen maintains skin thickness, hydration, and collagen content. Low levels lead to dry, thin, and less elastic skin.",
    energy: "Oestrogen affects mood, energy, and sleep. Declining levels are associated with fatigue, mood swings, and poor sleep quality.",
  },
  "Progesterone": {
    what: "Progesterone balances oestrogen and plays important roles in the menstrual cycle and stress response.",
    hair: "Progesterone competes with DHT at the follicle, providing a protective effect against androgenic hair loss.",
    energy: "Progesterone has a calming, sleep-promoting effect. Low levels contribute to anxiety, poor sleep, and fatigue.",
  },
  "LH": {
    what: "Luteinising Hormone — signals the ovaries to ovulate and produce oestrogen and progesterone.",
    hair: "LH imbalances — particularly elevated LH in PCOS — are linked to androgen excess and hair loss.",
  },
  "FSH": {
    what: "Follicle Stimulating Hormone — drives egg development and oestrogen production in the ovaries.",
    hair: "Elevated FSH can indicate declining ovarian function and lower oestrogen, which contributes to hair shedding.",
    energy: "FSH changes during perimenopause are associated with fatigue, hot flashes, and mood disruption.",
  },
  "Prolactin": {
    what: "Prolactin is primarily known for stimulating milk production, but it also plays a role in immune function and hormone balance.",
    hair: "Elevated prolactin can suppress oestrogen and progesterone, disrupting the hair growth cycle and causing shedding.",
    energy: "High prolactin is associated with fatigue, low libido, and mood changes.",
  },
  "AMH": {
    what: "Anti-Müllerian Hormone — reflects the number of remaining eggs (ovarian reserve). Not directly a hair or skin marker.",
    energy: "AMH provides context about hormonal ageing — low AMH suggests declining ovarian function, which affects the broader hormonal environment.",
  },
  "Cortisol AM": {
    what: "Cortisol is the primary stress hormone, produced by the adrenal glands. The morning peak is the most informative reading.",
    hair: "Chronically elevated cortisol pushes hair follicles into the telogen (resting/shedding) phase and can trigger alopecia areata.",
    skin: "High cortisol breaks down collagen, increases inflammation, and worsens conditions like acne and eczema.",
    energy: "Cortisol regulates the body's stress response and energy mobilisation. Chronic elevation leads to adrenal fatigue, poor sleep, and burnout.",
  },
  "hs-CRP": {
    what: "High-Sensitivity C-Reactive Protein — a highly sensitive marker of systemic inflammation. Elevated levels indicate the body is in an inflammatory state.",
    hair: "Chronic inflammation is increasingly recognised as a driver of scalp inflammation and follicle miniaturisation.",
    skin: "Inflammation underlies many skin conditions including acne, rosacea, psoriasis, and accelerated ageing.",
    energy: "Systemic inflammation is one of the most important causes of persistent fatigue — the immune system consumes enormous amounts of energy when activated.",
  },
  "CRP": {
    what: "C-Reactive Protein — a standard inflammation marker. Less sensitive than hs-CRP but widely used to detect moderate to severe inflammation.",
    hair: "Elevated CRP reflects a body under inflammatory stress, which diverts resources away from non-essential functions like hair growth.",
    skin: "Inflammation drives many chronic skin conditions and accelerates skin ageing.",
    energy: "Elevated CRP is strongly associated with fatigue, poor recovery, and immune burden.",
  },
  "ESR": {
    what: "Erythrocyte Sedimentation Rate — measures how quickly red blood cells settle at the bottom of a test tube. A general inflammation screen.",
    energy: "Elevated ESR alongside other markers signals active inflammation, which is a common but underappreciated cause of chronic fatigue.",
  },
  "WBC Count": {
    what: "White Blood Cell count — the total number of immune cells. High or low counts can indicate infection, inflammation, or immune dysfunction.",
    energy: "An elevated or suppressed WBC count provides context about whether the immune system is under active stress.",
  },
  "Neutrophils": {
    what: "The most abundant white blood cell, responsible for immediate response to bacterial infection and acute inflammation.",
    skin: "Elevated neutrophils can indicate skin infections or inflammatory skin conditions.",
  },
  "Lymphocytes": {
    what: "Lymphocytes are the key cells of adaptive immunity — they produce antibodies and coordinate specific immune responses.",
    energy: "Low lymphocytes may indicate immune suppression, chronic viral infection, or stress-related immune decline.",
  },
  "Monocytes": {
    what: "Monocytes are immune cells that mature into macrophages — key players in chronic inflammation.",
    skin: "Elevated monocytes suggest an ongoing inflammatory process that can affect skin conditions.",
  },
  "Eosinophils": {
    what: "Eosinophils respond to allergies and parasitic infections. Elevated levels indicate an allergic or inflammatory process.",
    skin: "High eosinophils are associated with eczema, allergic rashes, and other inflammatory skin conditions.",
  },
  "Basophils": {
    what: "Basophils are involved in allergic reactions and inflammatory processes. Elevated levels can signal chronic allergy or autoimmune activity.",
    skin: "Basophilia is sometimes seen in chronic urticaria (hives) and other allergic skin conditions.",
  },
  "Neutrophil / Lymphocyte Ratio": {
    what: "The NLR is a marker of systemic inflammatory stress. A high ratio indicates the immune system is in an inflammatory state.",
    hair: "Elevated NLR has been associated with autoimmune conditions that cause hair loss, including alopecia areata.",
    energy: "A high NLR is a strong predictor of chronic inflammatory fatigue and poor recovery.",
  },
  "ANA": {
    what: "Antinuclear Antibodies — their presence suggests the immune system may be targeting the body's own cell nuclei, which is a hallmark of autoimmune disease.",
    hair: "Positive ANA titres are seen in lupus and other autoimmune conditions that can cause scarring and non-scarring hair loss.",
    skin: "ANA positivity is associated with lupus, which causes the characteristic butterfly rash and photosensitive skin reactions.",
  },
  "Rheumatoid Factor": {
    what: "Rheumatoid Factor is an antibody associated with rheumatoid arthritis and some other autoimmune conditions.",
    hair: "Rheumatoid arthritis and related autoimmune diseases can cause inflammatory alopecia.",
  },
  "Fasting Glucose": {
    what: "Blood sugar measured after an overnight fast — the primary screening test for diabetes and insulin resistance.",
    hair: "Elevated glucose is associated with glycation of follicle proteins and microvascular damage that impairs follicle nutrition.",
    skin: "High blood sugar causes glycation — where sugar molecules damage collagen and elastin — leading to accelerated skin ageing.",
    energy: "Blood sugar instability (spikes and crashes) is one of the most common causes of energy crashes and afternoon fatigue.",
  },
  "HbA1c": {
    what: "Glycated haemoglobin — reflects average blood sugar over the past 2–3 months. It's the gold standard for monitoring long-term glucose control.",
    hair: "Chronically elevated glucose damages the microvasculature that supplies follicles, contributing to progressive thinning.",
    skin: "High HbA1c is associated with reduced skin collagen quality, impaired wound healing, and increased infection risk.",
    energy: "Poor long-term glucose control is a major driver of persistent fatigue and reduced cellular energy production.",
  },
  "Fasting Insulin": {
    what: "Insulin measured after fasting — one of the earliest markers of insulin resistance, often elevated years before glucose rises.",
    hair: "Insulin resistance drives elevated androgens (particularly in PCOS), which is a primary cause of androgenic hair loss.",
    skin: "High insulin stimulates sebaceous glands and androgen production, worsening acne and oiliness.",
    energy: "Insulin resistance impairs the ability of cells to take up glucose for energy, causing fatigue and poor stamina.",
  },
  "HOMA-IR": {
    what: "The Homeostatic Model Assessment of Insulin Resistance — calculated from fasting glucose and insulin. One of the best measures of insulin resistance.",
    hair: "Elevated HOMA-IR reflects insulin resistance — a major driver of PCOS-related hair thinning and androgenic alopecia.",
    skin: "Insulin resistance is linked to skin tags, acanthosis nigricans (dark skin patches), and acne.",
    energy: "Insulin resistance fundamentally impairs how well your body converts food into cellular energy.",
  },
  "Uric Acid": {
    what: "Uric acid is a waste product from purine metabolism. High levels can cause gout and are associated with metabolic syndrome.",
    energy: "Elevated uric acid is linked to chronic inflammation and oxidative stress, both of which reduce energy and resilience.",
  },
  "Total Protein": {
    what: "The total amount of protein in the blood — a general marker of nutritional status and liver function.",
    hair: "Hair is made of protein (keratin). Low total protein suggests overall protein insufficiency, which limits follicle building capacity.",
    skin: "Protein is essential for skin repair, collagen synthesis, and barrier function.",
    energy: "Adequate protein is required for enzyme production, hormone synthesis, and immune function — all critical for energy.",
  },
  "Albumin": {
    what: "Albumin is the most abundant protein in the blood, produced by the liver. It transports many substances and maintains fluid balance.",
    hair: "Low albumin reflects poor nutritional status or liver dysfunction, both of which impair hair follicle support.",
    energy: "Low albumin is associated with chronic illness, malnutrition, and poor functional resilience.",
  },
  "Globulin": {
    what: "Globulins are a group of proteins including antibodies and transport proteins. High globulin can indicate inflammation or immune activation.",
    energy: "Elevated globulin alongside other inflammatory markers suggests chronic immune burden, which is metabolically costly.",
  },
  "A/G Ratio": {
    what: "The albumin-to-globulin ratio — a general indicator of protein balance and liver/immune status.",
    energy: "An inverted A/G ratio can reflect inflammation, liver disease, or protein malnutrition, all affecting energy and vitality.",
  },
  "Total Cholesterol": {
    what: "Total cholesterol is the sum of all cholesterol types in the blood. Context matters — it needs to be interpreted alongside LDL, HDL, and triglycerides.",
    skin: "Cholesterol is a building block of skin cells and vitamin D. Very low cholesterol can impair skin barrier function.",
    energy: "Cholesterol is the precursor to all steroid hormones (including cortisol and sex hormones), so extremes affect hormonal energy systems.",
  },
  "LDL Cholesterol": {
    what: "Low-Density Lipoprotein — often called 'bad' cholesterol. Elevated LDL is the primary driver of cardiovascular plaque formation.",
    energy: "High LDL in the context of metabolic syndrome reflects underlying insulin resistance and inflammation, which affect energy and recovery.",
  },
  "HDL Cholesterol": {
    what: "High-Density Lipoprotein — the 'good' cholesterol that carries excess cholesterol back to the liver for processing.",
    energy: "Low HDL is a marker of metabolic dysfunction and inflammation — both associated with reduced energy and poor cellular health.",
  },
  "Triglycerides": {
    what: "Triglycerides are the primary form of fat stored and transported in the blood. Elevated levels usually reflect excess carbohydrate intake or insulin resistance.",
    skin: "Very high triglycerides can cause eruptive xanthomas (fatty skin deposits) and are associated with sebaceous gland dysfunction.",
    energy: "Elevated triglycerides are a key feature of metabolic syndrome, which is strongly linked to fatigue, insulin resistance, and poor stamina.",
  },
  "Non-HDL Cholesterol": {
    what: "Non-HDL cholesterol represents all the 'atherogenic' (artery-clogging) particles. It's a more complete cardiovascular risk marker than LDL alone.",
  },
  "ApoB": {
    what: "Apolipoprotein B — found on every atherogenic lipoprotein particle. ApoB particle count is considered the most accurate measure of cardiovascular risk.",
  },
  "Lipoprotein(a) (Lp(a))": {
    what: "Lp(a) is a genetically determined lipoprotein. Elevated levels are an independent risk factor for cardiovascular disease, regardless of lifestyle.",
  },
  "ALT": {
    what: "Alanine Aminotransferase — a liver enzyme. Elevated ALT indicates liver cell stress or damage.",
    hair: "Liver health affects hormone metabolism and detoxification — impaired liver function can disrupt hormone balance and worsen hair loss.",
    energy: "Elevated ALT often reflects metabolic liver disease or fatty liver, which impairs the liver's role in energy metabolism and toxin clearance.",
  },
  "AST": {
    what: "Aspartate Aminotransferase — another liver enzyme, also found in muscle. Elevated AST can indicate liver or muscle damage.",
    energy: "AST elevation alongside ALT points to liver stress, which affects the body's ability to process hormones, nutrients, and energy substrates.",
  },
  "GGT": {
    what: "Gamma-Glutamyl Transferase — a sensitive liver and bile duct enzyme. Often the first to rise with alcohol use or liver stress.",
    energy: "Elevated GGT is associated with oxidative stress, metabolic syndrome, and liver burden — all of which affect energy and recovery.",
  },
  "ALP": {
    what: "Alkaline Phosphatase — an enzyme found in the liver, bone, and bile ducts. Elevated levels can indicate liver, bone, or bile duct issues.",
    energy: "Persistent ALP elevation warrants investigation into liver or bone health, which can affect nutrient absorption and energy.",
  },
  "Total Bilirubin": {
    what: "Bilirubin is a breakdown product of haemoglobin. Elevated levels can cause jaundice and indicate liver or haemolytic problems.",
    skin: "High bilirubin causes yellowing of the skin (jaundice) — a visible sign of liver or bile duct dysfunction.",
  },
  "Direct Bilirubin": {
    what: "The water-soluble form of bilirubin processed by the liver. Elevated direct bilirubin usually points to liver or bile duct obstruction.",
  },
  "Indirect Bilirubin": {
    what: "The fat-soluble form before liver processing. Elevated indirect bilirubin suggests haemolysis (breakdown of red blood cells) or Gilbert's syndrome.",
  },
  "Creatinine": {
    what: "Creatinine is a waste product from muscle metabolism, filtered by the kidneys. It's the main marker of kidney function.",
    energy: "Poor kidney function affects fluid balance, electrolyte regulation, and the clearance of metabolic waste — all affecting energy.",
  },
  "eGFR": {
    what: "Estimated Glomerular Filtration Rate — calculated from creatinine. It directly measures how well the kidneys are filtering waste.",
    energy: "Declining eGFR means the body accumulates more metabolic waste, leading to fatigue, poor concentration, and reduced vitality.",
  },
  "Urea / BUN": {
    what: "Blood Urea Nitrogen — a waste product from protein breakdown. Kidney function and protein intake both influence this level.",
    energy: "Elevated BUN alongside low eGFR points to kidney stress, which impairs the body's ability to clear toxins and maintain energy balance.",
  },
  "Sodium": {
    what: "Sodium regulates fluid balance, blood pressure, and nerve/muscle function.",
    energy: "Sodium imbalances (particularly low sodium — hyponatraemia) cause fatigue, headaches, confusion, and muscle weakness.",
  },
  "Potassium": {
    what: "Potassium is critical for heart rhythm, nerve signalling, and muscle contraction.",
    energy: "Low potassium causes muscle weakness, cramping, and fatigue. High potassium can affect heart rhythm.",
  },
  "Chloride": {
    what: "Chloride is an electrolyte that works with sodium to maintain fluid balance and acid-base equilibrium.",
    energy: "Chloride imbalances usually reflect fluid or acid-base disturbances that affect cellular function and energy.",
  },
  "Calcium": {
    what: "Calcium is essential for bone health, muscle contraction, nerve transmission, and cellular signalling.",
    hair: "Calcium ions play a role in hair follicle cycling — some research links calcium channel activity to hair growth regulation.",
    energy: "Low calcium causes muscle cramps, fatigue, and irritability. High calcium can cause lethargy and weakness.",
  },
  "Phosphate": {
    what: "Phosphate is essential for bone structure, energy production (ATP), and cell signalling.",
    energy: "Low phosphate severely impairs ATP (energy currency) production, causing profound fatigue and muscle weakness.",
  },
  "Platelets": {
    what: "Platelets are cell fragments that initiate blood clotting. They're also involved in wound healing and inflammation.",
    skin: "Platelet-Rich Plasma (PRP) — used in BATO treatments — harnesses growth factors from platelets to stimulate skin and hair follicle regeneration.",
    hair: "PRP therapy uses concentrated platelet growth factors to stimulate dormant follicles and support hair regrowth.",
  },
  "MPV": {
    what: "Mean Platelet Volume — larger platelets are more active and metabolically potent.",
    energy: "Elevated MPV is associated with inflammation and cardiovascular risk — context markers for overall metabolic health.",
  },
  "Omega-3 Index": {
    what: "The percentage of EPA and DHA (omega-3 fatty acids) in red blood cell membranes — a marker of long-term omega-3 status.",
    hair: "Omega-3 fatty acids reduce scalp inflammation and support the lipid matrix of the hair follicle.",
    skin: "Omega-3s are potent anti-inflammatories — they reduce redness, dryness, and support the skin's protective lipid barrier.",
    energy: "Omega-3s support mitochondrial function, reduce inflammatory fatigue, and are linked to better mood and cognitive energy.",
  },
  "Homocysteine": {
    what: "Homocysteine is an amino acid that rises when B vitamins (B12, B6, folate) are depleted or when there's a genetic variant affecting methylation.",
    hair: "Elevated homocysteine is linked to impaired hair follicle blood supply and increased oxidative damage to follicle cells.",
    skin: "High homocysteine is associated with impaired collagen cross-linking and accelerated skin ageing.",
    energy: "Elevated homocysteine reflects poor methylation — a cellular process critical for energy production, mood regulation, and DNA repair.",
  },
  "IGF-1": {
    what: "Insulin-like Growth Factor-1 — produced in the liver under the influence of growth hormone. It drives tissue growth and repair.",
    hair: "IGF-1 stimulates hair follicle cell proliferation and prolongs the anagen (growth) phase.",
    skin: "IGF-1 promotes collagen synthesis and skin cell renewal — it's a key driver of youthful skin architecture.",
    energy: "IGF-1 is a major anabolic hormone — it supports muscle maintenance, bone density, and physical resilience. Levels naturally decline with age.",
  },
  "CoQ10": {
    what: "Coenzyme Q10 is a mitochondrial antioxidant essential for cellular energy production.",
    skin: "CoQ10 protects skin cells from oxidative damage and is used topically in anti-ageing formulations.",
    energy: "CoQ10 is the spark plug of the mitochondria — without it, cells cannot produce ATP efficiently. Deficiency causes profound fatigue, especially in those on statins.",
  },
  "Adiponectin": {
    what: "Adiponectin is a hormone secreted by fat cells that improves insulin sensitivity and has anti-inflammatory effects. Low levels indicate metabolic dysfunction.",
    skin: "Low adiponectin is associated with chronic low-grade inflammation — a driver of accelerated skin ageing.",
    energy: "Low adiponectin is a marker of insulin resistance and metabolic dysfunction, both of which are strongly linked to fatigue and poor energy regulation.",
  },
  "Leptin": {
    what: "Leptin is the 'satiety' hormone produced by fat cells. It regulates appetite, metabolism, and energy balance.",
    hair: "Leptin resistance — common in overweight individuals — is associated with increased inflammation and hormonal disruption that can affect hair.",
    energy: "When leptin signalling is disrupted, the brain receives conflicting messages about energy availability, contributing to fatigue, cravings, and poor metabolic efficiency.",
  },
  "Adiponectin / Leptin Ratio": {
    what: "This ratio is a powerful marker of metabolic health. A higher ratio indicates better insulin sensitivity and lower inflammatory burden.",
    skin: "A favourable ratio reflects low systemic inflammation — associated with better skin resilience and slower biological ageing.",
    energy: "The AL ratio is one of the most comprehensive indicators of metabolic vitality — a high ratio correlates with sustained energy, good recovery, and lower chronic disease risk.",
  },
};