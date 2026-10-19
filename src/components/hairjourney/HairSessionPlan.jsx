import CareText from "@/components/CareText";
import { ar } from "date-fns/locale";
import { format } from "@/lib/customerFormatting";
import React, { useState } from "react";
import { CheckCircle2, Lock, Circle, ChevronDown, ChevronUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { differenceInDays } from "date-fns";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { useLocation } from "../LocationContext";

function StatusDot({ status }) {
  if (status === "completed")
    return (
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "#c4aa8b" }}>
        <CheckCircle2 className="w-3.5 h-3.5 text-white" />
      </div>
    );
  if (status === "next")
    return (
      <div className="bato-style-surface w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "#fff", border: "2px solid #c4aa8b", boxShadow: "0 0 0 4px rgba(196,170,139,0.15)" }}>
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#c4aa8b" }} />
      </div>
    );
  if (status === "locked")
    return (
      <div className="bato-style-surface w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: "#f9f8f6", border: "1px solid rgba(196,170,139,0.2)" }}>
        <Lock className="w-3 h-3" style={{ color: "rgba(196,170,139,0.35)" }} />
      </div>
    );
  return (
    <div className="bato-style-surface w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
      style={{ background: "#f9f8f6", border: "1px solid rgba(196,170,139,0.15)" }}>
      <Circle className="w-3 h-3" style={{ color: "rgba(196,170,139,0.3)" }} />
    </div>
  );
}

