/**
 * The ORIGINAL BATO onboarding art, layout and transitions, connected to patient APIs.
 * Do not replace these screens with generic backend-generated forms.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { explorerStart, explorerBookingUrl, explorerMessageUrl } from '@/lib/explorerStart';
import { readPatientAuth, getPatientProfile } from '@/native/patientApi';
import {
  getOnboardingQuestions, getOnboardingState, getOnboardingStep,
  saveOnboardingStep, completeOnboarding, uploadOnboardingFile, deleteOnboardingFile,
} from '@/native/onboardingApi';
import { UI_STEPS, indexForStep, stepQuestions, buildApiAnswers, uiProfileFromAnswers } from '@/native/onboardingOriginalAdapter';
import { useLocation as useLocationCtx } from '../LocationContext';
import OnboardingShell from './OnboardingShell';
import PathSelector from './PathSelector';
import ExplorerOnboarding from './ExplorerOnboarding';
import BookedOnboarding from './BookedOnboarding';
import MakeItYours from '@/components/appearance/MakeItYours';
import { base44 } from '@/api/base44Client';

async function markLocalCompletion(path) {
  // Standalone Capacitor navigation still relies on its local demo-account flag.
  // Keep it in sync ONLY after the authoritative patient API completes.
  const user = await base44.auth.me();
  if (!user?.email) throw new Error('Unable to update the local onboarding completion state.');
  const profiles = await base44.entities.BATOProfile.filter({ client_email: user.email });
  const fields = { completed: true, onboarding_path: path === 'booked' ? 'booked_client' : 'explorer' };
  if (profiles[0]) await base44.entities.BATOProfile.update(profiles[0].id, fields);
  else await base44.entities.BATOProfile.create({ client_email: user.email, ...fields });
}

const pathFromState = state => {
  const p = state?.onboarding?.path ?? state?.onboarding?.onboarding_path ?? state?.answers?.path;
  return p === 'booked_client' ? 'booked' : p === 'booked' || p === 'explorer' ? p : null;
};

export default function PatientOriginalOnboarding() {
  const navigate = useNavigate();
  const { t } = useLocationCtx();
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState('');
  const [path, setPath] = useState(null);
  const [profile, setProfile] = useState(null);
  const [patient, setPatient] = useState(null);
  const [appearanceData, setAppearanceData] = useState(null);
  const [questionnaire, setQuestionnaire] = useState(null);
  const serverRef = useRef(null);
  const stepRef = useRef(0);
  const pathRef = useRef(null);
  const profileRef = useRef(null);

  const setCurrentProfile = updated => {
    profileRef.current = updated;
    setProfile(updated);
    stepRef.current = updated.current_step;
  };

  const init = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      const [state, questions, record] = await Promise.all([
        getOnboardingState(), getOnboardingQuestions(), getPatientProfile().catch(() => readPatientAuth()?.patient ?? {}),
      ]);
      serverRef.current = state;
      setQuestionnaire(questions);
      setPatient(record);
      const redoRequested = new URLSearchParams(window.location.search).get('edit') === '1';
      if (state?.onboarding?.status === 'completed') {
        if (!redoRequested) {
          await markLocalCompletion(pathFromState(state));
          navigate('/Dashboard', { replace: true });
          return;
        }
        // A completed onboarding cannot be edited through PUT. When coming from
        // Home's “Edit your answers” action, show the ORIGINAL path selector.
        // Selecting a path will PUT /steps/path, which starts a fresh run while
        // keeping the previous completed onboarding in the patient's history.
        pathRef.current = null;
        setPath(null);
        setAppearanceData(null);
        setCurrentProfile({ ...uiProfileFromAnswers(null, record), current_step: 0, onboarding_path: null });
        return;
      }
      const serverPath = pathFromState(state);
      pathRef.current = serverPath;
      setPath(serverPath);
      const base = uiProfileFromAnswers(state, record);
      const step = serverPath ? (state.ready ? indexForStep(serverPath, null) : indexForStep(serverPath, state.next_step)) : 0;
      setCurrentProfile({ ...base, current_step: step, onboarding_path: serverPath === 'booked' ? 'booked_client' : serverPath });
    } catch (e) {
      setError(e?.message || 'Unable to load onboarding.');
    } finally {
      setBusy(false);
    }
  }, [navigate]);
  useEffect(() => { init(); }, [init]);

  const choosePath = async choice => {
    const backendPath = choice === 'booked_client' ? 'booked' : 'explorer';
    const state = await saveOnboardingStep('path', { path: backendPath });
    serverRef.current = state;
    pathRef.current = backendPath;
    setPath(backendPath);
    const newProfile = { ...uiProfileFromAnswers(state, patient), current_step: 1, onboarding_path: choice };
    setCurrentProfile(newProfile);
  };

  const saveUiStep = async updates => {
    const pathKey = pathRef.current;
    const previous = stepRef.current;
    const desired = Number(updates.current_step || previous);
    const nextProfile = { ...profileRef.current, ...updates };
    if (desired <= previous) {
      // Back navigation edits local answers. PUT is reserved for Continue, so
      // moving back never erases previously saved answers on the server.
      setCurrentProfile(nextProfile);
      return { current_step: desired };
    }

    const stepKey = UI_STEPS[pathKey]?.[previous];
    if (!stepKey) {
      // Original Explorer welcome is an illustrated intro, not an API step.
      setCurrentProfile(nextProfile);
      return { current_step: desired };
    }
    // The server supplies the currently applicable questions and exact option values.
    const data = await getOnboardingStep(stepKey);
    const questions = stepQuestions(data, questionnaire, stepKey);
    const payload = buildApiAnswers(stepKey, nextProfile, questions);
    const state = await saveOnboardingStep(stepKey, payload);
    serverRef.current = state;
    const nextStep = state.ready ? indexForStep(pathKey, null) : indexForStep(pathKey, state.next_step);
    // Do not permit the UI to advance past incomplete/conditional backend steps.
    if (nextStep === previous && !state.ready) throw new Error('Please complete the required information to continue.');
    setCurrentProfile({ ...nextProfile, current_step: nextStep });
    return { current_step: nextStep };
  };

  const prepareAppearance = async data => {
    if (!serverRef.current?.ready) {
      const latest = await getOnboardingState();
      serverRef.current = latest;
      if (!latest.ready) throw new Error('Your onboarding still has required steps to complete.');
    }
    setAppearanceData(data);
    window.scrollTo(0, 0);
  };

  const finishAppearance = async () => {
    await completeOnboarding();
    await markLocalCompletion(pathRef.current);
    const data = appearanceData;
    if (pathRef.current === 'booked') {
      navigate('/Dashboard');
      return;
    }
    const start = explorerStart({
      explorer_interests: data.interests,
      explorer_recommended_start: data.explorer_recommended_start,
    });
    const destination = data.next_step === 'book' && start
      ? explorerBookingUrl(start, data.branch)
      : data.next_step === 'ask' && start
        ? explorerMessageUrl(start)
        : '/Dashboard';
    navigate(destination);
  };

  const uploadFile = async (file, field, formData) => {
    const kind = field === 'uploaded_photos' ? 'photos' : 'health';
    const service = String(formData?.booked_service_type || '').toLowerCase();
    const all = Array.isArray(formData?.[field]) ? formData[field] : [];
    let slot = 'other';
    if (kind === 'photos') {
      const slots = service.includes('hair') ? ['front', 'top', 'left', 'right', 'crown'] :
        service.includes('skin') ? ['front_face', 'left', 'right', 'close_up'] : ['photo'];
      slot = slots.length === 1 ? 'photo' : slots.find(s => !all.some(f => f.slot === s));
      if (!slot) throw new Error('All photo angles are filled. Remove an earlier photo before uploading a replacement.');
    }
    const response = await uploadOnboardingFile(file, kind, slot);
    const item = response?.file ?? response;
    return { id: item?.id ?? item?.file_id, slot, name: file.name };
  };

  const removeFile = async id => {
    await deleteOnboardingFile(id);
  };

  if (busy) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#eeebe6' }}>
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#c4aa8b' }} />
    </div>
  );
  if (error || !profile) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6" style={{ background: '#eeebe6' }}>
      <p role="alert" className="text-sm text-red-700 text-center">{error || t('Unable to load onboarding', 'تعذر تحميل التسجيل')}</p>
      <button className="rounded-xl px-5 py-3 text-white" style={{ background: '#3a2e1e' }} onClick={init}>
        {t('Try again', 'حاول مرة أخرى')}
      </button>
    </div>
  );

  if (!path) return (
    <OnboardingShell step={0} totalSteps={0} showProgress={false}>
      <PathSelector onSelect={choosePath} />
    </OnboardingShell>
  );

  if (appearanceData) {
    const interest = appearanceData.booked_service_type || appearanceData.explorer_recommended_start ||
      appearanceData.interests?.[0] || profile.explorer_interests?.[0] || '';
    const journey = /hair/i.test(interest) ? 'hair' : /skin/i.test(interest) ? 'skin' :
      /laser/i.test(interest) ? 'laser' : /health|iv|wellness/i.test(interest) ? 'health' : 'aesthetic';
    return <MakeItYours journey={journey} onBack={() => setAppearanceData(null)} onComplete={finishAppearance} />;
  }

  const user = { ...readPatientAuth()?.patient, ...patient };
  const common = { user, profile, onSave: saveUiStep, onComplete: prepareAppearance, apiMode: true };
  return path === 'booked'
    ? <BookedOnboarding key="booked-original" {...common} onApiUpload={uploadFile} onApiRemove={removeFile} />
    : <ExplorerOnboarding key="explorer-original" {...common} />;
}
