import { useBatoText } from "@/lib/batoText";
import React, { useState, useRef } from "react";
import { motion } from "@/components/motion/BatoMotion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { validateUpload } from "@/lib/uploads";
import {
  ScreenTitle, ChoiceCard, Chip, YesNoToggle,
  TextareaField, CTAButton, PrivacyNote, SectionDivider,
  ReflectionCard, MicrocopyHint, SavedProgressNote
} from "./OnboardingUI";
import OnboardingShell from "./OnboardingShell";
import { CheckCircle2, AlertCircle, Upload, X, Loader2, FileText as FileIcon } from "lucide-react";
import { useLocation as useLocationCtx } from "../LocationContext";
import {
  BookedIllustration, ProfileBuildIllustration, CategoryIllustration,
  UploadIllustration, HealthSafetyIllustration, GoalsIllustration,
  BeforeVisitIllustration, CompletionIllustration
} from "./OnboardingIllustrations";

// Steps: 1=Welcome, 2=MainConcern, 3=VisitDetails, 4=PreviousTx, 5=Goal, 6=Fear, 7=Health, 8=Photos, 9=Consent, 10=Complete
const TOTAL_STEPS = 10;

const STEP_LABELS_EN = [
  "Welcome", "Your concern", "Your visit", "Your history",
  "Your goal", "Your worry", "Your health", "Your photo", "Confirm", "You're ready",
];
const STEP_LABELS_AR = [
  "مرحباً", "ما يقلقك", "زيارتك", "تاريخك الصحي",
  "هدفك", "مخاوفك", "صحتك", "صورك", "تأكيد", "أنت جاهز",
];

const CONCERNS_MAP = {
  hair: ["Hair loss / thinning", "Receding hairline", "Bald patches", "Overall density loss", "Scalp health", "Other"],
  skin: ["Acne / breakouts", "Uneven skin tone", "Fine lines / ageing", "Texture / pores", "Pigmentation", "Other"],
  laser: ["Unwanted hair", "Full body laser", "Specific area", "Tattoo removal", "Not sure"],
  injectables: ["Facial refinement", "Injectables / Botox", "Filler", "Skin booster", "Not sure"],
  health: ["Fatigue / low energy", "Lab review", "Hormone check", "Iron / ferritin", "Not sure"],
  general: ["Hair loss / thinning", "Scalp concern", "Skin concern", "Pigmentation", "Acne / breakouts", "Laser / unwanted hair", "Injectables / facial refinement", "Fatigue / low energy", "Lab review", "Not sure", "Other"]
};

const PREVIOUS_TX = ["PRP", "Medications", "Topical products", "Hair transplant", "Laser", "Nothing yet", "Other"];
const PREV_RESULTS = ["It worked well", "Temporary result", "No result", "Had a bad reaction", "Not sure"];
const WORRIES = [
  "I'm worried it won't work",
  "I'm worried about the cost",
  "I've been disappointed before",
  "I'm not sure what is right for me",
  "I'm nervous about the procedure itself",
  "Something else",
];
const DEFICIENCIES = ["Iron / ferritin", "Vitamin D", "Hormones", "Thyroid", "Liver", "Kidney", "Autoimmune condition"];

const SERVICE_TYPES = [
  "Hair Consultation", "Hair Treatment / Hair Program",
  "Skin Consultation", "Skin Treatment",
  "Laser Session", "Injectables",
  "Drips / IV Therapy", "Panels / Lab Tests",
  "General Medical Consultation", "Not sure"
];

function getServiceCategory(service) {
  if (!service) return "general";
  const s = service.toLowerCase();
  if (s.includes("hair")) return "hair";
  if (s.includes("skin")) return "skin";
  if (s.includes("laser")) return "laser";
  if (s.includes("inject")) return "injectables";
  if (s.includes("drip") || s.includes("iv") || s.includes("panel") || s.includes("lab")) return "health";
  return "general";
}

function getConcernsList(service) {
  const cat = getServiceCategory(service);
  return CONCERNS_MAP[cat] || CONCERNS_MAP.general;
}

function getBeforeVisitInstructions(service) {
  const s = (service || "").toLowerCase();
  const base = [
    "Arrive 10 minutes early",
    "Bring previous lab results or treatment records if available",
    "Prepare any questions you want to ask",
    "Follow any instructions sent by the BATO team"
  ];
  if (s.includes("hair")) return [...base, "Avoid heavy styling products", "Upload front, top, sides, and crown photos if possible"];
  if (s.includes("skin")) return [...base, "Note your current skincare products", "Tell the team if you use retinoids or strong actives"];
  if (s.includes("laser")) return [...base, "Avoid tanning or strong sun exposure", "Do not wax the area (shave instead)"];
  if (s.includes("inject")) return [...base, "Tell the doctor about previous treatments", "Mention any blood thinners or bruising tendency"];
  if (s.includes("drip") || s.includes("panel") || s.includes("lab")) return [...base, "Bring or upload previous lab results", "Mention allergies, medications, and supplements"];
  return base;
}

// ─── Visit-specific question sets ────────────────────────────────────────────

