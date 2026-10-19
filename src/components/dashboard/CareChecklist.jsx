import React, { useState } from "react";
import { motion } from "@/components/motion/BatoMotion";
import { Check } from "lucide-react";

const CHECKLIST_ITEMS = [
  { key: "aftercare", en: "Followed aftercare instructions", ar: "اتبعت تعليمات الرعاية اللاحقة" },
  { key: "washing", en: "Avoided scalp washing", ar: "تجنبت غسل فروة الرأس" },
  { key: "sweating", en: "Avoided intense sweating", ar: "تجنبت التعرق الشديد" },
  { key: "product", en: "Used recommended product", ar: "استخدمت المنتج الموصى به" },
];

export default function CareChecklist({ isRTL, t }) {
  const storageKey = `bato_checklist_${new Date().toISOString().slice(0, 10)}`;
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const toggle = (key) => {
    const updated = { ...checked, [key]: !checked[key] };
    setChecked(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const completedCount = Object.values(checked).filter(Boolean).length;
  const total = CHECKLIST_ITEMS.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-[#eeebe6]"
    >
      <div className={`flex items-center justify-between mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <h2 className={`text-sm font-semibold text-[#333435] ${isRTL ? 'text-right' : 'text-left'}`}>{t("Care Checklist", "قائمة مهام العناية")}</h2>
      </div>

      {/* Progress bar */}
      <div className={`flex items-center gap-2 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="bato-progress-track flex-1 h-1 rounded-full overflow-hidden" style={{ background: "#eeebe6" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / total) * 100}%` }}
            transition={{ duration: 0.4 }}
            className={`h-full rounded-full ${isRTL ? 'mr-auto' : 'ml-0'}`}
            style={{ background: "linear-gradient(to right, #c4aa8b, #e7cb50)" }}
          />
        </div>
        <span className="text-xs text-[#7c8689] whitespace-nowrap" dir="ltr">
          {completedCount} / {total} <span dir={isRTL ? "rtl" : "ltr"}>{t("completed", "مكتمل")}</span>
        </span>
      </div>

      <div className="space-y-2">
        {CHECKLIST_ITEMS.map((item) => (
          <button
            key={item.key}
            onClick={() => toggle(item.key)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all active:scale-[0.98] ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{ background: checked[item.key] ? "rgba(196,170,139,0.1)" : "#f9f8f6" }}
          >
            <div className="w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: checked[item.key] ? "#c4aa8b" : "#ffffff",
                borderColor: checked[item.key] ? "#c4aa8b" : "rgba(196,170,139,0.35)",
              }}>
              {checked[item.key] && <Check className="w-3 h-3 text-white" />}
            </div>
            <p className={`text-sm flex-1 ${isRTL ? 'text-right' : 'text-left'}`}
              style={{ color: checked[item.key] ? "#3a2e1e" : "#333435", textDecoration: checked[item.key] ? "line-through" : "none" }}>
              {isRTL ? item.ar : item.en}
            </p>
          </button>
        ))}
      </div>
    </motion.div>
  );
}