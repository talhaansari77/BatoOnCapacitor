import CareText from "@/components/CareText";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, AlertCircle, ShieldCheck, Clock } from "lucide-react";
import { BIOMARKER_EXPLANATIONS_AR } from "@/lib/biomarkerExplanationsAr";
import { BIOMARKER_EXPLANATIONS } from "@/lib/biomarkerExplanations";
import { useLocation } from "../LocationContext";
import { useNavigate } from "react-router-dom";
import { getBiomarkerStatus, getBiomarkerPosition, getBatoZonePcts, generateBiomarkerInterpretation } from "@/lib/biomarkerUtils";

const REVIEW_LABELS = {
  pending_review: { label: "Automated preliminary explanation — awaiting BATO review", color: "#9ca3af" },
  reviewed_by_bato: { label: "Reviewed by BATO staff", color: "#22c55e" },
  reviewed_by_doctor: { label: "Reviewed by doctor", color: "#22c55e" },
  updated: { label: "Updated", color: "#eab308" },
};

export default function BiomarkerCard({ biomarker, isExpanded, onToggle, isPriority = false }) {
  const { t, isRTL } = useLocation();
  const navigate = useNavigate();
  const {
    marker_name,
    current_value,
    unit,
    marker_direction,
    general_health_min: healthMin,
    general_health_max: healthMax,
    bato_target_min: batoMin,
    bato_target_max: batoMax,
    review_status,
    reviewed_by,
    reviewed_date,
    category,
  } = biomarker;

  const status = getBiomarkerStatus(current_value, marker_direction, healthMin, healthMax, batoMin, batoMax, t);
  const barPosition = getBiomarkerPosition(current_value, healthMin, healthMax);

  const hasBatoTarget = typeof batoMin === "number" && typeof batoMax === "number" && batoMin < batoMax;
  const { batoLeftPct, batoRightPct } = getBatoZonePcts(current_value, healthMin, healthMax, batoMin, batoMax);

  const interpretation = generateBiomarkerInterpretation(biomarker, isRTL ? "ar" : "en");
  const reviewConfig = interpretation.isAutomated ? REVIEW_LABELS.pending_review : (REVIEW_LABELS[review_status] || REVIEW_LABELS.pending_review);

  const categoryColors = {
    hair_support: { label: t("Hair Support", "دعم الشعر"), bg: "rgba(196,170,139,0.08)" },
    skin_recovery: { label: t("Skin & Recovery", "البشرة والتعافي"), bg: "rgba(196,170,139,0.06)" },
    energy_wellness: { label: t("Energy & Wellness", "الطاقة والعافية"), bg: "rgba(196,170,139,0.08)" },
    hormonal_balance: { label: t("Hormonal Balance", "التوازن الهرموني"), bg: "rgba(155,139,126,0.08)" },
    inflammation: { label: t("Inflammation", "الالتهاب"), bg: "rgba(139,125,112,0.08)" },
    medical_safety: { label: t("Medical Safety", "السلامة الطبية"), bg: "rgba(124,111,99,0.08)" },
    cardiometabolic: { label: t("Cardiometabolic", "القلب والأيض"), bg: "rgba(109,97,87,0.08)" },
    advanced: { label: t("Advanced", "متقدم"), bg: "rgba(94,83,75,0.08)" },
    medical_review: { label: t("Medical Review", "المراجعة الطبية"), bg: "rgba(196,170,139,0.1)" },
  };

  const catConfig = categoryColors[category] || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className="bato-style-surface rounded-2xl border overflow-hidden transition-all"
      style={{
        background: "#fff",
        borderColor: isPriority ? "rgba(239,68,68,0.3)" : "rgba(196,170,139,0.15)",
        boxShadow: isPriority ? "0 0 0 1px rgba(239,68,68,0.2)" : "none",
      }}
    >
      {/* Header */}
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-start justify-between gap-3 hover:bg-[#fafaf9] transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="text-sm font-semibold text-[#333435]"><CareText value={marker_name} /></h4>
            {isPriority && <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold" style={{ color: status.color }}>
              <CareText value={current_value} />
            </span>
            <span className="text-xs text-[#7c8689]"><CareText value={unit} /></span>
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{
                background: `${status.color}20`,
                color: status.color,
                border: `1px solid ${status.color}40`,
              }}
            >
              <CareText value={status.label} />
            </span>
          </div>

          {/* Biomarker Bar */}
          <div className="mb-3">
            <div className="relative h-8 bg-[#f9f8f6] rounded-lg overflow-hidden border border-[#eeebe6]">
              <div className="absolute h-full opacity-20" style={{ background: status.color, left: "0%", right: "0%" }} />
              {hasBatoTarget && (
                <div className="absolute h-full opacity-30" style={{ background: "#c4aa8b", left: `${batoLeftPct}%`, right: `${batoRightPct}%` }} />
              )}
              <div className="absolute top-0 h-full w-1 transition-all" style={{ background: status.color, left: `${barPosition}%`, transform: "translateX(-50%)" }}>
                <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full"
                  style={{ background: status.color, boxShadow: `0 0 0 2px white, 0 0 0 3px ${status.color}` }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-between px-2 pointer-events-none">
                <span className="text-[9px] text-[#7c8689] font-medium"><CareText value={healthMin} /></span>
                <span className="text-[9px] text-[#7c8689] font-medium"><CareText value={healthMax} /></span>
              </div>
            </div>
          </div>

          {/* Range info */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#7c8689]">{t("General Reference Range:", "النطاق المرجعي العام:")}</span>
              <span className="text-[#333435] font-medium"><CareText value={healthMin} /> – <CareText value={healthMax} /> <CareText value={unit} /></span>
            </div>
            {hasBatoTarget ? (
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#7c8689]">{t("BATO Target Range:", "النطاق المستهدف لدى باتو:")}</span>
                <span className="text-[#333435] font-medium"><CareText value={batoMin} /> – <CareText value={batoMax} /> <CareText value={unit} /></span>
              </div>
            ) : (
              <div className="text-xs text-[#7c8689] italic">{t("BATO target not set yet", "لم يُحدد النطاق المستهدف لدى باتو بعد")}</div>
            )}
          </div>

          {/* Collapsed summary line */}
          {!isExpanded && interpretation.text && (
            <div className="mt-2.5 text-xs text-[#7c8689] leading-relaxed line-clamp-2">
              <CareText value={interpretation.text} />
            </div>
          )}
        </div>

        <ChevronDown
          className="w-4 h-4 text-[#7c8689] flex-shrink-0 mt-1 transition-transform"
          style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 border-t border-[#eeebe6]">
              {/* Review status badge */}
              <div className="mb-3 p-2.5 rounded-lg flex items-start gap-2" style={{ background: `${reviewConfig.color}10`, border: `1px solid ${reviewConfig.color}30` }}>
                {interpretation.isAutomated ? (
                  <Clock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: reviewConfig.color }} />
                ) : (
                  <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: reviewConfig.color }} />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold" style={{ color: reviewConfig.color }}>
                    {t(reviewConfig.label, interpretation.isAutomated ? "شرح آلي أولي — بانتظار مراجعة باتو" : review_status === "reviewed_by_doctor" ? "راجعه الطبيب" : review_status === "updated" ? "محدّث" : "راجعه فريق باتو")}
                  </p>
                  {!interpretation.isAutomated && reviewed_by && (
                    <p className="text-[10px] text-[#7c8689] mt-0.5">
                      {t("Reviewed by", "راجعه")}: <CareText value={reviewed_by} />
                      <CareText value={reviewed_date && ` · ${new Date(reviewed_date).toLocaleDateString(isRTL ? "ar-AE" : "en-GB")}`} />
                    </p>
                  )}
                </div>
              </div>

              {/* Interpretation text */}
              {interpretation.text && (
                <div className="mb-3 p-3 rounded-lg" style={{ background: interpretation.isAutomated ? "rgba(156,163,175,0.06)" : "rgba(196,170,139,0.06)", border: `1px solid ${interpretation.isAutomated ? "rgba(156,163,175,0.15)" : "rgba(196,170,139,0.15)"}` }}>
                  <p className="text-xs leading-relaxed text-[#333435]"><CareText value={interpretation.text} /></p>
                </div>
              )}

              {/* Explanation */}
              {(() => {
                const exp = (isRTL ? BIOMARKER_EXPLANATIONS_AR : BIOMARKER_EXPLANATIONS)[marker_name];
                if (!exp) return null;
                const tags = [
                  exp.hair && { label: t("Hair Support", "دعم الشعر"), icon: "✦", color: "#c4aa8b" },
                  exp.skin && { label: t("Skin & Recovery", "البشرة والتعافي"), icon: "✦", color: "#d4a574" },
                  exp.energy && { label: t("Energy & Wellness", "الطاقة والعافية"), icon: "✦", color: "#b8956a" },
                ].filter(Boolean);
                return (
                  <div className="mb-4 space-y-3">
                    <div className="bato-style-surface p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
                      <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "#7c8689" }}>{t("What it measures", "ما الذي يقيسه")}</p>
                      <p className="text-xs text-[#333435] leading-relaxed"><CareText value={exp.what} /></p>
                    </div>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                          <span key={tag.label} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: `${tag.color}15`, color: tag.color, border: `1px solid ${tag.color}30` }}>
                            <CareText value={tag.icon} /> <CareText value={tag.label} />
                          </span>
                        ))}
                      </div>
                    )}
                    {exp.hair && (
                      <div className="p-3 rounded-xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#c4aa8b" }}>✦ {t("Hair Support", "دعم الشعر")}</p>
                        <p className="text-xs text-[#333435] leading-relaxed"><CareText value={exp.hair} /></p>
                      </div>
                    )}
                    {exp.skin && (
                      <div className="p-3 rounded-xl" style={{ background: "rgba(212,165,116,0.06)", border: "1px solid rgba(212,165,116,0.15)" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#d4a574" }}>✦ {t("Skin & Recovery", "البشرة والتعافي")}</p>
                        <p className="text-xs text-[#333435] leading-relaxed"><CareText value={exp.skin} /></p>
                      </div>
                    )}
                    {exp.energy && (
                      <div className="p-3 rounded-xl" style={{ background: "rgba(184,149,106,0.06)", border: "1px solid rgba(184,149,106,0.15)" }}>
                        <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "#b8956a" }}>✦ {t("Energy & Wellness", "الطاقة والعافية")}</p>
                        <p className="text-xs text-[#333435] leading-relaxed"><CareText value={exp.energy} /></p>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Category info */}
              <div className="mb-3 text-xs">
                <p className="text-[#7c8689] mb-1">{t("Relevant to:", "ذو صلة بـ:")}</p>
                <span className="inline-block px-2 py-1 rounded-full font-medium text-[#333435]" style={{ background: catConfig.bg }}>
                  <CareText value={catConfig.label} />
                </span>
              </div>

              {/* CTA for outside general range */}
              {status.key === "outside_general_range" && (
                <button
                  onClick={() => navigate("/Messages?channel=medical_team&context=health_review")}
                  className="w-full py-2 text-xs font-medium text-center rounded-lg mt-2"
                  style={{
                    background: "rgba(239,68,68,0.1)",
                    color: "#dc2626",
                    border: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  {t("Contact your specialist", "تواصل مع أخصائيك")}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}