function HairQuestions({ data, onChange }) {
  const tr = useBatoText();
  const durations = ["Less than 3 months", "3–6 months", "6–12 months", "1–2 years", "Over 2 years", "Not sure"];
  const areas = ["Hairline", "Crown", "Temples", "Full scalp", "Patches", "Not sure"];
  const shedding = ["No", "Mild", "Moderate", "Heavy", "Not sure"];
  const scalp = ["Itching", "Oiliness", "Dryness", "Dandruff", "Irritation", "Sensitivity", "None"];
  const toggle = (field, val) => {
    const curr = data[field] || [];
    onChange({ ...data, [field]: curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val] });
  };
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[#333435] mb-2">{tr("When did the issue start?")}</p>
        <div className="flex flex-wrap gap-2">{tr(durations.map(d => <Chip key={d} label={d} selected={data.duration === d} onClick={() => onChange({ ...data, duration: d })} />))}</div>
      </div>
      <YesNoToggle label={tr("Is it getting worse?")} value={data.getting_worse} onChange={v => onChange({ ...data, getting_worse: v })} />
      <div>
        <p className="text-sm font-medium text-[#333435] mb-2">{tr("Where do you notice it most?")}</p>
        <div className="flex flex-wrap gap-2">{tr(areas.map(a => <Chip key={a} label={a} selected={(data.areas || []).includes(a)} onClick={() => toggle("areas", a)} />))}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-[#333435] mb-2">{tr("Shedding?")}</p>
        <div className="flex flex-wrap gap-2">{tr(shedding.map(s => <Chip key={s} label={s} selected={data.shedding === s} onClick={() => onChange({ ...data, shedding: s })} />))}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-[#333435] mb-2">{tr("Scalp symptoms?")}</p>
        <div className="flex flex-wrap gap-2">{tr(scalp.map(s => <Chip key={s} label={s} selected={(data.scalp_symptoms || []).includes(s)} onClick={() => toggle("scalp_symptoms", s)} />))}</div>
      </div>
      <YesNoToggle label={tr("Family history of hair loss?")} value={data.family_history} onChange={v => onChange({ ...data, family_history: v })} />
    </div>
  );
}

function SkinQuestions({ data, onChange }) {
  const tr = useBatoText();
  const concerns = ["Acne", "Pigmentation", "Dullness", "Texture", "Pores", "Dryness", "Sensitivity", "Wrinkles", "Laxity", "Scars", "Other"];
  const durations = ["Less than 3 months", "3–6 months", "6–12 months", "Over a year", "Not sure"];
  const toggle = (field, val) => {
    const curr = data[field] || [];
    onChange({ ...data, [field]: curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val] });
  };
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[#333435] mb-2">{tr("Main skin concerns?")}</p>
        <div className="flex flex-wrap gap-2">{tr(concerns.map(c => <Chip key={c} label={c} selected={(data.skin_concerns || []).includes(c)} onClick={() => toggle("skin_concerns", c)} />))}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-[#333435] mb-2">{tr("How long has this been bothering you?")}</p>
        <div className="flex flex-wrap gap-2">{tr(durations.map(d => <Chip key={d} label={d} selected={data.duration === d} onClick={() => onChange({ ...data, duration: d })} />))}</div>
      </div>
      <YesNoToggle label={tr("Is your skin sensitive?")} value={data.is_sensitive} onChange={v => onChange({ ...data, is_sensitive: v })} />
      <TextareaField label={tr("Current skincare products or active ingredients?")} placeholder={tr("e.g. retinol, vitamin C, acids...")} value={data.current_products} onChange={v => onChange({ ...data, current_products: v })} />
      <YesNoToggle label={tr("Any bad reactions to previous treatments?")} value={data.bad_reaction} onChange={v => onChange({ ...data, bad_reaction: v })} />
    </div>
  );
}

function LaserQuestions({ data, onChange }) {
  const tr = useBatoText();
  const areas = ["Full body", "Face", "Underarms", "Bikini", "Legs", "Arms", "Back", "Specific area", "Not sure"];
  const toggle = (field, val) => {
    const curr = data[field] || [];
    onChange({ ...data, [field]: curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val] });
  };
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[#333435] mb-2">{tr("Which area are you treating?")}</p>
        <div className="flex flex-wrap gap-2">{tr(areas.map(a => <Chip key={a} label={a} selected={(data.areas || []).includes(a)} onClick={() => toggle("areas", a)} />))}</div>
      </div>
      <YesNoToggle label={tr("Done laser before?")} value={data.done_before} onChange={v => onChange({ ...data, done_before: v })} />
      <YesNoToggle label={tr("Any previous reaction to laser?")} value={data.previous_reaction} onChange={v => onChange({ ...data, previous_reaction: v })} />
      <YesNoToggle label={tr("Recent tanning or strong sun exposure?")} value={data.recent_tanning} onChange={v => onChange({ ...data, recent_tanning: v })} />
      <YesNoToggle label={tr("Pregnant or breastfeeding?")} value={data.pregnant} onChange={v => onChange({ ...data, pregnant: v })} />
    </div>
  );
}

function InjectableQuestions({ data, onChange }) {
  const tr = useBatoText();
  const txTypes = ["Botox", "Filler", "Skin booster", "Profhilo", "Salmon DNA", "Mesotherapy", "Filler dissolving", "Not sure"];
  const areas = ["Forehead", "Eyes / crow's feet", "Lips", "Cheeks", "Jawline", "Neck", "Underarms", "Other"];
  const toggle = (field, val) => {
    const curr = data[field] || [];
    onChange({ ...data, [field]: curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val] });
  };
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[#333435] mb-2">{tr("What treatment are you coming for?")}</p>
        <div className="flex flex-wrap gap-2">{tr(txTypes.map(t => <Chip key={t} label={t} selected={data.injectable_type === t} onClick={() => onChange({ ...data, injectable_type: t })} />))}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-[#333435] mb-2">{tr("Which area?")}</p>
        <div className="flex flex-wrap gap-2">{tr(areas.map(a => <Chip key={a} label={a} selected={(data.areas || []).includes(a)} onClick={() => toggle("areas", a)} />))}</div>
      </div>
      <YesNoToggle label={tr("Done this treatment before?")} value={data.done_before} onChange={v => onChange({ ...data, done_before: v })} />
      <YesNoToggle label={tr("Any previous bad reaction or experience?")} value={data.bad_reaction} onChange={v => onChange({ ...data, bad_reaction: v })} />
      <YesNoToggle label={tr("Taking blood thinners or bruising medication?")} value={data.blood_thinners} onChange={v => onChange({ ...data, blood_thinners: v })} />
      <YesNoToggle label={tr("Pregnant or breastfeeding?")} value={data.pregnant} onChange={v => onChange({ ...data, pregnant: v })} />
    </div>
  );
}

function DripQuestions({ data, onChange }) {
  const tr = useBatoText();
  const types = ["Iron drip", "Glutathione drip", "Hydration", "Recovery", "Energy", "Doctor-selected drip", "Not sure"];
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[#333435] mb-2">{tr("What are you coming for?")}</p>
        <div className="flex flex-wrap gap-2">{tr(types.map(t => <Chip key={t} label={t} selected={data.drip_type === t} onClick={() => onChange({ ...data, drip_type: t })} />))}</div>
      </div>
      <YesNoToggle label={tr("Done IV therapy before?")} value={data.done_before} onChange={v => onChange({ ...data, done_before: v })} />
      <YesNoToggle label={tr("Any previous reaction?")} value={data.previous_reaction} onChange={v => onChange({ ...data, previous_reaction: v })} />
      <YesNoToggle label={tr("Pregnant or breastfeeding?")} value={data.pregnant} onChange={v => onChange({ ...data, pregnant: v })} />
    </div>
  );
}

