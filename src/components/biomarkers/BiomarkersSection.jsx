import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import BiomarkerSummary from "./BiomarkerSummary";
import BiomarkersGrid from "./BiomarkersGrid";
import { getBiomarkerStatus, generateBiomarkerInterpretation } from "@/lib/biomarkerUtils";
import { useLocation } from "../LocationContext";

const CATEGORY_TABS = (t) => [
  { key: "all",             label: t("All", "الكل") },
  { key: "hair_support",    label: t("Hair", "الشعر") },
  { key: "skin_recovery",   label: t("Skin", "البشرة") },
  { key: "energy_wellness", label: t("Energy", "الطاقة") },
  { key: "hormonal_balance",label: t("Hormones", "الهرمونات") },
  { key: "inflammation",    label: t("Inflammation", "الالتهاب") },
  { key: "medical_safety",  label: t("Medical", "الطبي") },
  { key: "cardiometabolic", label: t("Cardio", "القلب") },
  { key: "advanced",        label: t("Advanced", "متقدم") },
];

export default function BiomarkersSection({ biomarkers = [] }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const { t, isRTL } = useLocation();

  const biomarkersWithStatus = useMemo(
    () =>
      biomarkers.map((b) => {
        const status = getBiomarkerStatus(
          b.current_value,
          b.marker_direction,
          b.general_health_min,
          b.general_health_max,
          b.bato_target_min,
          b.bato_target_max,
          t
        );
        const interpretation = generateBiomarkerInterpretation(b, isRTL ? "ar" : "en");
        return { ...b, status, interpretation };
      }),
    [biomarkers, t, isRTL]
  );

  const filtered = useMemo(() => {
    if (activeTab === "all") return biomarkersWithStatus;
    return biomarkersWithStatus.filter((b) => b.category === activeTab);
  }, [biomarkersWithStatus, activeTab]);

  if (biomarkers.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border p-6 text-center"
        style={{ borderColor: "rgba(196,170,139,0.15)" }}
      >
        <Activity className="w-8 h-8 mx-auto mb-3" style={{ color: "rgba(196,170,139,0.3)" }} />
        <p className="text-sm font-medium text-[#333435] mb-1">{t("No biomarkers yet", "لا توجد مؤشرات حيوية بعد")}</p>
        <p className="text-xs text-[#7c8689] mb-4">
          {t("Your biomarker review will appear here after your BATO team uploads lab results.", "ستظهر النتائج هنا بعد أن يرفع فريق باتو تحاليلك.")}
        </p>
        <button
          className="px-4 py-2 rounded-lg text-sm font-medium"
          onClick={() => navigate("/Messages?channel=medical_team&context=health_review")}
          style={{ background: "rgba(196,170,139,0.1)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.2)" }}
        >
          {t("Contact your specialist", "تواصل مع أخصائيك")}
        </button>
      </motion.div>
    );
  }

  const allTabs = CATEGORY_TABS(t);
  const availableTabs = allTabs.filter(
    (tab) => tab.key === "all" || biomarkersWithStatus.some((b) => b.category === tab.key)
  );

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-[#333435]">{t("Your Biomarker Review", "مراجعة المؤشرات الحيوية")}</h3>
        <p className="text-xs text-[#7c8689] mt-0.5">{t("Understand your results at a glance.", "افهم نتائجك بسرعة.")}</p>
      </div>

      {biomarkersWithStatus.length > 0 && <BiomarkerSummary biomarkers={biomarkersWithStatus} />}

      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        {availableTabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const count = tab.key === "all" ? biomarkersWithStatus.length : biomarkersWithStatus.filter(b => b.category === tab.key).length;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
              style={isActive
                ? { background: "#3a2e1e", color: "#c4aa8b", border: "1px solid #3a2e1e" }
                : { background: "#f9f8f6", color: "#7c8689", border: "1px solid rgba(196,170,139,0.2)" }
              }
            >
              {tab.label}
              <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                style={isActive ? { background: "rgba(196,170,139,0.2)", color: "#c4aa8b" } : { background: "rgba(124,134,137,0.1)", color: "#7c8689" }}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "rgba(196,170,139,0.15)" }}>
        <BiomarkersGrid biomarkers={filtered} />
      </div>
    </motion.div>
  );
}