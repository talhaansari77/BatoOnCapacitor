import { format } from "@/lib/customerFormatting";
import { formatAppointment } from "@/lib/appointments";
import {programCounts} from "@/lib/carePrograms";
import {ar} from "date-fns/locale";
import React from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { Check, Lock } from "lucide-react";
import { isPast, differenceInDays } from "date-fns";
import { IlluTimeline } from "../illustrations/BatoIllustrations";

const getTimelineSteps = (t, totalSessions) => {
  const steps = [{ key: "assessment", label: t("Assessment", "التقييم"), type: "meta" }];
  for (let i = 1; i <= totalSessions; i++) {
    steps.push({ key: `session_${i}`, label: `${t("Session", "الجلسة")} ${i}`, type: "session", num: i });
  }
  steps.push({ key: "review", label: t("Progress Review", "مراجعة التقدم"), type: "meta" });
  steps.push({ key: "maintenance", label: t("Maintenance", "الحفاظ على النتائج"), type: "meta" });
  return steps;
};

// Returns a consistency badge config for the "current/next" step
function getConsistencyStatus(upcomingAppointments, activePackage, t) {
  const nextApt = upcomingAppointments?.[0];
  const recommendedDate = activePackage?.next_recommended_date;

  if (nextApt?.appointment_date) {
    const daysUntil = differenceInDays(new Date(nextApt.appointment_date), new Date());
    if (daysUntil <= 7) return { label: t("Due soon", "قريباً"), color: "#c4aa8b", bg: "rgba(196,170,139,0.1)" };
    return { label: t("On track", "حسب الخطة"), color: "#4ade80", bg: "rgba(74,222,128,0.08)" };
  }
  if (recommendedDate) {
    const daysPast = differenceInDays(new Date(), new Date(recommendedDate));
    if (daysPast > 0) return { label: t("Overdue", "تجاوز الموعد المقترح"), color: "#f87171", bg: "rgba(248,113,113,0.08)" };
    if (daysPast >= -7) return { label: t("Due soon", "قريباً"), color: "#c4aa8b", bg: "rgba(196,170,139,0.1)" };
    return { label: t("On track", "حسب الخطة"), color: "#4ade80", bg: "rgba(74,222,128,0.08)" };
  }
  return { label: t("Not scheduled", "غير محدد"), color: "#7c8689", bg: "rgba(124,134,137,0.08)" };
}