function PanelQuestions({ data, onChange }) {
  const tr = useBatoText();
  const panels = ["Hormones", "Iron / ferritin", "Vitamin D", "Vitamins / minerals", "Liver", "Kidney", "Inflammation", "Urine test", "Not sure"];
  const toggle = (val) => {
    const curr = data.panels || [];
    onChange({ ...data, panels: curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val] });
  };
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm font-medium text-[#333435] mb-2">{tr("What are you checking?")}</p>
        <div className="flex flex-wrap gap-2">{tr(panels.map(p => <Chip key={p} label={p} selected={(data.panels || []).includes(p)} onClick={() => toggle(p)} />))}</div>
      </div>
      <YesNoToggle label={tr("Reviewing symptoms or monitoring an existing issue?")} value={data.monitoring} onChange={v => onChange({ ...data, monitoring: v })} />
      <YesNoToggle label={tr("Currently taking medications or supplements?")} value={data.on_medication} onChange={v => onChange({ ...data, on_medication: v })} />
    </div>
  );
}

function VisitSpecificQuestions({ service, data, onChange }) {
  const tr = useBatoText();
  const cat = getServiceCategory(service);
  const props = { data, onChange };
  const titles = {
    hair: "Tell us about your hair",
    skin: "Tell us about your skin",
    laser: "Tell us about your laser visit",
    injectables: "Tell us about your injectable treatment",
    health: "Tell us about your drip or lab visit",
    general: "Tell us what your specialist should know"
  };
  return (
    <div>
      <ScreenTitle title={titles[cat] || "Tell us about your visit"} subtitle={tr("Your answers help your team prepare before you arrive.")} />
      {tr(cat === "hair" && <HairQuestions {...props} />)}
      {tr(cat === "skin" && <SkinQuestions {...props} />)}
      {tr(cat === "laser" && <LaserQuestions {...props} />)}
      {tr(cat === "injectables" && <InjectableQuestions {...props} />)}
      {tr(cat === "health" && (service?.toLowerCase().includes("panel") || service?.toLowerCase().includes("lab") ? <PanelQuestions {...props} /> : <DripQuestions {...props} />))}
      {tr(cat === "general" && (
        <div className="space-y-4">
          <TextareaField label={tr("What is the main reason for your visit?")} placeholder={tr("Describe your concern...")} value={data.general_reason} onChange={v => onChange({ ...data, general_reason: v })} optional={false} />
          <TextareaField label={tr("How long has this been going on?")} placeholder={tr("e.g. 3 months, a year...")} value={data.duration} onChange={v => onChange({ ...data, duration: v })} />
          <TextareaField label={tr("Any current medications?")} placeholder={tr("List any medications...")} value={data.medications} onChange={v => onChange({ ...data, medications: v })} />
        </div>
      ))}
      <PrivacyNote text={tr("Your answers are private and only used by the BATO team to prepare for your visit.")} />
    </div>
  );
}

// ─── File upload ──────────────────────────────────────────────────────────────

function FileUploadCard({ label, hint, files, onAdd, onRemove, isLoading, slots, photoOnly = false }) {
  const tr = useBatoText();
  const ref = useRef();
  const [selectedPreview, setSelectedPreview] = useState(null);
  const handleFile = async e => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file && !isLoading) {
      if (file.type.startsWith('image/')) {
        setSelectedPreview(previous => {
          if (previous?.url) URL.revokeObjectURL(previous.url);
          return { url: URL.createObjectURL(file), name: file.name };
        });
      }
      await onAdd(file);
    }
  };
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[#333435]">{tr(label)}</p>
      {hint && <p className="text-xs text-[#7c8689]">{tr(hint)}</p>}
      {slots?.length > 0 && <div className="flex flex-wrap gap-2">{slots.map(slot => <span key={slot} className="rounded-full border border-[#c4aa8b]/25 px-3 py-1 text-xs text-[#7c8689]">{tr(slot)}</span>)}</div>}
      <input ref={ref} type="file" accept={photoOnly ? "image/jpeg,image/png,image/webp,image/heic,image/heif" : "image/jpeg,image/png,image/webp,application/pdf,.doc,.docx"} className="hidden" onChange={handleFile} />
      <button type="button" disabled={isLoading} onClick={() => ref.current?.click()} className="w-full py-4 rounded-2xl border-2 border-dashed flex items-center justify-center gap-2 disabled:opacity-50" style={{borderColor: "rgba(196,170,139,0.3)", background: "#f9f8f6"}}>
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-[#c4aa8b]" /> : <Upload className="w-4 h-4 text-[#c4aa8b]" />}
        <span className="text-xs text-[#7c8689]">{tr(isLoading ? "Uploading..." : "Tap to upload")}</span>
      </button>
      {selectedPreview && (
        <div className="flex items-center gap-3 rounded-xl border border-[#c4aa8b]/30 bg-white p-2" aria-label={tr('Selected image preview')}>
          <img src={selectedPreview.url} alt={tr('Selected image')} className="h-16 w-16 rounded-lg object-cover" />
          <span className="min-w-0 flex-1 truncate text-xs text-[#333435]">{selectedPreview.name}</span>
          <button type="button" aria-label={tr('Clear preview')} onClick={() => { URL.revokeObjectURL(selectedPreview.url); setSelectedPreview(null); }}><X className="h-4 w-4 text-[#7c8689]" /></button>
        </div>
      )}
      <p className="text-[11px] text-[#7c8689]">{tr("Up to 20 files per onboarding, 10 MB each.")}</p>
      <div className="space-y-2">
        {files.map((file, index) => <div key={index} className="flex items-center gap-2 rounded-xl border border-[#c4aa8b]/20 bg-white px-3 py-2">
          {file?.preview ? <img src={file.preview} alt={tr('Uploaded image')} className="h-12 w-12 rounded-lg object-cover shrink-0" /> : <FileIcon className="w-4 h-4 shrink-0 text-[#c4aa8b]" />}
          <span className="flex-1 min-w-0 truncate text-xs text-[#333435]">{typeof file === "string" ? file.split("/").pop() : file.name}</span>
          <button type="button" disabled={isLoading} aria-label={tr("Remove file")} onClick={() => onRemove(index)}><X className="w-4 h-4 text-[#7c8689]" /></button>
        </div>)}
      </div>
    </div>
  );
}

