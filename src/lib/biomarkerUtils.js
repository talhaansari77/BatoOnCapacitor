import { BIOMARKER_EXPLANATIONS_AR } from "./biomarkerExplanationsAr";
/**
 * Shared biomarker utility functions — single source of truth.
 * Used by BiomarkerCard, BiomarkersSection, BiomarkerSummary, BiomarkersGrid,
 * and the backend recalculation function.
 *
 * Status hierarchy:
 *   1. Outside general range     → red,    is_priority: true
 *   2. Within general, within BATO → green,  is_priority: false
 *   3. Within general, below BATO → amber,  is_priority: false
 *   4. Within general, above BATO → amber,  is_priority: false
 *   5. Needs review (no ranges)   → grey,   is_priority: false
 */

const DISCLAIMER = "This result should be interpreted together with your full medical history and other laboratory findings. It is not a diagnosis.";

/**
 * Returns { key, label, color, is_priority, subDirection } for a biomarker value.
 *
 * direction:
 *   "higher_until_limit" — higher is better, up to a ceiling
 *   "lower_is_better"    — lower is better
 *   "middle_range"       — optimal is in the middle
 */
export function getBiomarkerStatus(value, direction, healthMin, healthMax, batoMin, batoMax, t) {
  const tFn = t || ((en) => en);
  const hMin = typeof healthMin === "number" ? healthMin : null;
  const hMax = typeof healthMax === "number" ? healthMax : null;

  if (!Number.isFinite(value) || !Number.isFinite(hMin) || !Number.isFinite(hMax) || hMin >= hMax) {
    return { key: "needs_review", label: tFn("Awaiting Review", "بانتظار المراجعة"), color: "#9ca3af", is_priority: false, subDirection: null };
  }

  const bMin = typeof batoMin === "number" ? batoMin : null;
  const bMax = typeof batoMax === "number" ? batoMax : null;
  const hasBato = bMin !== null && bMax !== null && bMin < bMax;

  // ── Step 1: Check general laboratory range ──
  if (value < hMin) {
    return { key: "outside_general_range", label: tFn("Outside General Range", "خارج النطاق العام"), color: "#ef4444", is_priority: true, subDirection: "below" };
  }
  if (value > hMax) {
    return { key: "outside_general_range", label: tFn("Outside General Range", "خارج النطاق العام"), color: "#ef4444", is_priority: true, subDirection: "above" };
  }

  // ── Step 2: Within general range — check BATO target ──
  if (hasBato) {
    if (value >= bMin && value <= bMax) {
      return { key: "within_bato_target", label: tFn("Within BATO Target", "ضمن النطاق المستهدف لدى باتو"), color: "#22c55e", is_priority: false, subDirection: null };
    }
    if (value < bMin) {
      return { key: "below_bato_target", label: tFn("Below BATO Target", "أقل من النطاق المستهدف لدى باتو"), color: "#eab308", is_priority: false, subDirection: "below" };
    }
    if (value > bMax) {
      return { key: "above_bato_target", label: tFn("Above BATO Target", "أعلى من النطاق المستهدف لدى باتو"), color: "#eab308", is_priority: false, subDirection: "above" };
    }
  }

  // Within general range but no BATO target set
  return { key: "needs_review", label: tFn("Awaiting Review", "بانتظار المراجعة"), color: "#9ca3af", is_priority: false, subDirection: null };
}

/**
 * Generates a concise, client-friendly interpretation for a biomarker result.
 * Returns { text, isAutomated }.
 *
 * If the result has been manually reviewed (review_status !== "pending_review"),
 * returns the existing staff_interpretation as a manual interpretation.
 * Otherwise generates an automated preliminary explanation.
 */
