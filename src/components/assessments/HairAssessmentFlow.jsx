import { QUESTIONS } from "@/lib/hairAssessmentAnswers";
import {toast} from "sonner";
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { motion } from "@/components/motion/BatoMotion";
import { ChevronLeft, ChevronRight, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "../LocationContext";
import AssessmentSummary from "./AssessmentSummary";



export default function HairAssessmentFlow({ onComplete, onCancel, userEmail }) {
  const { t, isRTL } = useLocation();
  const [step, setStep] = useState(0);
  const [responses, setResponses] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [loading, setLoading] = useState(false);
  const questionHeading = useRef(null);
  const previousStep = useRef(step);
  useEffect(() => {
    if (previousStep.current !== step) {
      questionHeading.current?.focus({ preventScroll: true });
      questionHeading.current?.scrollIntoView({ block: "start", behavior: "instant" });
    }
    previousStep.current = step;
  }, [step]);

  const currentQuestion = QUESTIONS[step];
  const progress = Math.round(((step + 1) / QUESTIONS.length) * 100);

  const handleSelect = (value) => {
    if (currentQuestion.multiple) {
      const current = responses[currentQuestion.key] || [];
      const updated = current.includes(value) ? current.filter(v => v !== value) : [...current, value];
      setResponses({ ...responses, [currentQuestion.key]: updated });
    } else {
      setResponses({ ...responses, [currentQuestion.key]: value });
    }
  };

  const handleNext = async () => {
    if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      await handleComplete();
    }
  };

  const handleComplete = async () => {
    if(loading)return;
    setLoading(true);
    try {
      const internalFactors = responses.internal_factors || [];
      const hasInternalConcerns = internalFactors.some(f => 
        ["Stress / poor sleep", "Weight change / diet change", "Pregnancy / postpartum", "Hormonal concerns", "Low iron / vitamin D / thyroid history", "التوتر / قلة النوم", "تغير الوزن / تغير النظام الغذائي", "الحمل / ما بعد الولادة", "مشكلات هرمونية محتملة", "نقص سابق في الحديد أو فيتامين د / مشكلات في الغدة الدرقية"].includes(f)
      );
      const unknownCause = responses.biggest_worry === "I don't know the cause" || responses.biggest_worry === "لا أعرف السبب";

      let recommendedPoint = "consultation";
      if (hasInternalConcerns || unknownCause) recommendedPoint = "biomarker_review";
      else if (responses.main_concern === "Scalp irritation" || responses.main_concern === "تهيج فروة الرأس") recommendedPoint = "team_review";

      try {
        await base44.entities.AssessmentLead.create({
          client_email: userEmail,
          assessment_type: "hair",
          main_concern: responses.main_concern || "",
          timeline: responses.timeline || "",
          pattern: responses.pattern || "",
          previous_treatments: responses.previous_treatments ? (Array.isArray(responses.previous_treatments) ? responses.previous_treatments : [responses.previous_treatments]) : [],
          internal_factors: responses.internal_factors || [],
          biggest_worry: responses.biggest_worry || "",
          photos_uploaded: false,
          recommended_starting_point: recommendedPoint,
          status: "completed",
        });
      } catch (saveError) {
        toast.error(t("Your assessment answers were not saved. You can still discuss them with the Hair Team.","لم تُحفظ إجابات التقييم. يمكنك مناقشتها مع فريق الشعر."));
      }

      // Always show summary regardless of whether save succeeded
      setShowSummary(true);
    } finally {
      setLoading(false);
    }
  };

  if (showSummary) {
    return (
      <AssessmentSummary
        responses={responses}
        userEmail={userEmail}
        onClose={onCancel}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="space-y-5"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#333435]">{t("Hair Assessment", "تقييم الشعر")}</h2>
          <span className="text-sm font-medium" style={{ color: "var(--style-ink)" }}>{progress}%</span>
        </div>
        <div role="progressbar" aria-label={t("Assessment progress", "تقدم التقييم")} aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} className="w-full h-2 rounded-full" style={{ background: "var(--style-soft)", border: "1px solid var(--bato-control-edge)" }}>
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
            style={{ background: "var(--style-control)" }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="space-y-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-3" style={{ color: "#7c8689" }}>
            {t("Question", "السؤال")} {step + 1} {t("of", "من")} {QUESTIONS.length}
          </p>
          <h3 ref={questionHeading} tabIndex={-1} className="text-xl font-bold text-[#333435] scroll-mt-24 focus:outline-none">
            {isRTL ? currentQuestion.questionAr : currentQuestion.questionEn}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-2.5">
          {(isRTL ? currentQuestion.optionsAr : currentQuestion.optionsEn).map((option, idx) => {
            const value = currentQuestion.optionsEn[idx];
            const isSelected = currentQuestion.multiple
              ? (responses[currentQuestion.key] || []).includes(value)
              : responses[currentQuestion.key] === value;

            return (
              <motion.button
                key={idx}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                aria-pressed={isSelected}
                onClick={() => handleSelect(value)}
                className={`w-full p-4 rounded-xl border-2 transition-all font-medium ${isRTL ? 'text-right' : 'text-left'}`}
                style={{
                  borderColor: isSelected ? "var(--style-ink)" : "var(--bato-control-edge)",
                  background: isSelected ? "var(--style-soft)" : "var(--style-surface)",
                  color: "var(--style-ink)",
                }}
              >
                <div className="flex items-center justify-between gap-3">
                  <span>{option}</span>
                  <div
                    className="w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor: "var(--bato-control-edge)",
                      background: isSelected ? "var(--style-control)" : "transparent",
                    }}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full" style={{background:"var(--style-control-ink)"}} />}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 pt-4">
        <Button
          variant="outline"
          onClick={() => setStep(step > 0 ? step - 1 : step)}
          disabled={step === 0}
          className="flex-1 min-h-11"
        >
          <ChevronLeft className={`w-4 h-4 me-2 ${isRTL ? "rotate-180" : ""}`} />
          {t("Back", "رجوع")}
        </Button>
        <Button
          onClick={handleNext}
          disabled={
            !responses[currentQuestion.key] ||
            (Array.isArray(responses[currentQuestion.key]) && responses[currentQuestion.key].length === 0) ||
            loading
          }
          className="flex-1 min-h-11"
          style={{ background: "var(--style-control)", color: "var(--style-control-ink)" }}
        >
          {step === QUESTIONS.length - 1 ? t("Complete", "إكمال") : t("Next", "التالي")}
          {step < QUESTIONS.length - 1 && <ChevronRight className={`w-4 h-4 ms-2 ${isRTL ? "rotate-180" : ""}`} />}
        </Button>
      </div>
    </motion.div>
  );
}