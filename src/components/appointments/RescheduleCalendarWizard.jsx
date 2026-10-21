import React, { useMemo, useRef, useState } from 'react';
import { addDays, isBefore, isSameDay, startOfDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Calendar, ChevronLeft, ChevronRight, CheckCircle2, Clock, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { base44 } from '@/api/base44Client';
import { format } from '@/lib/customerFormatting';
import { formatAppointment, clinicToday } from '@/lib/appointments';
import { appointmentBranch } from '@/lib/clinicBranches';
import { rescheduleRequestContent } from '@/lib/rescheduleRequest';
import { selectCareLanguage } from '@/lib/careArabic';
import CareText from '@/components/CareText';
import { careMessageUrl } from '@/lib/customerCare';
import { useLocation } from '../LocationContext';

// Matches the time ranges in BookingCalendarTimeRanges and the prior request-a-change form.
const RANGES = [
  { value: 'morning', en: 'Morning', ar: 'الصباح', time: '9 AM – 12 PM', arTime: '٩ ص – ١٢ ظهراً' },
  { value: 'afternoon', en: 'Afternoon', ar: 'بعد الظهر', time: '12 PM – 4 PM', arTime: '١٢ ظهراً – ٤ م' },
  { value: 'late_afternoon', en: 'Evening', ar: 'المساء', time: '4 PM – 7 PM', arTime: '٤ م – ٧ م' },
];
const weekDays = Array.from({ length: 7 }, (_, i) => new Date(2024, 0, 7 + i));
const dateKey = d => format(d, 'yyyy-MM-dd');
function monthRows(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const cells = Array.from({ length: first.getDay() }, () => null);
  for (let d = 1; d <= new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(); d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));
  return rows;
}

