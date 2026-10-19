import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { standaloneOnboardingComplete } from '@/test-mode/previewClient';
import { startLocalSession } from '@/native/localAuth';

/** Native UI-first sign-in screen. The real auth service is intentionally not wired yet. */
export default function SignIn() {
  const navigate = useNavigate();
  const { checkAppState } = useAuth();
  const isRTL = window.localStorage.getItem('bato_language') !== 'en';
  const t = (english, arabic) => isRTL ? arabic : english;
  const [mode, setMode] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isSignUp = mode === 'register';
  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const ContinueIcon = isRTL ? ArrowLeft : ArrowRight;

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    if (password.length < 6) {
      setError(t('Enter at least 6 characters.', 'أدخل ٦ أحرف على الأقل.'));
      return;
    }
    setBusy(true);
    try {
      // UI flow only. Password is never sent, saved or checked against an account.
      startLocalSession({ email, name: isSignUp ? name : '' });
      setPassword('');
      await checkAppState();
      navigate(standaloneOnboardingComplete() ? '/Dashboard' : '/Onboarding', { replace: true });
    } catch (cause) {
      setError(cause?.message || t('Unable to continue.', 'تعذّر المتابعة.'));
    } finally {
      setBusy(false);
    }
  };

  const changeMode = (next) => {
    setMode(next);
    setError('');
    setPassword('');
  };

  return (
    <main
      dir={isRTL ? 'rtl' : 'ltr'}
      className="min-h-screen flex flex-col justify-center px-5 py-9"
      style={{ background: '#eeebe6', paddingTop: 'max(28px, env(safe-area-inset-top))', paddingBottom: 'max(28px, env(safe-area-inset-bottom))' }}
    >
      <div className="w-full max-w-md mx-auto">
        <button type="button" onClick={() => navigate('/Welcome')} className="inline-flex items-center gap-2 mb-7 text-sm font-medium text-[#3a2e1e] min-h-11">
          <BackIcon size={18} />{t('Back', 'رجوع')}
        </button>
        <div className="text-center mb-7">
          <div className="mx-auto mb-4 w-16 h-16 rounded-3xl flex items-center justify-center" style={{ background: '#3a2e1e' }}>
            <span aria-hidden="true" className="text-[#c4aa8b] font-semibold text-2xl tracking-wide">B</span>
          </div>
          <p className="uppercase font-semibold text-xs tracking-[0.3em] text-[#9b8060] mb-2">BATO CLINIC</p>
          <h1 className="text-3xl font-bold text-[#3a2e1e]">{isSignUp ? t('Create your account', 'إنشاء حساب') : t('Welcome back', 'مرحباً بعودتك')}</h1>
          <p className="mt-2 text-sm text-[#7c8689]">
            {isSignUp ? t('Start your care journey with BATO.', 'ابدأ رحلتك مع باتو.') : t('Sign in to continue your care journey.', 'سجل الدخول لمتابعة رحلتك.')}
          </p>
        </div>

        <section className="rounded-3xl border border-[#e4dbcf] bg-white p-6 shadow-sm">
          <div className="flex items-center rounded-2xl bg-[#f3efea] p-1 mb-6" role="group" aria-label={t('Account options', 'خيارات الحساب')}>
            <button type="button" onClick={() => changeMode('sign-in')} aria-pressed={!isSignUp}
              className={`flex-1 py-3 px-3 rounded-xl text-sm font-semibold transition-colors ${!isSignUp ? 'bg-[#3a2e1e] text-white shadow-sm' : 'text-[#766b5d]'}`}>
              {t('Sign in', 'تسجيل الدخول')}
            </button>
            <button type="button" onClick={() => changeMode('register')} aria-pressed={isSignUp}
              className={`flex-1 py-3 px-3 rounded-xl text-sm font-semibold transition-colors ${isSignUp ? 'bg-[#3a2e1e] text-white shadow-sm' : 'text-[#766b5d]'}`}>
              {t('Create account', 'إنشاء حساب')}
            </button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {isSignUp && (
              <label className="block text-sm font-medium text-[#3a2e1e]">
                {t('Full name', 'الاسم الكامل')}
                <div className="relative mt-2">
                  <UserRound size={18} className={`absolute top-1/2 -translate-y-1/2 text-[#978978] ${isRTL ? 'right-3' : 'left-3'}`} />
                  <input className={`w-full h-12 rounded-xl border border-[#e4dbcf] bg-white outline-none focus:ring-2 focus:ring-[#c4aa8b] ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'}`}
                    value={name} onChange={e => setName(e.target.value)} maxLength={80} required autoComplete="off" placeholder={t('Your name', 'اسمك')} />
                </div>
              </label>
            )}
            <label className="block text-sm font-medium text-[#3a2e1e]">
              {t('Email address', 'البريد الإلكتروني')}
              <div className="relative mt-2">
                <Mail size={18} className={`absolute top-1/2 -translate-y-1/2 text-[#978978] ${isRTL ? 'right-3' : 'left-3'}`} />
                <input type="email" inputMode="email" dir="ltr" required value={email} onChange={e => setEmail(e.target.value)} autoCapitalize="none" autoComplete="off"
                  placeholder="name@example.com" className={`w-full h-12 rounded-xl border border-[#e4dbcf] bg-white outline-none focus:ring-2 focus:ring-[#c4aa8b] ${isRTL ? 'pr-10 pl-3' : 'pl-10 pr-3'}`} />
              </div>
            </label>
            <label className="block text-sm font-medium text-[#3a2e1e]">
              {t('Password', 'كلمة المرور')}
              <div className="relative mt-2">
                <LockKeyhole size={18} className={`absolute top-1/2 -translate-y-1/2 text-[#978978] ${isRTL ? 'right-3' : 'left-3'}`} />
                <input type={showPassword ? 'text' : 'password'} dir="ltr" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} autoComplete="off"
                  placeholder={t('At least 6 characters', '٦ أحرف على الأقل')}
                  className={`w-full h-12 rounded-xl border border-[#e4dbcf] bg-white outline-none focus:ring-2 focus:ring-[#c4aa8b] ${isRTL ? 'pr-10 pl-12' : 'pl-10 pr-12'}`} />
                <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? t('Hide password','إخفاء كلمة المرور') : t('Show password','إظهار كلمة المرور')}
                  className={`absolute top-1/2 -translate-y-1/2 text-[#766b5d] min-w-10 min-h-10 flex items-center justify-center ${isRTL ? 'left-1' : 'right-1'}`}>
                  {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                </button>
              </div>
            </label>
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={busy} className="w-full h-13 min-h-12 py-3 rounded-2xl font-semibold text-white flex items-center justify-center gap-3 mt-2 disabled:opacity-60" style={{ background: '#3a2e1e' }}>
              {busy ? t('Continuing…', 'جارٍ المتابعة…') : (isSignUp ? t('Create account', 'إنشاء الحساب') : t('Sign in', 'تسجيل الدخول'))}
              <ContinueIcon size={18}/>
            </button>
          </form>
        </section>
        <p className="text-center text-xs leading-relaxed text-[#766b5d] mt-5 px-3">
          {t('Local UI testing only. Use a test password; credentials are not verified or transmitted. Do not enter real patient details.',
            'لاختبار الواجهة محلياً فقط. استخدم كلمة مرور تجريبية؛ لن يتم التحقق منها أو إرسالها. لا تدخل بيانات مرضى حقيقية.')}
        </p>
      </div>
    </main>
  );
}
