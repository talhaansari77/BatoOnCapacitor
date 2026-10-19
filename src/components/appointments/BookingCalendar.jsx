import { format } from "@/lib/customerFormatting";
import {programCounts} from "@/lib/carePrograms";

import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, Clock, CheckCircle2, ChevronLeft, ChevronRight, Crown } from "lucide-react";
import { addDays, isSameDay, isBefore, startOfDay } from "date-fns";
import { ar } from "date-fns/locale";
import { useLocation } from "../LocationContext";
import { clinicDateTime, clinicToday } from "@/lib/appointments";
import { toast } from "sonner";
import { CARE_DEPARTMENTS, resolveBookingDepartment } from "@/lib/serviceFlow";
import CareText from "@/components/CareText";

const PREFERRED_TIMES = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

// Weekday header row, starting Sunday (Jan 7 2024 is a Sunday).
const WEEKDAY_DATES = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + i));

function buildMonthGrid(viewMonth) {
  const first = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), 1);
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const leading = first.getDay(); // Sunday-based offset
  const cells = Array.from({ length: leading }, () => null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  return cells;
}

// Split the flat grid into visual rows for real table semantics.
function gridRows(cells) {
  return Array.from({ length: Math.ceil(cells.length / 7) }, (_, r) => cells.slice(r * 7, r * 7 + 7));
}

