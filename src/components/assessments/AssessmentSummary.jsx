import { hairAssessmentAnswer } from "@/lib/hairAssessmentAnswers";
import { EXPLORER_STARTS, explorerBookingUrl, explorerAppointment } from "@/lib/explorerStart";
import { useQuery } from "@tanstack/react-query";
import {toast} from "sonner";
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { motion } from "@/components/motion/BatoMotion";
import { CheckCircle2, MessageSquare, Activity, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "../LocationContext";

const RECOMMENDATIONS = {
  consultation: {
    titleEn: "Hair Consultation",
    titleAr: "استشارة الشعر",
    descEn: "A specialist review of your hair concern and recommended first steps.",
    descAr: "استشارة متخصصة لمراجعة مشكلة شعرك وتحديد الخطوات المناسبة.",
    icon: MessageSquare,
  },
  biomarker_review: {
    titleEn: "Hair + Biomarker Review",
    titleAr: "الشعر + مراجعة المؤشرات الحيوية",
    descEn: "Internal markers may be relevant to your hair concern. We'll review both together.",
    descAr: "قد ترتبط مشكلة شعرك بعوامل صحية داخلية. سنراجع الجانبين معاً.",
    icon: Activity,
  },
  team_review: {
    titleEn: "Scalp & Hair Team Review",
    titleAr: "مراجعة مع فريق الشعر وفروة الرأس",
    descEn: "Your specific scalp concern will be reviewed by the hair team.",
    descAr: "سيراجع فريق الشعر مشكلة فروة رأسك.",
    icon: Stethoscope,
  },
};

export default function AssessmentSummary({ responses, userEmail, onClose }) {
  const navigate = useNavigate();
  const { t, isRTL } = useLocation();
  const [sending, setSending] = useState(false);
  const summaryHeading = useRef(null);
  useEffect(() => {
    summaryHeading.current?.focus({preventScroll:true});
    summaryHeading.current?.scrollIntoView({block:"start",behavior:"instant"});
  }, []);
  const answer = value => hairAssessmentAnswer(value, isRTL);
  const appointments = useQuery({queryKey:["explorerAppointments",userEmail],queryFn:()=>base44.entities.Appointment.filter({client_email:userEmail},"-appointment_date"),enabled:!!userEmail,refetchOnMount:"always"});
  const existing = explorerAppointment(appointments.data || [], userEmail, EXPLORER_STARTS[0]);
  const openAppointment = existing && ["requested","scheduled","confirmed"].includes(existing.status) ? existing : null;

  const internalFactors = responses.internal_factors || [];
  const hasInternalConcerns = internalFactors.some(f =>
    ["Stress / poor sleep", "Weight change / diet change", "Pregnancy / postpartum", "Hormonal concerns", "Low iron / vitamin D / thyroid history", "التوتر / قلة النوم", "تغير الوزن / تغير النظام الغذائي", "الحمل / ما بعد الولادة", "مشكلات هرمونية محتملة", "نقص سابق في الحديد أو فيتامين د / مشكلات في الغدة الدرقية"].includes(f)
  );
  const unknownCause = responses.biggest_worry === "I don't know the cause" || responses.biggest_worry === "لا أعرف السبب";

  let recommendedPoint = "consultation";
  if (hasInternalConcerns || unknownCause) recommendedPoint = "biomarker_review";
  else if (responses.main_concern === "Scalp irritation" || responses.main_concern === "تهيج فروة الرأس") recommendedPoint = "team_review";

  const recommendation = RECOMMENDATIONS[recommendedPoint];
  const RecommendIcon = recommendation.icon;

  const sendToTeam = async () => {
    if(sending)return;
    setSending(true);
    try {
      const summary = [
        t("Hair Assessment Summary:", "ملخص تقييم الشعر:"),
        `${t("Main concern", "المشكلة الرئيسية")}: ${answer(responses.main_concern)}`,
        `${t("Timeline", "المدة")}: ${answer(responses.timeline)}`,
        `${t("Pattern", "النمط")}: ${answer(responses.pattern)}`,
        `${t("Previous treatments", "العلاجات السابقة")}: ${answer(responses.previous_treatments)}`,
        `${t("Internal factors", "العوامل الداخلية")}: ${answer(responses.internal_factors)}`,
        `${t("Biggest worry", "ما يقلقك أكثر")}: ${answer(responses.biggest_worry)}`,
      ].join("\n");

      const user = await base44.auth.me();
      
      await base44.entities.Message.create({
        client_email: userEmail,
        sender_email: userEmail,
        sender_name: user.full_name || user.email,
        sender_role: "client",
        subject: t("Hair Assessment", "تقييم الشعر"),
        content: summary,
        is_from_doctor: false,
        tags: ["hair_team"],
        thread_id: `hair_assessment_${new Date().getTime()}`,
      });

      toast.success(t("Assessment sent to the Hair Team.","تم إرسال التقييم إلى فريق الشعر."));
      try {
      // Updating the linked record must not invite a second message after a confirmed send.
      const assessmentRecords = await base44.entities.AssessmentLead.filter({ client_email: userEmail, assessment_type: "hair" });
      if (assessmentRecords.length > 0) {
        await base44.entities.AssessmentLead.update(assessmentRecords[0].id, {
          sent_to_team: true,
          sent_to_team_at: new Date().toISOString(),
          status: "sent_to_team",
        });
      }

      } catch { toast.error(t("Your message was sent, but the assessment record could not be updated.","تم إرسال رسالتك، لكن تعذر تحديث سجل التقييم.")); }
      navigate("/Messages?channel=hair_team&context=hair_assessment");
    } catch (error) {
      toast.error(t("Sending was not confirmed. Your answers are still here; check the conversation before retrying.","لم يتم تأكيد الإرسال. إجاباتك ما زالت هنا؛ تحقق من المحادثة قبل المحاولة مجدداً."));
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5"
      dir={isRTL ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-5 h-5" style={{ color: "var(--style-ink)" }} />
          <h2 ref={summaryHeading} tabIndex={-1} className="text-lg font-bold text-[#333435] scroll-mt-24 focus:outline-none">{t("Your Hair Assessment Summary", "ملخص تقييم شعرك")}</h2>
        </div>
        <p className="text-sm text-[#7c8689]">
          {t("Based on your answers, BATO can help review your hair concern and guide the right first step.", "بناءً على إجاباتك، يساعدك فريق باتو على فهم مشكلة شعرك واختيار الخطوة الأولى المناسبة.")}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2.5">
        {[
          { label: t("Main concern", "المشكلة الرئيسية"), value: responses.main_concern },
          { label: t("Timeline", "الجدول الزمني"), value: responses.timeline },
          { label: t("Pattern", "النمط"), value: responses.pattern },
          { label: t("Worry", "ما يقلقك"), value: responses.biggest_worry },
        ].map((item, idx) => (
          <div key={idx} className="bato-style-surface p-3 rounded-xl border" style={{ borderColor: "rgba(196,170,139,0.15)", background: "#f9f8f6" }}>
            <p className="text-xs font-semibold mb-1" style={{ color: "#7c8689" }}>
              {item.label}
            </p>
            <p className="text-sm font-medium text-[#333435]">{answer(item.value)}</p>
          </div>
        ))}
      </div>

      {/* Internal factors */}
      {responses.internal_factors?.length > 0 && (
        <div className="p-3 rounded-xl border" style={{ borderColor: "rgba(196,170,139,0.15)", background: "rgba(196,170,139,0.06)" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "#7c8689" }}>
            {t("Internal factors", "العوامل الداخلية")}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {responses.internal_factors.map((factor, idx) => (
              <span key={idx} className="text-xs px-2.5 py-1 rounded-full" style={{ background: "var(--style-soft)", color: "var(--style-ink)" }}>
                {answer(factor)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Recommendation */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-4 rounded-2xl border-2" style={{ borderColor: "var(--bato-control-edge)", background: "var(--style-soft)" }}>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: "rgba(196,170,139,0.2)" }}>
            <RecommendIcon className="w-5 h-5" style={{ color: "var(--style-ink)" }} />
          </div>
          <div>
            <p className="text-xs font-semibold mb-1" style={{ color: "#7c8689" }}>
              {t("Recommended starting point", "الخطوة الأولى المقترحة")}
            </p>
            <p className="text-sm font-semibold text-[#333435] mb-1">
              {isRTL ? recommendation.titleAr : recommendation.titleEn}
            </p>
            <p className="text-xs text-[#7c8689]">
              {isRTL ? recommendation.descAr : recommendation.descEn}
            </p>
          </div>
        </div>
      </motion.div>

      {/* CTAs */}
      <div className="space-y-2.5 pt-2">
        <Button disabled={appointments.isPending} onClick={() => appointments.isError ? appointments.refetch() : navigate(openAppointment ? "/ClinicAppointments?" + new URLSearchParams({appointment:openAppointment.id}) : explorerBookingUrl(EXPLORER_STARTS[0]))} style={{background:"var(--style-control)",color:"var(--style-control-ink)"}} className="w-full min-h-12 h-auto py-3 text-sm font-semibold">{appointments.isPending ? t("Checking your appointments…", "جارٍ التحقق من مواعيدك…") : appointments.isError ? t("Try again", "حاول مرة أخرى") : openAppointment ? t("View your appointment", "عرض موعدك") : t("Request Hair Assessment", "اطلب تقييم الشعر")}</Button>
        {appointments.isError && <p role="alert" className="text-sm text-red-700">{t("We could not check your appointment status.", "تعذر التحقق من حالة موعدك.")}</p>}
        <p className="text-xs text-[#7c8689] leading-relaxed">{openAppointment ? t("Your request is already in your appointments. Open it to check its status.", "طلبك موجود بالفعل في مواعيدك. افتحه للتحقق من حالته.") : t("Choose your preferred date and time. The clinic will confirm your visit.", "اختر التاريخ والوقت المفضلين. ستؤكد العيادة موعد زيارتك.")}</p>
        <Button
          onClick={sendToTeam}
          disabled={sending}
          variant="outline"
          className="w-full min-h-11 h-auto py-3 text-sm font-semibold border-[#c4aa8b] text-[#3a2e1e]"
        >
          <MessageSquare className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t("Send to Hair specialists", "إرسال إلى أخصائيي الشعر")}
        </Button>

        {(hasInternalConcerns || unknownCause) && (
          <Button
            variant="outline"
            className="w-full min-h-11 h-auto py-3 text-sm font-medium"
            onClick={() => navigate("/HealthJourney")}
          >
            {t("Ask About Biomarker Review", "اسأل عن مراجعة المؤشرات الحيوية")}
          </Button>
        )}

        <Button
          variant="ghost"
          className="w-full min-h-11 h-auto py-3 text-sm"
          onClick={onClose}
        >
          {t("Back", "رجوع")}
        </Button>
      </div>
    </motion.div>
  );
}