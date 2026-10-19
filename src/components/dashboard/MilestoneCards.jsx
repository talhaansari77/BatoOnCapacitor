import {programCounts} from "@/lib/carePrograms";
import React from "react";
import { motion } from "@/components/motion/BatoMotion";
import { CheckCircle2, Circle } from "lucide-react";
import { IlluMilestone } from "../illustrations/BatoIllustrations";

const getMilestones = (t, sessionsUsed, totalSessions, caseFile) => [
  {
    key: "assessment",
    label: t("Hair Assessment", "تقييم الشعر"),
    done: ["treatment_planned","in_treatment","post_treatment","completed"].includes(caseFile?.case_status),
    description: t("Your hair was assessed by the team", "راجع الفريق حالة شعرك"),
  },
  {
    key: "first_session",
    label: t("First Session", "الجلسة الأولى"),
    done: sessionsUsed >= 1,
    description: t("Your treatment journey began", "بدأت رحلة علاجك"),
  },
  {
    key: "halfway",
    label: t("Halfway Point", "منتصف الطريق"),
    done: totalSessions > 0 && sessionsUsed >= Math.ceil(totalSessions / 2),
    description: t(`${Math.ceil(totalSessions / 2)} sessions completed`, `اكتملت ${Math.ceil(totalSessions / 2)} جلسات`),
  },
  {
    key: "review",
    label: t("Progress Review", "مراجعة التقدم"),
    done: caseFile?.case_status === "post_treatment" || caseFile?.case_status === "completed",
    description: t("Team reviews your results", "يراجع الفريق نتائجك"),
  },
  {
    key: "maintenance",
    label: t("Maintenance Phase", "مرحلة الحفاظ على النتائج"),
    done: caseFile?.case_status === "completed",
    description: t("Long-term hair health program", "برنامج للحفاظ على صحة الشعر على المدى الطويل"),
  },
];

export default function MilestoneCards({ activePackage, caseFile, sessionsCount, isRTL, t }) {
  const {used:sessionsUsed,total:totalSessions}=programCounts(activePackage);
  const milestones = getMilestones(t, sessionsUsed, totalSessions, caseFile);
  const doneCount = milestones.filter(m => m.done).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      dir={isRTL ? "rtl" : "ltr"} className="bg-white rounded-2xl p-5 shadow-sm border border-[#eeebe6]"
    >
      <div className={`flex flex-wrap items-center justify-between gap-3 mb-4 `}>
        <div className={`flex items-center gap-2.5 `}>
          <IlluMilestone size={30} color="#c4aa8b" />
          <h2 className="text-lg leading-7 font-semibold text-[#333435]">{t("Milestones", "مراحل أكملتها")}</h2>
        </div>
        <span className="text-xs leading-5 text-[#7c8689]"><bdi>{doneCount}/{milestones.length}</bdi> <span dir={isRTL ? "rtl" : "ltr"}>{t("reached", "تم إنجازها")}</span></span>
      </div>

      <div className="space-y-3">
        {milestones.map((m) => (
          <div
            key={m.key}
            className={`flex items-start gap-3 `}
            
          >
            <div className="mt-0.5 w-5 h-5 flex-shrink-0">
              {m.done
                ? <CheckCircle2 className="w-5 h-5" style={{ color: "#c4aa8b" }} />
                : <Circle className="w-5 h-5" style={{ color: "#c4aa8b" }} />
              }
            </div>
            <div className={`min-w-0 flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              <p className="text-sm leading-6 font-medium" style={{ color: m.done ? "#333435" : "#7c8689" }}>{m.label}</p>
              <p className="text-xs leading-5 text-[#7c8689] mt-0.5">{m.done?m.description:t("Not recorded yet","لم تُسجل بعد")}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}