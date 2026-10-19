import React from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { ChevronLeft, ChevronRight, Stethoscope } from "lucide-react";
import { useLocation as useLocationCtx } from "../LocationContext";

export default function OnboardingShell({ children, step, totalSteps, onBack, showBack = true, showProgress = true, stepLabels }) {
  const { isRTL,t } = useLocationCtx();
  const pct = totalSteps > 0 ? Math.round((step / totalSteps) * 100) : 0;
  const currentLabel = stepLabels && step >= 1 && step <= stepLabels.length ? stepLabels[step - 1] : null;
  const BackIcon = isRTL ? ChevronRight : ChevronLeft;

  return (
    <div className="bato-onboarding min-h-screen flex flex-col" style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
        <div className={`flex items-center gap-2.5`}>
          {showBack && onBack ? (
            <button aria-label={t("Previous step","الخطوة السابقة")} onClick={onBack} className="w-11 h-11 flex items-center justify-center rounded-xl hover:bg-[#eeebe6] transition-colors">
              <BackIcon className="w-4 h-4 text-[#7c8689]" />
            </button>
          ) : (
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "#3a2e1e" }}>
              <Stethoscope className="w-4 h-4" style={{ color: "#c4aa8b" }} />
            </div>
          )}
          <div className={isRTL ? "text-right" : ""}>
            <span className="font-semibold text-sm text-[#333435]">{isRTL?"باتو":"BATO"}</span>
            {currentLabel && (
              <p className="text-xs text-[#7c8689] leading-relaxed mt-0.5">{currentLabel}</p>
            )}
          </div>
        </div>
        {showProgress && totalSteps > 0 && (
          <div className="flex items-center gap-2">
            <div role="progressbar" aria-label={t("Onboarding progress","تقدم التسجيل")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} className="bato-progress-track w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "#eeebe6" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full"
                style={{ background: "linear-gradient(to right, #c4aa8b, #e7cb50)" }}
              />
            </div>
            <span className="text-xs font-medium text-[#7c8689]">{pct}%</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-lg mx-auto px-4 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}