function SessionRow({ step, status, sessionData, isLast, onBook, sessionsUsed, upcomingAppointment, activePackage }) {
  const { t, isRTL } = useLocation();
  const [open, setOpen] = useState(status === "next" || status === "completed");

  const getSessionMeta = (num) => ({
    purpose: num <= 2
      ? t("Start the protocol and prepare the scalp environment.", "ابدأ العلاج وتهيئة فروة الرأس.")
      : num <= 4
      ? t("Continue treatment rhythm and monitor response.", "انتظم في العلاج وتابع استجابتك.")
      : t("Continue the programme and prepare for progress review.", "واصل البرنامج استعداداً لتقييم تقدمك."),
    what: t(`Protocol session ${num}. Treatment is applied to the scalp as per the plan.`, `جلسة العلاج ${num}. يُطبق العلاج على فروة الرأس بحسب خطتك.`),
    aftercare: t("Follow washing, sweating, and product instructions provided by the team.", "اتبع تعليمات الفريق بشأن غسل الشعر والرياضة والمنتجات."),
    note: t("To be updated by your hair team.", "سيحدّث فريق الشعر هذه المعلومات."),
  });

  const getMeta = (step) => {
    if (step.type === "session") return getSessionMeta(step.num);
    if (step.key === "assessment") return {
      purpose: t("Understand scalp condition, hair loss pattern, density, history, and goals.", "فهم حالة فروة الرأس ونمط تساقط الشعر والكثافة والتاريخ والأهداف."),
      what: t("Hair team reviews the case and recommends the programme.", "يراجع فريق الشعر الحالة ويوصي بالبرنامج."),
      outcome: t("Programme selected and treatment plan confirmed.", "تم اختيار البرنامج وتأكيد خطة العلاج."),
    };
    if (step.key === "review") return {
      purpose: t("Team reviews visible progress, photos, response, and next recommendation.", "يراجع الفريق التقدم الظاهر والصور والاستجابة والتوصية التالية."),
      what: t("Session history, photos, and scalp response are assessed by the team.", "يقيّم الفريق سجل الجلسات والصور واستجابة فروة الرأس."),
      outcome: t("Next stage is confirmed — maintenance, renewal, or continuation.", "تحديد المرحلة التالية: الحفاظ على النتائج أو تجديد البرنامج أو مواصلة العلاج."),
    };
    if (step.key === "maintenance") return {
      purpose: t("Long-term care plan after core sessions are completed.", "خطة رعاية طويلة الأمد بعد اكتمال الجلسات الأساسية."),
      what: t("Team defines your maintenance schedule based on treatment response.", "يحدد الفريق جدول متابعة النتائج بحسب استجابتك للعلاج."),
      outcome: t("Maintenance plan designed for sustainable long-term results.", "خطة للحفاظ على نتائجك على المدى الطويل."),
    };
    return {};
  };

  const meta = getMeta(step);
  const textColor = status === "completed" ? "#333435" : status === "next" ? "#3a2e1e" : "#7c8689";

  // Compute next-step date info
  const getNextDateInfo = () => {
    if (upcomingAppointment?.appointment_date) {
      const daysUntil = differenceInDays(new Date(upcomingAppointment.appointment_date), new Date());
      const badge = daysUntil <= 7
        ? { label: t("Due soon", "قريباً"), color: "#c4aa8b", bg: "rgba(196,170,139,0.1)" }
        : { label: t("On track", "حسب الخطة"), color: "#4ade80", bg: "rgba(74,222,128,0.08)" };
      return {
        line: `${(upcomingAppointment.status === "confirmed" ? t("Confirmed", "مؤكد") : t("Awaiting confirmation", "بانتظار التأكيد"))}: ${format(upcomingAppointment.appointment_date, "d MMM yyyy", {locale:isRTL?ar:undefined})}`,
        badge,
      };
    }
    const rec = sessionData?.next_recommended_date || activePackage?.next_recommended_date;
    if (rec) {
      const daysPast = differenceInDays(new Date(), new Date(rec));
      const badge = daysPast > 0
        ? { label: t("Overdue", "تجاوز الموعد المقترح"), color: "#f87171", bg: "rgba(248,113,113,0.08)" }
        : daysPast > -7
        ? { label: t("Due soon", "قريباً"), color: "#c4aa8b", bg: "rgba(196,170,139,0.1)" }
        : { label: t("On track", "حسب الخطة"), color: "#4ade80", bg: "rgba(74,222,128,0.08)" };
      return {
        line: `${t("Recommended", "مقترح")}: ${format(rec, "d MMM yyyy", {locale:isRTL?ar:undefined})}`,
        badge,
      };
    }
    return { line: t("Not scheduled yet", "لم يُحدد بعد"), badge: null };
  };

  return (
    <div className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
      <div className="flex flex-col items-center flex-shrink-0 w-8">
        <StatusDot status={status} />
        {!isLast && (
          <div className="w-0.5 flex-1 min-h-[28px] mt-0.5"
            style={{ background: status === "completed" ? "linear-gradient(to bottom, #c4aa8b, #d4bfa0)" : "rgba(196,170,139,0.18)" }} />
        )}
      </div>

      <div className={`flex-1 min-w-0 pb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
        <button onClick={() => setOpen(o => !o)}
          className={`w-full flex items-center justify-between gap-2 mb-0.5 ${isRTL ? 'flex-row-reverse text-right' : 'text-left'}`}>
          <div className={`flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <p className="text-sm font-semibold leading-snug" style={{ color: textColor }}>{step.label}</p>
            {status === "next" && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(231,203,80,0.12)", color: "#3a2e1e", border: "1px solid rgba(231,203,80,0.3)" }}>
                {t("Next", "التالية")}
              </span>
            )}
            {status === "completed" && (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(196,170,139,0.12)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.25)" }}>
                {t("Done", "مكتمل")}
              </span>
            )}
          </div>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-[#7c8689] flex-shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 text-[#7c8689] flex-shrink-0" />}
        </button>

        {/* Completed session date */}
        {status === "completed" && step.type === "session" && (
          sessionData?.session_date ? (
            <p className="text-[11px] mb-1" style={{ color: "#c4aa8b" }} dir="ltr">
              {format(sessionData.session_date, "d MMM yyyy", {locale:isRTL?ar:undefined})}
            </p>
          ) : (
            <p className="text-[11px] text-[#7c8689] opacity-60 mb-1">{t("Date unavailable", "التاريخ غير متوفر")}</p>
          )
        )}

        {/* Next step: scheduled/recommended date + consistency badge */}
        {status === "next" && step.type === "session" && (() => {
          const { line, badge } = getNextDateInfo();
          return (
            <div className={`flex items-center gap-2 mb-1 flex-wrap ${isRTL ? 'flex-row-reverse justify-end' : ''}`}>
              <p className="text-[11px] text-[#7c8689]" dir={isRTL ? "rtl" : "ltr"}>{line}</p>
              {badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{ background: badge.bg, color: badge.color }}>
                  {badge.label}
                </span>
              )}
            </div>
          );
        })()}

        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="det" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="pt-2 space-y-2.5">
                {meta.purpose && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#c4aa8b" }}>{t("Purpose", "الغرض")}</p>
                    <p className="text-xs text-[#7c8689] leading-relaxed">{meta.purpose}</p>
                  </div>
                )}
                {meta.what && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#c4aa8b" }}>{t("What happens", "ماذا يحدث")}</p>
                    <p className="text-xs text-[#7c8689] leading-relaxed">{meta.what}</p>
                  </div>
                )}
                {meta.aftercare && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#c4aa8b" }}>{t("Aftercare", "الرعاية اللاحقة")}</p>
                    <p className="text-xs text-[#7c8689] leading-relaxed">{meta.aftercare}</p>
                  </div>
                )}
                {sessionData?.specialist_notes && (
                  <div className="p-2.5 rounded-lg" style={{ background: "rgba(231,203,80,0.05)", border: "1px solid rgba(231,203,80,0.15)" }}>
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-1" style={{ color: "#c4aa8b" }}>{t("Team Note", "ملاحظة الفريق")}</p>
                    <p className="text-xs text-[#333435] leading-relaxed italic"><CareText value={sessionData.specialist_notes} prose /></p>
                    {sessionData.specialist_name && (
                      <p className="text-[10px] text-[#7c8689] mt-1">— {sessionData.specialist_name}</p>
                    )}
                  </div>
                )}
                {sessionData?.next_steps && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#c4aa8b" }}>{t("Next Steps", "الخطوات التالية")}</p>
                    <p className="text-xs text-[#7c8689] leading-relaxed">{sessionData.next_steps}</p>
                  </div>
                )}
                {meta.outcome && !sessionData && (
                  <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#c4aa8b" }}>{t("Outcome", "النتيجة")}</p>
                    <p className="text-xs text-[#7c8689] leading-relaxed">{meta.outcome}</p>
                  </div>
                )}
                {status === "next" && onBook && (
                  <Button onClick={onBook} size="sm"
                    className={`w-full rounded-lg h-8 text-xs font-semibold border-0 mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}
                    style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
                    <Calendar className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />
                    {t("Request Session", "اطلب جلسة")} {sessionsUsed + 1}
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function HairSessionPlan({ sessions, totalSessions, sessionsUsed, stageKey, onBook, upcomingAppointments = [], activePackage = null }) {
  const { t } = useLocation();

  const steps = [
    { key: "assessment", label: t("Assessment", "التقييم"), type: "meta" },
    ...Array.from({ length: totalSessions }, (_, i) => ({
      key: `s${i + 1}`,
      label: `${t("Session", "جلسة")} ${i + 1}`,
      type: "session",
      num: i + 1,
    })),
    { key: "review", label: t("Progress Review", "مراجعة التقدم"), type: "meta" },
    { key: "maintenance", label: t("Maintenance Phase", "مرحلة الحفاظ على النتائج"), type: "meta" },
  ];

  const getStatus = (step, idx) => {
    if (idx === 0) return ["treatment_planned","in_treatment","post_treatment","completed"].includes(stageKey) ? "completed" : "upcoming";
    if (step.type === "session") {
      if (step.num <= sessionsUsed) return "completed";
      if (step.num === sessionsUsed + 1) return "next";
      return "upcoming";
    }
    if (step.key === "review") return ["post_treatment", "completed"].includes(stageKey) ? "completed" : "locked";
    if (step.key === "maintenance") return stageKey === "completed" ? "completed" : "locked";
    return "upcoming";
  };

  // The next upcoming appointment (first future scheduled one)
  const nextAppointment = upcomingAppointments?.[0] || null;

  return (
    <div className="pt-1">
      {steps.map((step, idx) => {
        const status = getStatus(step, idx);
        const sd = step.type === "session" ? sessions.find(s => s.session_number === step.num) : null;
        return (
          <SessionRow
            key={step.key}
            step={step}
            status={status}
            sessionData={sd}
            isLast={idx === steps.length - 1}
            onBook={status === "next" ? onBook : null}
            sessionsUsed={sessionsUsed}
            upcomingAppointment={status === "next" ? nextAppointment : null}
            activePackage={activePackage}
          />
        );
      })}
    </div>
  );
}