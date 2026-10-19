import HairProgressRing from "./HairProgressRing";
import CareText from "@/components/CareText";
import { ar } from "date-fns/locale";
import {programCounts} from "@/lib/carePrograms";
import { format } from "@/lib/customerFormatting";
import React from "react";
import { motion } from "@/components/motion/BatoMotion";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";

import { useLocation } from "../LocationContext";

export default function HairJourneyHero({ activePackage, caseFile, sessions, onBook }) {
  const { t, isRTL } = useLocation();

  const stageLabels = {
    initial_consultation: t("Assessment", "التقييم"),
    treatment_planned:    t("Planning", "التخطيط"),
    in_treatment:         t("Activation Phase", "مرحلة بدء العلاج"),
    post_treatment:       t("Post Treatment", "ما بعد العلاج"),
    completed:            t("Completed", "مكتمل"),
  };

  const phaseExplains = {
    initial_consultation: t("Your initial assessment is in progress. The team is reviewing your case to recommend the right plan.", "يراجع الفريق تقييمك الأولي لاختيار الخطة المناسبة."),
    treatment_planned:    t("Your plan has been designed. Sessions will begin shortly.", "تم تصميم خطتك. ستبدأ الجلسات قريبًا."),
    in_treatment:         t("Your current phase focuses on preparing the scalp environment, building treatment rhythm, and monitoring early response before visible progress is reviewed.", "تركز هذه المرحلة على تهيئة فروة الرأس والانتظام في الجلسات ومتابعة الاستجابة المبكرة قبل تقييم التحسن الظاهر."),
    post_treatment:       t("Your hair is consolidating the gains from treatment. The team is monitoring your response.", "يتابع الفريق استجابتك للعلاج ويعمل على الحفاظ على التحسن."),
    completed:            t("You have completed your core programme. Long-term maintenance is now the focus.", "أكملت البرنامج الأساسي. نركز الآن على الحفاظ على النتائج على المدى الطويل."),
  };

  const {used:sessionsUsed,total:totalSessions,progress,remaining}=programCounts(activePackage);
  const stageKey = caseFile?.case_status || "pending";
  const stageName = stageLabels[stageKey] || t("Treatment details pending", "بانتظار تحديث تفاصيل العلاج");
  const phaseExplain = phaseExplains[stageKey] || "";


  const startDate = activePackage?.start_date || caseFile?.start_date;

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bato-style-hero bato-hair-active-hero relative overflow-hidden rounded-3xl p-5 min-[390px]:p-6 shadow-lg"
      style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 55%, #2e2418 100%)" }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 85% 8%, rgba(231,203,80,0.12) 0%, transparent 50%), radial-gradient(circle at 10% 88%, rgba(196,170,139,0.08) 0%, transparent 55%)" }} />

      <div className="relative z-10">
        <p className="text-xs font-semibold tracking-widest uppercase mb-0.5" style={{ color: "rgba(196,170,139,0.7)" }}>
          {t("Hair Journey · Active Programme", "رحلة الشعر · برنامج نشط")}
        </p>

        <h2 className="text-white font-bold text-lg leading-snug mb-1">
          <CareText value={activePackage?.package_name || t("Hair Programme", "برنامج الشعر")} />
        </h2>

        <p className="text-xs mb-4" style={{ color: "rgba(238,235,230,0.75)" }}>
          {t("Non-surgical hair restoration", "استعادة كثافة الشعر دون جراحة")}
        </p>

        <div className="grid grid-cols-[80px_minmax(0,1fr)] min-[360px]:grid-cols-[88px_minmax(0,1fr)] items-center gap-4 mb-5">
          <HairProgressRing progress={progress} total={totalSessions} t={t} />

          <div className={`flex-1 min-w-0 space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(196,170,139,0.8)" }}>{t("Sessions", "الجلسات")}</p>
              <p className="text-white font-semibold text-sm">{t("Session", "جلسة")} {sessionsUsed} {t("of", "من")} {totalSessions}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(196,170,139,0.8)" }}>{t("Current Phase", "المرحلة الحالية")}</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#c4aa8b" }} />
                <p className="text-white font-semibold text-sm">{stageName}</p>
              </div>
            </div>
            {startDate && (
              <div>
                <p className="text-xs uppercase tracking-widest" style={{ color: "rgba(196,170,139,0.8)" }}>{t("Started", "تاريخ البدء")}</p>
                <p className="text-white font-semibold text-sm">{format(startDate, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})}</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {caseFile?.assigned_specialist && (
            <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(196,170,139,0.12)" }}>
              <p className="text-xs" style={{ color: "rgba(196,170,139,0.8)" }}>{t("Specialist", "المختص")}</p>
              <p className="text-white text-xs font-semibold truncate"><CareText value={caseFile.assigned_specialist}/></p>
            </div>
          )}
          {caseFile?.treatment_goals && (
            <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(196,170,139,0.12)" }}>
              <p className="text-xs" style={{ color: "rgba(196,170,139,0.8)" }}>{t("Goal", "الهدف")}</p>
              <p className="text-white text-xs font-semibold line-clamp-2"><CareText value={caseFile.treatment_goals} prose /></p>
            </div>
          )}
          {remaining > 0 && (
            <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(196,170,139,0.12)" }}>
              <p className="text-xs" style={{ color: "rgba(196,170,139,0.8)" }}>{t("Remaining", "المتبقي")}</p>
              <p className="text-white text-xs font-semibold">{remaining} {remaining !== 1 ? t("sessions", "جلسات") : t("session", "جلسة")}</p>
            </div>
          )}
          {activePackage?.next_recommended_date && (
            <div className="rounded-xl p-2.5" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(196,170,139,0.12)" }}>
              <p className="text-xs" style={{ color: "rgba(196,170,139,0.8)" }}>{t("Next Recommended", "الموعد المقترح")}</p>
              <p className="text-white text-xs font-semibold">{format(activePackage.next_recommended_date, isRTL ? "d MMM" : "MMM d", {locale:isRTL?ar:undefined})}</p>
            </div>
          )}
        </div>

        {phaseExplain && (
          <div className="rounded-xl p-3 mb-4" style={{ background: "rgba(196,170,139,0.08)", border: "1px solid rgba(196,170,139,0.15)" }}>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(238,235,230,0.7)" }}>{phaseExplain}</p>
          </div>
        )}

        {remaining > 0 && (
          <Button onClick={onBook} className={`w-full rounded-xl min-h-12 h-auto py-3 text-sm font-semibold border-0`} style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
            <Calendar className="w-4 h-4 me-2" />
            {t("Request Session", "اطلب جلسة")} {sessionsUsed + 1}
          </Button>
        )}
        {totalSessions > 0 && remaining === 0 && stageKey !== "completed" && (
          <div className="text-center py-1">
            <p className="text-xs" style={{ color: "rgba(196,170,139,0.7)" }}>{t("All sessions completed — awaiting progress review", "اكتملت جميع الجلسات — في انتظار مراجعة التقدم")}</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}