export default function TreatmentTimeline({ activePackage, caseFile, sessionsCount, sessions = [], upcomingAppointments = [], isRTL, t }) {
  const reduceMotion = useReducedMotion();
  if (!activePackage && !caseFile) return null;

  const {total:totalSessions,used:sessionsUsed}=programCounts(activePackage);
  const steps = getTimelineSteps(t, totalSessions);

  const getStepStatus = (index) => {
    if (index === 0) return ["treatment_planned","in_treatment","post_treatment","completed"].includes(caseFile?.case_status) ? "completed" : "upcoming";
    if (index <= sessionsUsed) return "completed";
    if (index === sessionsUsed + 1) return "current";
    if (index >= steps.length - 2) return "locked";
    return "upcoming";
  };

  // Find session data for a given session number
  const getSessionData = (num) =>
    sessions.find(s => s.session_number === num) || null;

  // Date display for completed session
  const getCompletedDateLabel = (step) => {
    if (step.type !== "session") return null;
    const sd = getSessionData(step.num);
    if (sd?.session_date) return format(sd.session_date, "d MMM yyyy", {locale:isRTL?ar:undefined});
    return null;
  };

  // Date/status display for "current" (next) step
  const getNextStepDateLabel = (upcomingAppointments, activePackage) => {
    const nextApt = upcomingAppointments?.[0];
    if (nextApt?.appointment_date) {
      // Real request/confirmed distinction, never a fake confirmation.
      const stateLabel = nextApt.status === "confirmed"
        ? t("Confirmed", "مؤكد")
        : nextApt.status === "scheduled" ? t("Scheduled — awaiting confirmation", "مجدول — بانتظار التأكيد")
        : t("Requested — awaiting clinic confirmation", "مطلوب — بانتظار تأكيد العيادة");
      return {
        line: `${stateLabel}: ${formatAppointment(nextApt, "d MMM yyyy", {locale:isRTL?ar:undefined})}`,
        isScheduled: true,
      };
    }
    const rec = activePackage?.next_recommended_date;
    if (rec) {
      return {
        line: `${t("Recommended", "مقترح")}: ${format(rec, "d MMM yyyy", {locale:isRTL?ar:undefined})}`,
        isScheduled: false,
      };
    }
    return { line: t("Not scheduled yet", "لم يُحدد بعد"), isScheduled: false };
  };

  const consistencyStatus = getConsistencyStatus(upcomingAppointments, activePackage, t);
  const nextStepDateInfo = getNextStepDateLabel(upcomingAppointments, activePackage);

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={reduceMotion ? { duration: 0 } : { delay: 0.15 }}
      dir={isRTL ? "rtl" : "ltr"} className="bg-white rounded-2xl p-5 shadow-sm border border-[#eeebe6]"
    >
      <div className={`flex items-center gap-2.5 mb-4 `}>
        <IlluTimeline size={32} color="#c4aa8b" />
        <h2 className="text-lg leading-7 font-semibold text-[#333435]">
          {t("Treatment Timeline", "مسار العلاج")}
        </h2>
      </div>

      <div className="space-y-0">
        {steps.map((step, idx) => {
          const status = getStepStatus(idx);
          const isLast = idx === steps.length - 1;
          const completedDate = status === "completed" && idx > 0 ? getCompletedDateLabel(step) : null;

          return (
            <div key={step.key} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
              {/* Line + dot column */}
              <div className="relative flex flex-col items-center w-8 self-stretch">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center z-10 ${
                  status === "completed" ? "shadow-sm"
                    : status === "current" ? "bg-white border-2"
                    : status === "locked" ? "border" : ""
                }`}
                style={{
                  background: status === "completed" ? "#c4aa8b"
                    : status === "current" ? "#ffffff"
                    : status === "locked" ? "#eeebe6" : "#f5f4f2",
                  borderColor: status === "current" ? "#c4aa8b"
                    : status === "locked" ? "#c4aa8b" : "transparent",
                  boxShadow: status === "current" ? "0 0 0 4px rgba(196,170,139,0.15)" : undefined,
                }}>
                  {status === "completed" ? (
                    <Check className="w-3.5 h-3.5 text-white" />
                  ) : status === "locked" ? (
                    <Lock className="w-3 h-3" style={{ color: "#c4aa8b" }} />
                  ) : status === "current" ? (
                    <div className="w-2 h-2 rounded-full" style={{ background: "#c4aa8b" }} />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-[#c4aa8b]/30" />
                  )}
                </div>
                {!isLast && (
                  <div className="absolute w-0.5 top-[30px] bottom-0" style={{
                    background: status === "completed"
                      ? "linear-gradient(to bottom, #c4aa8b, #d4bfa0)" : "#eeebe6"
                  }} />
                )}
              </div>

              {/* Label + date */}
              <div className="pb-5 min-w-0 text-start">
                <span className="sr-only">
                  {status === "completed" ? t("Completed", "مكتملة")
                    : status === "current" ? t("Current step", "الخطوة الحالية")
                    : status === "locked" ? t("Later step", "خطوة لاحقة")
                    : t("Upcoming", "قادمة")}
                  {" · "}
                </span>
                <p className="text-sm font-medium leading-6" style={{
                  color: status === "current" ? "#3a2e1e"
                    : status === "completed" ? "#333435" : "#7c8689"
                }}>
                  {step.label}
                </p>

                {/* Completed — status + date */}
                {status === "completed" && idx > 0 && (
                  <div className={`flex items-center gap-1.5 mt-0.5 flex-wrap `}>
                    <p className="text-xs text-[#7c8689]">{t("Completed", "مكتملة")}</p>
                    {completedDate ? (
                      <p className="text-xs" style={{ color: "#c4aa8b" }} dir="ltr">{completedDate}</p>
                    ) : (
                      <p className="text-xs leading-5 text-[#7c8689]">{t("Date unavailable", "التاريخ غير متوفر")}</p>
                    )}
                  </div>
                )}

                {/* Current / next step — label + scheduled date + consistency badge */}
                {status === "current" && (
                  <div className="mt-0.5 space-y-1">
                    <div className={`flex items-center gap-1.5 flex-wrap `}>
                      <p className="text-xs" style={{ color: "#c4aa8b" }}>{t("Next step", "الخطوة التالية")}</p>
                      <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                        style={{ background: consistencyStatus.bg, color: consistencyStatus.color }}>
                        {consistencyStatus.label}
                      </span>
                    </div>
                    <p className="text-xs text-[#7c8689]" dir={isRTL ? "rtl" : "ltr"}>
                      {nextStepDateInfo.line}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}