import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { EXPLORER_GOALS_AR, explorerStart, explorerAppointment, explorerBookingUrl, explorerMessageUrl } from "@/lib/explorerStart";
import CareText from "@/components/CareText";
import { selectCareLanguage } from "@/lib/careArabic";
import { Button } from "@/components/ui/button";
export default function ExplorerNextStep({user,profile,isRTL,t}) {
 const navigate=useNavigate();
 const start=explorerStart(profile);
 const c = value => selectCareLanguage(isRTL ? (EXPLORER_GOALS_AR[value] || value) : value,isRTL?"ar":"en");
 const query=useQuery({queryKey:["explorerAppointments",user.email],queryFn:()=>base44.entities.Appointment.filter({client_email:user.email},"-appointment_date"),refetchOnMount:"always"});
 const appointment=start?explorerAppointment(query.data||[],user.email,start):null;
 const open=appointment&&["requested","scheduled","confirmed"].includes(appointment.status);
 const concerns=(profile.explorer_interests||[]).flatMap(i=>(profile.explorer_assessment?.[i]||[]).map(c));
 const date=appointment?new Date(appointment.appointment_date):null;
 const dateLabel=date&&!Number.isNaN(date.getTime())?new Intl.DateTimeFormat(isRTL?"ar":"en",{dateStyle:"medium",timeStyle:"short",timeZone:appointment.timezone|| (appointment.location?.toLowerCase()==="kuwait"?"Asia/Kuwait":"Asia/Dubai")}).format(date):"";
 return <section className="bato-style-hero rounded-3xl bg-[#3a2e1e] text-[#eeebe6] p-6 space-y-4">
   <p className="text-xs text-[#c4aa8b]">{t("Your next step with BATO","خطوتك التالية مع باتو")}</p>
   <h2 className="text-2xl font-bold">{start?(isRTL?start.ar:start.title):t("Choose where to start","اختر من أين تبدأ")}</h2>
   {concerns.length>0&&<p className="text-sm break-words">{concerns.join(" · ")}</p>}
   {profile.desired_result&&<p className="text-sm break-words">{t("Your goal: ","هدفك: ")}{<CareText prose value={isRTL?(EXPLORER_GOALS_AR[profile.desired_result]||profile.desired_result):profile.desired_result}/>}</p>}
   {profile.explorer_preferred_branch&&<p className="text-sm">{t("Preferred branch: ","الفرع المفضل: ")}{c(profile.explorer_preferred_branch)}</p>}
   {query.isPending?<p role="status">{t("Checking your appointments…","جارٍ التحقق من مواعيدك…")}</p>:query.isError?<div role="alert"><p>{t("We couldn't check your appointment status.","تعذر التحقق من حالة موعدك.")}</p><Button onClick={()=>query.refetch()}>{t("Try again","حاول مرة أخرى")}</Button></div>:<>
     {appointment&&<div className="rounded-2xl p-4 bg-white/10 space-y-2">
       <p className="font-semibold">{appointment.status==="requested"?t("Awaiting confirmation","بانتظار تأكيد الموعد"):open?t("Your upcoming appointment","موعدك القادم"):t("Previous appointment cancelled or expired","الموعد السابق ملغى أو منتهي")}</p>
       <p className="text-sm">{dateLabel}</p>
       {appointment.location&&<p className="text-sm">{c(appointment.location.toLowerCase()==="kuwait"?"Kuwait":appointment.location.toLowerCase()==="dubai"?"Dubai":appointment.location)}</p>}
       {appointment.status==="requested"&&<p className="text-sm">{t("Your request has been submitted. The appointment is confirmed only when its status is updated.","تم إرسال طلبك. لا يُعد الموعد مؤكداً حتى يتم تحديث حالته.")}</p>}
       {open&&appointment.status!=="requested"&&appointment.pre_appointment_instructions&&<p className="text-sm whitespace-pre-wrap break-words">{<CareText prose value={appointment.pre_appointment_instructions}/>}</p>}
     </div>}
     {start&&!open&&<p className="text-sm leading-relaxed">{isRTL?start.descriptionAr:start.en}</p>}
     <Button className="w-full rounded-2xl bg-[#c4aa8b] text-[#3a2e1e] h-auto py-3 whitespace-normal" onClick={()=>navigate(open?"/ClinicAppointments":start?explorerBookingUrl(start,profile.explorer_preferred_branch):"/Onboarding?edit=1")}>{open?t("View your appointment","عرض موعدك"):start?t("Request "+start.title,"اطلب "+start.ar):t("Choose my starting point","اختر نقطة البداية")}</Button>
   </>}
   {start&&<button className="w-full rounded-2xl border border-[#c4aa8b]/50 p-3 text-sm" onClick={()=>navigate(explorerMessageUrl(start))}>{t("Connect with an advisor","تواصل مع مرشد")}</button>}
   <button className="text-xs underline" onClick={()=>navigate("/Onboarding?edit=1")}>{t("Edit your answers","عدّل إجاباتك")}</button>
 </section>;
}
