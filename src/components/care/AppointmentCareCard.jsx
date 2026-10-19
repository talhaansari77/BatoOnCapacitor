import {CheckCircle2,Clock,AlertCircle} from "lucide-react";
import React from "react";
import {Link} from "react-router-dom";
import {useLocation} from "@/components/LocationContext";
import CareText from "@/components/CareText";
import {appointmentBranch} from "@/lib/clinicBranches";
import {appointmentState, careDepartment, careMessageUrl} from "@/lib/customerCare";
import {formatAppointment} from "@/lib/appointments";
import {ar} from "date-fns/locale";

export default function AppointmentCareCard({appointment, onReschedule, compact=false}) {
  const {t,isRTL}=useLocation();
  const state=appointmentState(appointment);
  const branch=appointmentBranch(appointment);
  const department=careDepartment(appointment.department);
  const titles={
    requested:t("Awaiting confirmation","بانتظار تأكيد الموعد"),
    confirmed:t("Your appointment is confirmed","موعدك مؤكد"),
    scheduled:t("Your appointment is scheduled","تمت جدولة موعدك"),
    needs_review:t("Check this appointment with BATO","تحقق من هذا الموعد مع باتو"),
    cancelled:t("Appointment cancelled","الموعد ملغى"),
    rescheduled:t("Appointment rescheduled","تم تعديل الموعد"),
    completed:t("Visit completed","اكتملت الزيارة")
  };
  const confirmed=state==="confirmed";
  const StatusIcon=confirmed||state==="completed"?CheckCircle2:["requested","scheduled"].includes(state)?Clock:AlertCircle;
  return <div className="bato-appointment-glass-stage"><section dir={isRTL?"rtl":"ltr"} aria-label={t("Appointment status","حالة الموعد")} className="bato-appointment-glass rounded-2xl bg-white border border-[#c4aa8b]/30 p-5 space-y-3 text-[#3a2e1e]">
    <p className="text-xs text-[#7c8689]">{isRTL?department.ar:department.en}</p>
    <div className="grid grid-cols-[20px_minmax(0,1fr)] items-start gap-2"><StatusIcon aria-hidden="true" className="w-5 h-5 mt-1 text-[#8f7252]"/><h3 className="font-semibold text-lg leading-7">{titles[state] || titles.needs_review}</h3></div>
    <p className="text-base font-semibold leading-7"><bdi>{formatAppointment(appointment,"EEEE, d MMM yyyy · h:mm a",{locale:isRTL?ar:undefined})}</bdi></p>
    {branch&&<p className="text-xs">{t("Clinic local time · ","بتوقيت العيادة · ")}{isRTL?branch.ar:branch.en}</p>}
    {appointment.service_name&&<p className="text-sm"><CareText value={appointment.service_name}/></p>}
    {appointment.specialist_name&&<p className="text-sm">{t("Specialist: ","المختص: ")}<CareText value={appointment.specialist_name}/></p>}
    {state==="requested"&&<p className="text-sm leading-relaxed">{t("This is your preferred date and time. Please wait for the clinic to confirm before planning your visit.","هذا هو التاريخ والوقت المفضلان لديك. انتظر تأكيد العيادة قبل ترتيب زيارتك.")}</p>}
    {state==="scheduled"&&<p className="text-sm leading-relaxed">{t("The clinic has scheduled this visit. If you have not received confirmation, check with customer service before travelling.","جدولت العيادة هذه الزيارة. إذا لم يصلك التأكيد، تحقق من خدمة العملاء قبل التوجه للعيادة.")}</p>}
    {state==="needs_review"&&<p className="text-sm leading-relaxed">{t("This record needs a clinic update. It does not show whether you attended or whether a new time was agreed.","يحتاج هذا السجل إلى تحديث من العيادة. لا يوضح ما إذا تمت الزيارة أو تم الاتفاق على موعد جديد.")}</p>}
    {confirmed&&<div className="rounded-xl bg-[#f9f8f6] p-4 space-y-2">
      <h3 className="text-sm font-semibold">{t("Prepare for your visit","استعد لزيارتك")}</h3>
      {appointment.pre_appointment_instructions?<p className="text-sm leading-6 whitespace-pre-wrap break-words"><CareText prose value={appointment.pre_appointment_instructions}/></p>:<p className="text-sm">{t("No specific preparation instructions are recorded. Ask your specialist whether you need to prepare or bring anything.","لم تُسجل تعليمات تحضير خاصة. اسأل أخصائيك عما تحتاج إلى تحضيره أو إحضاره.")}</p>}
    </div>}
    {confirmed&&branch&&<a className="block text-center w-full rounded-xl bg-[#3a2e1e] text-white px-4 py-3 text-sm font-semibold" href={branch.mapsUrl} target="_blank" rel="noopener noreferrer">{t("Directions to ","الطريق إلى فرع ")}{isRTL?branch.ar:branch.en}</a>}
    {confirmed&&!branch&&<p className="text-sm">{t("Ask customer service to confirm the branch before your visit.","اطلب من خدمة العملاء تأكيد الفرع قبل زيارتك.")}</p>}
    <div className="grid grid-cols-1 gap-2 text-sm bato-care-actions">
      {!compact&&<Link className={confirmed&&branch?"bato-action-link underline py-2":"bato-action-link bato-primary-action"} to={"/ClinicAppointments?appointment="+encodeURIComponent(appointment.id)}>{t("View appointment","عرض الموعد")}</Link>}
      {confirmed&&department.channel!=="client_care"&&<Link className="bato-action-link underline py-2" to={careMessageUrl(appointment.department)}>{t("Contact your specialist", "تواصل مع أخصائيك")}</Link>}
      <Link className="bato-action-link underline py-2" to="/Messages?channel=client_care">{t("Contact customer service", "تواصل مع خدمة العملاء")}</Link>
      {state==="completed"&&department.journey&&<Link className="bato-action-link underline py-2" to={"/"+department.journey}>{t("View your care and next steps","عرض رعايتك والخطوات التالية")}</Link>}
      {onReschedule&&["requested","scheduled","confirmed"].includes(state)&&<button className="bato-action-link underline py-2" onClick={onReschedule}>{t("Request a change","اطلب تعديل الموعد")}</button>}
    </div>
  </section></div>;
}
