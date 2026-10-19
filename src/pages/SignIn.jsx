import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, ArrowRight } from 'lucide-react';
import { useLocation } from '@/components/LocationContext';
import { useAuth } from '@/lib/AuthContext';
import { startLocalSession } from '@/native/localAuth';

const codes = [{ value: '+965', label: '🇰🇼 Kuwait (+965)' }, { value: '+971', label: '🇦🇪 UAE (+971)' }, { value: '+966', label: '🇸🇦 Saudi Arabia (+966)' }];
export default function SignIn() {
  const navigate = useNavigate();
  const { isRTL, t } = useLocation();
  const { checkAppState } = useAuth();
  const [code, setCode] = useState('+965');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const digits = phone.replace(/\D/g, '');
  const valid = digits.length >= 7 && digits.length <= 12;
  const continueToPath = async (skip = false) => {
    if (busy) return;
    if (!skip && !valid) { setError(t('Enter a valid WhatsApp number.', 'أدخل رقم واتساب صحيحاً.')); return; }
    setBusy(true); setError('');
    try {
      // Temporary local identity only; no OTP or remote verification.
      const identity = skip ? `guest-${Date.now()}@local.invalid` : `phone-${code.replace(/\D/g, '')}${digits}@local.invalid`;
      startLocalSession({ email: identity, name: t('BATO Guest', 'ضيف باتو') });
      await checkAppState();
      navigate('/Onboarding', { replace: true });
    } catch (e) { setError(e?.message || t('Unable to continue.', 'تعذر المتابعة.')); }
    finally { setBusy(false); }
  };
  return <main dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen px-8 pt-10 pb-12" style={{ background: '#eeebe6', paddingTop: 'max(36px, env(safe-area-inset-top))' }}>
    <div className="max-w-md mx-auto">
      <div className="flex justify-center mb-5"><div className="w-14 h-14 rounded-2xl bg-[#e5e0da] flex items-center justify-center"><Phone size={26} /></div></div>
      <h1 className="text-center font-bold text-xl text-[#292929]">{t('Connect your BATO profile', 'اربط ملفك في باتو')}</h1>
      <p className="text-center text-sm text-[#626262] leading-6 mt-2 mb-7">{t('Add your WhatsApp number so we can connect your appointment, BATO Profile, and care journey.', 'أضف رقم واتساب لربط موعدك وملفك في باتو ورحلة العناية الخاصة بك.')}</p>
      <label className="block text-xs text-[#444] mb-1.5">{t('Country code', 'رمز الدولة')}</label>
      <select dir="ltr" value={code} onChange={e => setCode(e.target.value)} className="w-full h-12 border border-[#9b9995] bg-transparent rounded-xl px-3 mb-4">{codes.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}</select>
      <label className="block text-xs text-[#444] mb-1.5">{t('WhatsApp number', 'رقم واتساب')}</label>
      <input dir="ltr" type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={e => setPhone(e.target.value)} placeholder="e.g. 50 123 4567" className="w-full h-12 rounded-xl border border-[#9b9995] bg-transparent px-4 outline-none" />
      <p className="text-xs text-[#626262] mt-2">{t('Enter the number you use on WhatsApp — without the country code.', 'أدخل رقم واتساب بدون رمز الدولة.')}</p>
      {error && <p role="alert" className="text-red-700 text-sm mt-3">{error}</p>}
      <button type="button" onClick={() => continueToPath(false)} disabled={!valid || busy} className="w-full rounded-xl h-12 mt-7 bg-[#3a2e1e] text-white font-semibold flex justify-center items-center gap-3 disabled:opacity-35"><ArrowRight size={17}/>{t('Connect My Profile', 'ربط ملفي')}</button>
      <button type="button" onClick={() => continueToPath(true)} disabled={busy} className="block mx-auto mt-5 text-xs underline underline-offset-4 text-[#555]">{t("I don't have an appointment — skip this step", 'ليس لدي موعد — تخطي هذه الخطوة')}</button>
      <div className="rounded-2xl border border-[#e1dcd5] text-center text-xs text-[#555] leading-5 p-5 mt-9">🔒 {t('Your phone number is only used to connect your BATO appointment and profile. It is never shared.', 'يُستخدم رقمك فقط لربط موعدك وملفك في باتو ولا تتم مشاركته.')}</div>
    </div>
  </main>;
}
