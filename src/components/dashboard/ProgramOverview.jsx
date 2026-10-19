import React from "react";
import {Link} from "react-router-dom";
import {CARE_DEPARTMENTS} from "@/lib/serviceFlow";
import {programDepartment,programCounts} from "@/lib/carePrograms";
import CareText from "@/components/CareText";

export default function ProgramOverview({programs,t,isRTL}) {
  if(!programs.length)return null;
  return <section className="space-y-3" aria-label={t("Your programs","برامجك")}>
    <h2 className="text-sm font-semibold text-[#333435]">{t("Your programs","برامجك")}</h2>
    {programs.map(program=>{
      const care=CARE_DEPARTMENTS.find(d=>d.key===programDepartment(program));
      const {used,total,remaining,progress}=programCounts(program);
      const active=program.status==="active";
      return <div key={program.id} className="rounded-2xl p-5 border border-[#c4aa8b]/25 shadow-sm bg-white">
        <div className="flex justify-between gap-3 mb-2">
          <p className="text-xs text-[#7c8689]">{care?(isRTL?care.ar:care.en):t("Care program","برنامج رعاية")}</p>
          <span className="text-xs text-[#3a2e1e]">{active?t("Active","نشط"):program.status==="completed"?t("Completed","مكتمل"):program.status==="expired"?t("Expired","منتهي الصلاحية"):program.status==="cancelled"?t("Cancelled","ملغى"):t("Needs review","يحتاج إلى مراجعة")}</span>
        </div>
        <h3 className="font-semibold text-[#3a2e1e]"><CareText value={program.package_name}/></h3>
        <p className="text-sm text-[#7c8689] mt-2">{t(`${used} of ${total} sessions completed`,`الجلسات المكتملة: ${used} من ${total}`)}</p>
        {total>0&&<div className="bato-progress-track h-1.5 bg-[#eeebe6] rounded-full overflow-hidden my-3"><div className="h-full bg-[#c4aa8b]" style={{width:progress+"%"}}/></div>}
        {active&&<p className="text-xs text-[#7c8689] mb-3">{t(`${remaining} sessions remaining`,`الجلسات المتبقية: ${remaining}`)}</p>}
        <Link to={(care?.journey?"/"+care.journey:"/TreatmentPlan")+"?program="+encodeURIComponent(program.id)} className="flex items-center justify-center min-h-11 rounded-xl bg-[#3a2e1e] text-white px-4 py-2 text-xs font-semibold">
          {active?t("View program","عرض البرنامج"):t("View care history","عرض سجل الرعاية")}
        </Link>
      </div>;
    })}
  </section>;
}
