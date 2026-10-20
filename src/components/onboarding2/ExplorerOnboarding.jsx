import { EXPLORER_GOALS_AR, EXPLORER_STARTS, GENERAL_START } from "@/lib/explorerStart";
import { translateCareText } from "@/lib/careArabic";
import React, { useState, useRef } from "react";
import { motion } from "@/components/motion/BatoMotion";
import { TrendingUp, Sparkles, Zap, Activity, CheckCircle2, Heart, Clock, FileText, Shield } from "lucide-react";
import { ScreenTitle, Chip, CTAButton, TextareaField } from "./OnboardingUI";
import OnboardingShell from "./OnboardingShell";
import { ExplorerIllustration } from "./OnboardingIllustrations";
import { useLocation as useLocationCtx } from "../LocationContext";
import { base44 } from "@/api/base44Client";

// Steps: 1=Welcome, 2=Interests, 3=Assessment, 4=HairDepth(conditional), 5=Goal+Worry, 6=Contact, 7=Recommendation
const TOTAL_STEPS = 7;

const STEP_LABELS_EN = ["Welcome", "Your interests", "Quick look", "More detail", "Your goal", "Stay in touch", "Your starting point"];
const STEP_LABELS_AR = ["مرحباً", "اهتماماتك", "نظرة سريعة", "تفاصيل إضافية", "هدفك", "ابق على تواصل", "من أين تبدأ"];

const JOURNEYS = [
  { key: "hair", label: "Hair restoration", description: "Scalp assessment, hair loss treatment, and restoration programmes.", icon: TrendingUp },
  { key: "skin", label: "Skin treatments", description: "Facials, peels, RF, microneedling, and glow treatments.", icon: Sparkles },
  { key: "health", label: "Wellness / IV drips", description: "Internal health, panels, drips, and energy support.", icon: Activity },
  { key: "laser", label: "Laser", description: "Laser hair removal — full body or targeted areas.", icon: Zap },
  { key: "aesthetic", label: "Aesthetic care", description: "Injectables, fillers, boosters, and facial refinement.", icon: Heart },
  { key: "unsure", label: "Not sure yet", description: "We'll help you find the right starting point.", icon: CheckCircle2 },
];

const INTERESTS = ["Hair", "Skin", "Health / Panels", "Laser", "Injectables", "Not sure yet"];

const ASSESSMENT_OPTIONS = {
  Hair: ["Hair thinning", "Hair shedding", "Scalp concern", "Hairline / crown / full scalp", "Not sure"],
  Skin: ["Acne", "Pigmentation", "Texture", "Dullness", "Pores", "Sensitivity", "Not sure"],
  Laser: ["Full body", "Specific area", "Maintenance", "First time laser", "Not sure"],
  Injectables: ["Botox", "Filler", "Skin booster", "Natural refinement", "Not sure"],
  "Health / Panels": ["Low energy", "Hair-related panels", "Iron / ferritin", "Vitamin D", "Hormones", "Not sure"],
};

const HAIR_DEPTH_TRIGGERS = ["Hair thinning", "Hair shedding"];

const GOAL_CHIPS = [
  "I want more confidence",
  "I want to understand my options",
  "I want to improve something specific",
  "I tried something before and want a better answer",
  "I'm preparing for an event",
  "Other",
];

const WORRIES = [
  "I'm worried it won't work",
  "I'm worried about the cost",
  "I've been disappointed before",
  "I'm not sure what is right for me",
  "I'm nervous about what I'll find out",
  "Something else",
];

