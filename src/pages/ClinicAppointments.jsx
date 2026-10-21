import { getAllPatientAppointments, readPatientAuth } from "@/native/patientApi";
import BatoEmptyState from "@/components/ui/BatoEmptyState";
import CustomerLoadState from "@/components/CustomerLoadState";
import {rescheduleRequestContent} from "@/lib/rescheduleRequest";
import {selectCareLanguage} from "@/lib/careArabic";
import AppointmentCareCard from "@/components/care/AppointmentCareCard";
import {appointmentState,careMessageUrl,appointmentSelection} from "@/lib/customerCare";
import {programDepartment} from "@/lib/carePrograms";
import {ar} from "date-fns/locale";
import CareText from "@/components/CareText";
import { formatAppointment } from "@/lib/appointments";
import { useSearchParams } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { Button } from "@/components/ui/button";
import {
  Calendar, Clock, MapPin, User, ChevronDown, ChevronUp,
  MessageSquare, Plus, AlertCircle, CheckCircle2, RotateCcw,
  CalendarPlus, Info, ArrowRight, Send
} from "lucide-react";
import {clinicToday} from "@/lib/appointments";
import {appointmentBranch} from "@/lib/clinicBranches";
import {Dialog,DialogContent,DialogTitle,DialogDescription} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useLocation } from "../components/LocationContext";
import BookingCalendar from "../components/appointments/BookingCalendar";
import BookingCalendarTimeRanges from "../components/appointments/BookingCalendarTimeRanges";

// Appointment workflow status codes supplied by the clinic (0–5).
const PATIENT_STATUS = {
  '0': { label: 'Draft', ar: 'مسودة', background: '#E9EEFF', foreground: '#3755D9', border: '#BAC7FF', icon: 'draft' },
  '1': { label: 'Confirm', ar: 'تأكيد', background: '#E5F4EF', foreground: '#197556', border: '#ABDCCB', icon: 'confirm' },
  '2': { label: 'Waiting', ar: 'انتظار', background: '#FFF2D9', foreground: '#91600F', border: '#F1D192', icon: 'waiting' },
  '3': { label: 'InConsultation', ar: 'قيد الاستشارة', background: '#E9E9FA', foreground: '#6551A2', border: '#C9BCEB', icon: 'consultation' },
  '4': { label: 'Not Paid', ar: 'غير مدفوع', background: '#FDE9E7', foreground: '#B44639', border: '#F4BDB5', icon: 'unpaid' },
  '5': { label: 'Paid', ar: 'مدفوع', background: '#E3F2F8', foreground: '#146A87', border: '#ACD8E9', icon: 'paid' },
};

/** Map API appointment data into the original customer-care presentation. */
function mapClinicPatientAppointment(item) {
  const date = String(item.appointment_start_date || item.date || '').slice(0, 10);
  const time = String(item.appointment_start_time || item.time12 || '');
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  const h24 = time.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  const rawTime = String(item.time24 || '').match(/^(\d{2}):(\d{2})/);
  const hour = match ? Number(match[1]) % 12 + (match[3].toUpperCase() === 'PM' ? 12 : 0)
    : h24 ? Number(h24[1]) : rawTime ? Number(rawTime[1]) : 0;
  const minute = match ? Number(match[2]) : h24 ? Number(h24[2]) : rawTime ? Number(rawTime[2]) : 0;
  const localDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && hour < 24 && minute < 60
    ? `${date}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00+03:00` : '';
  const timestamp = localDate ? new Date(localDate) : new Date(NaN);
  const rawStatus = item.appointment_status ?? item.status ?? null;
  const normalizedStatus = typeof rawStatus === 'string' ? rawStatus.toLowerCase().trim() : '';
  return {
    ...item,
    id: String(item.id),
    appointment_date: Number.isNaN(timestamp.getTime()) ? '' : timestamp.toISOString(),
    timezone: 'Asia/Kuwait',
    type: item.service_name || item.section_name || 'appointment',
    service_name: item.service_name || '',
    specialist_name: item.doctor_name || '',
    raw_status: rawStatus,
    status: PATIENT_STATUS[String(rawStatus)] ? String(rawStatus)
      : ['requested','scheduled','confirmed','completed','cancelled','rescheduled'].includes(normalizedStatus)
        ? normalizedStatus : 'unknown',
    sessions: Array.isArray(item.sessions) ? item.sessions : [],
  };
}

