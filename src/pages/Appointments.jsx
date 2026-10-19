import { getPatientAppointments, readPatientAuth } from "@/native/patientApi";
import {ar} from "date-fns/locale";
import CareText from "@/components/CareText";
import CustomerLoadState from "@/components/CustomerLoadState";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, MapPin, Plus, CheckCircle2, ChevronDown, ChevronUp, User } from "lucide-react";
import { formatAppointment } from "@/lib/appointments";
import { CARE_DEPARTMENTS, partitionAppointments } from "@/lib/serviceFlow";
import { findBatoService } from "@/lib/batoServices";
import { useSearchParams, Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import BookingCalendar from "../components/appointments/BookingCalendar";
import { useLocation } from "../components/LocationContext";


/** Adapt only documented fields; numeric appointment status codes are not documented. */
function mapPatientAppointment(item) {
  const date = String(item.appointment_start_date || item.date || '');
  const time = String(item.appointment_start_time || item.time12 || '');
  const match = time.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  let hh = 0, mm = 0;
  if (match) {
    hh = (Number(match[1]) % 12) + (match[3].toUpperCase() === 'PM' ? 12 : 0);
    mm = Number(match[2]);
  } else {
    const t = String(item.time24 || '').match(/^(\d{2}):(\d{2})/);
    if (t) { hh = Number(t[1]); mm = Number(t[2]); }
  }
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date);
  const instant = validDate ? new Date(`${date}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00+03:00`) : new Date(NaN);
  return {
    id: item.id,
    appointment_date: Number.isNaN(instant.getTime()) ? '' : instant.toISOString(),
    timezone: 'Asia/Kuwait',
    service_name: item.service_name || '',
    specialist_name: item.doctor_name || '',
    // Numeric status IDs (e.g. "4") have no status dictionary in the collection.
    status: 'unknown',
  };
}

const STATUS_CONFIG = {
  requested: { label: "Awaiting confirmation", style: { background: "#f9f8f6", color: "#3a2e1e", border: "#c4aa8b" } },
  scheduled:  { label: "Scheduled",  style: { background: "rgba(196,170,139,0.15)", color: "#3a2e1e", border: "rgba(196,170,139,0.35)" } },
  confirmed:  { label: "Confirmed",  style: { background: "rgba(196,170,139,0.25)", color: "#3a2e1e", border: "rgba(196,170,139,0.5)" } },
  completed:  { label: "Completed",  style: { background: "#eeebe6", color: "#7c8689", border: "rgba(124,134,137,0.2)" } },
  cancelled:  { label: "Cancelled",  style: { background: "#f9f0f0", color: "#c0392b", border: "rgba(192,57,43,0.2)" } },
  rescheduled:{ label: "Rescheduled",style: { background: "#eeebe6", color: "#7c8689", border: "rgba(124,134,137,0.2)" } },
};

