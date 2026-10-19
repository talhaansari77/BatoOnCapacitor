import React from "react";
import { useReducedMotion } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";

export default function HairProgressRing({ progress, total, t }) {
  const reduceMotion = useReducedMotion();
  const known = Number.isFinite(Number(total)) && Number(total) > 0;
  const value = known ? Math.max(0, Math.min(100, Number(progress) || 0)) : 0;
  const circumference = 2 * Math.PI * 40;
  return (
    <div className="bato-hair-progress" role="img"
      aria-label={known ? t(`${value}% of sessions completed`, `اكتملت ${value}% من الجلسات`) : t("Session progress pending", "تقدم الجلسات قيد الانتظار")}>
      <svg viewBox="0 0 88 88" aria-hidden="true">
        <circle cx="44" cy="44" r="40" fill="none" strokeWidth="4" className="bato-hair-progress-track" />
        {value > 0 && <motion.circle cx="44" cy="44" r="40" fill="none" strokeWidth="4"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={false} animate={{strokeDashoffset:circumference * (1 - value / 100)}}
          transition={{duration:reduceMotion ? 0 : 0.45, ease:"easeOut"}}
          className="bato-hair-progress-fill" />}
      </svg>
      <div className="bato-hair-progress-label" aria-hidden="true">
        <span className="bato-hair-progress-value" dir="ltr">{known ? `${value}%` : "—"}</span>
        <span className="bato-hair-progress-caption">{known ? t("complete", "مكتمل") : t("pending", "قيد الانتظار")}</span>
      </div>
    </div>
  );
}
