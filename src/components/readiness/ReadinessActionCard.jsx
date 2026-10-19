import {useLocation} from "../LocationContext";
import {translateCareText} from "@/lib/careArabic";
import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, ChevronRight } from "lucide-react";

// Shown only when the client has required action to complete
export default function ReadinessActionCard({ urgency, missingItems, onOpen }) {
  const {t,isRTL}=useLocation();
  const isUrgent = urgency === "today" || urgency === "tomorrow";

  const title = isUrgent
    ? urgency === "today" ? t("Complete before you arrive","أكمل هذه المعلومات قبل زيارتك") : t("Your visit is tomorrow","موعد زيارتك غداً")
    : t("Complete your Pre-Visit Readiness","استعد لزيارتك");

  const body = isUrgent
    ? t("A few important details help your BATO team prepare. Please finish before your visit.","أكمل هذه المعلومات المهمة قبل زيارتك لمساعدة فريق باتو على الاستعداد.")
    : t("A few details help your BATO team prepare before your visit.","تساعد هذه المعلومات فريق باتو على الاستعداد لزيارتك.");

  return (
    <motion.button type="button"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onOpen}
      className="w-full text-start rounded-2xl border cursor-pointer overflow-hidden"
      style={{
        background: isUrgent ? "rgba(251,146,60,0.04)" : "#fff",
        borderColor: isUrgent ? "rgba(251,146,60,0.35)" : "rgba(196,170,139,0.25)",
      }}
    >
      <div className="px-4 py-3.5 flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: isUrgent ? "rgba(251,146,60,0.1)" : "rgba(196,170,139,0.1)" }}>
          <AlertCircle className="w-4 h-4" style={{ color: isUrgent ? "#fb923c" : "#c4aa8b" }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#333435] mb-0.5">{title}</p>
          <p className="text-xs text-[#7c8689] leading-relaxed">{body}</p>
          {missingItems.length > 0 && (
            <p className="text-[10px] mt-1.5" style={{ color: isUrgent ? "#fb923c" : "#c4aa8b" }}>
              {missingItems.slice(0, 2).map(i => isRTL ? translateCareText(i.label) : i.label).join(" · ")}
              {missingItems.length > 2 ? t(` · +${missingItems.length - 2} more`, ` · ومعلومات إضافية: ${missingItems.length - 2}`) : ""}
            </p>
          )}
        </div>
        <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={{ color: isUrgent ? "#fb923c" : "#c4aa8b" }} />
      </div>
    </motion.button>
  );
}