function AppointmentCard({ appointment, upcoming = false }) {
  const { t, isRTL } = useLocation();
  const sc = STATUS_CONFIG[appointment.status] || { label: "Needs review", style: STATUS_CONFIG.requested.style };
  const statusAr = { requested: "بانتظار التأكيد", scheduled: "مجدول", confirmed: "مؤكد", completed: "مكتمل", cancelled: "ملغى", rescheduled: "أعيدت جدولته" };
  const care = CARE_DEPARTMENTS.find(d => d.key === appointment.department);
  const service = findBatoService(appointment.service_name);
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-4 shadow-sm border border-[#eeebe6]"
    >
      <div className="flex items-start gap-4">
        {/* Date box */}
        <div className="flex-shrink-0 w-14 h-14 rounded-2xl flex flex-col items-center justify-center text-white font-bold shadow-sm"
          style={{ background: upcoming ? "var(--style-control)" : "var(--style-soft)", color: upcoming ? "var(--style-control-ink)" : "var(--style-ink)" }}>
          <span className="text-lg leading-none">{formatAppointment(appointment, "d", {locale:isRTL?ar:undefined})}</span>
          <span className="text-xs font-medium mt-0.5">{formatAppointment(appointment, "MMM", {locale:isRTL?ar:undefined})}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-start gap-2 mb-1">
            <p className="font-semibold text-[#333435] text-sm capitalize">
              <CareText value={(isRTL && service ? service.nameAr : appointment.service_name) || (appointment.type || 'appointment').replace(/_/g, ' ')} />
            </p>
            <span className="bato-appointment-status text-xs font-medium px-2 py-1 rounded-full"
              style={{ color: "var(--style-ink)", background: "var(--style-soft)", border: "1px solid var(--style-line)" }}>
              {isRTL ? statusAr[appointment.status] || "يحتاج إلى مراجعة" : sc.label}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-[#7c8689]">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatAppointment(appointment, "h:mm a", {locale:isRTL?ar:undefined})}</span>
            {appointment.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /><CareText value={appointment.location} /></span>}
          </div>
          {care && <p className="text-xs text-[#7c8689] mt-2">{isRTL ? care.ar : care.en}</p>}
          {care?.journey && <Link className="text-xs text-[#3a2e1e] underline mt-2 inline-block" to={"/" + care.journey}>{t("View care journey", "عرض رحلة الرعاية")}</Link>}
          {appointment.specialist_name && (
            <span className="flex items-center gap-1 text-xs text-[#7c8689] mt-1">
              <User className="w-3 h-3" />{appointment.specialist_name}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Appointments() {
  const isPatientSession = Boolean(readPatientAuth());
  const accountQuery = useQuery({ queryKey: ["appointmentsAccount"], queryFn: () => base44.auth.me(), retry: 1, gcTime: 0, refetchOnMount: "always", enabled: !isPatientSession });
  const user = isPatientSession ? { email: null } : (!accountQuery.isFetching ? accountQuery.data : null);
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [showPast, setShowPast] = useState(() => Boolean(readPatientAuth()));
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedService = findBatoService(searchParams.get("service"));
  useEffect(() => { if (selectedService) setShowBookingCalendar(true); }, [selectedService]);
  const closeBooking = () => { setShowBookingCalendar(false); if (searchParams.has("service")) setSearchParams({}, { replace: true }); };
  const queryClient = useQueryClient();
  const { isRTL, t } = useLocation();



  const { data: appointments = [], isPending: appointmentsPending, isError: appointmentsError, error: appointmentsFailure } = useQuery({
    queryKey: ['appointments', isPatientSession ? 'patient-api' : user?.email],
    queryFn: async () => isPatientSession
      ? (await getPatientAppointments()).map(mapPatientAppointment)
      : base44.entities.Appointment.filter({ client_email: user.email }, '-appointment_date'),
    enabled: !!user,
  });

  const { upcoming: upcomingAppointments, history: pastAppointments } = partitionAppointments(appointments);

  if ((!isPatientSession && (accountQuery.isPending || accountQuery.isFetching)) || (!!user && appointmentsPending)) return <CustomerLoadState />;
  if ((!isPatientSession && accountQuery.isError) || appointmentsError) return (
    <div>
      <CustomerLoadState error onRetry={() => { if (!isPatientSession) accountQuery.refetch(); queryClient.invalidateQueries({queryKey:["appointments"]}); }} />
      {isPatientSession && <p role="alert" className="max-w-lg mx-auto px-4 text-sm break-words" style={{ color: '#a32929' }}>
        {appointmentsFailure?.message || 'Unable to load appointments.'}
      </p>}
    </div>
  );

  return (
    <div className={`min-h-screen pb-8 ${isRTL ? 'text-right' : 'text-left'}`}
      style={{ background: "#eeebe6" }} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-[#333435]">{t("Appointments", "المواعيد")}</h1>
            <p className="text-xs text-[#7c8689]">{t("Manage your sessions", "إدارة جلساتك")}</p>
          </div>
          <Button
            onClick={() => setShowBookingCalendar(true)}
            size="sm"
            className="rounded-xl h-9 text-sm font-semibold border-0"
            style={{ background: "#c4aa8b", color: "#3a2e1e" }}
          >
            <Plus className="w-4 h-4 me-1.5" />
            {t("Book", "احجز")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-[#eeebe6]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ background: "rgba(196,170,139,0.12)" }}>
              <CalendarIcon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
            </div>
            <p className="text-xl font-bold text-[#333435]">{upcomingAppointments.length}</p>
            <p className="text-xs text-[#7c8689]">{t("Upcoming", "القادمة")}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm border border-[#eeebe6]">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2"
              style={{ background: "rgba(196,170,139,0.12)" }}>
              <CheckCircle2 className="w-4 h-4" style={{ color: "#c4aa8b" }} />
            </div>
            <p className="text-xl font-bold text-[#333435]">{appointments.filter(a => a.status === "completed").length}</p>
            <p className="text-xs text-[#7c8689]">{t("Completed", "مكتملة")}</p>
          </div>
        </div>

        {/* Upcoming */}
        <div>
          <p className="text-xs font-semibold text-[#7c8689] uppercase tracking-wider mb-3">{t("Upcoming", "القادمة")}</p>
          {upcomingAppointments.length > 0 ? (
            <div className="space-y-3">
              {upcomingAppointments.map(apt => (
                <AppointmentCard key={apt.id} appointment={apt} upcoming />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-[#eeebe6]">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{ background: "rgba(196,170,139,0.12)" }}>
                <CalendarIcon className="w-6 h-6" style={{ color: "#c4aa8b" }} />
              </div>
              <p className="font-semibold text-[#333435] mb-1">{t("No upcoming appointments", "لا توجد مواعيد قادمة")}</p>
              <p className="text-sm text-[#7c8689] mb-4">{t("Book your next session", "احجز جلستك القادمة")}</p>
              <Button
                onClick={() => setShowBookingCalendar(true)}
                size="sm"
                className="rounded-xl h-9 text-sm font-semibold border-0"
                style={{ background: "#c4aa8b", color: "#3a2e1e" }}
              >
                <Plus className="w-4 h-4 me-1.5" />
                {t("Book Appointment", "احجز موعداً")}
              </Button>
            </div>
          )}
        </div>

        {/* Past Appointments */}
        {pastAppointments.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-[#eeebe6] overflow-hidden">
            <button
              aria-expanded={showPast}
              onClick={() => setShowPast(!showPast)}
              className="w-full p-4 flex items-center justify-between hover:bg-[#f9f8f6] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#eeebe6" }}>
                  <Clock className="w-5 h-5 text-[#7c8689]" />
                </div>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="font-semibold text-[#333435] text-sm">{t("Appointment History", "سجل المواعيد")}</h3>
                  <p className="text-xs text-[#7c8689]">{pastAppointments.length} {t("records", "سجلات")}</p>
                </div>
              </div>
              {showPast ? <ChevronUp className="w-5 h-5 text-[#7c8689]" /> : <ChevronDown className="w-5 h-5 text-[#7c8689]" />}
            </button>

            <AnimatePresence>
              {showPast && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-3 space-y-2" style={{ borderTop: "1px solid rgba(196,170,139,0.15)" }}>
                    {pastAppointments.map(apt => (
                      <AppointmentCard key={apt.id} appointment={apt} />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {user && (
        <BookingCalendar
          open={showBookingCalendar}
          onClose={closeBooking}
          service={selectedService}
          userEmail={user.email}
          appointmentType="treatment"
          onBookingSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['appointments'] });
            closeBooking();
          }}
        />
      )}
    </div>
  );
}