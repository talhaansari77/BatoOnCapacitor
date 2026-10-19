import React from 'react';
import { AlertCircle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from './LocationContext';
export default function CustomerLoadState({ error = false, onRetry }) {
 const { t, isRTL } = useLocation();
 const Icon = error ? AlertCircle : LoaderCircle;
 return <div className="max-w-lg mx-auto p-4" dir={isRTL ? 'rtl' : 'ltr'}>
  <section role={error ? 'alert' : 'status'} aria-live={error ? 'assertive' : 'polite'} className="bato-style-surface rounded-2xl border p-6 space-y-4">
   <Icon aria-hidden="true" className="w-7 h-7" />
   <div className="space-y-2">
    <h1 className="text-xl font-semibold">{error ? t('This page couldn’t load', 'تعذر تحميل هذه الصفحة') : t('Loading your information…', 'جارٍ تحميل معلوماتك…')}</h1>
    {error && <p className="text-sm text-[#7c8689] leading-relaxed">{t('Please try again to reconnect.', 'حاول مرة أخرى لإعادة الاتصال.')}</p>}
   </div>
   {error && <Button onClick={onRetry || (() => window.location.reload())}>{t('Try again', 'حاول مرة أخرى')}</Button>}
  </section>
 </div>;
}