// ─── Main booked onboarding ───────────────────────────────────────────────────

export default function BookedOnboarding({ user, profile, onSave, onComplete, apiMode = false, onApiUpload, onApiRemove }) {
  const tr = useBatoText();
  const { isRTL, t } = useLocationCtx();
  const STEP_LABELS = isRTL ? STEP_LABELS_AR : STEP_LABELS_EN;
  const [step, setStep] = useState(() => profile?.current_step > 1 ? Math.min(profile.current_step, TOTAL_STEPS) : 1);
  const [data, setData] = useState({
    booked_service_type: profile?.booked_service_type || "",
    appointment_confirmed: profile?.appointment_confirmed,
    main_concern: profile?.main_concern || "",
    biggest_worry: profile?.biggest_worry || "",
    visit_specific_answers: profile?.visit_specific_answers || {},
    has_allergies: profile?.has_allergies,
    allergies_detail: profile?.allergies_detail || "",
    has_medications: profile?.has_medications,
    medications_detail: profile?.medications_detail || "",
    has_supplements: profile?.has_supplements,
    supplements_detail: profile?.supplements_detail || "",
    has_medical_conditions: profile?.has_medical_conditions,
    medical_conditions_detail: profile?.medical_conditions_detail || "",
    had_recent_surgery: profile?.had_recent_surgery,
    had_bad_reaction: profile?.had_bad_reaction,
    bad_reaction_detail: profile?.bad_reaction_detail || "",
    is_pregnant_or_breastfeeding: profile?.is_pregnant_or_breastfeeding,
    known_deficiencies: profile?.known_deficiencies || [],
    previous_treatments: profile?.previous_treatments || [],
    previous_experience_result: profile?.previous_experience_result || "",
    previous_experience_notes: profile?.previous_experience_notes || "",
    desired_result: profile?.desired_result || "",
    fears_and_concerns: profile?.fears_and_concerns || "",
    uploaded_photos: profile?.uploaded_photos || [],
    uploaded_documents: profile?.uploaded_documents || [],
    consent_acknowledged: profile?.consent_acknowledged || false,
  });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const actionBusy = useRef(false);
  const dataRef = useRef(data);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const set = (updates) => {
    dataRef.current = { ...dataRef.current, ...updates };
    setData(dataRef.current);
    setSaved(false);
  };
  const save = async (updates = {}) => {
    const merged = { ...dataRef.current, ...updates, last_updated_at: new Date().toISOString() };
    set(updates);
    const result = await onSave(merged);
    setSaved(true);
    return result;
  };
  const runAction = async (action) => {
    if (actionBusy.current) return;
    actionBusy.current = true;
    setSaving(true);
    setSaveError("");
    try { await action(); }
    catch (error) {
      setSaveError(error?.message || t("We couldn't save your progress. Your answers are still here. Try again.", "تعذر حفظ تقدمك. إجاباتك ما زالت هنا. حاول مرة أخرى."));
    } finally { actionBusy.current = false; setSaving(false); }
  };
  const next = ({ skip = false } = {}) => runAction(async () => {
    if (skip && apiMode) {
      const nextStep = Math.min(step + 1, TOTAL_STEPS);
      const result = await onSave({ current_step: nextStep, __skipStep: true });
      setStep(result?.current_step || nextStep);
      window.scrollTo(0, 0);
      return;
    }
    const requiredFields = Array.from(document.querySelectorAll('[data-bato-onboarding-required="true"]'));
    const invalid = requiredFields.find(input => !String(input.value || '').trim() || !input.checkValidity());
    if (invalid && !skip) {
      invalid.focus();
      invalid.reportValidity();
      throw new Error(t('Please complete the required text fields.', 'يرجى إكمال الحقول النصية المطلوبة.'));
    }
    let nextStep = Math.min(step + 1, TOTAL_STEPS);
    const result = await save({ current_step: nextStep });
    if (apiMode && result?.current_step) nextStep = result.current_step;
    setStep(nextStep);
    window.scrollTo(0, 0);
  });
  const back = () => runAction(async () => {
    const previousStep = Math.max(1, step - 1);
    await save({ current_step: previousStep });
    setStep(previousStep);
    window.scrollTo(0, 0);
  });
  const finish = () => runAction(() => onComplete(dataRef.current));
  const toggleArr = (field, val) => {
    const curr = dataRef.current[field] || [];
    set({ [field]: curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val] });
  };
  const upload = (file, field, photoOnly) => runAction(async () => {
    const reason = apiMode && !['image/jpeg','image/png',...(photoOnly ? [] : ['application/pdf'])].includes(file.type)
      ? 'type'
      : validateUpload(file, { photoOnly, count: (dataRef.current[field] || []).length });
    if (reason) {
      toast.error(reason === "size" ? t("Choose a file under 10 MB.", "اختر ملفاً أقل من ١٠ ميغابايت.") : reason === "count" ? t("You can add up to 10 files.", "يمكنك إضافة ١٠ ملفات كحد أقصى.") : t("Choose a supported image or document.", "اختر صورة أو مستنداً مدعوماً."));
      return;
    }
    const setUploading = photoOnly ? setUploadingPhoto : setUploadingDoc;
    setUploading(true);
    try {
      const fileResult = apiMode ? await onApiUpload(file, field, dataRef.current) : await base44.integrations.Core.UploadFile({ file });
      const uploaded = apiMode ? fileResult : fileResult?.file_url;
      if (!uploaded) throw new Error("Upload incomplete");
      // Uploading a file is independent from saving answers. The backend has
      // already stored the file; don't resubmit the current step on upload.
      const preview = file.type.startsWith('image/') ? URL.createObjectURL(file) : null;
      set({ [field]: [...(dataRef.current[field] || []), apiMode ? { ...uploaded, ...(preview ? { preview } : {}) } : uploaded] });
      toast.success(t("File saved to your profile.", "تم حفظ الملف في ملفك الشخصي."));
    } catch {
      setSaveError(t("We couldn't upload this file. Check the selected image and try again.", "تعذر رفع الملف أو حفظه. إجاباتك ما زالت هنا. إذا ظهر الملف في القائمة، اضغط متابعة لإعادة حفظه؛ وإلا أعد رفعه."));
    } finally { setUploading(false); }
  });
  const handlePhotoAdd = file => upload(file, "uploaded_photos", true);
  const handleDocAdd = file => upload(file, "uploaded_documents", false);
  const removeFile = (field, index) => {
    if (!apiMode) return set({ [field]: dataRef.current[field].filter((_, idx) => idx !== index) });
    return runAction(async () => {
      const item = dataRef.current[field]?.[index];
      if (item?.id) await onApiRemove(item.id);
      set({ [field]: dataRef.current[field].filter((_, idx) => idx !== index) });
    });
  };

  const firstName = user?.full_name?.split(" ")[0] || "";

  const renderStep = () => {
    switch (step) {

      // ── STEP 1: WELCOME ──────────────────────────────────────────────────────
      case 1:
        return (
          <div>
            <div className="mb-4 -mx-1">
              <BookedIllustration />
            </div>

            <div className="relative overflow-hidden rounded-3xl p-7 mb-6"
              style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 80% 10%, rgba(231,203,80,0.1) 0%, transparent 55%)" }} />
              <div className={`relative z-10 ${isRTL ? "text-right" : ""}`}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "rgba(196,170,139,0.7)" }}>{tr("BATO Clinic")}</p>
                <h1 className="text-2xl font-bold text-white mb-3 leading-snug">
                  {tr(t("Welcome to BATO.", "مرحباً بك في باتو."))}
                </h1>
                <p className="text-sm leading-relaxed" style={{ color: "rgba(238,235,230,0.75)" }}>
                  {tr(t(
                    "Before your visit, we'd like to understand you a little better. This takes about 3 minutes — and helps your team prepare for a visit that feels personal to you.",
                    "قبل زيارتك، نود التعرف على حالتك. يستغرق هذا نحو ٣ دقائق ويساعد الفريق على الاستعداد لك."
                  ))}
                </p>
              </div>
            </div>

            <p className={`text-sm font-semibold text-[#333435] mb-3 ${isRTL ? "text-right" : ""}`}>
              {tr(t("Is your appointment confirmed?", "هل موعدك مؤكد؟"))}
            </p>
            <div className="space-y-2 mb-6">
              {tr([
                { val: true, icon: CheckCircle2, label: t("Yes — I have a confirmed appointment", "نعم — لدي موعد مؤكد") },
                { val: false, icon: AlertCircle, label: t("Something looks wrong — I need help", "هناك خطأ ما — أحتاج إلى مساعدة") }
              ].map(opt => (
                <button key={String(opt.val)} onClick={() => set({ appointment_confirmed: opt.val })}
                  className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                  style={{ borderColor: data.appointment_confirmed === opt.val ? "#c4aa8b" : "rgba(196,170,139,0.2)", background: data.appointment_confirmed === opt.val ? "rgba(196,170,139,0.06)" : "#fff" }}>
                  <opt.icon className="w-5 h-5 flex-shrink-0" style={{ color: data.appointment_confirmed === opt.val ? "#c4aa8b" : "#7c8689" }} />
                  <span className="text-sm text-[#333435] font-medium">{tr(opt.label)}</span>
                </button>
              )))}
            </div>
            <CTAButton label={t("Let's begin", "لنبدأ")} onClick={next} disabled={data.appointment_confirmed === undefined} />
            <p className="text-center text-xs text-[#7c8689] mt-3">{tr(t("Your progress is saved when you continue.", "يُحفظ تقدمك عند الضغط على متابعة."))}</p>
          </div>
        );

      // ── STEP 2: MAIN CONCERN ─────────────────────────────────────────────────
      case 2: {
        return (
          <div>
            <div className="mb-4 -mx-1">
              <ProfileBuildIllustration />
            </div>
            <ScreenTitle
              title={tr("What brings you to BATO?")}
              subtitle={tr("Your team will review this before your visit.")}
            />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#7c8689] mb-3">{tr("What are you visiting us for?")}</p>
            <div className="space-y-2 mb-5">
              {tr(SERVICE_TYPES.map(s => (
                <button key={s} onClick={() => set({ booked_service_type: s, main_concern: "" })}
                  className="w-full text-start px-4 py-3 rounded-2xl border text-sm font-medium transition-all"
                  style={{ borderColor: data.booked_service_type === s ? "#c4aa8b" : "rgba(196,170,139,0.2)", background: data.booked_service_type === s ? "rgba(196,170,139,0.08)" : "#fff", color: "#333435" }}>
                  {tr(s)}
                </button>
              )))}
            </div>
            {tr(data.booked_service_type && (
              <>
                <p className="text-sm font-semibold text-[#333435] mb-2 mt-4">{tr("What's your main concern?")}</p>
                <div className="flex flex-wrap gap-2 mb-5">
                  {tr(getConcernsList(data.booked_service_type).map(c => (
                    <Chip key={c} label={c} selected={data.main_concern === c} onClick={() => set({ main_concern: c })} />
                  )))}
                </div>
              </>
            ))}
            <CTAButton label={t("Continue", "متابعة")} onClick={next} disabled={!data.booked_service_type || !data.main_concern} />
          </div>
        );
      }

      // ── STEP 3: VISIT-SPECIFIC DETAILS ───────────────────────────────────────
      case 3: {
        const cat = getServiceCategory(data.booked_service_type);
        return (
          <div>
            <div className="mb-4 -mx-1">
              <CategoryIllustration category={cat} />
            </div>
            <VisitSpecificQuestions
              service={data.booked_service_type}
              data={data.visit_specific_answers || {}}
              onChange={v => set({ visit_specific_answers: v })}
            />
            <div className="mt-5">
              <CTAButton label={t("Continue", "متابعة")} onClick={next} />
            </div>
          </div>
        );
      }

      // ── STEP 4: PREVIOUS TREATMENTS ──────────────────────────────────────────
      case 4:
        return (
          <div>
            <ScreenTitle
              title={tr("Have you tried anything for this before?")}
              subtitle={tr("No judgment — this helps us understand what worked, what didn't, and what to avoid repeating.")}
            />
            <div className="flex flex-wrap gap-2 mb-4">
              {tr(PREVIOUS_TX.map(tx => (
                <Chip key={tx} label={tx} selected={(data.previous_treatments || []).includes(tx)} onClick={() => toggleArr("previous_treatments", tx)} />
              )))}
            </div>
            {tr((data.previous_treatments || []).length > 0 && !(data.previous_treatments || []).includes("Nothing yet") && (
              <>
                <p className="text-sm font-medium text-[#333435] mb-2 mt-4">{tr("How did it go?")}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tr(PREV_RESULTS.map(res => (
                    <Chip key={res} label={res} selected={data.previous_experience_result === res} onClick={() => set({ previous_experience_result: res })} />
                  )))}
                </div>
              </>
            ))}
            <TextareaField
              label={tr("Anything you'd like the team to know?")}
              placeholder={tr("What worked, what didn't, what you're hoping will be different...")}
              value={data.previous_experience_notes}
              onChange={v => set({ previous_experience_notes: v })}
              hint={tr("Your team will read this before your visit.")}
            />
            <div className="mt-5"><CTAButton label={t("Continue", "متابعة")} onClick={next} /></div>
          </div>
        );

      // ── STEP 5: GOAL SCREEN ───────────────────────────────────────────────────
      case 5: {
        const canContinue = data.desired_result && data.desired_result.trim().length > 5;
        return (
          <div>
            <div className="mb-6 -mx-1">
              <GoalsIllustration />
            </div>

            {/* Premium journal-style prompt */}
            <div className={`mb-8 ${isRTL ? "text-right" : ""}`}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#c4aa8b] mb-3">
                {tr(t("Your goal", "هدفك"))}
              </p>
              <h1 className="text-2xl font-bold text-[#333435] leading-tight mb-3">
                {tr(t("If this goes perfectly —", "لو حقق العلاج النتيجة التي تتمناها…"))}
              </h1>
              <p className="text-sm text-[#7c8689] leading-relaxed">
                {tr(t("What would that look like for you?", "ما الذي سيتغير بالنسبة لك؟"))}
              </p>
            </div>

            <textarea
              value={data.desired_result || ""}
              onChange={e => set({ desired_result: e.target.value })}
              placeholder={t(
                'Example: "I want my hairline to look fuller again. I want to feel confident without hiding it."',
                "مثال: أريد أن يستعيد خط شعري كثافته، وأن أشعر بالثقة دون إخفائه."
              )}
              rows={5}
              required data-bato-onboarding-required="true" minLength={6}
              className="w-full rounded-2xl border px-4 py-4 text-sm text-[#333435] placeholder:text-[#b0b8bc] resize-none outline-none mb-2"
              dir={isRTL ? "rtl" : "ltr"}
              style={{
                borderColor: data.desired_result?.trim().length > 5 ? "#c4aa8b" : "rgba(196,170,139,0.3)",
                background: "#ffffff",
                fontSize: "15px",
                lineHeight: "1.6",
              }}
            />
            <p className={`text-[11px] text-[#7c8689] mb-6 flex items-center gap-1.5 ${isRTL ? "flex-row-reverse" : ""}`}>
              <span style={{ color: "#c4aa8b" }}>🔒</span>
              {tr(t("Your specialist will read this before meeting you.", "سيطلع أخصائيك على هذا قبل لقائك."))}
            </p>

            <CTAButton label={t("Continue", "متابعة")} onClick={next} disabled={!canContinue} />
            {tr(!canContinue && data.desired_result?.length > 0 && (
              <p className="text-center text-xs text-[#7c8689] mt-2">
                {tr(t("Tell us a little more — this helps your specialist prepare.", "أضف بعض التفاصيل لمساعدة أخصائيك على الاستعداد."))}
              </p>
            ))}
          </div>
        );
      }

      // ── STEP 6: FEAR / WORRY SCREEN ───────────────────────────────────────────
      case 6: {
        const canContinue6 = !!data.biggest_worry;
        const WORRIES_DISPLAY = isRTL ? [
          "أخشى ألا ينجح العلاج",
          "أخشى التكلفة",
          "لم تنجح تجاربي السابقة",
          "لا أعرف ما المناسب لي",
          "أشعر بالقلق من الإجراء نفسه",
          "شيء آخر",
        ] : WORRIES;
        return (
          <div>
            <div className={`mb-6 ${isRTL ? "text-right" : ""}`}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#c4aa8b] mb-3">
                {tr(t("Your worry", "ما يقلقك"))}
              </p>
              <h1 className="text-2xl font-bold text-[#333435] leading-tight mb-2">
                {tr(t("Most people come in with a worry.", "من الطبيعي أن يكون لديك سؤال أو قلق قبل العلاج."))}
              </h1>
              <p className="text-sm text-[#7c8689] leading-relaxed">
                {tr(t("What is yours?", "ما أكثر ما يشغلك؟"))}
              </p>
            </div>

            <div className="space-y-2 mb-5">
              {tr(WORRIES_DISPLAY.map((w, idx) => (
                <button
                  key={w}
                  onClick={() => set({ biggest_worry: WORRIES[idx] })}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border transition-all ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                  style={{
                    borderColor: data.biggest_worry === WORRIES[idx] ? "#c4aa8b" : "rgba(196,170,139,0.2)",
                    background: data.biggest_worry === WORRIES[idx] ? "rgba(196,170,139,0.08)" : "#fff",
                  }}
                >
                  <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{ borderColor: data.biggest_worry === WORRIES[idx] ? "#c4aa8b" : "rgba(196,170,139,0.35)", background: data.biggest_worry === WORRIES[idx] ? "#c4aa8b" : "transparent" }}>
                    {tr(data.biggest_worry === WORRIES[idx] && <div className="w-1.5 h-1.5 rounded-full bg-white" />)}
                  </div>
                  <span className="text-sm text-[#333435] font-medium">{tr(w)}</span>
                </button>
              )))}
            </div>

            <TextareaField
              label={t("Tell us more if you want.", "أخبرنا أكثر إذا أردت.")}
              placeholder={t("Anything specific on your mind — you can be as honest as you like.", "اكتب ما يشغلك بكل صراحة.")}
              value={data.fears_and_concerns}
              onChange={v => set({ fears_and_concerns: v })}
            />

            <div className={`mt-4 mb-5 px-3 py-3 rounded-xl flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
              style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
              <span className="text-xs flex-shrink-0" style={{ color: "#c4aa8b" }}>🔒</span>
              <p className={`text-[11px] text-[#7c8689] leading-relaxed ${isRTL ? "text-right" : ""}`}>
                {tr(t(
                  "This stays between you and the BATO team. It helps them address what matters most to you.",
                  "هذه المعلومات بينك وبين فريق باتو، وتساعده على فهم ما يهمك."
                ))}
              </p>
            </div>

            <CTAButton label={t("Continue", "متابعة")} onClick={next} disabled={!canContinue6} />
            {tr(!canContinue6 && (
              <p className="text-center text-xs text-[#7c8689] mt-2">
                {tr(t("Please select a worry to continue.", "اختر ما يقلقك للمتابعة."))}
              </p>
            ))}
          </div>
        );
      }

      // ── STEP 7: HEALTH & SAFETY ───────────────────────────────────────────────
      case 7:
        return (
          <div>
            <div className="mb-4 -mx-1">
              <HealthSafetyIllustration />
            </div>
            <ScreenTitle
              title={tr("A few quick health questions.")}
              subtitle={tr("This helps the team take care of you safely.")}
            />
            <div className="space-y-3 mt-4">
              <YesNoToggle
                label={tr("Currently taking any medications?")}
                hint={tr("This helps your medical team review your case safely before any treatment.")}
                value={data.has_medications}
                onChange={v => set({ has_medications: v })}
              />
              {tr(data.has_medications && <TextareaField label={tr("List your medications")} placeholder={tr("Name, dose, reason if known...")} value={data.medications_detail} onChange={v => set({ medications_detail: v })} optional={false} />)}

              <YesNoToggle
                label={tr("Taking any supplements or vitamins?")}
                value={data.has_supplements}
                onChange={v => set({ has_supplements: v })}
              />
              {tr(data.has_supplements && <TextareaField label={tr("Which supplements?")} placeholder={tr("e.g. Vitamin D, biotin, omega-3...")} value={data.supplements_detail} onChange={v => set({ supplements_detail: v })} />)}

              <YesNoToggle
                label={tr("Any allergies?")}
                hint={tr("This helps your team avoid anything that may not be suitable for you.")}
                value={data.has_allergies}
                onChange={v => set({ has_allergies: v })}
              />
              {tr(data.has_allergies && <TextareaField label={tr("Please describe")} placeholder={tr("e.g. latex, certain medications, food...")} value={data.allergies_detail} onChange={v => set({ allergies_detail: v })} optional={false} />)}

              <YesNoToggle
                label={tr("Any medical conditions we should know about?")}
                hint={tr("This helps ensure the right approach for your situation.")}
                value={data.has_medical_conditions}
                onChange={v => set({ has_medical_conditions: v })}
              />
              {tr(data.has_medical_conditions && <TextareaField label={tr("Please describe")} value={data.medical_conditions_detail} onChange={v => set({ medical_conditions_detail: v })} optional={false} />)}

              <YesNoToggle
                label={tr("Had any surgery in the last 3 months?")}
                value={data.had_recent_surgery}
                onChange={v => set({ had_recent_surgery: v })}
              />

              <YesNoToggle
                label={tr("Ever had a bad reaction to a treatment?")}
                hint={tr("This helps us understand what to avoid repeating.")}
                value={data.had_bad_reaction}
                onChange={v => set({ had_bad_reaction: v })}
              />
              {tr(data.had_bad_reaction && <TextareaField label={tr("What happened?")} value={data.bad_reaction_detail} onChange={v => set({ bad_reaction_detail: v })} optional={false} />)}

              <div>
                <p className="text-sm font-medium text-[#333435] mb-1">{tr("Any known deficiencies?")}</p>
                <p className="text-xs text-[#7c8689] mb-2">{tr("Select any that apply — or skip if unsure.")}</p>
                <div className="flex flex-wrap gap-2">
                  {tr(DEFICIENCIES.map(d => <Chip key={d} label={d} selected={(data.known_deficiencies || []).includes(d)} onClick={() => toggleArr("known_deficiencies", d)} />))}
                </div>
              </div>
            </div>
            <PrivacyNote text={tr("This is reviewed only by your medical team.")} />
            <div className="mt-5 space-y-3">
              <FileUploadCard
                label={tr("Upload any documents (optional)")}
                hint={tr("Lab results, prescriptions, or previous records. Skip if you have nothing to add.")}
                files={data.uploaded_documents || []}
                onAdd={handleDocAdd}
                onRemove={i => removeFile("uploaded_documents", i)}
                isLoading={uploadingDoc}
                slots={["Lab Results", "Previous Records", "Prescription / Meds", "Other Document"]}
              />
              <CTAButton label={tr("Continue")} onClick={next} />
              {tr((data.uploaded_documents || []).length === 0 && (
                <button onClick={() => next({ skip: true })} className="w-full py-2.5 text-xs text-[#7c8689]">{tr("I don't have documents to upload")}</button>
              ))}
            </div>
          </div>
        );

      // ── STEP 8: PHOTO UPLOAD ─────────────────────────────────────────────────
      case 8: {
        const cat8 = getServiceCategory(data.booked_service_type);
        const photoSlots = cat8 === "hair"
          ? ["Front", "Top", "Left Side", "Right Side", "Crown"]
          : cat8 === "skin"
            ? ["Front Face", "Left Side", "Right Side", "Concern Close-Up"]
            : null;
        return (
          <div>
            {/* Warm intro before upload */}
            <div className="mb-6 rounded-2xl p-5"
              style={{ background: "rgba(196,170,139,0.07)", border: "1px solid rgba(196,170,139,0.18)" }}>
              <p className="text-base font-semibold text-[#333435] mb-2 leading-snug">{tr("One more thing that makes a real difference.")}</p>
              <p className="text-sm text-[#7c8689] leading-relaxed mb-1">{tr("A clear photo of the area you're concerned about helps your team prepare before you arrive.")}</p>
              <p className="text-xs text-[#7c8689] mt-2">{tr("Photos are private and only visible to the BATO team.")}</p>
            </div>

            <div className="mb-4">
              <FileUploadCard
                label={tr("Add a photo")}
                hint={cat8 === "hair"
                  ? "Natural light, no filters. Front, top, and sides help most. Not perfect is fine."
                  : cat8 === "skin"
                    ? "No filters or heavy makeup if possible. Clear photos help your team review your skin before you arrive."
                    : "Clear photos help your team review your case before your visit."}
                files={data.uploaded_photos || []}
                photoOnly
                onAdd={handlePhotoAdd}
                onRemove={i => removeFile("uploaded_photos", i)}
                isLoading={uploadingPhoto}
                slots={photoSlots}
              />
            </div>

            <div className="space-y-2 mt-4">
              <CTAButton label={tr("Continue")} onClick={next} />
              {tr((data.uploaded_photos || []).length === 0 && (
                <button onClick={() => next({ skip: true })} className="w-full py-2.5 text-xs text-[#7c8689]">{tr("Skip for now")}</button>
              ))}
            </div>
          </div>
        );
      }

      // ── STEP 9: CONSENT ──────────────────────────────────────────────────────
      case 9: {
        const sections = [
          { label: "Booked visit", value: data.booked_service_type || "Not specified" },
          { label: "Main concern", value: data.main_concern || "Not specified" },
          { label: "Your goal", value: data.desired_result ? data.desired_result.substring(0, 80) + (data.desired_result.length > 80 ? "…" : "") : "Not specified" },
          { label: "Biggest worry", value: data.biggest_worry || "Not specified" },
          { label: "Allergies", value: data.has_allergies ? (data.allergies_detail || "Yes — detail not added") : "None" },
          { label: "Medications", value: data.has_medications ? (data.medications_detail || "Yes — detail not added") : "None" },
          { label: "Medical conditions", value: data.has_medical_conditions ? (data.medical_conditions_detail || "Yes — detail not added") : "None" },
          { label: "Previous treatments", value: (data.previous_treatments || []).join(", ") || "None" },
          { label: "Photos", value: (data.uploaded_photos || []).length > 0 ? `${data.uploaded_photos.length} uploaded` : "None" },
        ];
        return (
          <div>
            <div className="mb-4 -mx-1">
              <BeforeVisitIllustration />
            </div>
            <ScreenTitle title={tr("Almost done.")} subtitle={tr("Here's a summary of what your team will receive.")} />
            <div className="bg-white rounded-2xl border divide-y mb-5" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
              {tr(sections.map(s => (
                <div key={s.label} className="flex items-start justify-between gap-3 px-4 py-3">
                  <span className="text-xs text-[#7c8689] flex-shrink-0 w-28">{tr(s.label)}</span>
                  <span className="text-xs text-[#333435] text-right flex-1">{tr(s.value)}</span>
                </div>
              )))}
            </div>

            <div className="rounded-2xl p-5 mb-5" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
              <p className="text-sm text-[#7c8689] leading-relaxed">{tr("By continuing, you confirm that the information you shared is accurate to the best of your knowledge and that you consent to BATO's team reviewing it before your visit.")}</p>
            </div>

            <button onClick={() => set({ consent_acknowledged: !data.consent_acknowledged })}
              className="w-full flex items-start gap-3 p-3.5 rounded-2xl border mb-5 text-left"
              style={{ borderColor: data.consent_acknowledged ? "#c4aa8b" : "rgba(196,170,139,0.2)", background: data.consent_acknowledged ? "rgba(196,170,139,0.06)" : "#fff" }}>
              <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 border-2"
                style={{ borderColor: data.consent_acknowledged ? "#c4aa8b" : "rgba(196,170,139,0.4)", background: data.consent_acknowledged ? "#c4aa8b" : "transparent" }}>
                {tr(data.consent_acknowledged && <CheckCircle2 className="w-3 h-3 text-white" />)}
              </div>
              <p className="text-xs text-[#7c8689] leading-relaxed">{tr("I confirm")}</p>
            </button>
            <CTAButton label={tr("Send to My BATO Team")} onClick={next} disabled={!data.consent_acknowledged} />
          </div>
        );
      }

      // ── STEP 10: COMPLETION ───────────────────────────────────────────────────
      case 10: {
        const instructions = getBeforeVisitInstructions(data.booked_service_type);
        const completionItems = [
          t("Your BATO profile is complete", "ملفك في باتو مكتمل"),
          t("Your team can review your case before you arrive", "يمكن لفريقك مراجعة حالتك قبل وصولك"),
          t("Your specialist will know your goal and concern", "سيعرف أخصائيك هدفك وما يقلقك"),
        ];
        return (
          <div>
            <div className="mb-4 -mx-1">
              <CompletionIllustration />
            </div>
            <div className={`text-center mb-6 ${isRTL ? "text-right" : ""}`}>
              <h1 className="text-2xl font-bold text-[#333435] mb-2">
                {tr(firstName
                  ? t(`You're all set, ${firstName}.`, `أنت جاهز، ${firstName}.`)
                  : t("You're all set.", "أنت جاهز."))}
              </h1>
              <p className="text-sm text-[#7c8689] leading-relaxed px-4">
                {tr(t(
                  "Your team will review what you shared before your visit. You're not starting from zero when you walk in.",
                  "سيراجع الفريق معلوماتك قبل الزيارة، ليبدأ الحديث وهو يعرف حالتك."
                ))}
              </p>
            </div>

            <div className="bg-white rounded-2xl border p-4 mb-4 space-y-3" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
              {tr(completionItems.map((item, i) => (
                <div key={i} className={`flex items-center gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#c4aa8b" }} />
                  <p className="text-sm text-[#333435]">{tr(item)}</p>
                </div>
              )))}
            </div>

            <div className="bg-white rounded-2xl border p-5 mb-5 space-y-3" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
              <p className={`text-xs font-semibold uppercase tracking-wider text-[#7c8689] mb-2 ${isRTL ? "text-right" : ""}`}>
                {tr(t("Before your visit", "قبل زيارتك"))}
              </p>
              {tr(instructions.map((inst, i) => (
                <div key={i} className={`flex items-start gap-2.5 ${isRTL ? "flex-row-reverse" : ""}`}>
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#c4aa8b" }} />
                  <p className="text-sm text-[#333435]">{tr(inst)}</p>
                </div>
              )))}
            </div>

            <CTAButton label={t("View My Visit Prep", "عرض تعليمات الزيارة")} onClick={finish} />
          </div>
        );
      }

      default: return null;
    }
  };

  return (
    <OnboardingShell
      step={step}
      totalSteps={TOTAL_STEPS + 1}
      onBack={step > 1 && !saving ? back : null}
      showBack={step > 1}
      stepLabels={STEP_LABELS}
    >
      {tr(saveError && <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{tr(saveError)}</p>)}
      {tr(saving && <p role="status" className="mb-3 text-sm text-[#7c8689]">{tr(t("Saving…", "جارٍ الحفظ…"))}</p>)}
      <fieldset disabled={saving} className="min-w-0 border-0 p-0 m-0">{tr(renderStep())}</fieldset>
      {tr(saved && <SavedProgressNote />)}
    </OnboardingShell>
  );
}