export function generateBiomarkerInterpretation(biomarker, language = "en") {
  const {
    current_value,
    unit,
    marker_name,
    marker_direction,
    general_health_min,
    general_health_max,
    bato_target_min,
    bato_target_max,
    review_status,
    staff_interpretation,
  } = biomarker;

  // Recognise the exact legacy seeded template; preserve actual staff-written notes.
  const isSeededTemplate = /^All markers show optimal health\.\s*Excellent baseline(?: for your treatment)?\.?$/i.test((staff_interpretation || "").trim());
  if (["reviewed_by_bato", "reviewed_by_doctor", "updated"].includes(review_status) && staff_interpretation?.trim() && !isSeededTemplate) {
    return { text: staff_interpretation || "", isAutomated: false };
  }

  const status = getBiomarkerStatus(
    current_value, marker_direction,
    general_health_min, general_health_max,
    bato_target_min, bato_target_max
  );

  if (language === "ar") {
    const result = Number.isFinite(current_value) ? String(current_value) + " " + (unit || "") + ". " : "";
    let explanation;
    if (status.key === "outside_general_range") {
      explanation = status.subDirection === "below" ? "النتيجة أقل من النطاق المرجعي العام" : "النتيجة أعلى من النطاق المرجعي العام";
      explanation += " (" + general_health_min + "–" + general_health_max + " " + (unit || "") + "). ينبغي أن يراجعها فريق باتو أو الطبيب.";
    } else if (status.key === "within_bato_target") {
      explanation = "النتيجة ضمن النطاق المستهدف لدى باتو (" + bato_target_min + "–" + bato_target_max + " " + (unit || "") + ").";
    } else if (status.key === "below_bato_target" || status.key === "above_bato_target") {
      explanation = "النتيجة ضمن النطاق المرجعي العام، لكنها " + (status.key === "below_bato_target" ? "أقل من" : "أعلى من") + " النطاق المستهدف لدى باتو (" + bato_target_min + "–" + bato_target_max + " " + (unit || "") + ").";
    } else if (Number.isFinite(current_value) && Number.isFinite(general_health_min) && Number.isFinite(general_health_max) && general_health_min < general_health_max) {
      explanation = "النتيجة ضمن النطاق المرجعي العام (" + general_health_min + "–" + general_health_max + " " + (unit || "") + "). لم يُحدد نطاق مستهدف لدى باتو، وتحتاج إلى مراجعة الفريق.";
    } else {
      explanation = "يلزم توفر نتيجة ونطاق مرجعي صالحين قبل تفسير المؤشر. تحتاج النتيجة إلى مراجعة الفريق.";
    }
    const relevance = BIOMARKER_EXPLANATIONS_AR[marker_name]?.what || "";
    return { text: [result + explanation, relevance, "يُفسر هذا التحليل مع تاريخك الصحي وبقية النتائج، ولا يمثل تشخيصاً."].filter(Boolean).join(" "), isAutomated: true };
  }

  const parts = [];
  const valStr = `${current_value} ${unit || ""}`.trim();

  // ── 1. State result and status ──
  if (status.key === "outside_general_range") {
    if (status.subDirection === "below") {
      parts.push(`${valStr}. This result is below the listed general reference range of ${general_health_min}–${general_health_max} ${unit || ""}.`);
    } else {
      parts.push(`${valStr}. This result is above the listed general reference range of ${general_health_min}–${general_health_max} ${unit || ""}.`);
    }
  } else if (status.key === "below_bato_target") {
    parts.push(`${valStr}. This result is within the listed general reference range (${general_health_min}–${general_health_max} ${unit || ""}) but below BATO's preferred treatment-support range of ${bato_target_min}–${bato_target_max} ${unit || ""}.`);
  } else if (status.key === "above_bato_target") {
    parts.push(`${valStr}. This result is within the listed general reference range (${general_health_min}–${general_health_max} ${unit || ""}) but above BATO's preferred treatment-support range of ${bato_target_min}–${bato_target_max} ${unit || ""}.`);
  } else if (status.key === "within_bato_target") {
    parts.push(`${valStr}. This result is within BATO's preferred treatment-support range of ${bato_target_min}–${bato_target_max} ${unit || ""}.`);
  } else if (Number.isFinite(current_value) && Number.isFinite(general_health_min) && Number.isFinite(general_health_max) && general_health_min < general_health_max) {
    parts.push(`${valStr}. This result is within the listed general reference range of ${general_health_min}–${general_health_max} ${unit || ""}. A BATO target range has not been set.`);
  } else {
    parts.push("A valid result and reference range are needed before this marker can be interpreted. BATO staff review is needed.");
  }

  // ── 2. Direction-aware explanation ──
  const dir = marker_direction || "middle_range";
  if (status.key === "within_bato_target") {
    if (dir === "higher_until_limit") {
      parts.push("This result is within BATO's preferred support range.");
    } else if (dir === "lower_is_better") {
      parts.push("This result is within BATO's preferred range.");
    } else {
      parts.push("The result is within the preferred range.");
    }
  } else if (status.key === "below_bato_target") {
    if (dir === "higher_until_limit") {
      parts.push("This result is below BATO's preferred support range.");
    } else if (dir === "lower_is_better") {
      parts.push("Lower values may generally be preferred for this marker, but the result should still remain within an appropriate clinical range.");
    } else {
      parts.push("The result is below the preferred range.");
    }
  } else if (status.key === "above_bato_target") {
    if (dir === "higher_until_limit") {
      parts.push("This result is above the listed target range and should be interpreted in context.");
    } else if (dir === "lower_is_better") {
      parts.push("This result is above BATO's preferred range.");
    } else {
      parts.push("The result is above the preferred range.");
    }
  }

  // ── 3. Relevance (from explanation data if available) ──
  let relevance = getMarkerRelevance(marker_name);
  if (relevance) {
    parts.push(relevance);
  }

  // ── 4. Staff review recommendation ──
  if (status.key === "outside_general_range") {
    parts.push("BATO staff or an appropriate clinician should review this result.");
  } else if (status.key === "needs_review") {
    parts.push("BATO staff review is recommended.");
  }

  // ── 5. Disclaimer ──
  parts.push(DISCLAIMER);

  return { text: parts.join(" "), isAutomated: true };
}