function patientAppointmentCategory(appointment, now = Date.now()) {
  if (['completed', 'cancelled'].includes(appointment.status)) return 'history';
  const time = Date.parse(appointment.appointment_date);
  return Number.isFinite(time) ? (time >= now ? 'upcoming' : 'history') : 'unscheduled';
}

function PatientAppointmentCard({ appointment, t, isRTL, onReschedule }) {
  const code = String(appointment.raw_status ?? '');
  const config = PATIENT_STATUS[code] || {
    label: appointment.status !== 'unknown' ? appointment.status.replace(/_/g, ' ') : t('Status unavailable', 'الحالة غير متاحة'),
    ar: null, background: '#EEECE8', foreground: '#625749', border: '#DCD4CA', icon: 'unknown'
  };
  const label = isRTL && config.ar ? config.ar : config.label;
  const hasDate = Boolean(appointment.appointment_date);
  const note = code === '0' ? t('Your appointment is still a draft.', 'موعدك لا يزال مسودة.')
    : code === '1' ? t('Your appointment has been confirmed by the clinic.', 'تم تأكيد موعدك من العيادة.')
    : code === '2' ? t('Your appointment is waiting for the next step.', 'موعدك في انتظار الخطوة التالية.')
    : code === '3' ? t('Your consultation is in progress.', 'استشارتك جارية الآن.')
    : code === '4' ? t('Payment is still pending for this appointment.', 'الدفع لا يزال معلقاً لهذا الموعد.')
    : code === '5' ? t('Payment has been recorded for this appointment.', 'تم تسجيل الدفع لهذا الموعد.')
    : t('View your appointment details below.', 'اطلع على تفاصيل موعدك أدناه.');

  return <article className="rounded-[24px] border border-[#D2CDC5] bg-[#EEEBE6] shadow-[0_5px_14px_rgba(38,32,24,0.10)] p-5 space-y-3">
    <p className="text-xs text-[#6D665D]"><CareText value={appointment.section_name || appointment.department_name || appointment.service_name || appointment.type} /></p>
    <div className="flex items-center gap-2 flex-wrap">
      <Clock className="w-5 h-5 shrink-0" style={{ color: config.foreground }} aria-hidden="true" />
      <span className="font-semibold text-[15px] text-[#242424]">{label}</span>
      <span className="text-xs rounded-full px-2.5 py-1 font-semibold border" style={{ color: config.foreground, background: config.background, borderColor: config.border }}>{label}</span>
    </div>
    <p className="font-semibold text-[15px] text-[#292929]">
      {hasDate ? formatAppointment(appointment, 'EEEE, d MMM yyyy · h:mm a', { locale: isRTL ? ar : undefined }) : t('Date not available', 'التاريخ غير متاح')}
    </p>
    <p className="text-xs text-[#665F58]">{t('Clinic local time · Kuwait', 'توقيت العيادة المحلي · الكويت')}</p>
    <p className="text-sm text-[#302B26] leading-6">{note}</p>
    {appointment.service_name && <p className="text-xs text-[#61584E]">{t('Service', 'الخدمة')}: <CareText value={appointment.service_name}/></p>}
    {appointment.specialist_name && <p className="text-xs text-[#61584E]">{t('Doctor', 'الطبيب')}: <CareText value={appointment.specialist_name}/></p>}
    <div className="space-y-2">
      <a href={careMessageUrl(appointment.department)} target="_blank" rel="noopener noreferrer"
        className="block w-full text-start rounded-xl border border-[#DED6CA] px-4 py-3 text-sm text-[#302B26] hover:bg-white/40">
        {t('Contact customer service', 'تواصل مع خدمة العملاء')}
      </a>
      <button type="button" onClick={onReschedule}
        className="block w-full text-start rounded-xl border border-[#DED6CA] px-4 py-3 text-sm text-[#302B26] hover:bg-white/40">
        {t('Request a change', 'طلب تعديل')}
      </button>
    </div>
  </article>;
}

