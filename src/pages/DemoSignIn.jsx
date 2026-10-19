import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ChevronLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { beginStandaloneSession, standaloneOnboardingComplete } from '@/test-mode/previewClient';

/** A deliberately *simulated* sign-in. No credentials are accepted or sent. */
export default function DemoSignIn() {
  const navigate = useNavigate();
  const { checkAppState } = useAuth();
  const [busy, setBusy] = useState(false);
  const start = async () => {
    if (busy) return;
    setBusy(true);
    try {
      beginStandaloneSession();
      // User is a fictional persona, not a signed-in patient.
      await base44.auth.me();
      await checkAppState();
      navigate(standaloneOnboardingComplete() ? '/Dashboard' : '/Onboarding', { replace: true });
    } catch (error) {
      console.error('Offline demo could not start:', error);
      setBusy(false);
    }
  };
  return (
    <div className="min-h-screen px-5 py-10 flex flex-col justify-center" style={{background:'#eeebe6',paddingTop:'max(env(safe-area-inset-top),40px)',paddingBottom:'max(env(safe-area-inset-bottom),40px)'}}>
      <div className="max-w-md w-full mx-auto">
        <button type="button" onClick={()=>navigate('/Welcome')} className="mb-8 flex items-center gap-2 text-sm text-[#3a2e1e]" aria-label="Back to Welcome"><ChevronLeft size={18} /> Back</button>
        <div className="rounded-3xl p-8 shadow-sm bg-white border border-[#e1d7cb]">
          <div className="inline-flex h-14 w-14 rounded-2xl items-center justify-center mb-6" style={{background:'#3a2e1e'}}><ShieldCheck color="#c4aa8b" size={28}/></div>
          <div className="text-xs uppercase font-semibold tracking-widest text-[#9b8060]">BATO Clinic</div>
          <h1 className="text-3xl font-bold mt-2 mb-3 text-[#3a2e1e]">Explore the iOS app</h1>
          <p className="text-sm leading-relaxed text-[#7c8689] mb-6">For now, continue with a fictional demo profile. You can explore onboarding, navigation, dashboards and screens without Base44 or Node.js access.</p>
          <div role="note" className="p-4 rounded-xl mb-6 bg-[#f5f1ec] text-xs text-[#574c3c]">This is <strong>not real sign-in</strong>. No real patient account, appointment, purchase or message is created.</div>
          <button type="button" onClick={start} disabled={busy} className="w-full py-4 rounded-2xl font-semibold flex justify-center items-center gap-3 disabled:opacity-60" style={{background:'#3a2e1e',color:'#eeebe6'}}>
            {busy?'Preparing sample profile…':'Continue with demo data'} <ArrowRight size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}