// Keep every client-facing summary consistent with the card without rewriting stored records.
export function getBiomarkerDisplayResult(biomarker) {
  const status = getBiomarkerStatus(biomarker.current_value, biomarker.marker_direction, biomarker.general_health_min, biomarker.general_health_max, biomarker.bato_target_min, biomarker.bato_target_max);
  const interpretation = generateBiomarkerInterpretation(biomarker);
  return { ...biomarker, is_priority: status.is_priority,
    ...(interpretation.isAutomated ? { review_status: "pending_review", reviewed_by: null, reviewed_date: null } : {})
  };
}

// Brief relevance line per marker — static import to avoid circular dependency issues
import { BIOMARKER_EXPLANATIONS as _EXPLANATIONS } from "@/lib/biomarkerExplanations";

function getMarkerRelevance(markerName) {
  const exp = _EXPLANATIONS[markerName];
  if (!exp) return null;
  return exp.what || null;
}

/**
 * Computes a panel-level summary from biomarkers that already have .status attached.
 * Returns { withinTarget, belowTarget, aboveTarget, outsideRange, needsReview, total }
 */
export function computePanelSummary(biomarkers) {
  const summary = { withinTarget: 0, belowTarget: 0, aboveTarget: 0, outsideRange: 0, needsReview: 0, total: 0 };
  for (const b of biomarkers) {
    const key = b.status?.key;
    if (!key) continue;
    summary.total += 1;
    if (key === "within_bato_target") summary.withinTarget += 1;
    else if (key === "below_bato_target") summary.belowTarget += 1;
    else if (key === "above_bato_target") summary.aboveTarget += 1;
    else if (key === "outside_general_range") summary.outsideRange += 1;
    else if (key === "needs_review") summary.needsReview += 1;
  }
  return summary;
}

/**
 * Returns indicator position as a percentage (2–98) on the bar.
 * The bar domain is healthMin → healthMax (matching the edge labels).
 * Out-of-range values are clamped to 2% / 98%.
 */
export function getBiomarkerPosition(value, healthMin, healthMax) {
  const hMin = typeof healthMin === "number" ? healthMin : null;
  const hMax = typeof healthMax === "number" ? healthMax : null;
  if (hMin === null || hMax === null || hMin >= hMax) return 50;

  const pct = ((value - hMin) / (hMax - hMin)) * 100;
  return Math.max(2, Math.min(98, pct));
}

/**
 * Returns { batoLeftPct, batoRightPct } for rendering the BATO target zone
 * within the same healthMin → healthMax domain used by getBiomarkerPosition.
 */
export function getBatoZonePcts(value, healthMin, healthMax, batoMin, batoMax) {
  const hMin = typeof healthMin === "number" ? healthMin : 0;
  const hMax = typeof healthMax === "number" ? healthMax : 100;
  if (hMin >= hMax) return { batoLeftPct: 0, batoRightPct: 0 };

  const hasBato = typeof batoMin === "number" && typeof batoMax === "number" && batoMin < batoMax;
  if (!hasBato) return { batoLeftPct: 0, batoRightPct: 0 };

  const range = hMax - hMin;
  const leftPct = Math.max(0, Math.min(100, ((batoMin - hMin) / range) * 100));
  const rightPct = Math.max(0, Math.min(100, 100 - ((batoMax - hMin) / range) * 100));
  return { batoLeftPct: leftPct, batoRightPct: rightPct };
}