/** Separate reschedule presentation. The original RescheduleModal remains in ClinicAppointments.jsx. */
export default function RescheduleCalendarWizard({ appointment, onClose, userEmail, t }) {
  const { isRTL } = useLocation();
  const branch = appointmentBranch(appointment);
  const locationId = branch?.id || 'kuwait';
  const today = clinicToday(locationId);
  const from = startOfDay(addDays(today, 1));
  const to = startOfDay(addDays(today, 30));
  const startMonth = new Date(from.getFullYear(), from.getMonth(), 1);
  const endMonth = new Date(to.getFullYear(), to.getMonth(), 1);
  const [month, setMonth] = useState(startMonth);
  const [stage, setStage] = useState(1);
  const [date, setDate] = useState(null);
  const [range, setRange] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [sent, setSent] = useState(false);
  const busy = useRef(false);
  const dateLabel = (d, pattern) => format(d, pattern, { locale: isRTL ? ar : undefined });
  const rangeInfo = RANGES.find(r => r.value === range);
  const rangeText = rangeInfo ? `${isRTL ? rangeInfo.ar : rangeInfo.en} (${isRTL ? rangeInfo.arTime : rangeInfo.time})` : '';
  const inWindow = d => !isBefore(d, from) && !isBefore(to, d);
  const displayedMonths = useMemo(() => monthRows(month), [month]);

  const submit = async () => {
    if (busy.current) return;
    if (!date || !inWindow(date) || !range || !reason.trim()) { setError('validation'); return; }
    busy.current = true;
    setError(''); setSaving(true);
    try {
      await base44.entities.Message.create({
        client_email: userEmail,
        sender_email: userEmail,
        sender_name: 'Client',
        sender_role: 'client',
        subject: t('Reschedule Request', 'طلب تغيير الموعد'),
        content: rescheduleRequestContent({
          isRTL, appointmentId: appointment.id,
          branch: branch ? t(branch.en, branch.ar) : selectCareLanguage(appointment.location, isRTL ? 'ar' : 'en'),
          currentAppointment: formatAppointment(appointment, isRTL ? 'EEEE، d MMMM yyyy، h:mm a' : "EEEE, MMMM d, yyyy 'at' h:mm a", { locale: isRTL ? ar : undefined }),
          service: selectCareLanguage(appointment.type?.replace(/_/g, ' '), isRTL ? 'ar' : 'en'),
          preferredDate: dateKey(date), timeRange: range, reason,
        }),
        is_from_doctor: false, priority: 'high',
        tags: [careMessageUrl(appointment.department).split('=')[1]],
      });
      setSent(true);
    } catch (e) {
      console.error('Reschedule request failed', e);
      setError('save');
    } finally { busy.current = false; setSaving(false); }
  };

  const stages = [t('Date', 'التاريخ'), t('Time', 'الوقت'), t('Review', 'المراجعة')];
  return (
    <Dialog open onOpenChange={open => { if (!open && !saving) onClose(); }}>
      <DialogContent className="bato-booking-dialog w-[calc(100%-2rem)] max-w-lg max-h-[90dvh] flex flex-col p-4 min-[360px]:p-5 gap-3" dir={isRTL ? 'rtl' : 'ltr'} aria-describedby="change-date-description">
        <DialogTitle className="flex items-center gap-2 pe-7"><Calendar className="w-5 h-5 text-[#3a2e1e]" />{t('Request a date change', 'اطلب تغيير الموعد')}</DialogTitle>
        <DialogDescription id="change-date-description">{t('Your appointment remains unchanged until the clinic confirms the request.', 'يبقى موعدك الحالي دون تغيير حتى تؤكد العيادة الطلب.')}</DialogDescription>
        {sent ? <div className="py-8 text-center space-y-4">
          <CheckCircle2 className="mx-auto h-12 w-12 text-[#3a2e1e]" />
          <h3 className="font-semibold text-lg">{t('Request Sent', 'تم إرسال الطلب')}</h3>
          <p className="text-sm text-[#7c8689]">{t('The BATO team will review availability and contact you.', 'سيراجع فريق باتو التوفر ويتواصل معك.')}</p>
          <Button onClick={onClose} className="w-full bg-[#3a2e1e] text-white">{t('Done', 'تم')}</Button>
        </div> : <>
          <div className="rounded-xl bg-[#f9f8f6] border border-[#c4aa8b] px-3 py-2.5 space-y-1 text-sm">
            <div className="font-semibold text-[#3a2e1e]"><CareText value={appointment.service_name || appointment.type || 'Appointment'} /></div>
            <div className="text-[#7c8689]">{t('Current appointment', 'الموعد الحالي')}: {formatAppointment(appointment, 'd MMM yyyy · h:mm a', { locale: isRTL ? ar : undefined })}</div>
            {date && <div className="font-medium text-[#3a2e1e]">{t('Requested', 'المطلوب')}: {dateLabel(date, 'd MMM yyyy')}{range ? ` · ${rangeText}` : ''}</div>}
          </div>
          <div className="shrink-0 flex items-center justify-center gap-2" role="list" aria-label={t('Request steps', 'خطوات الطلب')}>
            {[1, 2, 3].map(s => <React.Fragment key={s}>
              <div role="listitem" aria-current={stage === s ? 'step' : undefined} className="flex flex-col items-center gap-1">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${stage >= s ? 'bg-[#3a2e1e] text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</span>
                <span className={`text-[11px] ${stage === s ? 'font-semibold text-[#3a2e1e]' : 'text-[#7c8689]'}`}>{stages[s - 1]}</span>
              </div>
              {s < 3 && <span aria-hidden="true" className={`w-10 h-0.5 mb-4 ${stage > s ? 'bg-[#3a2e1e]' : 'bg-gray-200'}`} />}
            </React.Fragment>)}
          </div>
          <div className="bato-booking-stage flex-1 min-h-0 overflow-y-auto px-1 pb-2">
            {stage === 1 && <div>
              <div className="flex items-center justify-between mb-3">
                <Button variant="ghost" size="sm" aria-label={t('Previous month', 'الشهر السابق')} disabled={month <= startMonth} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft className="w-4 h-4 rtl:rotate-180" /></Button>
                <h3 className="text-sm font-semibold text-[#3a2e1e]">{dateLabel(month, 'MMMM yyyy')}</h3>
                <Button variant="ghost" size="sm" aria-label={t('Next month', 'الشهر التالي')} disabled={month >= endMonth} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight className="w-4 h-4 rtl:rotate-180" /></Button>
              </div>
              <p className="text-xs text-[#7c8689] mb-3">{t('Choose a preferred new date. The clinic confirms availability.', 'اختر التاريخ المفضل الجديد. تؤكد العيادة التوفر.')}</p>
              <table className="w-full border-separate border-spacing-1" aria-label={t('Preferred dates', 'التواريخ المفضلة')}>
                <thead><tr>{weekDays.map((d, i) => <th key={i} scope="col" className="text-center text-[11px] font-medium text-[#7c8689] pb-1">{dateLabel(d, 'EEE')}</th>)}</tr></thead>
                <tbody>{displayedMonths.map((row, ri) => <tr key={ri}>{row.map((d, ci) => <td key={ci} className="p-0">{d && <button type="button" disabled={!inWindow(d)} aria-pressed={Boolean(date && isSameDay(date, d))} onClick={() => { setDate(d); setError(''); setStage(2); }} className={`w-full h-11 rounded-lg text-sm text-center ${date && isSameDay(date, d) ? 'bg-[#3a2e1e] text-white font-semibold' : inWindow(d) ? 'border border-[#eeebe6] bg-white text-[#333435] hover:border-[#c4aa8b]' : 'text-gray-300'}`}>{format(d, 'd')}</button>}</td>)}</tr>)}</tbody>
              </table>
            </div>}
            {stage === 2 && <div className="space-y-3">
              <h3 className="font-semibold text-[#3a2e1e]">{t('Preferred Time Range (clinic local time)', 'الفترة الزمنية المفضلة (بتوقيت العيادة)')}</h3>
              <p className="text-sm text-[#7c8689]">{t('Choose a preferred period. The clinic will confirm an exact time.', 'اختر الفترة المفضلة. ستؤكد العيادة الوقت المحدد.')}</p>
              <div className="flex flex-col gap-2" role="group" aria-label={t('Preferred time range', 'الفترة الزمنية المفضلة')}>
                {RANGES.map(item => <button key={item.value} type="button" aria-pressed={range === item.value} onClick={() => { setRange(item.value); setError(''); setStage(3); }} className={'bato-time-option flex items-center w-full min-h-14 gap-3 px-4 py-3 rounded-xl border text-start transition-colors ' + (range === item.value ? 'bg-[#3a2e1e] text-white border-[#3a2e1e]' : 'border-[#c4aa8b]/50 bg-[#f9f8f6] text-[#3a2e1e] hover:bg-[#eeebe6]')}>
                  <Clock className={'w-5 h-5 shrink-0 ' + (range === item.value ? 'text-white' : 'text-[#8f7252]')} />
                  <span className="flex flex-col flex-1"><span className="font-semibold text-sm">{isRTL ? item.ar : item.en}</span><span className={'text-xs mt-0.5 ' + (range === item.value ? 'text-white/80' : 'text-[#7c8689]')}><bdi>{isRTL ? item.arTime : item.time}</bdi></span></span>
                  {range === item.value && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                </button>)}
              </div>
            </div>}
            {stage === 3 && <div className="space-y-4">
              <h3 className="font-semibold text-[#3a2e1e]">{t('Review your change request', 'مراجعة طلب التعديل')}</h3>
              <div className="rounded-xl border border-[#c4aa8b]/50 bg-[#f9f8f6] p-4 space-y-2 text-sm">
                <p><strong>{t('Preferred date', 'التاريخ المفضل')}:</strong> {dateLabel(date, 'EEEE, MMMM d, yyyy')}</p>
                <p><strong>{t('Preferred time range', 'الفترة المفضلة')}:</strong> {rangeText}</p>
                <p className="text-xs text-[#7c8689]">{t('Subject to clinic confirmation.', 'يخضع لتأكيد العيادة.')}</p>
              </div>
              <div className="space-y-2">
                <label htmlFor="change-reason" className="block font-semibold text-sm text-[#3a2e1e]">{t('Reason for Reschedule', 'سبب تغيير الموعد')} *</label>
                <textarea id="change-reason" required rows={4} value={reason} onChange={e => { setReason(e.target.value); setError(''); }} placeholder={t('Please explain why you need to reschedule...', 'اكتب سبب طلب تغيير الموعد...')} className="w-full border rounded-xl px-3 py-2.5 text-sm text-[#333435] bg-[#f9f8f6] resize-none focus:outline-[#c4aa8b]" />
              </div>
            </div>}
          </div>
          {error && <p role="alert" className="text-sm text-red-700">{error === 'validation' ? t('Select a date, time range and enter a reason.', 'اختر التاريخ والفترة الزمنية واكتب السبب.') : t('Could not send request. Your choices are still here; try again.', 'تعذر إرسال الطلب. اختياراتك محفوظة؛ حاول مرة أخرى.')}</p>}
          <div className="shrink-0 flex items-center gap-3 border-t border-[#eeebe6] pt-3">
            {stage > 1 ? <Button type="button" variant="outline" onClick={() => { setError(''); setStage(stage - 1); }} className="min-h-11 px-4"><ChevronLeft className="h-4 w-4 rtl:rotate-180" />{t('Back', 'رجوع')}</Button> : <span className="flex-1" />}
            {stage < 3 ? <Button type="button" disabled={(stage === 1 && !date) || (stage === 2 && !range)} onClick={() => setStage(stage + 1)} className="flex-1 min-h-11 bg-[#3a2e1e] text-white">{t('Continue', 'متابعة')}</Button>
              : <Button type="button" disabled={saving || !reason.trim()} onClick={submit} className="flex-1 min-h-11 bg-[#3a2e1e] text-white"><Send className="h-4 w-4 mr-2" />{saving ? t('Sending…', 'جارٍ الإرسال…') : t('Submit Request', 'إرسال الطلب')}</Button>}
          </div>
        </>}
      </DialogContent>
    </Dialog>
  );
}
