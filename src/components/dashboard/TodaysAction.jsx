import React from "react";
import { motion } from "@/components/motion/BatoMotion";
import { CheckCircle2, Droplets, Flame, Package, Sun } from "lucide-react";
import { isFuture, differenceInHours, isBefore, startOfDay } from "date-fns";
import { IlluDroplet, IlluChecklist } from "../illustrations/BatoIllustrations";

export default function TodaysAction({ recentSessions, upcomingAppointments, activePackage, onBookSession, isRTL, t }) {
  const lastSession = recentSessions?.[0];
  const hoursSince = lastSession ? differenceInHours(new Date(), new Date(lastSession.session_date)) : null;
  const hasRecentSession = hoursSince !== null && hoursSince >= 0 && hoursSince < 48;
  const nextApt = upcomingAppointments?.[0];
  const isSessionSoon = nextApt && differenceInHours(new Date(nextApt.appointment_date), new Date()) < 48 && isFuture(new Date(nextApt.appointment_date));

  const recommended = activePackage?.next_recommended_date;
  const hasRemainingSessions = activePackage && (activePackage.sessions_used || 0) < (activePackage.total_sessions || 0);
  const isOverdue = hasRemainingSessions && !nextApt && recommended && isBefore(new Date(recommended), startOfDay(new Date()));

  let actions = [];

  if (isSessionSoon) {
    actions = [
      { icon: Droplets, text: t("Wash your hair the night before", "اغسل شعرك الليلة قبل جلستك") },
      { icon: Sun, text: t("Avoid sun exposure before session", "تجنب التعرض للشمس قبل الجلسة") },
    ];
  } else if (hasRecentSession) {
    actions = [
      { icon: Droplets, text: t("Avoid washing scalp for 48h", "تجنب غسل فروة الرأس لمدة ٤٨ ساعة") },
      { icon: Flame, text: t("No intense exercise today", "تجنب التمارين الشاقة اليوم") },
    ];
  }

  const allDone = !isSessionSoon && !hasRecentSession && !isOverdue;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-[#eeebe6]"
    >
      <div className={`flex items-center justify-between mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="flex items-center gap-2.5">
          <IlluDroplet size={32} color="#c4aa8b" />
          <h2 className="text-sm font-semibold text-[#333435]">{t("Today's Action", "ما عليك فعله اليوم")}</h2>
        </div>
        {isSessionSoon && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
            style={{ background: "rgba(231,203,80,0.12)", color: "#3a2e1e", borderColor: "rgba(231,203,80,0.4)" }}>
            {t("Session Soon", "لديك جلسة قريباً")}
          </span>
        )}
        {hasRecentSession && !isSessionSoon && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-medium border"
            style={{ background: "rgba(196,170,139,0.12)", color: "#3a2e1e", borderColor: "rgba(196,170,139,0.4)" }}>
            {t("Post-Session Care", "رعاية ما بعد الجلسة")}
          </span>
        )}
      </div>

      {isOverdue ? (
        <div className="space-y-3">
          <p className="text-sm text-[#333435]">{t("Your recommended session date has passed. Check the timing with BATO.", "مرّ الموعد المقترح لجلستك. تواصل مع باتو لتحديد الموعد المناسب.")}</p>
          <button onClick={onBookSession} className="rounded-xl px-4 py-2 text-sm font-semibold bg-[#3a2e1e] text-white">{t("Request next session", "اطلب الجلسة التالية")}</button>
        </div>
      ) : allDone ? (
        <div className={`flex items-center gap-3 py-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(196,170,139,0.12)" }}>
            <CheckCircle2 className="w-5 h-5" style={{ color: "#c4aa8b" }} />
          </div>
          <p className={`text-sm text-[#333435] font-medium ${isRTL ? 'text-right' : 'text-left'}`}>{t("You're all set today.", "لا توجد مهام مطلوبة اليوم.")}</p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {actions.map((action, idx) => (
            <div key={idx} className={`flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "#eeebe6" }}>
                <action.icon className="w-4 h-4" style={{ color: "#7c8689" }} />
              </div>
              <p className={`text-sm text-[#333435] flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{action.text}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}