const getStatusConfig = (t) => ({
  requested: { label: t("Awaiting confirmation", "بانتظار التأكيد"), bg: "#fff7ed", color: "#9a3412", border: "#fed7aa" },
  scheduled:   { label: t("Scheduled", "مجدول"),     bg: "rgba(196,170,139,0.15)", color: "#3a2e1e", border: "rgba(196,170,139,0.35)" },
  confirmed:   { label: t("Confirmed", "مؤكد"),      bg: "rgba(196,170,139,0.25)", color: "#3a2e1e", border: "rgba(196,170,139,0.5)" },
  completed:   { label: t("Completed", "مكتمل"),     bg: "#eeebe6",               color: "#7c8689", border: "rgba(124,134,137,0.2)" },
  rescheduled: { label: t("Rescheduled", "معاد جدولته"), bg: "#eeebe6",               color: "#7c8689", border: "rgba(124,134,137,0.2)" },
  cancelled:   { label: t("Cancelled", "ملغى"),      bg: "#fef2f2",               color: "#9b1c1c", border: "rgba(155,28,28,0.2)" },
});

const getBookingTypes = (t) => [
  { label: t("Hair Assessment", "تقييم الشعر"),                type: "consultation",    dept: "hair_restoration" },
  { label: t("Skin Consultation", "استشارة بشرة"),        type: "consultation", dept: "skin_care" },
  { label: t("Laser Consultation", "استشارة الليزر"),              type: "consultation",    dept: "laser_hair_removal" },
  { label: t("Health Review", "مراجعة صحية"), type: "consultation", dept: "general_health" },
  { label: t("Aesthetic Consultation", "استشارة تجميلية"), type: "consultation", dept: "injections" },
  { label: t("Follow-Up", "متابعة"),                     type: "follow_up",    dept: "general_consultation" },
  { label: t("General Consultation", "استشارة عامة"),    type: "consultation", dept: "general_consultation" },
];

const getInstructions = (t) => [
  { icon: Clock,         text: t("Arrive 10 minutes before your scheduled time.", "احضر قبل موعدك بعشر دقائق.") },
  { icon: AlertCircle,   text: t("Follow any pre-session instructions shared by your specialist.", "اتبع تعليمات أخصائيك قبل الجلسة.") },
  { icon: MessageSquare, text: t("If you need to reschedule, contact customer service — do not miss the appointment without notice.", "إذا احتجت إلى تعديل موعدك، تواصل مع خدمة العملاء — لا تفوّت الموعد دون إشعار.") },
  { icon: Info,          text: t("Bring any test results, documents, or products requested by your team.", "أحضر التحاليل أو المستندات أو المنتجات التي طلبها الفريق.") },
];

