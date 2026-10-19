import JourneySectionCard from "@/components/design/JourneySectionCard";
import CareText from "@/components/CareText";
import React from "react";
import { User } from "lucide-react";
import { useLocation } from "../LocationContext";

function Row({ label, value, fallback }) {
  return (
    <div className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid rgba(196,170,139,0.1)" }}>
      <p className="text-xs text-[#7c8689] w-[40%] flex-shrink-0 pt-0.5">{label}</p>
      <p className="text-sm text-[#333435] font-medium flex-1 min-w-0 break-words"><CareText value={value || fallback} prose /></p>
    </div>
  );
}

export default function HairCaseProfile({ caseFile }) {
  const { t } = useLocation();
  const cf = caseFile || {};
  const TBD = t("To be updated by your hair team.", "سيحدّث فريق الشعر هذه المعلومات.");

  return (
    <JourneySectionCard icon={User} title={t("Your Hair Case", "حالة شعرك")} subtitle={t("Personal diagnosis summary", "ملخص تقييم حالتك")}>
      <div>
        <Row label={t("Main Concern", "المشكلة الرئيسية")} value={cf.diagnosis} fallback={TBD} />
        <Row label={t("Hair Loss Pattern", "نمط تساقط الشعر")} value={null} fallback={TBD} />
        <Row label={t("Focus Areas", "المناطق المستهدفة")} value={null} fallback={TBD} />
        <Row label={t("Scalp Condition", "حالة فروة الرأس")} value={null} fallback={TBD} />
        <Row label={t("Shedding Status", "حالة التساقط")} value={null} fallback={TBD} />
        <Row label={t("Hair Density Baseline", "الكثافة عند بدء البرنامج")} value={null} fallback={TBD} />
        <Row label={t("Treatment Goal", "هدف العلاج")} value={cf.treatment_goals} fallback={TBD} />
        <Row label={t("Primary Department", "القسم الرئيسي")} value={cf.primary_department?.replace(/_/g, " ")} fallback={TBD} />
        <Row label={t("Assigned Specialist", "الأخصائي المسؤول")} value={cf.assigned_specialist} fallback={TBD} />
        {cf.contraindications && <Row label={t("Contraindications", "موانع العلاج")} value={cf.contraindications} fallback={TBD} />}
        {cf.notes && <Row label={t("Case Notes", "ملاحظات الحالة")} value={cf.notes} fallback={TBD} />}
      </div>
    </JourneySectionCard>
  );
}