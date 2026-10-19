import BatoSectionIntro from "@/components/design/BatoSectionIntro";
import React,{useState} from "react";
import {Link} from "react-router-dom";
import {useLocation} from "@/components/LocationContext";
import CareText from "@/components/CareText";
import {selectCareLanguage,selectCareProse} from "@/lib/careArabic";
import {EXPLORER_GOALS_AR} from "@/lib/explorerStart";
import {useCustomerCare} from "@/hooks/useCustomerCare";
import AppointmentCareCard from "./AppointmentCareCard";
import {programDepartment,programCounts,appointmentsForProgram} from "@/lib/carePrograms";
import {careAppointments,caseForProgram,latestProgramSession,latestRecord,programStage,careDepartment,careMessageUrl,clientNextStep,NEXT_STEPS,outcomeDepartment,instructionItems,instructionStorageKey} from "@/lib/customerCare";

const dateLabel=(value,isRTL)=>{
  if(!value)return "";
  const date=new Date(/^\d{4}-\d{2}-\d{2}$/.test(value)?value+"T12:00:00":value);
  return Number.isFinite(date.getTime())?date.toLocaleDateString(isRTL?"ar":"en-GB",{year:"numeric",month:"short",day:"numeric"}):"";
};
const panel="bato-care-panel rounded-2xl border border-[#c4aa8b]/25 bg-white p-5 space-y-3";
function Instructions({session,email}) {
  const {t,isRTL,language}=useLocation();
  const items=instructionItems(session.next_steps);
  const day=new Date().toLocaleDateString("en-CA");
  const key=instructionStorageKey(email,session,day);
  const [checked,setChecked]=useState(()=>{try{return JSON.parse(localStorage.getItem(key))||{};}catch{return {};}});
  const [saveError,setSaveError]=useState(false);
  if(!items.length)return <p className="text-sm text-[#7c8689]">{t("No home-care instructions are recorded for this session. Ask your team for guidance.","لم تُسجل تعليمات عناية منزلية لهذه الجلسة. اطلب الإرشادات من فريقك.")}</p>;
  const toggle=index=>{
    const next={...checked,[index]:!checked[index]};
    setChecked(next);
    try{localStorage.setItem(key,JSON.stringify(next));setSaveError(false);}catch{setSaveError(true);}
  };
  return <div className="space-y-3">
    <h4 className="font-semibold text-sm">{t("Your team's instructions","تعليمات فريقك")}</h4>
    <p className="text-xs text-[#7c8689]">{t("Review the instructions and follow their stated timing. The checks below record what you reviewed today on this device.","راجع التعليمات والتزم بالتوقيت المذكور فيها. تحدد العلامات أدناه ما راجعته اليوم على هذا الجهاز.")}</p>
    <div className="space-y-2">{items.map((item,index)=><label key={item} className="flex gap-3 items-start rounded-xl bg-[#f9f8f6] px-3 py-3 cursor-pointer">
      <input className="mt-1 shrink-0 accent-[#3a2e1e]" type="checkbox" disabled={selectCareProse(item,language)!==(language==="ar"?selectCareLanguage(item,language).replace(/\bBATO\b/g,"باتو"):selectCareLanguage(item,language))} checked={!!checked[index]} onChange={()=>toggle(index)}/>
      <span className="text-sm leading-6 whitespace-pre-wrap break-words min-w-0"><CareText prose value={item}/></span>
    </label>)}</div>
    <p className="text-xs text-[#7c8689]">{t("Reviewed today: ","تمت مراجعتها اليوم: ")}{items.filter((_,i)=>checked[i]).length} / {items.length}</p>
    {saveError&&<p role="alert" className="text-xs text-red-700">{t("Your checks could not be saved on this device.","تعذر حفظ علامات المراجعة على هذا الجهاز.")}</p>}
  </div>;
}
function SessionSummary({session,email}) {
  const {t,isRTL}=useLocation();
  return <div className="space-y-3">
    <div><h3 className="text-sm font-semibold">{t("Latest recorded session","آخر جلسة مسجلة")}</h3>
      <p className="text-xs text-[#7c8689]">{dateLabel(session.session_date,isRTL)}{session.specialist_name&&<> · <CareText value={session.specialist_name}/></>}</p>
    </div>
    {session.treatment_type&&<p className="text-sm"><CareText value={session.treatment_type.replace(/_/g," ")}/></p>}
    <Instructions key={instructionStorageKey(email,session,new Date().toLocaleDateString("en-CA"))} session={session} email={email}/>
  </div>;
}
function ProgramCare({program,data,email,journeyPage}) {
  const {t,isRTL}=useLocation();
  const department=programDepartment(program),care=careDepartment(department);
  const stage=programStage(program),count=programCounts(program);
  const caseFile=caseForProgram(data.cases,program,data.programs);
  const session=latestProgramSession(data.sessions,program,data.programs);
  const nextDate=stage==="active"?(session?.next_recommended_date||program.next_recommended_date):program.maintenance_review_date;
  const journey=care.journey?"/"+care.journey+"?program="+encodeURIComponent(program.id):"/TreatmentPlan";
  const isReview=["completed","review_due"].includes(stage);
  const canRequest=stage==="active"&&count.remaining>0&&!careAppointments(appointmentsForProgram(data.appointments,program,data.programs)).live.length;
  return <section className={panel} aria-label={t("Care program","برنامج الرعاية")}>
    <div className="flex flex-wrap justify-between gap-2 text-xs text-[#7c8689]"><span>{isRTL?care.ar:care.en}</span><span>{stage==="active"?t("Treatment underway","العلاج مستمر"):stage==="completed"?t("Program completed","اكتمل البرنامج"):stage==="review_due"?t("Program review due","حان موعد مراجعة البرنامج"):stage==="expired"?t("Package expired","انتهت صلاحية الباقة"):stage==="cancelled"?t("Package cancelled","الباقة ملغاة"):t("Check with your team","تحقق من فريقك")}</span></div>
    <h3 className="text-lg font-semibold"><CareText value={program.package_name}/></h3>
    {!journeyPage&&<p className="text-sm">{t("Sessions recorded: ","الجلسات المسجلة: ")}{count.used} / {count.total}</p>}
    {!journeyPage&&count.total>0&&<div className="h-1.5 bg-[#eeebe6] rounded-full overflow-hidden" role="progressbar" aria-label={t("Sessions completed","الجلسات المكتملة")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={count.progress}><div className="h-full bg-[#c4aa8b]" style={{width:count.progress+"%"}}/></div>}
    {!journeyPage&&stage==="active"&&<p className="text-xs text-[#7c8689]">{t("Sessions remaining: ","الجلسات المتبقية: ")}{count.remaining}</p>}
    {nextDate&&<div className="rounded-xl bg-[#f9f8f6] p-3"><p className="text-xs leading-5 text-[#7c8689]">{isReview?t("Recommended review date","تاريخ المراجعة الموصى به"):t("Recommended next session","الجلسة التالية الموصى بها")}</p><p className="text-sm leading-6 font-semibold mt-1"><bdi>{dateLabel(nextDate,isRTL)}</bdi></p><p className="text-xs text-[#7c8689] mt-1">{t("A recommended date is not a booked appointment. Confirm the timing with your team.","التاريخ الموصى به ليس موعداً محجوزاً. أكد التوقيت مع فريقك.")}</p></div>}
    {isReview&&<div className="rounded-xl bg-[#f9f8f6] p-4 space-y-2"><h4 className="font-semibold text-sm">{t("Maintaining your results","الحفاظ على نتائجك")}</h4>
      {program.maintenance_plan?<p className="text-sm leading-6 whitespace-pre-wrap break-words"><CareText prose value={program.maintenance_plan}/></p>:<p className="text-sm">{t("No maintenance plan is recorded yet. Ask your team to review your results and agree on the next step.","لم تُسجل خطة للحفاظ على النتائج بعد. اطلب من فريقك مراجعة نتائجك والاتفاق على الخطوة التالية.")}</p>}
    </div>}
    <details open={journeyPage||undefined} className="border-t border-[#eeebe6] pt-3">
      <summary className="text-sm leading-6 font-semibold cursor-pointer min-h-11 flex items-center py-2">{t("Care plan and session instructions","خطة الرعاية وتعليمات الجلسة")}</summary>
      <div className="space-y-4 pt-2">
        <div><h4 className="text-sm font-semibold mb-2">{t("Your recorded care plan","خطة رعايتك المسجلة")}</h4>
          {caseFile?.treatment_plan?<p className="text-sm leading-6 whitespace-pre-wrap break-words"><CareText prose value={caseFile.treatment_plan}/></p>:<p className="text-sm text-[#7c8689]">{t("No care plan is linked to this program. Ask your team to share it.","لا توجد خطة رعاية مرتبطة بهذا البرنامج. اطلب من فريقك مشاركتها.")}</p>}
        </div>
        {session?<SessionSummary session={session} email={email}/>:<p className="text-sm text-[#7c8689]">{t("No completed session is recorded for this program yet.","لا توجد جلسة مكتملة مسجلة لهذا البرنامج بعد.")}</p>}
      </div>
    </details>
    <div className="grid grid-cols-1 gap-2 text-sm bato-care-actions">
      {canRequest&&<Link className="bato-primary-action" to={"/ClinicAppointments?book=1&type=treatment&department="+care.key+"&program="+encodeURIComponent(program.id)}>{t("Request next session","اطلب الجلسة التالية")}</Link>}
      {!journeyPage&&<Link className={canRequest||isReview?"underline py-3":"bato-primary-action"} to={journey}>{t("View progress and history","عرض التقدم وسجل الرعاية")}</Link>}
      <Link className={isReview?"bato-primary-action":"underline py-3"} to={careMessageUrl(department)}>{isReview?t("Discuss maintenance","ناقش الحفاظ على النتائج"):t("Contact your specialist", "تواصل مع أخصائيك")}</Link>
    </div>
  </section>;
}
export default function CustomerCareHub({user,department,programId,profile,fallback=null,journeyPage=false,excludeHair=false,view="all"}) {
  const {t,isRTL}=useLocation();
  const query=useCustomerCare(user?.email);
  if(query.isPending)return <div className={panel} role="status">{t("Loading your care updates…","جارٍ تحميل تحديثات رعايتك…")}</div>;
  if(query.isError)return <div className={panel} role="alert"><p>{t("We couldn't load your care updates.","تعذر تحميل تحديثات رعايتك.")}</p><button className="underline py-3" onClick={()=>query.refetch()}>{t("Try again","حاول مرة أخرى")}</button></div>;
  if(!query.data)return null;
  const data=query.data;
  const programs=data.programs.filter(p=>(!department||programDepartment(p)===department)&&(!programId||p.id===programId)&&(!excludeHair||programDepartment(p)!=="hair_restoration"));
  const selected=programId?programs[0]:null;
  const appointments=programId?(selected?appointmentsForProgram(data.appointments,selected,data.programs):[]):data.appointments.filter(a=>(!department||a.department===department)&&(!excludeHair||a.department!=="hair_restoration"));
  const {live,unresolved}=careAppointments(appointments);
  const latestVisit=latestRecord(appointments.filter(a=>a.status==="completed"),"appointment_date");
  const outcome=latestRecord(data.outcomes.filter(o=>(!department||outcomeDepartment(o,data.appointments)===department)&&(!programId||appointments.some(a=>a.id===o.appointment_id))&&(!excludeHair||outcomeDepartment(o,data.appointments)!=="hair_restoration")),"consultation_date");
  const relevantCases=programId?(selected?[caseForProgram(data.cases,selected,data.programs)].filter(Boolean):[]):data.cases.filter(c=>(!department||c.primary_department===department)&&(!excludeHair||c.primary_department!=="hair_restoration"));
  const latestCase=latestRecord(relevantCases,"start_date");
  const relevantSessions=data.sessions.filter(s=>(!department||s.department===department)&&(!excludeHair||s.department!=="hair_restoration")&&new Date(s.session_date).getTime()<=Date.now());
  const latestSession=programId&&selected?latestProgramSession(data.sessions,selected,data.programs):latestRecord(relevantSessions,"session_date");
  const hasInstructions=latestSession&&instructionItems(latestSession.next_steps).length>0;
  if(view==="today") {
    if(!live.length&&!unresolved.length&&!hasInstructions&&!data.messages.length)return null;
    return <section className="space-y-4 text-[#3a2e1e]" dir={isRTL?"rtl":"ltr"} aria-label={t("Your care today","رعايتك اليوم")}>
      <BatoSectionIntro title={t("Your care today","رعايتك اليوم")}/>
      {data.messages.length>0&&<Link className="block rounded-xl bg-[#c4aa8b]/15 p-4 text-sm" to="/Messages">{t("New updates from your team: ","تحديثات جديدة من فريقك: ")}{data.messages.length}</Link>}
      {live.map(a=><AppointmentCareCard key={a.id} appointment={a}/>)}
      {unresolved[0]&&<AppointmentCareCard appointment={unresolved[0]}/>}
      {hasInstructions&&<section className={panel}><p className="text-xs text-[#7c8689]">{isRTL?careDepartment(latestSession.department).ar:careDepartment(latestSession.department).en}</p><SessionSummary session={latestSession} email={user.email}/></section>}
    </section>;
  }
  if(programId&&!selected)return <div role="alert" className={panel}>{t("This program is not available in your care records.","هذا البرنامج غير متاح في سجلات رعايتك.")}</div>;
  const hasCare=appointments.length||programs.length||outcome||latestCase||(!programId&&latestSession);
  if(!hasCare || (view==="overview"&&!programs.length&&!outcome&&!latestCase))return fallback;
  const step=clientNextStep(outcome), recommendation=NEXT_STEPS[step];
  const outcomeDept=outcomeDepartment(outcome,data.appointments);
  const nextTeam=recommendation?.department||outcomeDept||department||"general_consultation";
  const firstSessionRecorded=step==="session_1"&&data.sessions.some(s=>s.department===outcomeDept&&new Date(s.session_date).getTime()>=new Date(outcome.consultation_date).getTime()&&new Date(s.session_date).getTime()<=Date.now());
  const showOutcome=outcome&&!firstSessionRecorded&&(!latestVisit||!outcome.appointment_id||outcome.appointment_id===latestVisit.id);
  return <div className="space-y-4 text-[#3a2e1e]" dir={isRTL?"rtl":"ltr"}>
    {profile?.desired_result&&<p className="text-sm text-[#7c8689]">{t("Your goal: ","هدفك: ")}{<CareText prose value={isRTL?(EXPLORER_GOALS_AR[profile.desired_result]||profile.desired_result):profile.desired_result}/>}</p>}
    <div className="flex items-center justify-between gap-3"><h2 className="bato-section-title">{view==="overview"?t("Your care programs","برامج رعايتك"):t("Your care today","رعايتك اليوم")}</h2><button className="text-sm underline min-h-11 px-2 py-2" disabled={query.isFetching} onClick={()=>query.refetch()}>{t("Refresh","تحديث")}</button></div>
    {view!=="overview"&&data.messages.length>0&&!journeyPage&&<Link className="block rounded-xl bg-[#c4aa8b]/15 p-4 text-sm" to="/Messages">{t("New updates from your team: ","تحديثات جديدة من فريقك: ")}{data.messages.length}</Link>}
    {view!=="overview"&&live.map(a=><AppointmentCareCard key={a.id} appointment={a}/>)}
    {view!=="overview"&&unresolved[0]&&<AppointmentCareCard appointment={unresolved[0]}/>}
    {(showOutcome||(!programs.length&&latestVisit&&!firstSessionRecorded))&&<section className={panel}>
      <p className="text-xs text-[#7c8689]">{t("After your visit","بعد زيارتك")}{(outcome?.consultation_date||latestVisit?.appointment_date)?" · "+dateLabel(outcome?.consultation_date||latestVisit.appointment_date,isRTL):""}</p>
      <h3 className="font-semibold text-lg">{showOutcome&&recommendation?(isRTL?recommendation.ar:recommendation.en):t("Your next step after the visit","خطوتك التالية بعد الزيارة")}</h3>
      {showOutcome&&outcome.recommendation_reason?<p className="text-sm leading-6 whitespace-pre-wrap break-words"><CareText prose value={outcome.recommendation_reason}/></p>:<p className="text-sm">{t("No recommendation is recorded for this visit yet. Ask the team to share your next step.","لم تُسجل توصية لهذه الزيارة بعد. اطلب من الفريق مشاركة الخطوة التالية.")}</p>}
      <Link className="inline-block rounded-xl bg-[#3a2e1e] text-white px-4 py-3 text-sm" to={careMessageUrl(nextTeam)}>{nextTeam==="general_consultation"?t("Contact customer service", "تواصل مع خدمة العملاء"):t("Contact your specialist", "تواصل مع أخصائيك")}</Link>
      {showOutcome&&step==="follow_up_consultation"&&<Link className="block underline text-sm py-2" to={"/ClinicAppointments?book=1&type=follow_up&department="+careDepartment(nextTeam).key}>{t("Request a follow-up","اطلب موعد متابعة")}</Link>}
    </section>}
    {!programs.length&&latestCase&&<section className={panel}><h3 className="font-semibold">{t("Your recorded care plan","خطة رعايتك المسجلة")}</h3>
      {latestCase.treatment_plan?<p className="text-sm leading-6 whitespace-pre-wrap break-words"><CareText prose value={latestCase.treatment_plan}/></p>:<p className="text-sm">{t("Your case is recorded, but a care plan has not been shared here yet.","حالتك مسجلة، لكن لم تُشارك خطة رعاية هنا بعد.")}</p>}
      <Link className="inline-block underline py-2 text-sm" to={careMessageUrl(latestCase.primary_department)}>{t("Contact your specialist", "تواصل مع أخصائيك")}</Link>
    </section>}
    {programs.map(p=><ProgramCare key={p.id} program={p} data={data} email={user.email} journeyPage={journeyPage}/>)}
    {view!=="overview"&&!programs.length&&!programId&&latestSession&&<section className={panel}><SessionSummary session={latestSession} email={user.email}/><Link className="inline-block underline py-2 text-sm" to={careMessageUrl(latestSession.department)}>{t("Ask about your instructions","اسأل عن تعليماتك")}</Link></section>}
    {!live.length&&!unresolved.length&&!programs.length&&!outcome&&!latestCase&&!latestSession&&<section className={panel}><h3 className="font-semibold">{t("Your previous appointment","موعدك السابق")}</h3><p className="text-sm">{t("Your previous request was cancelled or replaced. Check with Customer service to agree on the next step.","تم إلغاء طلبك السابق أو تغييره. تواصل مع خدمة العملاء للاتفاق على الخطوة التالية.")}</p><Link className="inline-block underline py-2" to="/Messages?channel=client_care">{t("Contact customer service", "تواصل مع خدمة العملاء")}</Link></section>}
  </div>;
}