function RescheduleModal({ appointment, onClose, userEmail, t }) {
  const {isRTL}=useLocation();
  const [preferredDate, setPreferredDate] = useState("");
  const [timeRange, setTimeRange] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const saveBusy=useRef(false);
  const [error,setError]=useState("");
  const branch=appointmentBranch(appointment);
  const today=clinicToday(branch?.id||"dubai");
  const minDate=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saveBusy.current) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate)||preferredDate<minDate||!timeRange||!reason.trim()) {setError("validation");return;}
    saveBusy.current=true;setError("");setSaving(true);
    try {
    await base44.entities.Message.create({
      client_email: userEmail,
      sender_email: userEmail,
      sender_name: "Client",
      sender_role: "client",
      subject: t("Reschedule Request","طلب تغيير الموعد"),
      content: rescheduleRequestContent({isRTL,appointmentId:appointment.id,
        branch:branch?t(branch.en,branch.ar):selectCareLanguage(appointment.location,isRTL?"ar":"en"),
        currentAppointment:formatAppointment(appointment,isRTL?"EEEE، d MMMM yyyy، h:mm a":"EEEE, MMMM d, yyyy 'at' h:mm a",{locale:isRTL?ar:undefined}),
        service:selectCareLanguage(appointment.type?.replace(/_/g," "),isRTL?"ar":"en"),preferredDate,timeRange,reason}),
      is_from_doctor: false,
      priority: "high",
      tags: [careMessageUrl(appointment.department).split("=")[1]],
    });
    setSubmitted(true);
    } catch { setError("save"); }
    finally { saveBusy.current=false;setSaving(false); }
  };

  return (
    <Dialog open onOpenChange={open=>{if(!open&&!saving)onClose();}}>
      <DialogContent dir={isRTL?"rtl":"ltr"} className="w-[calc(100%-2rem)] max-h-[90dvh] overflow-y-auto" aria-describedby="reschedule-description">
        <DialogTitle>{t("Request a date change","اطلب تغيير الموعد")}</DialogTitle>
        <DialogDescription id="reschedule-description">{t("Your current appointment stays unchanged until the clinic confirms a new time.","يبقى موعدك الحالي كما هو حتى تؤكد العيادة الوقت الجديد.")}</DialogDescription>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
        className="w-full bg-white pb-4">
        {submitted ? (
          <div className="text-center py-8">
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(196,170,139,0.15)" }}>
              <CheckCircle2 className="w-7 h-7" style={{ color: "#c4aa8b" }} />
            </div>
            <h3 className="text-lg font-bold text-[#333435] mb-2">{t("Request Sent", "تم إرسال الطلب")}</h3>
            <p className="text-sm text-[#7c8689] leading-relaxed mb-6">
              {t("Your request has been sent. The BATO team will review availability and contact you to confirm.", "تم إرسال طلبك. سيتحقق فريق باتو من المواعيد المتاحة ويتواصل معك للتأكيد.")}
            </p>
            <Button onClick={onClose} className="w-full rounded-xl h-10 font-semibold border-0" style={{ background: "#c4aa8b", color: "#3a2e1e" }}>{t("Done", "تم")}</Button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-[#333435]">{t("Request Reschedule", "طلب تعديل الموعد")}</h3>
            </div>
            <p className="text-xs text-[#7c8689] mb-5 leading-relaxed">
              {t("Rescheduling is subject to availability and clinic approval. Please send your request and the BATO team will confirm the next available option.", "يعتمد تغيير الموعد على التوفر وتأكيد العيادة. أرسل طلبك وسيؤكد لك فريق باتو الموعد المناسب.")}
            </p>

            <div className="p-3 rounded-xl mb-5" style={{ background: "rgba(196,170,139,0.08)", border: "1px solid rgba(196,170,139,0.2)" }}>
              <p className="text-xs font-semibold text-[#7c8689] mb-0.5">{t("Current Appointment", "الموعد الحالي")}</p>
              <p className="text-sm font-semibold text-[#333435]">{formatAppointment(appointment, "EEEE, MMMM d, yyyy", {locale:isRTL?ar:undefined})}</p>
              <p className="text-xs text-[#7c8689]">{formatAppointment(appointment, "h:mm a", {locale:isRTL?ar:undefined})} · <CareText value={appointment.type?.replace(/_/g, " ")} /></p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error&&<p role="alert" className="text-sm text-red-700">{error==="validation"?t("Choose a current or future date, a time range and a reason.","اختر تاريخاً حالياً أو مستقبلياً ووقتاً مفضلاً واكتب سبب التغيير."):t("Could not send request. Your answers are kept here; please try again.","تعذر إرسال الطلب. إجاباتك محفوظة هنا؛ حاول مرة أخرى.")}</p>}
              <fieldset disabled={saving} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7c8689] uppercase tracking-wider block mb-1.5">{t("Preferred New Date", "التاريخ المفضل الجديد")}</label>
                <input aria-label={t("Preferred New Date","التاريخ المفضل الجديد")} min={minDate} type="date" required value={preferredDate} onChange={e => setPreferredDate(e.target.value)}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm text-[#333435] outline-none focus:ring-1"
                  style={{ borderColor: "rgba(196,170,139,0.35)", background: "#f9f8f6" }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-[#7c8689] uppercase tracking-wider block mb-1.5">{t("Preferred Time Range", "الوقت المفضل")}</label>
                <select aria-label={t("Preferred Time Range","الوقت المفضل")} value={timeRange} onChange={e => setTimeRange(e.target.value)} required
                  className="w-full border rounded-xl px-3 py-2.5 text-sm text-[#333435] outline-none"
                  style={{ borderColor: "rgba(196,170,139,0.35)", background: "#f9f8f6" }}>
                  <option value="">{t("Select a range", "اختر الوقت المفضل")}</option>
                  <option value="morning">{t("Morning (9am – 12pm)", "الصباح (٩ ص – ١٢ ظهراً)")}</option>
                  <option value="afternoon">{t("Afternoon (12pm – 4pm)", "بعد الظهر (١٢ ظهراً – ٤ م)")}</option>
                  <option value="late_afternoon">{t("Late Afternoon (4pm – 7pm)", "المساء (٤ م – ٧ م)")}</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-[#7c8689] uppercase tracking-wider block mb-1.5">{t("Reason for Reschedule", "سبب تغيير الموعد")}</label>
                <textarea aria-label={t("Reason for Reschedule","سبب تغيير الموعد")} required value={reason} onChange={e => setReason(e.target.value)} rows={3}
                  placeholder={t("Please explain why you need to reschedule...", "اكتب سبب طلب تغيير الموعد...")}
                  className="w-full border rounded-xl px-3 py-2.5 text-sm text-[#333435] outline-none resize-none"
                  style={{ borderColor: "rgba(196,170,139,0.35)", background: "#f9f8f6" }} />
              </div>
              <Button type="submit" disabled={saving} className="w-full rounded-xl h-10 font-semibold border-0" style={{ background: "#3a2e1e", color: "#c4aa8b" }}>
                <Send className="w-4 h-4 mr-2" />{saving?t("Sending…","جارٍ الإرسال…"):t("Submit Request", "إرسال الطلب")}
              </Button>
              </fieldset>
            </form>
          </>
        )}
      </motion.div>
      </DialogContent>
    </Dialog>
  );
}

function UpcomingHero({appointment,onReschedule,onBook,t}) {
  if(appointment)return <AppointmentCareCard appointment={appointment} compact onReschedule={onReschedule}/>;
  return <section className="bato-style-surface bato-appointment-empty rounded-3xl p-5 space-y-4">
    <BatoEmptyState tone="plain" title={t("No upcoming appointment","لا يوجد موعد قادم")} description={t("Choose a care team to request a visit.","اختر فريق الرعاية لطلب زيارة.")} />
    <Button onClick={onBook} className="w-full rounded-xl bg-[#c4aa8b] text-[#3a2e1e]">{t("Request an appointment","اطلب موعداً")}</Button>
  </section>;
}

export default function ClinicAppointments() {
  const isPatientSession = Boolean(readPatientAuth());
  const [user, setUser] = useState(() => isPatientSession ? { email: null } : null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showBooking, setShowBooking] = useState(false);
  const [bookingType, setBookingType] = useState("treatment");
  const [bookingDepartment, setBookingDepartment] = useState("general_consultation");
  const [showReschedule, setShowReschedule] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [patientFilter, setPatientFilter] = useState("all");
  const [showPast, setShowPast] = useState(() => Boolean(readPatientAuth()));
  const [historyLimit,setHistoryLimit] = useState(8);
  const [bookingProgramId, setBookingProgramId] = useState(null);
  const [userError,setUserError]=useState(false);
  const queryClient = useQueryClient();
  const { isRTL, t, setLocation } = useLocation();
  useEffect(() => {
    if (searchParams.get("book") !== "1") return;
    const allowed = ["hair_restoration", "skin_care", "laser_hair_removal", "injections", "general_health", "general_consultation"];
    setBookingDepartment(allowed.includes(searchParams.get("department")) ? searchParams.get("department") : "general_consultation");
    setBookingType(["consultation","treatment","follow_up","check_up","photo_session"].includes(searchParams.get("type")) ? searchParams.get("type") : "consultation");
    if (["dubai", "kuwait"].includes(searchParams.get("branch"))) setLocation(searchParams.get("branch"));
    setBookingProgramId(searchParams.get("program"));
    setShowBooking(true);
    const next = new URLSearchParams(searchParams);
    ["book", "type", "department", "branch", "program"].forEach(key => next.delete(key));
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, setLocation]);
  const STATUS_CONFIG = getStatusConfig(t);
  const INSTRUCTIONS = getInstructions(t);
  const BOOKING_TYPES = getBookingTypes(t);

  useEffect(() => { if (!isPatientSession) base44.auth.me().then(setUser).catch(() => setUserError(true)); }, [isPatientSession]);

  const { data: appointments = [], isPending: appointmentsPending, isError: appointmentsError } = useQuery({
    queryKey: ["appointments", isPatientSession ? "patient-api" : user?.email],
    queryFn: () => isPatientSession
      ? getAllPatientAppointments().then(items => items.map(mapClinicPatientAppointment))
      : base44.entities.Appointment.filter({ client_email: user.email }, "-appointment_date"),
    enabled: !!user, refetchOnMount: "always", refetchInterval:60000,
  });

  const packageQuery=useQuery({queryKey:["bookingPrograms",user?.email],queryFn:()=>base44.entities.Package.filter({client_email:user.email}),enabled:!!user && !isPatientSession});
  const bookingProgram=bookingProgramId?packageQuery.data?.find(p=>p.id===bookingProgramId&&p.client_email===user?.email&&p.status==="active"):null;

  const selection = appointmentSelection(appointments,searchParams.get("appointment"));
  const past = selection.history;
  const nextAppointment = selection.primary;
  const patientSorted = [...appointments].sort((a,b) => (Date.parse(b.appointment_date) || 0) - (Date.parse(a.appointment_date) || 0));
  const patientFilters = [
    {key:'upcoming',label:t('Upcoming','القادمة')},
    {key:'confirmed',label:t('Confirmed','المؤكدة')},
    {key:'all',label:t('All','الكل')},
    {key:'history',label:t('History','السابقة')},
  ];
  const matchesPatientFilter = (apt, filter) => filter === 'all' ||
    (filter === 'confirmed' ? ['1', 'confirmed'].includes(apt.status) : patientAppointmentCategory(apt) === filter);
  const filteredPatientAppointments = patientSorted.filter(apt => matchesPatientFilter(apt, patientFilter));


  const handleReschedule = (apt) => {
    setSelectedAppointment(apt);
    setShowReschedule(true);
  };

  if(userError||appointmentsError)return <CustomerLoadState error />;
  if(!user||appointmentsPending)return <CustomerLoadState />;
  return (
    <div className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`} style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#333435]">{t("Appointments", "المواعيد")}</h1>
          <p className="text-xs text-[#7c8689]">{t("Manage your clinic visits", "إدارة زياراتك للعيادة")}</p>
        </div>

        {/* Patient request CTA: reuses the original BookingCalendar with care-team selection. */}
        {isPatientSession && (
          <section className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-[#333435]">{t("Request a new appointment", "اطلب موعداً جديداً")}</p>
            <p className="text-xs text-[#7c8689]">{t("Choose a care team and your preferred date and time. The clinic must confirm your request.", "اختر فريق الرعاية والتاريخ والوقت المفضلين. يجب أن تؤكد العيادة طلبك.")}</p>
            <Button className="w-full rounded-xl bg-[#3a2e1e] text-white hover:bg-[#51412c]" onClick={() => {setBookingProgramId(null);setBookingType("consultation");setBookingDepartment(null);setShowBooking(true);}}>
              <CalendarPlus className="h-4 w-4 mr-2" />{t("Request an appointment", "اطلب موعداً")}
            </Button>
          </section>
        )}

        {selection.missing&&<p role="alert" className="rounded-xl bg-white p-4 text-sm">{t("That appointment is not available in your records.","هذا الموعد غير متاح في سجلاتك.")}</p>}
        {isPatientSession && <section className="space-y-3">
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label={t('Appointment filters','تصفية المواعيد')}>
            {patientFilters.map(filter => <button key={filter.key} role="tab" type="button"
              aria-selected={patientFilter === filter.key} onClick={() => setPatientFilter(filter.key)}
              className="rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap border shrink-0"
              style={patientFilter === filter.key ? {background:'#3a2e1e',color:'#fff',borderColor:'#3a2e1e'} : {background:'#fff',color:'#3a2e1e',borderColor:'#c4aa8b55'}}>
              {filter.label} ({appointments.filter(apt=>matchesPatientFilter(apt,filter.key)).length})
            </button>)}
          </div>
          {filteredPatientAppointments.length ? filteredPatientAppointments.map(apt =>
            <PatientAppointmentCard key={apt.id} appointment={apt} t={t} isRTL={isRTL} onReschedule={() => handleReschedule(apt)}/>)
            : <div className="bg-white rounded-2xl p-5"><BatoEmptyState tone="plain"
              title={t('No appointments in this category','لا توجد مواعيد في هذه الفئة')}
              description={t('Try another filter to view your appointments.','جرّب تصفية أخرى لعرض مواعيدك.')} /></div>}
        </section>}

        {/* Next Appointment Hero */}
        {!isPatientSession && <UpcomingHero appointment={nextAppointment} onReschedule={() => nextAppointment && handleReschedule(nextAppointment)} onBook={() => {setBookingProgramId(null);setBookingType("consultation");setBookingDepartment(null);setShowBooking(true);}} t={t} STATUS_CONFIG={STATUS_CONFIG} />}

        {!isPatientSession && selection.unresolved.length>0&&<AppointmentCareCard appointment={selection.unresolved[0]} compact/>}
        {/* Upcoming list (beyond first) */}
        {!isPatientSession && selection.others.map(apt=><AppointmentCareCard key={apt.id} appointment={apt} compact onReschedule={()=>handleReschedule(apt)}/>)}

        {/* Book Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#eeebe6] p-4">
          <h2 className="bato-section-title mb-3">{t("Request a Visit", "اطلب زيارة")}</h2>
          <div className="space-y-2">
            {BOOKING_TYPES.map(bt => (
              <button key={bt.label} onClick={() => { setBookingType(bt.type); setBookingDepartment(bt.dept); setBookingProgramId(null); setShowBooking(true); }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl hover:bg-[#f9f8f6] transition-colors"
                style={{ border: "1px solid rgba(196,170,139,0.18)" }}>
                <span className="text-sm font-medium text-[#333435]">{bt.label}</span>
                <ArrowRight className={`w-4 h-4 text-[#7c8689] shrink-0 ${isRTL ? "rotate-180" : ""}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Past Appointments */}
        {!isPatientSession && past.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#eeebe6] overflow-hidden">
            <button aria-expanded={showPast} onClick={() => setShowPast(o => !o)} className="w-full flex items-center justify-between p-4 hover:bg-[#f9f8f6] transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "#eeebe6" }}>
                  <Clock className="w-4 h-4 text-[#7c8689]" />
                </div>
                <div className={isRTL?"text-right":"text-left"}>
                  <p className="text-sm font-semibold text-[#333435]">{t("Past Appointments", "المواعيد السابقة")}</p>
                  <p className="text-xs text-[#7c8689]">{past.length} {t("on record", "مواعيد مسجلة")}</p>
                </div>
              </div>
              {showPast ? <ChevronUp className="w-4 h-4 text-[#7c8689]" /> : <ChevronDown className="w-4 h-4 text-[#7c8689]" />}
            </button>
            <AnimatePresence>
              {showPast && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                  <div className="px-4 pb-4 space-y-2" style={{ borderTop: "1px solid rgba(196,170,139,0.12)" }}>
                    {past.slice(0, historyLimit).map(apt => {
                      const state=appointmentState(apt);
                      const sc = state==="needs_review"?{label:t("Needs clinic update","يحتاج تحديث العيادة"),bg:"#fff7ed",color:"#9a3412",border:"#fed7aa"}:STATUS_CONFIG[state] || {label:t("Needs review","يحتاج مراجعة"),bg:"#eeebe6",color:"#7c8689",border:"#eeebe6"};
                      return (
                        <button key={apt.id} onClick={()=>{setSearchParams({appointment:apt.id});window.scrollTo({top:0,behavior:"smooth"});}} className="w-full flex items-center gap-3 py-3 text-start">
                          <div className="bato-style-surface w-9 h-9 rounded-xl flex flex-col items-center justify-center flex-shrink-0" style={{ background: "#f9f8f6" }}>
                            <span className="text-xs font-bold text-[#333435] leading-none">{formatAppointment(apt, "d", {locale:isRTL?ar:undefined})}</span>
                            <span className="text-[9px] text-[#7c8689]">{formatAppointment(apt, "MMM", {locale:isRTL?ar:undefined})}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#333435] capitalize"><CareText value={apt.type?.replace(/_/g, " ")} /></p>
                            {apt.specialist_name && <p className="text-xs text-[#7c8689]">{apt.specialist_name}</p>}
                          </div>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>{sc.label}</span>
                        </button>
                      );
                    })}
                    {past.length>historyLimit&&<button className="underline py-3 text-sm" onClick={()=>setHistoryLimit(n=>n+8)}>{t("Show more appointments","عرض المزيد من المواعيد")}</button>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#eeebe6] p-4">
          <h2 className="bato-card-title mb-3">{t("Appointment Guidelines", "إرشادات الموعد")}</h2>
          <div className="space-y-3">
            {INSTRUCTIONS.map((inst, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(196,170,139,0.12)" }}>
                  <inst.icon className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                </div>
                <p className="text-sm text-[#7c8689] leading-relaxed">{inst.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
            <p className="text-xs text-[#7c8689] italic">{t("Rescheduling is subject to availability and clinic approval. Contact customer service as early as possible if your plans change.", "يعتمد تغيير الموعد على التوفر وتأكيد العيادة. تواصل مع خدمة العملاء مبكراً إذا تغيرت خططك.")}</p>
          </div>
        </div>

      </div>

      {/* Modals */}
      <AnimatePresence>
        {showReschedule && selectedAppointment && (
        <RescheduleModal appointment={selectedAppointment} userEmail={user?.email} onClose={() => setShowReschedule(false)} t={t} />
        )}
      </AnimatePresence>

      {bookingProgramId&&showBooking&&(!packageQuery.isPending&&(packageQuery.isError||!bookingProgram))&&<div role="alert" className="rounded-xl bg-white p-4 m-4"><p>{t("We couldn't load this active package. Please check with your team.","تعذر تحميل هذه الباقة النشطة. تحقق من فريقك.")}</p><button className="underline py-3" onClick={()=>{setShowBooking(false);setBookingProgramId(null);}}>{t("Close","إغلاق")}</button></div>}
      {user && (!bookingProgramId || bookingProgram) && (
        <>{isPatientSession ? <BookingCalendarTimeRanges open={showBooking} onClose={() => setShowBooking(false)} userEmail={user.email}
          appointmentType={bookingType} department={bookingProgram ? programDepartment(bookingProgram) : bookingDepartment} packageData={bookingProgram}
          patientRequestMode={isPatientSession}
          onBookingSuccess={() => { queryClient.invalidateQueries({ queryKey: ["appointments"] }); setShowBooking(false);  }} /> : <BookingCalendar open={showBooking} onClose={() => setShowBooking(false)} userEmail={user.email}
          appointmentType={bookingType} department={bookingProgram ? programDepartment(bookingProgram) : bookingDepartment} packageData={bookingProgram}
          patientRequestMode={false}
          onBookingSuccess={() => { queryClient.invalidateQueries({ queryKey: ["appointments"] }); setShowBooking(false); }} />}</>
      )}
    </div>
  );
}