export default function BookingCalendar({
  open,
  onClose,
  userEmail,
  packageData = null,
  appointmentType = "treatment",
  department = null,
  service = null,
  onBookingSuccess
}) {
  const submitBusy=useRef(false);
  const [requestError,setRequestError]=useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const { currentLocation, isRTL, t } = useLocation();
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const resolvedDepartment = resolveBookingDepartment(department, packageData, service, selectedDepartment);
  const fixedDepartment = resolveBookingDepartment(department, packageData, service);
  const [notes, setNotes] = useState('');
  const dateLabel = (date, pattern) => format(date, pattern, { locale: isRTL ? ar : undefined });
  // Named stages: 1 Date, 2 Time, 3 Review.
  const [step, setStep] = useState(1);
  const [isVIP, setIsVIP] = useState(false);
  const queryClient = useQueryClient();

  // Preferred dates are requests, not live availability: a 30-day request window.
  const windowStart = startOfDay(addDays(clinicToday(currentLocation.id), 1));
  const windowEnd = startOfDay(addDays(clinicToday(currentLocation.id), 30));
  const inWindow = (date) => !isBefore(date, windowStart) && !isBefore(windowEnd, date);

  // Calendar view month starts on the window's month and follows navigation.
  const [viewMonth, setViewMonth] = useState(() => new Date(windowStart.getFullYear(), windowStart.getMonth(), 1));
  useEffect(() => {
    if (open) setViewMonth(new Date(windowStart.getFullYear(), windowStart.getMonth(), 1));
  }, [open, currentLocation.id]);

  const canGoPrev = viewMonth > new Date(windowStart.getFullYear(), windowStart.getMonth(), 1);
  const canGoNext = viewMonth < new Date(windowEnd.getFullYear(), windowEnd.getMonth(), 1);

  useEffect(() => {
    if (open && userEmail) {
      loadUserVIPStatus();
    }
  }, [open, userEmail]);

  const loadUserVIPStatus = async () => {
    try {
      const lifecycle = await base44.entities.ClientLifecycle.filter({
        client_email: userEmail
      });
      if (lifecycle.length > 0) {
        setIsVIP(lifecycle[0].vip_status || false);
      }
    } catch (error) {
      console.error("Error loading VIP status:", error);
    }
  };

  const bookAppointmentMutation = useMutation({
    mutationFn: async (appointmentData) => {
      const appointment = await base44.entities.Appointment.create({
        client_email: userEmail,
        appointment_date: appointmentData.dateTime,
        type: appointmentType,
        department: resolvedDepartment,
        service_name: service?.nameEn || packageData?.package_name || undefined,
        package_id: packageData?.id || undefined,
        location: currentLocation.name,
        timezone: currentLocation.id === "kuwait" ? "Asia/Kuwait" : "Asia/Dubai",
        notes: notes || t(packageData ? "Requested via care program" : "Requested via calendar",packageData ? "طلب عبر برنامج الرعاية" : "طلب عبر التقويم"),
        status: 'requested',
        send_reminder: false
      });

      // The request is already saved; a notification failure must not invite a duplicate.
      try {
        await base44.entities.Notification.create({
          client_email: userEmail, type: "appointment_update",
          title: "Appointment Request Received",
          message: "The BATO team will confirm availability and your specialist.",
          priority: "normal", related_id: appointment.id, related_type: "appointment"
        });
      } catch (error) { console.error("Request notification failed:", error); }

      return appointment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['customerCare', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['explorerAppointments', userEmail] });
      queryClient.invalidateQueries({ queryKey: ['upcomingAppointments'] });
      toast.success(t('Request sent. The clinic will confirm availability.', 'تم إرسال الطلب. ستؤكد العيادة توفر الموعد.'));
      handleReset();
      onClose();
      if (onBookingSuccess) onBookingSuccess();
    },
    onSettled: () => {submitBusy.current=false;},
    onError: (error) => {
      console.error("Error booking appointment:", error);
      setRequestError("save");
    }
  });

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setStep(2);
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setStep(3);
  };

  // Going back preserves the date and time already chosen.
  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleContinue = () => {
    if (step === 1 && selectedDate) setStep(2);
    else if (step === 2 && selectedTime) setStep(3);
  };

  const handleConfirmBooking = () => {
    if(submitBusy.current)return;
    setRequestError("");
    if (packageData && (packageData.status !== "active" || programCounts(packageData).remaining === 0)) {
      toast.error(t("This package has no available sessions. Ask your care team about the next step.","لا توجد جلسات متاحة في هذه الباقة. اسأل فريق الرعاية عن الخطوة التالية."));
      return;
    }
    if (!userEmail || !resolvedDepartment) {
      toast.error(t('Choose a care team before sending.', 'اختر فريق الرعاية قبل الإرسال.'));
      return;
    }
    if (!selectedDate || !selectedTime) {
      toast.error(t('Please select date and time', 'اختر التاريخ والوقت أولاً.'));
      return;
    }

    const dateTime = clinicDateTime(format(selectedDate, "yyyy-MM-dd"), selectedTime, currentLocation.id);
    if(new Date(dateTime).getTime()<=Date.now()){setRequestError("expired");return;}
    submitBusy.current=true;
    bookAppointmentMutation.mutate({ dateTime });
  };

  const handleReset = () => {
    setRequestError("");
    setSelectedDate(null);
    setSelectedTime(null);
    setNotes('');
    setSelectedDepartment('');
    setStep(1);
    setIsVIP(false); // Reset VIP status as well
  };

  const visitLabel = service ? (isRTL ? service.nameAr : service.nameEn) : packageData ? <CareText value={packageData.package_name} /> : appointmentType === "consultation" && resolvedDepartment === "hair_restoration" ? t("Hair Assessment","تقييم الشعر") : <CareText value={appointmentType} />;

  const STAGE_NAMES = [t("Date", "التاريخ"), t("Time", "الوقت"), t("Review", "المراجعة")];

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!isOpen && !bookAppointmentMutation.isPending) {
        handleReset();
        onClose();
      }
    }}>
      <DialogContent className="bato-booking-dialog w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] flex flex-col p-4 min-[360px]:p-5 gap-3" dir={isRTL ? "rtl" : "ltr"}>
        {/* Stable header: title, description, and persistent selection summary */}
        <DialogHeader className="shrink-0 text-start">
          <DialogTitle className="flex flex-wrap items-center gap-2 pe-6">
            <Calendar className="w-5 h-5 text-[#3a2e1e]" />
            {t("Request Your Appointment", "اطلب موعداً")}
            {isVIP && (
              <Badge className="bg-[#3a2e1e] text-white ml-2">
                <Crown className="w-3 h-3 mr-1" />
                {t("VIP Priority", "أولوية كبار العملاء")}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            {isVIP
              ? t("Your request will be reviewed by the clinic team.", "يراجع فريق العيادة طلبك.")
              : packageData
                ? t("Remaining sessions in your package: ", "الجلسات المتبقية في باقتك: ") + Math.max(0, (packageData.total_sessions || 0) - (packageData.sessions_used || 0))
                : t("Choose your preferred date and time. The clinic will confirm availability and your specialist.", "اختر التاريخ والوقت المفضلين. تؤكد العيادة الموعد والمختص.")
            }
          </DialogDescription>
        </DialogHeader>

        <div className="bato-booking-body flex flex-col flex-1 min-h-0 gap-3">
        {/* Persistent summary: service, branch and any selection made so far */}
        <div className="shrink-0 rounded-xl bg-[#f9f8f6] border border-[#c4aa8b] px-3 py-2.5 text-sm" aria-live="polite">
          <div className="grid grid-cols-1 gap-1">
            <span className="font-semibold text-[#3a2e1e]">{visitLabel}</span>
            <span className="text-[#7c8689]">{t("Branch:", "الفرع:")} {isRTL ? currentLocation.nameAr : currentLocation.name}</span>
            {selectedDate && (
              <span className="font-medium text-[#3a2e1e]">
                {dateLabel(selectedDate, "d MMM yyyy")}{selectedTime ? ` · ${selectedTime}` : ""}
              </span>
            )}
          </div>
          {(service || selectedDate) && (
            <div>
              <Label htmlFor="booking-department" className="sr-only">{t("Care team", "فريق الرعاية")}</Label>
              <select id="booking-department" className="mt-2 w-full rounded-lg border border-[#c4aa8b] bg-white p-2 text-sm" value={resolvedDepartment || ""} disabled={!!fixedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
                <option value="">{t("Choose a team", "اختر الفريق")}</option>
                {CARE_DEPARTMENTS.map(d => <option key={d.key} value={d.key}>{isRTL ? d.ar : d.en}</option>)}
              </select>
            </div>
          )}
          {!service && !selectedDate && (
            <div>
              <Label htmlFor="booking-department">{t("Care team", "فريق الرعاية")}</Label>
              <select id="booking-department" className="mt-2 w-full rounded-lg border border-[#c4aa8b] bg-white p-2 text-sm" value={resolvedDepartment || ""} disabled={!!fixedDepartment} onChange={e => setSelectedDepartment(e.target.value)}>
                <option value="">{t("Choose a team", "اختر الفريق")}</option>
                {CARE_DEPARTMENTS.map(d => <option key={d.key} value={d.key}>{isRTL ? d.ar : d.en}</option>)}
              </select>
            </div>
          )}
        </div>

        {isVIP && (
          <div className="p-3 bg-[#f9f8f6] border border-[#c4aa8b] rounded-lg">
            <div className="flex flex-wrap items-center gap-2 text-sm text-[#3a2e1e]">
              <Crown className="w-4 h-4" />
              <span className="font-semibold">{t("VIP Benefits Active:", "مزايا كبار العملاء مفعّلة:")}</span>
              <span>{t("Clinic confirmation required", "يلزم تأكيد العيادة")}</span>
            </div>
          </div>
        )}

        {/* Named stage indicator */}
        <div className="shrink-0 flex items-center justify-center gap-2" role="list" aria-label={t("Booking steps", "خطوات الطلب")}>
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center" role="listitem" aria-current={step === s ? "step" : undefined}>
              <div className="flex flex-col items-center gap-1">
                <div data-bato-step-state={step >= s ? "reached" : "upcoming"} className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  step >= s ? 'bg-[#3a2e1e] text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  {s}
                </div>
                <span className={`text-[11px] leading-none ${step === s ? 'font-semibold text-[#3a2e1e]' : 'text-[#7c8689]'}`}>
                  {STAGE_NAMES[s - 1]}
                </span>
              </div>
              {s < 3 && (
                <div data-bato-step-line={step > s ? "reached" : "upcoming"} className={`w-10 h-0.5 mb-4 ${step > s ? 'bg-[#3a2e1e]' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Inner scroll area: stage content scrolls while header, summary and actions stay fixed. */}
        <div className="bato-booking-stage flex-1 min-h-0 overflow-y-auto px-1 pb-2">
        <div className="space-y-6">
          {/* Stage 1: Select Date — compact month calendar with navigation */}
          {step === 1 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost" size="sm"
                  aria-label={t("Previous month", "الشهر السابق")}
                  disabled={!canGoPrev}
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                  className="h-9 px-2"
                >
                  <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
                </Button>
                <h3 className="font-semibold text-gray-900 text-sm" aria-live="polite">
                  {dateLabel(viewMonth, "MMMM yyyy")}
                </h3>
                <Button
                  variant="ghost" size="sm"
                  aria-label={t("Next month", "الشهر التالي")}
                  disabled={!canGoNext}
                  onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                  className="h-9 px-2"
                >
                  <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                </Button>
              </div>
              <p className="text-xs text-[#7c8689] mb-3">
                {t("Preferred dates for your request window. The clinic confirms availability.", "تواريخ مفضلة ضمن نافذة الطلب. تؤكد العيادة التوفر.")}
              </p>
              {/* Real table semantics: column headers with meaningful abbreviations, row groups and cells. */}
              <table className="w-full border-separate border-spacing-1"  aria-label={t("Preferred dates", "التواريخ المفضلة")}>
                <thead>
                  <tr>
                    {WEEKDAY_DATES.map((d, i) => (
                      <th key={i} scope="col" abbr={dateLabel(d, "EEEE")}
                        className="text-center text-[11px] font-medium text-[#7c8689] pb-1">
                        {dateLabel(d, "EEE")}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {gridRows(buildMonthGrid(viewMonth)).map((row, ri) => (
                    <tr key={ri}>
                      {row.map((date, ci) => {
                        if (!date) return <td key={ci} />;
                        const selectable = inWindow(date);
                        const isSelected = selectedDate && isSameDay(date, selectedDate);
                        return (
                          <td key={ci} className="p-0">
                            <button
                              disabled={!selectable}
                              aria-pressed={!!isSelected}
                              aria-label={`${dateLabel(date, "EEEE, d MMMM yyyy")}${selectable ? "" : " " + t("outside your request window", "خارج نافذة الطلب")}`}
                              onClick={() => handleDateSelect(date)}
                              className={`bato-date-option w-full h-11 rounded-lg text-sm text-center transition-colors ${
                                isSelected
                                  ? 'bg-[#3a2e1e] text-white font-semibold'
                                  : selectable
                                    ? 'border border-[#eeebe6] bg-white text-[#333435] hover:border-[#c4aa8b] hover:bg-[#f9f8f6]'
                                    : 'text-gray-300'
                              }`}
                            >
                              {format(date, 'd')}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Stage 2: Select Time */}
          {step === 2 && selectedDate && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">{t("Preferred Time (clinic local time)", "الوقت المفضل (بتوقيت العيادة)")}</h3>
              <div className="grid grid-cols-2 min-[390px]:grid-cols-3 gap-2">
                {PREFERRED_TIMES.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleTimeSelect(time)}
                    aria-pressed={selectedTime === time}
                    aria-pressed={selectedTime === time}
                    className={"bato-time-option min-h-11 px-2 py-3 border rounded-xl transition-colors flex items-center justify-center gap-2 " + (selectedTime === time ? "bg-[#3a2e1e] text-white border-[#3a2e1e]" : "border-[#c4aa8b]/30 bg-white text-[#3a2e1e] hover:bg-[#f9f8f6]")}
                  >
                    {selectedTime === time ? <CheckCircle2 aria-hidden="true" className="w-4 h-4 shrink-0"/> : <Clock aria-hidden="true" className="w-4 h-4 shrink-0 text-[#7c8689]"/>}
                    <span className="text-sm font-semibold"><bdi>{time}</bdi></span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stage 3: Details & Confirm */}
          {step === 3 && selectedDate && selectedTime && (
            <div className="space-y-6">
              {/* Summary */}
              <Card className="border-[#c4aa8b] bg-[#f9f8f6]">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#3a2e1e] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-gray-900 mb-1">{t("Appointment Details", "تفاصيل طلب الموعد")}</p>
                      <p className="text-sm text-gray-700">
                        {dateLabel(selectedDate, "EEEE, MMMM d, yyyy")} {t("at", "الساعة")} {selectedTime}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {t("Type:", "نوع الموعد:")} {isRTL ? ({ treatment: "علاج", consultation: "استشارة", follow_up: "متابعة", photo_session: "تصوير", check_up: "فحص" }[appointmentType] || "موعد") : appointmentType.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <p className="text-sm text-gray-600">{t("The clinic team will assign a specialist after reviewing your request. Times shown are preferences, not available slots.", "يحدد فريق العيادة المختص بعد مراجعة طلبك. الأوقات المعروضة للاختيار المفضل، وتحتاج إلى تأكيد العيادة.")}</p>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">{t("Additional Notes (Optional)", "ملاحظات إضافية (اختياري)")}</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={t("Any specific concerns or requirements...", "أي ملاحظات أو متطلبات خاصة...")}
                  rows={3}
                  className="mt-2"
                />
              </div>

              {/* Package Info */}
              {packageData && (
                <div className="bg-[#f9f8f6] border border-[#c4aa8b] rounded-lg p-4">
                  <p className="text-sm text-[#3a2e1e]">
                    <strong>{t("Package:", "الباقة:")}</strong> <CareText value={packageData.package_name} />
                  </p>
                  <p className="text-sm text-[#3a2e1e] mt-1">
                    {t("Your package sessions are unchanged by this request. The clinic will confirm how the visit applies to your package.", "لا يخصم هذا الطلب أي جلسة من باقتك. توضح العيادة كيفية احتساب الزيارة ضمن الباقة.")}
                  </p>
                </div>
              )}

            </div>
          )}
        </div>
        </div>

        </div>

        {/* Reachable bottom actions: back on the left, primary action fixed at the bottom. */}
        <div className="flex items-center gap-3 pt-3 border-t border-gray-100 flex-shrink-0">
          {step > 1 ? (
            <Button variant="outline" onClick={handleBack} className="min-h-11 px-4 flex-shrink-0">
              <ChevronLeft className="w-4 h-4 rtl:rotate-180" />
              {t("Back", "رجوع")}
            </Button>
          ) : (
            <span aria-hidden="true" className="flex-1" />
          )}
          {step < 3 ? (
            <Button
              onClick={handleContinue}
              disabled={bookAppointmentMutation.isPending || (step === 1 && !selectedDate) || (step === 2 && !selectedTime)}
              className="bato-press flex-1 bg-[#3a2e1e] hover:bg-[#51412c] min-h-11 text-base"
            >
              {t("Continue", "متابعة")}
            </Button>
          ) : (
            <Button
              onClick={handleConfirmBooking}
              disabled={bookAppointmentMutation.isPending || !resolvedDepartment || !userEmail}
              className="bato-press flex-1 bg-[#3a2e1e] hover:bg-[#51412c] min-h-11 text-base"
            >
              {bookAppointmentMutation.isPending ? t('Sending...', 'جارٍ الإرسال...') : t('Send Appointment Request', 'أرسل طلب الموعد')}
            </Button>
          )}
        </div>
        {requestError && <p role="alert" className="text-sm text-red-700 flex-shrink-0 pt-1">{requestError === "expired" ? t("This preferred time has passed. Choose a new date and time.","انتهى الوقت المفضل. اختر تاريخاً ووقتاً جديدين.") : t("Failed to send your request. Your selections are kept here; please try again.", "تعذر إرسال طلبك. اختياراتك محفوظة هنا؛ حاول مرة أخرى.")}</p>}
      </DialogContent>
    </Dialog>
  );
}