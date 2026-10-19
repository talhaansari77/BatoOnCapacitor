import {formatAppointment,clinicToday} from "@/lib/appointments";
import {appointmentBranch} from "@/lib/clinicBranches";
import {careAppointments} from "@/lib/customerCare";
import {selectCareLanguage} from "@/lib/careArabic";
import {rescheduleRequestContent} from "@/lib/rescheduleRequest";
import CustomerLoadState from "@/components/CustomerLoadState";
import {ar} from "date-fns/locale";
import React, { useState, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Calendar, Send, Loader2, CheckCircle2 } from "lucide-react";

import { toast } from "sonner";

export default function RescheduleForm({ user, caseFileId, onBack, isRTL, t }) {
  const queryClient = useQueryClient();
  const [selectedAppointment, setSelectedAppointment] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error,setError]=useState("");
  const saveBusy=useRef(false);

  const { data: appointments = [], isPending, isError, refetch } = useQuery({
    queryKey: ["appointments_reschedule", user?.email],
    queryFn: async () => {
      const all = await base44.entities.Appointment.filter({ client_email: user.email }, "-appointment_date");
      return careAppointments(all).live;
    },
    enabled: !!user,
  });

  const appt=appointments.find(a=>a.id===selectedAppointment);
  const branch=appointmentBranch(appt);
  const today=clinicToday(branch?.id||"dubai");
  const minDate=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
  const submitMutation = useMutation({
    mutationFn: async () => {
      const appt = appointments.find(a => a.id === selectedAppointment);
      if(!appt)throw new Error("Appointment no longer available");
      const content=rescheduleRequestContent({isRTL,appointmentId:appt.id,
        branch:branch?t(branch.en,branch.ar):selectCareLanguage(appt.location,isRTL?"ar":"en"),
        currentAppointment:formatAppointment(appt,isRTL?"EEEE، d MMMM yyyy، h:mm a":"EEEE, MMMM d, yyyy 'at' h:mm a",{locale:isRTL?ar:undefined}),
        service:selectCareLanguage(appt.type?.replace(/_/g," "),isRTL?"ar":"en"),preferredDate,timeRange:preferredTime,reason});

      await base44.entities.Message.create({
        client_email: user.email,
        sender_email: user.email,
        sender_name: user.full_name,
        sender_role: "client",
        is_from_doctor: false,
        subject: t("[Customer service] Reschedule Request","[خدمة العملاء] طلب تغيير الموعد"),
        content,
        case_file_id: caseFileId,
        tags: ["client_care"],
        priority: "normal",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      setSubmitted(true);
      toast.success(t("Reschedule request sent","تم إرسال طلب تغيير الموعد"));
    },
    onError:()=>setError("save"),
    onSettled:()=>{saveBusy.current=false;},
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if(saveBusy.current)return;
    if (!appt || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || preferredDate<minDate || !reason.trim()) {
      setError("validation");return;
    }
    saveBusy.current=true;setError("");submitMutation.mutate();
  };

  if(isPending||isError)return <CustomerLoadState error={isError} onRetry={refetch}/>;
  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "rgba(196,170,139,0.12)" }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: "#c4aa8b" }} />
        </div>
        <h3 className="font-semibold text-[#333435] text-base mb-2">
          {t("Request Sent", "تم إرسال الطلب")}
        </h3>
        <p className="text-sm text-[#7c8689] leading-relaxed mb-6">
          {t(
            "The BATO team will review your request and confirm the next available option.",
            "سيراجع فريق باتو طلبك ويؤكد الموعد المتاح."
          )}
        </p>
        <Button onClick={onBack} className="rounded-xl border-0 font-semibold"
          style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
          {t("Back to Messages", "العودة إلى الرسائل")}
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="bato-style-hero flex items-center gap-3 px-4 py-3 rounded-t-3xl"
        style={{ background: "linear-gradient(135deg, #3a2e1e, #3e352c)" }}>
        <button aria-label={t("Back to Messages","العودة إلى الرسائل")} onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(196,170,139,0.15)" }}>
          <Calendar className="w-4 h-4" style={{ color: "#c4aa8b" }} />
        </div>
        <div>
          <p className="font-semibold text-white text-sm">{t("Request Reschedule", "طلب تغيير الموعد")}</p>
          <p className="text-[10px]" style={{ color: "rgba(196,170,139,0.65)" }}>
            {t("Customer service", "خدمة العملاء")}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-5 space-y-4 bg-white rounded-b-3xl">
        {error&&<p role="alert" className="text-sm text-red-700">{error==="save"?t("Could not send request. Your answers are kept here; please try again.","تعذر إرسال الطلب. إجاباتك محفوظة هنا؛ حاول مرة أخرى."):t("Select an appointment, a current or future date and a reason.","اختر موعداً وتاريخاً حالياً أو مستقبلياً واكتب سبب التغيير.")}</p>}
        <fieldset disabled={submitMutation.isPending} className="space-y-4">
        {/* Notice */}
        <div className="p-4 rounded-2xl" style={{ background: "rgba(196,170,139,0.08)", border: "1px solid rgba(196,170,139,0.2)" }}>
          <p className="text-xs text-[#333435] leading-relaxed">
            {t(
              "Rescheduling is subject to availability and clinic approval. Please send your request and the BATO team will confirm the next available option.",
              "يعتمد تغيير الموعد على التوفر وتأكيد العيادة. أرسل طلبك وسيؤكد لك فريق باتو الموعد المناسب."
            )}
          </p>
        </div>

        {/* Current appointment */}
        <div>
          <label className="text-xs font-semibold text-[#333435] block mb-2">
            {t("Current Appointment", "الموعد الحالي")}
          </label>
          {appointments.length > 0 ? (
            <select
              aria-label={t("Current Appointment","الموعد الحالي")}
              required
              value={selectedAppointment}
              onChange={(e) => setSelectedAppointment(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl text-sm border text-[#333435] bg-[#f9f8f6]"
              style={{ borderColor: "rgba(196,170,139,0.3)" }}
            >
              <option value="">{t("Select an appointment", "اختر موعدًا")}</option>
              {appointments.map(a => (
                <option key={a.id} value={a.id}>
                  {formatAppointment(a,isRTL?"EEE، d MMM، h:mm a":"EEE, MMM d 'at' h:mm a",{locale:isRTL?ar:undefined})} — {selectCareLanguage(a.type?.replace(/_/g," "),isRTL?"ar":"en")}
                </option>
              ))}
            </select>
          ) : (
            <p className="text-sm text-[#7c8689] px-3 py-2.5 rounded-xl"
              style={{ background: "#f9f8f6", border: "1px solid rgba(196,170,139,0.15)" }}>
              {t("No upcoming appointments found", "لا توجد مواعيد قادمة")}
            </p>
          )}
        </div>

        {/* Preferred date */}
        <div>
          <label className="text-xs font-semibold text-[#333435] block mb-2">
            {t("Preferred New Date *", "التاريخ الجديد المفضل *")}
          </label>
          <input
            aria-label={t("Preferred New Date","التاريخ الجديد المفضل")}
            type="date"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            required
            min={minDate}
            className="w-full px-3 py-2.5 rounded-xl text-sm border text-[#333435] bg-[#f9f8f6]"
            style={{ borderColor: "rgba(196,170,139,0.3)" }}
          />
        </div>

        {/* Preferred time */}
        <div>
          <label className="text-xs font-semibold text-[#333435] block mb-2">
            {t("Preferred Time Range", "الوقت المفضل")}
          </label>
          <select
            aria-label={t("Preferred Time Range","الوقت المفضل")}
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm border text-[#333435] bg-[#f9f8f6]"
            style={{ borderColor: "rgba(196,170,139,0.3)" }}
          >
            <option value="">{t("Any time", "أي وقت")}</option>
            <option value="morning">{t("Morning (9am – 12pm)", "الصباح (٩ ص – ١٢ ظهراً)")}</option>
            <option value="afternoon">{t("Afternoon (12pm – 4pm)", "بعد الظهر (١٢ ظهراً – ٤ م)")}</option>
            <option value="late_afternoon">{t("Evening (4pm – 7pm)", "المساء (٤ م – ٧ م)")}</option>
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className="text-xs font-semibold text-[#333435] block mb-2">
            {t("Reason for Reschedule *", "سبب تغيير الموعد *")}
          </label>
          <Textarea
            aria-label={t("Reason for Reschedule","سبب تغيير الموعد")}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("Please share the reason for your request...", "اكتب سبب طلبك...")}
            required
            rows={3}
            className="resize-none border-[#eeebe6] bg-[#f9f8f6] text-[#333435]"
          />
        </div>

        <Button type="submit" className="w-full rounded-xl h-11 font-semibold border-0"
          style={{ background: "#c4aa8b", color: "#3a2e1e" }}
          disabled={submitMutation.isPending||!appointments.length}>
          {submitMutation.isPending
            ? <Loader2 className="w-4 h-4 animate-spin mr-2" />
            : <Send className="w-4 h-4 mr-2" />}
          {t("Send Request", "إرسال الطلب")}
        </Button>
        </fieldset>
      </form>
    </div>
  );
}