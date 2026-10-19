import React from "react";
import { useLocation } from "../LocationContext";
import { motion } from "framer-motion";
import { CheckCircle2, Clock, ChevronRight } from "lucide-react";

// Small passive strip — shown when profile is complete or BATO is handling it
export default function ReadinessCompactStrip({ status, onOpen }) {
  const { t } = useLocation();
  const isPending = status === "pending_confirmation";
  const isReady = status === "ready";

  const icon = isReady
    ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#4ade80" }} />
    : <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#c4aa8b" }} />;

  const text = isReady
    ? t("Your BATO Profile is ready. Your team can review your case before your visit.", "ملفك لدى باتو جاهز. يستطيع فريقك مراجعته قبل الزيارة.")
    : t("Your BATO Profile is saved. Appointment details are being confirmed by the team.", "تم حفظ ملفك لدى باتو. يعمل الفريق على تأكيد تفاصيل الموعد.");

  const cta = isReady ? t("View Visit Prep", "عرض تعليمات الزيارة") : t("View My Profile", "عرض ملفي");

  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      onClick={onOpen}
      className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl cursor-pointer"
      style={{ background: "rgba(196,170,139,0.07)", border: "1px solid rgba(196,170,139,0.18)" }}
    >
      {icon}
      <p className="flex-1 text-xs text-[#7c8689] leading-snug">{text}</p>
      <span
        className="text-[10px] font-semibold whitespace-nowrap flex items-center gap-0.5"
        style={{ color: "#c4aa8b" }}
      >
        {cta} <ChevronRight className="w-3 h-3" />
      </span>
    </motion.button>
  );
}