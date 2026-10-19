import { format } from "@/lib/customerFormatting";
import React from "react";
import { isValid } from "date-fns";
import {ar} from "date-fns/locale";
import {useLocation} from "../LocationContext";
import CareText from "../CareText";
import {programCounts} from "@/lib/carePrograms";

export default function ProgramHistory({program,sessions}) {
  const {t,isRTL}=useLocation();
  const {used,total,progress}=programCounts(program);
  const status={completed:t("Completed","مكتمل"),expired:t("Expired","منتهي الصلاحية"),cancelled:t("Cancelled","ملغى")}[program.status]||t("Care history","سجل الرعاية");
  return <section className="space-y-4">
    <div className="bato-style-hero rounded-3xl p-6 shadow-xl text-white" style={{background:"linear-gradient(135deg, #3a2e1e, #3e352c)"}}>
      <p className="text-xs text-[#c4aa8b] mb-2">{t("Care history","سجل الرعاية")} · {status}</p>
      <h2 className="font-semibold text-xl"><CareText value={program.package_name}/></h2>
      <p className="mt-3 text-sm text-[#eeebe6]">{t(`${used} of ${total} sessions completed`,`الجلسات المكتملة: ${used} من ${total}`)}</p>
      {total>0&&<div className="bato-progress-track bg-white/10 h-2 rounded-full mt-3 overflow-hidden"><div className="bg-[#c4aa8b] h-full" style={{width:progress+"%"}}/></div>}
    </div>
    <div className="bg-white rounded-2xl border border-[#eeebe6] p-5">
      <h3 className="font-semibold text-[#333435] mb-3">{t("Recorded sessions","الجلسات المسجلة")}</h3>
      {sessions.length?sessions.slice().sort((a,b)=>new Date(a.session_date)-new Date(b.session_date)).map(session=>{
        const date=new Date(session.session_date);
        return <div key={session.id} className="border-t border-[#eeebe6] py-3 text-sm text-[#7c8689]">
          <p>{isValid(date)?format(date,"d MMM yyyy",{locale:isRTL?ar:undefined}):t("Date needs clinic review","يحتاج التاريخ إلى مراجعة العيادة")}</p>
          {session.specialist_notes&&<p className="mt-1 whitespace-pre-wrap break-words leading-6"><CareText value={session.specialist_notes} prose /></p>}
        </div>;
      }):<p className="text-sm text-[#7c8689]">{t("No session details are available yet.","لا تتوفر تفاصيل الجلسات بعد.")}</p>}
    </div>
  </section>;
}
