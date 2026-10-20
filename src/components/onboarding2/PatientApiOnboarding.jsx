import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import OnboardingShell from './OnboardingShell';
import PathSelector from './PathSelector';
import { useLocation as useLocationCtx } from '../LocationContext';
import {
  getOnboardingQuestions, getOnboardingState, getOnboardingStep, saveOnboardingStep,
  completeOnboarding, uploadOnboardingFile, deleteOnboardingFile,
} from '@/native/onboardingApi';

const isObject = val => !!val && typeof val === 'object' && !Array.isArray(val);
const list = val => Array.isArray(val) ? val : [];
const label = (value, fallback = '') => typeof value === 'string' ? value : (value?.en || value?.label || fallback);
const humanize = value => String(value || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
const getKey = q => q.key || q.question_key || q.name || q.id;
const getOptions = q => list(q.options || q.choices).map(o => typeof o === 'string' ? { value: o, label: humanize(o) } : o);

// The backend decides which steps and conditional questions are applicable.
function questionsForStep(questionnaire, stepPayload, stepKey) {
  const resolved = stepPayload?.step;
  if (Array.isArray(resolved?.questions)) return resolved.questions;
  if (Array.isArray(stepPayload?.questions)) return stepPayload.questions;
  const collection = questionnaire?.steps || questionnaire?.data?.steps || questionnaire;
  const entry = Array.isArray(collection)
    ? collection.find(s => (s.key || s.step || s.id) === stepKey)
    : collection?.[stepKey];
  return list(entry?.questions);
}

function Field({ question, value, onChange, t }) {
  const key = getKey(question);
  const title = label(question.label || question.title || question.question, humanize(key));
  const type = question.type || question.input_type || 'text';
  const options = getOptions(question);
  const exclusive = list(question.exclusive);
  const isMulti = type === 'multi' || type === 'multiple';
  const choose = option => {
    if (isMulti) {
      const existing = list(value);
      if (existing.includes(option)) return onChange(existing.filter(x => x !== option));
      onChange(exclusive.includes(option) ? [option] : [...existing.filter(x => !exclusive.includes(x)), option]);
    } else onChange(option);
  };
  return (
    <div className="bg-white rounded-2xl border p-5 space-y-3" style={{ borderColor: 'rgba(196,170,139,0.25)' }}>
      <p className="font-semibold text-[#333435]">{title}{question.required ? ' *' : ''}</p>
      {question.description && <p className="text-xs text-[#7c8689]">{label(question.description)}</p>}
      {(options.length > 0 || ['single','multi','multiple','yes_no','consent'].includes(type)) ? (
        <div className="space-y-2">
          {(type === 'yes_no' ? [{ value: true, label: 'Yes' }, { value: false, label: 'No' }] : type === 'consent' ? [{ value: true, label: title }] : options).map((option, index) => {
            const chosen = isMulti ? list(value).includes(option.value) : value === option.value;
            return <button key={`${String(option.value)}-${index}`} type="button" onClick={() => choose(option.value)}
              aria-pressed={chosen} className="w-full text-start rounded-xl border px-4 py-3 text-sm transition-colors"
              style={{ borderColor: chosen ? '#3a2e1e' : 'rgba(196,170,139,0.28)', background: chosen ? '#f5efe7' : 'white', color: '#333435' }}>
              <span className="me-2">{isMulti ? chosen ? '☑' : '☐' : chosen ? '◉' : '○'}</span>{label(option.label, humanize(option.value))}
            </button>;
          })}
        </div>
      ) : type === 'appointment' || type === 'appointment_id' ? (
        <input type="number" inputMode="numeric" value={value ?? ''} onChange={e => onChange(e.target.value ? Number(e.target.value) : null)}
          className="w-full rounded-xl border p-3 text-sm" placeholder={t('Appointment number (optional)','رقم الموعد (اختياري)')} />
      ) : type === 'text' && (question.multiline || key === 'desired_result' || question.max_length > 250) ? (
        <textarea rows={3} maxLength={2000} value={value ?? ''} onChange={e => onChange(e.target.value)} className="w-full rounded-xl border p-3 text-sm" />
      ) : (
        <input type={type === 'phone' ? 'tel' : 'text'} maxLength={type === 'phone' ? 16 : 2000} value={value ?? ''}
          onChange={e => onChange(e.target.value)} className="w-full rounded-xl border p-3 text-sm" />
      )}
    </div>
  );
}

export default function PatientApiOnboarding() {
  const navigate = useNavigate();
  const { t } = useLocationCtx();
  const [questionnaire, setQuestionnaire] = useState(null);
  const [state, setState] = useState(null);
  const [stepData, setStepData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [busy, setBusy] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);

  const refresh = useCallback(async () => {
    setBusy(true); setError('');
    try {
      const [q, current] = await Promise.all([getOnboardingQuestions(), getOnboardingState()]);
      setQuestionnaire(q); setState(current);
      const next = current.next_step;
      if (next && next !== 'path') {
        const details = await getOnboardingStep(next);
        setStepData(details);
        setAnswers(isObject(details.answers) ? details.answers : {});
      } else { setStepData(null); setAnswers({}); }
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const stepKey = state?.next_step || 'path';
  const questions = useMemo(() => questionsForStep(questionnaire, stepData, stepKey), [questionnaire, stepData, stepKey]);
  const steps = list(state?.steps);
  const position = Math.max(1, steps.findIndex(s => (s.key || s.step || s.id || s) === stepKey) + 1);

  const moveTo = async (current, previous) => {
    setState(current);
    const next = current?.next_step;
    if (!next || next === 'path') { setStepData(null); setAnswers({}); return; }
    const details = await getOnboardingStep(next);
    setStepData(details);
    setAnswers(isObject(details.answers) ? details.answers : {});
    if (previous && previous !== next) setHistory(old => [...old, previous]);
    window.scrollTo(0, 0);
  };
  const saveStep = async (key, values) => {
    setSaving(true); setError('');
    try {
      // Include every value in the step: PUT replaces all earlier answers for it.
      const next = await saveOnboardingStep(key, values);
      await moveTo(next, key);
    } catch (e) { setError(e.message); }
    finally { setSaving(false); }
  };
  const back = async () => {
    const prev = history.at(-1);
    if (!prev) return;
    setSaving(true); setError('');
    try {
      const details = await getOnboardingStep(prev);
      setStepData(details); setAnswers(isObject(details.answers) ? details.answers : {});
      setState(old => ({ ...old, next_step: prev })); setHistory(old => old.slice(0, -1));
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const finish = async () => {
    setSaving(true); setError('');
    try {
      await completeOnboarding();
      // Retain the existing standalone navigation guard/fixture lifecycle.
      const me = await base44.auth.me();
      const profiles = await base44.entities.BATOProfile.filter({ client_email: me.email });
      if (profiles[0]) await base44.entities.BATOProfile.update(profiles[0].id, { completed: true });
      else await base44.entities.BATOProfile.create({ client_email: me.email, completed: true, onboarding_path: 'explorer' });
      navigate('/Dashboard');
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  };
  const changeFile = async (event, slot) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { setError('Maximum file size is 10 MB.'); return; }
    setSaving(true); setError('');
    try { await uploadOnboardingFile(file, stepKey, slot); await moveTo(await getOnboardingState()); }
    catch (e) { setError(e.message); } finally { setSaving(false); event.target.value = ''; }
  };
  const files = list(stepData?.files);
  const slots = stepKey === 'health' ? ['lab_results','previous_records','prescription','other'] :
    stepKey === 'photos' ? ((String(state?.onboarding?.category || '').includes('hair')) ? ['front','top','left','right','crown'] :
      (String(state?.onboarding?.category || '').includes('skin')) ? ['front_face','left','right','close_up'] : ['photo']) : [];

  if (busy) return <div className="min-h-screen grid place-items-center bg-[#eeebe6]"><Loader2 className="animate-spin text-[#c4aa8b]" /></div>;
  if (!state) return <div className="min-h-screen bg-[#eeebe6] p-6 flex flex-col justify-center gap-4"><p role="alert" className="text-red-700">{error || 'Unable to load onboarding.'}</p><button className="rounded-xl bg-[#3a2e1e] text-white p-3" onClick={refresh}>{t('Try again', 'حاول مرة أخرى')}</button></div>;
  const stepTitle = label(stepData?.step?.label || stepData?.step?.title, humanize(stepKey));
  return <OnboardingShell step={position} totalSteps={steps.length || 1} onBack={history.length ? back : undefined} showBack={history.length > 0}>
    {stepKey === 'path' && !state?.ready ? <PathSelector onSelect={path => saveStep('path', { path: path === 'booked_client' ? 'booked' : path })} /> : (
      <div className="space-y-5">
        <h1 className="text-2xl font-bold text-[#333435]">{state?.ready ? t('You’re ready!', 'أنت جاهز!') : stepTitle}</h1>
        {state?.ready ? <p className="text-sm text-[#7c8689]">{t('Your answers are ready to submit.', 'إجاباتك جاهزة للإرسال.')}</p> : null}
        {!state?.ready && questions.map(q => <Field key={getKey(q)} question={q} value={answers[getKey(q)]}
          onChange={v => setAnswers(old => ({ ...old, [getKey(q)]: v }))} t={t} />)}
        {!state?.ready && slots.map(slot => <div key={slot} className="bg-white rounded-2xl border p-4 space-y-2">
          <p className="text-sm font-medium text-[#333435]">{humanize(slot)}</p>
          <label className="flex items-center gap-2 cursor-pointer text-sm text-[#3a2e1e]"><Upload size={16} />{t('Choose file', 'اختر ملفاً')}
            <input className="sr-only" type="file" accept={stepKey === 'photos' ? 'image/jpeg,image/png' : 'application/pdf,image/jpeg,image/png'}
              onChange={e => changeFile(e, slot)} disabled={saving} /></label>
          {files.filter(f => f.slot === slot).map(f => <div key={f.id} className="flex justify-between text-xs text-[#7c8689]">
            <span>{f.filename || f.original_name || `File ${f.id}`}</span><button disabled={saving} aria-label="Delete file" onClick={async () => {setSaving(true);try {await deleteOnboardingFile(f.id);await moveTo(await getOnboardingState());}catch(e){setError(e.message);}finally{setSaving(false);}}}><Trash2 size={15}/></button>
          </div>)}
        </div>)}
        {error && <p role="alert" className="text-sm whitespace-pre-line text-red-700">{error}</p>}
        <button disabled={saving} className="w-full rounded-xl py-3.5 font-semibold text-white disabled:opacity-50" style={{ background: '#3a2e1e' }}
          onClick={() => state?.ready ? finish() : saveStep(stepKey, answers)}>
          {saving ? t('Saving…','جارٍ الحفظ…') : state?.ready ? t('Complete onboarding','إنهاء التسجيل') : t('Continue','متابعة')}
        </button>
      </div>
    )}
    {error && stepKey === 'path' && <p role="alert" className="text-sm text-red-700 mt-4">{error}</p>}
    {stepKey === 'path' && saving && <p className="text-center text-sm">{t('Saving…', 'جارٍ الحفظ…')}</p>}
    {error && <button className="text-sm underline text-[#3a2e1e] mt-3" onClick={refresh}>{t('Retry loading', 'إعادة المحاولة')}</button>}
  </OnboardingShell>;
}
