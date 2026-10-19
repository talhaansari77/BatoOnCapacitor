import React from "react";
import { CheckCircle2, AlertCircle, ArrowUpCircle, ArrowDownCircle, HelpCircle } from "lucide-react";
import { useLocation } from "../LocationContext";
import { computePanelSummary } from "@/lib/biomarkerUtils";

function SummaryPill({ icon: Icon, label, count, color }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl flex-shrink-0" style={{ background: `${color}12`, border: `1px solid ${color}30` }}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color }} />
      <span className="text-xs font-medium text-[#333435]">{label}</span>
      <span className="text-sm font-bold" style={{ color }}>{count}</span>
    </div>
  );
}

export default function BiomarkerSummary({ biomarkers }) {
  const { isRTL, t } = useLocation();
  const summary = computePanelSummary(biomarkers);

  if (summary.total === 0) return null;

  const allWithin = summary.withinTarget === summary.total;

  return (
    <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "rgba(196,170,139,0.15)" }}>
      <p className="text-xs font-semibold uppercase tracking-wider text-[#7c8689] mb-3">
        {t("Panel Summary", "ملخص التحاليل")}
      </p>

      {allWithin ? (
        <p className="text-sm text-[#333435] leading-relaxed">
          {t(
            `All ${summary.total} markers are within BATO's preferred range.`,
            `جميع المؤشرات الـ ${summary.total} ضمن النطاق المستهدف لدى باتو.`
          )}
        </p>
      ) : (
        <>
          <p className="text-sm text-[#333435] leading-relaxed mb-3">
            {t(
              `${summary.withinTarget} marker${summary.withinTarget === 1 ? "" : "s"} within BATO's preferred range, ${summary.belowTarget + summary.aboveTarget} outside the preferred range${summary.outsideRange > 0 ? `, and ${summary.outsideRange} require staff review.` : "."}`,
              `ضمن النطاق المستهدف: ${summary.withinTarget}، خارج النطاق المستهدف: ${summary.belowTarget + summary.aboveTarget}${summary.outsideRange > 0 ? `، خارج النطاق المرجعي العام ويحتاج إلى مراجعة: ${summary.outsideRange}.` : "."}`
            )}
          </p>

          <div className="flex flex-wrap gap-2">
            {summary.withinTarget > 0 && (
              <SummaryPill icon={CheckCircle2} label={t("Within target", "ضمن الهدف")} count={summary.withinTarget} color="#22c55e" />
            )}
            {summary.belowTarget > 0 && (
              <SummaryPill icon={ArrowDownCircle} label={t("Below target", "أقل من النطاق المستهدف")} count={summary.belowTarget} color="#eab308" />
            )}
            {summary.aboveTarget > 0 && (
              <SummaryPill icon={ArrowUpCircle} label={t("Above target", "أعلى من النطاق المستهدف")} count={summary.aboveTarget} color="#eab308" />
            )}
            {summary.outsideRange > 0 && (
              <SummaryPill icon={AlertCircle} label={t("Outside range", "خارج النطاق")} count={summary.outsideRange} color="#ef4444" />
            )}
            {summary.needsReview > 0 && (
              <SummaryPill icon={HelpCircle} label={t("Awaiting review", "بانتظار المراجعة")} count={summary.needsReview} color="#9ca3af" />
            )}
          </div>
        </>
      )}
    </div>
  );
}