function buildExplorerStaffSummary(data, userName) {
  const assessmentStr = Object.entries(data.explorer_assessment || {})
    .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`)
    .join(" | ") || "Not specified";
  const hairDepth = data.visit_specific_answers || {};
  return `Explorer Profile — ${userName}

Interests: ${(data.explorer_interests || []).join(", ") || "Not specified"}
Assessment symptoms: ${assessmentStr}
${hairDepth.hair_duration ? `Hair concern duration: ${hairDepth.hair_duration}` : ""}
${hairDepth.hair_getting_worse ? `Getting worse: ${hairDepth.hair_getting_worse}` : ""}
${hairDepth.hair_trigger ? `Trigger: ${hairDepth.hair_trigger}` : ""}

Goal / reason: ${data.desired_result || "Not specified"}
Biggest worry: ${data.biggest_worry || "Not specified"}
Recommended starting point: ${data.explorer_recommended_start || "Not specified"}
Readiness: ${data.readiness_status || "Not specified"}
Branch preference: ${data.explorer_preferred_branch || "Not specified"}
Contact name: ${data.explorer_contact_name || "Not specified"}
Contact phone: ${data.explorer_contact_phone || "Not specified"}

Team reminder: Explorer profile — reach out to guide to first appointment.`;
}

export default function ExplorerOnboarding({ user, profile, onSave, onComplete, apiMode = false }) {
  const { isRTL, t, location } = useLocationCtx();
  const c = value => isRTL ? (EXPLORER_GOALS_AR[value] || translateCareText(value)) : value;
  const STEP_LABELS = isRTL ? STEP_LABELS_AR : STEP_LABELS_EN;

  const [step, setStep] = useState(() => profile?.current_step > 1 ? Math.min(profile.current_step, TOTAL_STEPS) : 1);
  const [interests, setInterests] = useState(profile?.explorer_interests || []);
  const [assessment, setAssessment] = useState(profile?.explorer_assessment || {});
  const [hairDepth, setHairDepth] = useState(profile?.visit_specific_answers || {});
  const [desiredResult, setDesiredResult] = useState(GOAL_CHIPS.includes(profile?.desired_result) ? "" : (profile?.desired_result || ""));
  const [goalChip, setGoalChip] = useState(GOAL_CHIPS.includes(profile?.desired_result) ? profile.desired_result : "");
  const [biggestWorry, setBiggestWorry] = useState(profile?.biggest_worry || "");
  const [branch, setBranch] = useState(profile?.explorer_preferred_branch || "");
  const [name, setName] = useState(profile?.explorer_contact_name || user?.full_name || "");
  const saveBusy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [phone, setPhone] = useState(profile?.explorer_contact_phone || "");

  const saveAction = async action => {
    if (saveBusy.current) return;
    saveBusy.current = true;
    setSaving(true);
    setSaveError("");
    try { await action(); }
    catch (error) { console.error("Onboarding save failed:", error); setSaveError(error?.message || t("Your answers could not be saved. Please try again.", "تعذر حفظ إجاباتك. حاول مرة أخرى.")); }
    finally { saveBusy.current = false; setSaving(false); }
  };

  const needsHairDepth = () => {
    const hairSelections = interests.includes("Hair") ? (assessment["Hair"] || []) : [];
    return hairSelections.some(s => HAIR_DEPTH_TRIGGERS.includes(s));
  };

  const [priority, setPriority] = useState(() => EXPLORER_STARTS.find(s => s.title === profile?.explorer_recommended_start)?.interest || "");
  const relevantStarts = EXPLORER_STARTS.filter(s => interests.includes(s.interest));
  const chosenStart = relevantStarts.length === 1 ? relevantStarts[0] : relevantStarts.find(s => s.interest === priority);
  const getRouting = () => chosenStart || GENERAL_START;

  const toggleInterest = (val) => {
    setInterests(prev => {
      if(prev.includes(val)) return prev.filter(x=>x!==val);
      return val==="Not sure yet" ? ["Not sure yet"] : [...prev.filter(x=>x!=="Not sure yet"),val];
    });
  };

  const toggleAssessment = (interest, val) => {
    setAssessment(prev => {
      const curr = prev[interest] || [];
      return { ...prev, [interest]: curr.includes(val) ? curr.filter(x => x !== val) : [...curr, val] };
    });
  };

  const saveAll = (extras = {}) => onSave({
    explorer_interests: interests,
    explorer_recommended_start: getRouting().title,
    explorer_assessment: Object.fromEntries(Object.entries(assessment).filter(([key])=>interests.includes(key))),
    visit_specific_answers: interests.includes("Hair") ? hairDepth : {},
    explorer_preferred_branch: branch,
    explorer_contact_name: name.trim(),
    explorer_contact_phone: phone.trim(),
    desired_result: desiredResult || goalChip,
    biggest_worry: biggestWorry,
    ...extras,
  });

  const next = () => saveAction(async () => {
    const requiredFields = Array.from(document.querySelectorAll('[data-bato-onboarding-required="true"]'));
    const invalid = requiredFields.find(input => !String(input.value || '').trim() || !input.checkValidity());
    if (invalid) {
      invalid.focus();
      invalid.reportValidity();
      throw new Error(t('Please complete the required text fields.', 'يرجى إكمال الحقول النصية المطلوبة.'));
    }
    let nextStep = step + 1;
    // Skip step 4 (hair depth) if not triggered, AND skip step 3 entirely if no relevant interests
    if (step === 2) {
      const relevantInterests = interests.filter(i => ASSESSMENT_OPTIONS[i]);
      if (relevantInterests.length === 0) nextStep = 5; // skip both 3 and 4
    }
    if (step === 3 && !needsHairDepth()) nextStep = 5;
    const result = await saveAll({ current_step: nextStep });
    if (apiMode && result?.current_step) nextStep = result.current_step;
    setStep(nextStep);
    window.scrollTo(0, 0);
  });

  const back = () => saveAction(async () => {
    let prevStep = step - 1;
    // Mirror the skip logic going backwards
    if (step === 5) {
      const relevantInterests = interests.filter(i => ASSESSMENT_OPTIONS[i]);
      if (relevantInterests.length === 0) prevStep = 2; // skipped both 3 and 4
      else if (!needsHairDepth()) prevStep = 3; // skipped only 4
    }
    if (step === 4) prevStep = 3;
    const newStep = Math.max(1, prevStep);
    await saveAll({ current_step: newStep });
    setStep(newStep);
    window.scrollTo(0, 0);
  });

  const handleComplete = (readiness) => saveAction(async () => {
    const r = getRouting();
    const staffSummary = buildExplorerStaffSummary({
      explorer_interests: interests,
      explorer_assessment: Object.fromEntries(Object.entries(assessment).filter(([key])=>interests.includes(key))),
      visit_specific_answers: interests.includes("Hair") ? hairDepth : {},
      desired_result: desiredResult || goalChip,
      biggest_worry: biggestWorry,
      explorer_recommended_start: r.title,
      explorer_preferred_branch: branch,
      explorer_contact_name: name,
      explorer_contact_phone: phone,
      readiness_status: readiness,
    }, user?.full_name || user?.email);

    if (readiness === "interested" && !apiMode && !profile?._preview) {
      try {
        await base44.entities.Notification.create({
          client_email: "admin@batoclinic.com",
          type: "general",
          title: "Explorer ready for follow-up",
          message: `${user?.full_name || name || user?.email} completed a ${r.title} recommendation and hasn't booked yet. Suggested follow-up within 48 hours.`,
          priority: "high",
        });
      } catch (e) {
        console.error("Follow-up notification failed:", e);
      }
    }

    await onComplete({
      interests,
      assessment: Object.fromEntries(Object.entries(assessment).filter(([key])=>interests.includes(key))),
      visit_specific_answers: interests.includes("Hair") ? hairDepth : {},
      branch,
      name:name.trim(),
      phone:phone.trim(),
      next_step: readiness === "ready" ? "book" : readiness === "ask" ? "ask" : "think",
      explorer_recommended_start: r.title,
      desired_result: desiredResult || goalChip,
      biggest_worry: biggestWorry,
      consent_acknowledged: profile?.consent_acknowledged === true,
      readiness_status: readiness,
      staff_summary: staffSummary,
    });
  });

  const renderStep = () => {
    switch (step) {

      case 1:
        return (
          <div>
            <div className="mb-4 -mx-1"><ExplorerIllustration /></div>
            <div className="mb-6 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
                style={{ background: "rgba(58,46,30,0.06)", border: "1px solid rgba(196,170,139,0.2)" }}>
                <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "#3a2e1e" }}>
                  <span className="text-[8px] font-bold" style={{ color: "#c4aa8b" }}>B</span>
                </div>
                <span className="text-[10px] font-semibold text-[#7c8689] tracking-wide uppercase">{isRTL ? "عيادة باتو" : "BATO Clinic"}</span>
              </div>
              <h1 className="text-2xl font-bold text-[#333435] mb-2">{c("Discover BATO.")}</h1>
              <p className="text-sm text-[#7c8689] leading-relaxed max-w-xs mx-auto">
                {c("Not sure where to start? Answer a few quick questions and we'll guide you to the right first step.")}
              </p>
            </div>
            <div className="mb-5"><CTAButton label={t("Find My Starting Point", "ساعدني أختار من أين أبدأ")} onClick={next} /></div>
            <div className="rounded-2xl p-4 mb-5" style={{ background: "rgba(196,170,139,0.07)", border: "1px solid rgba(196,170,139,0.18)" }}>
              <p className="text-xs font-semibold text-[#333435] mb-1">{t("Start with what matters to you","ابدأ بما يهمك")}</p>
              <p className="text-xs text-[#7c8689] leading-relaxed">
                {t("Tell us what you want to change. We’ll help you explore the relevant service, understand the next step and decide what to ask your team.","أخبرنا بما تريد تغييره. نساعدك في استكشاف الخدمة المناسبة وفهم الخطوة التالية وتحديد ما تريد سؤاله لفريقك.")}
              </p>
            </div>
            <div className="space-y-2.5 mb-5">
              {JOURNEYS.map((j, i) => {
                const Icon = j.icon;
                return (
                  <motion.div key={j.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                    <div className="bg-white rounded-2xl border p-4 flex items-start gap-3" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(196,170,139,0.1)" }}>
                        <Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#333435]">{c(j.label)}</p>
                        <p className="text-xs text-[#7c8689] mt-0.5">{c(j.description)}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        );

      case 2:
        return (
          <div>
            <ScreenTitle title={c("What would you like to explore?")} subtitle={c("Select everything that feels relevant — you can explore more than one area.")} />
            <div className="flex flex-wrap gap-2 mb-6">
              {INTERESTS.map(i => (
                <Chip key={i} label={c(i)} selected={interests.includes(i)} onClick={() => toggleInterest(i)} />
              ))}
            </div>
            {relevantStarts.length > 1 && <div className="mb-6"><p className="text-sm font-semibold mb-3">{t("Which would you like to start with?", "بأي مجال ترغب في البدء؟")}</p><div className="flex flex-wrap gap-2">{relevantStarts.map(s => <Chip key={s.interest} label={c(s.interest)} selected={priority===s.interest} onClick={()=>setPriority(s.interest)} />)}</div></div>}
            <CTAButton label={t("Continue", "متابعة")} onClick={next} disabled={interests.length === 0 || (relevantStarts.length > 1 && !chosenStart)} />
          </div>
        );

      case 3: {
        const relevantInterests = interests.filter(i => ASSESSMENT_OPTIONS[i]);
        // Should never reach here if no relevant interests (next() skips it), but guard anyway
        if (relevantInterests.length === 0) { return null; }
        const anyNotSure = relevantInterests.some(i => (assessment[i] || []).includes("Not sure"));
        return (
          <div>
            <ScreenTitle title={c("What would you like help with?")} subtitle={c("Select all that feel relevant to you.")} />
            <div className="space-y-5 mb-4">
              {relevantInterests.map(interest => (
                <div key={c(interest)}>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#7c8689] mb-2">{c(interest)}</p>
                  <div className="flex flex-wrap gap-2">
                    {(ASSESSMENT_OPTIONS[interest] || []).map(opt => (
                      <Chip key={opt} label={c(opt)} selected={(assessment[interest] || []).includes(opt)} onClick={() => toggleAssessment(interest, opt)} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {anyNotSure && <p className="text-xs text-[#7c8689] italic mb-4">{c("That's okay \u2014 your team can help confirm this during your visit.")}</p>}
            <CTAButton label={t("Continue", "متابعة")} onClick={next} />
          </div>
        );
      }

      case 4: {
        const DURATION_OPTIONS = ["Just started (under 3 months)", "A few months", "Over a year", "Several years"];
        const WORSE_OPTIONS = ["Yes, noticeably", "Seems stable", "Not sure"];
        const TRIGGER_OPTIONS = ["Stress", "Diet change", "Medical reason", "It just started", "Not sure"];
        return (
          <div>
            <div className={`mb-6 ${isRTL ? "text-right" : ""}`}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#c4aa8b] mb-3">{c("Hair Detail")}</p>
              <h1 className="text-2xl font-bold text-[#333435] leading-tight mb-2">{c("A few more questions about your hair.")}</h1>
              <p className="text-sm text-[#7c8689] leading-relaxed">{c("This helps your specialist understand the full picture before you arrive.")}</p>
            </div>
            <div className="space-y-6 mb-6">
              <div>
                <p className="text-sm font-semibold text-[#333435] mb-2">{c("How long has this been happening?")}</p>
                <div className="flex flex-wrap gap-2">
                  {DURATION_OPTIONS.map(opt => (
                    <Chip key={opt} label={c(opt)} selected={hairDepth.hair_duration === opt}
                      onClick={() => setHairDepth(d => ({ ...d, hair_duration: opt }))} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#333435] mb-2">{c("Is it getting worse?")}</p>
                <div className="flex flex-wrap gap-2">
                  {WORSE_OPTIONS.map(opt => (
                    <Chip key={opt} label={c(opt)} selected={hairDepth.hair_getting_worse === opt}
                      onClick={() => setHairDepth(d => ({ ...d, hair_getting_worse: opt }))} />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#333435] mb-2">{c("Has anything triggered it?")}</p>
                <div className="flex flex-wrap gap-2">
                  {TRIGGER_OPTIONS.map(opt => (
                    <Chip key={opt} label={c(opt)} selected={hairDepth.hair_trigger === opt}
                      onClick={() => setHairDepth(d => ({ ...d, hair_trigger: opt }))} />
                  ))}
                </div>
              </div>
            </div>
            <CTAButton label={t("Continue", "متابعة")} onClick={next} />
            <button onClick={next} className="w-full py-2.5 text-xs text-[#7c8689] mt-1">{t("Skip for now", "تجاوز الآن")}</button>
          </div>
        );
      }

      case 5: {
        const GOAL_CHIPS_AR = ["أريد المزيد من الثقة بالنفس", "أريد فهم خياراتي", "أريد تحسين شيء محدد", "جربت علاجاً سابقاً وأريد فهماً أوضح", "أستعد لمناسبة", "أخرى"];
        const WORRIES_AR = ["أخشى ألا ينجح العلاج", "أخشى التكلفة", "لم تنجح تجاربي السابقة", "لا أعرف ما المناسب لي", "أشعر بالقلق مما سأعرفه", "شيء آخر"];
        const displayChips = isRTL ? GOAL_CHIPS_AR : GOAL_CHIPS;
        const displayWorries = isRTL ? WORRIES_AR : WORRIES;
        return (
          <div>
            <div className={`mb-5 ${isRTL ? "text-right" : ""}`}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#c4aa8b] mb-3">{t("Your goal", "هدفك")}</p>
              <h1 className="text-2xl font-bold text-[#333435] leading-tight mb-2">{t("What made you look into this?", "ما الذي دفعك للبحث عن حل؟")}</h1>
              <p className="text-sm text-[#7c8689] leading-relaxed">{t("No commitment. We just want to understand what you're hoping for.", "لا يلزمك الحجز. نريد فقط فهم ما تتطلع إليه.")}</p>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {displayChips.map((chip, idx) => (
                <button key={chip}
                  aria-pressed={goalChip===GOAL_CHIPS[idx]} onClick={() => setGoalChip(prev => prev === GOAL_CHIPS[idx] ? "" : GOAL_CHIPS[idx])}
                  className="px-3.5 py-2 rounded-full text-sm font-medium transition-all"
                  style={goalChip === GOAL_CHIPS[idx]
                    ? { background: "#3a2e1e", color: "#c4aa8b", border: "1px solid transparent" }
                    : { background: "#ffffff", color: "#7c8689", border: "1px solid rgba(196,170,139,0.25)" }}>
                  {chip}
                </button>
              ))}
            </div>
            <TextareaField
              label={t("Tell us more if you want.", "أخبرنا أكثر إذا أردت.")}
              placeholder={t("In your own words — what would feel like a real difference for you?", "بكلماتك، ما النتيجة التي ستُحدث فرقاً بالنسبة لك؟")}
              value={desiredResult}
              onChange={v => setDesiredResult(v)}
            />
            <div className={`mt-6 mb-4 ${isRTL ? "text-right" : ""}`}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[#c4aa8b] mb-2">{t("Your concern", "ما يقلقك")}</p>
              <p className="text-sm font-semibold text-[#333435] mb-3">{t("Most people come in with a worry. What's yours?", "من الطبيعي أن يكون لديك قلق قبل العلاج. ما أكثر ما يشغلك؟")}</p>
              <div className="space-y-2">
                {displayWorries.map((w, idx) => (
                  <button key={w} aria-pressed={biggestWorry===WORRIES[idx]} onClick={() => setBiggestWorry(WORRIES[idx])}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                    style={{ borderColor: biggestWorry === WORRIES[idx] ? "#c4aa8b" : "rgba(196,170,139,0.2)", background: biggestWorry === WORRIES[idx] ? "rgba(196,170,139,0.08)" : "#fff" }}>
                    <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                      style={{ borderColor: biggestWorry === WORRIES[idx] ? "#c4aa8b" : "rgba(196,170,139,0.35)", background: biggestWorry === WORRIES[idx] ? "#c4aa8b" : "transparent" }}>
                      {biggestWorry === WORRIES[idx] && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm text-[#333435] font-medium">{w}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <CTAButton label={t("Continue", "متابعة")} onClick={next} />
              <button onClick={next} className="w-full py-2.5 text-xs text-[#7c8689]">{t("Skip for now", "تجاوز الآن")}</button>
            </div>
          </div>
        );
      }

      case 6:
        return (
          <div>
            <ScreenTitle title={c("Where would you like to visit us?")} subtitle={t("These details are optional. You can add them now or continue exploring.","هذه التفاصيل اختيارية. يمكنك إضافتها الآن أو متابعة الاستكشاف.")} />
            <div className="space-y-4 mb-5">
              <div>
                <label className="text-xs font-medium text-[#333435] block mb-1.5">{c("Preferred branch")}</label>
                <div className="flex gap-2">
                  {["Dubai", "Kuwait"].map(b => (
                    <button key={c(b)} aria-pressed={branch===b} onClick={() => setBranch(b)} className="flex-1 py-3 rounded-xl text-sm font-medium transition-all"
                      style={{ border: "1px solid", borderColor: branch === b ? "#c4aa8b" : "rgba(196,170,139,0.2)", background: branch === b ? "rgba(196,170,139,0.08)" : "#fff", color: "#333435" }}>
                      {c(b)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="explorer-name" className="text-xs font-medium text-[#333435] block mb-1.5">{c("Your name")}</label>
                <input required data-bato-onboarding-required="true" id="explorer-name" autoComplete="name" value={name} onChange={e => setName(e.target.value)} placeholder={c("Your name")}
                  className="w-full rounded-xl border px-3.5 py-3 text-sm text-[#333435] outline-none"
                  style={{ borderColor: "rgba(196,170,139,0.25)", background: "#fff" }} />
              </div>
              <div>
                <label htmlFor="explorer-phone" className="text-xs font-medium text-[#333435] block mb-1.5">{c("Phone / WhatsApp")}</label>
                <input required data-bato-onboarding-required="true" id="explorer-phone" type="tel" autoComplete="tel" inputMode="tel" dir="ltr" value={phone} onChange={e => setPhone(e.target.value)} placeholder={(branch ? branch==="Kuwait" : location==="kuwait")?"+965 …":"+971 …"}
                  className="w-full rounded-xl border px-3.5 py-3 text-sm text-[#333435] outline-none"
                  style={{ borderColor: "rgba(196,170,139,0.25)", background: "#fff" }} />
              </div>
            </div>
            <CTAButton label={t("Continue", "متابعة")} onClick={next} />
            {!apiMode && <button onClick={next} className="w-full py-2.5 text-xs text-[#7c8689] mt-1">{t("I'll add this later", "سأضيف هذا لاحقاً")}</button>}
          </div>
        );

      case 7: {
        const r = getRouting();
        const needsPriority = relevantStarts.length > 1 && !chosenStart;
        const concerns = interests.flatMap(i => (assessment[i] || []).map(a => c(a)));
        return <div className="space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-[#c4aa8b]/25">
            <h1 className="text-xl font-bold mb-3">{t("What you shared", "ما أخبرتنا به")}</h1>
            <p className="text-sm text-[#333435] break-words">{concerns.length ? concerns.join(" · ") : interests.map(c).join(" · ")}</p>
            {(desiredResult || goalChip) && <p className="text-sm mt-3 break-words">{t("Your goal: ", "هدفك: ")}{c(desiredResult || goalChip)}</p>}
            {branch && <p className="text-sm mt-2">{t("Preferred branch: ", "الفرع المفضل: ")}{c(branch)}</p>}
            <button className="text-sm text-[#3a2e1e] underline mt-4" onClick={()=>saveAction(async()=>{await saveAll({current_step:2});setStep(2);window.scrollTo(0,0);})}>{t("Edit your answers", "عدّل إجاباتك")}</button>
          </div>
          {needsPriority && <div className="bg-white rounded-2xl p-5"><p className="font-semibold mb-3">{t("Which would you like to start with?", "بأي مجال ترغب في البدء؟")}</p><div className="flex flex-wrap gap-2">{relevantStarts.map(s=><Chip key={s.interest} label={c(s.interest)} selected={priority===s.interest} onClick={()=>setPriority(s.interest)}/>)}</div></div>}
          {!needsPriority && <>
            <div className="bato-style-hero rounded-3xl p-7 bg-[#3a2e1e] text-[#eeebe6]">
              <p className="text-xs text-[#c4aa8b] mb-2">{t("Your starting point", "نقطة البداية المناسبة لك")}</p>
              <h2 className="text-xl font-bold mb-3">{isRTL?r.ar:r.title}</h2>
              <p className="text-sm leading-relaxed">{t("This starting point follows the area you chose to explore.", "نقطة البداية هذه تتوافق مع المجال الذي اخترته.")}</p>
            </div>
            <div className="bg-white rounded-2xl p-5">
              <h3 className="font-semibold mb-3">{t("What to expect", "ما يمكنك توقعه")}</h3>
              <p className="text-sm leading-relaxed">{isRTL?r.descriptionAr:r.en}</p>
              <p className="text-xs text-[#7c8689] mt-3">{t("The team will discuss suitable next steps with you. Completing these questions does not book a visit.", "سيناقش الفريق معك الخطوات المناسبة. إكمال هذه الأسئلة لا يعني حجز موعد.")}</p>
            </div>
            <CTAButton label={t("Request "+r.title, "اطلب "+r.ar)} onClick={()=>handleComplete("ready")} />
            <button className="w-full rounded-2xl p-3 border border-[#c4aa8b] bg-white text-sm" onClick={()=>handleComplete("ask")}>{t("Connect with an advisor", "تواصل مع مرشد")}</button>
            <button className="w-full p-3 text-sm text-[#7c8689]" onClick={()=>handleComplete("interested")}>{t("Explore for now", "استكشف الآن")}</button>
          </>}
        </div>;
      }

      default: return null;
    }
  };

  return (
    <OnboardingShell step={step} totalSteps={TOTAL_STEPS + 1} onBack={step > 1 && !saving ? back : null} showBack={step > 1} stepLabels={STEP_LABELS}>
      {saveError && <p role="alert" className="mb-3 text-sm text-red-700">{saveError}</p>}
      <fieldset disabled={saving} aria-busy={saving} className="min-w-0">{renderStep()}</fieldset>
      {saving && <p role="status" className="mt-3 text-sm text-[#7c8689]">{t("Saving...", "جارٍ الحفظ...")}</p>}
    </OnboardingShell>
  );
}