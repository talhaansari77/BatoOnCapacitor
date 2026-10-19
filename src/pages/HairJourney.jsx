import { EXPLORER_STARTS, explorerBookingUrl } from "@/lib/explorerStart";
import SectionCard from "@/components/design/JourneySectionCard";
import BatoSectionIntro from "@/components/design/BatoSectionIntro";
import CareText from "@/components/CareText";
import {loadCompletedTreatmentSessions} from "@/lib/treatmentSessions";
import {caseForProgram} from "@/lib/customerCare";
import { format } from "@/lib/customerFormatting";
import CustomerCareHub from "@/components/care/CustomerCareHub";
import {ar} from "date-fns/locale";
import ProgramHistory from "@/components/dashboard/ProgramHistory";
import {programDepartment,programCounts,sessionsForProgram,appointmentsForProgram} from "@/lib/carePrograms";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { Button } from "@/components/ui/button";
import {
  Calendar, CheckCircle2, Circle, ChevronDown, ChevronUp,
  Camera, MessageSquare, ShieldCheck, Sparkles, ClipboardList,
  User, TrendingUp, Droplets, Activity, Sun, Package,
  FileText, HelpCircle, Clock, Leaf, AlertCircle, Check, Search
} from "lucide-react";

import { useLocation } from "../components/LocationContext";
import { useNavigate, useSearchParams, useLocation as useRouterLocation } from "react-router-dom";
import BookingCalendar from "../components/appointments/BookingCalendar";
import HairJourneyHero from "../components/hairjourney/HairJourneyHero";
import HairCaseProfile from "../components/hairjourney/HairCaseProfile";
import HairSessionPlan from "../components/hairjourney/HairSessionPlan";
import HairFAQ from "../components/hairjourney/HairFAQ";
import ProgressPhotoTimeline from "../components/photos/ProgressPhotoTimeline";
import HairAssessmentModal from "../components/assessments/HairAssessmentModal";
import { IlluScalpTreatment, IlluHairGrowth, IlluHairCare, IlluShield, IlluChecklist, IlluMilestone, IlluMessages, IlluWave, IlluCamera } from "../components/illustrations/BatoIllustrations";
import { JourneySkeleton } from "../components/ui/BatoSkeleton";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLE = {
  "Included":             { bg: "rgba(196,170,139,0.12)", color: "#3a2e1e", border: "rgba(196,170,139,0.3)" },
  "Included when needed": { bg: "rgba(196,170,139,0.08)", color: "#3a2e1e", border: "rgba(196,170,139,0.2)" },
  "Optional":             { bg: "#f9f8f6",                color: "#7c8689", border: "rgba(124,134,137,0.18)" },
  "Included or optional": { bg: "rgba(196,170,139,0.08)", color: "#3a2e1e", border: "rgba(196,170,139,0.2)" },
  "Later stage":          { bg: "#f9f8f6",                color: "#7c8689", border: "rgba(124,134,137,0.15)" },
};

// ─── Reusable SectionCard ────────────────────────────────────────────────────

function BulletList({ items, accent = false }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
            style={{ background: accent ? "#e7cb50" : "#c4aa8b" }} />
          <p className="text-sm text-[#333435] leading-relaxed">{item}</p>
        </li>
      ))}
    </ul>
  );
}

// ─── Explore view (no active package) ───────────────────────────────────────
function HairJourneyExplore({ user, isRTL, t, onStartAssessment, batoProfile, appointment }) {
  const navigate = useNavigate();

  // Anyone on the explorer view (no active hair package) can start the assessment
  const isExplorer = true;
  const isBooked = false;

  const handleAskTeam = () => navigate("/Messages?channel=advisors&department=hair_restoration&context=hair_review");
  const requestAssessment = () => navigate(appointment ? "/ClinicAppointments?" + new URLSearchParams({appointment:appointment.id}) : explorerBookingUrl(EXPLORER_STARTS[0], batoProfile?.explorer_preferred_branch));
  const assessmentAction = appointment ? t("View your appointment", "عرض موعدك") : t("Request Hair Assessment", "اطلب تقييم الشعر");

  const LOOK_AT_ITEMS = [
    { labelEn: "Shedding", labelAr: "التساقط", descEn: "Sudden, seasonal, postpartum, stress-related, or ongoing shedding.", descAr: "التساقط المفاجئ أو الموسمي أو ما بعد الولادة أو المرتبط بالتوتر أو المستمر.", Icon: Leaf },
    { labelEn: "Density", labelAr: "الكثافة", descEn: "Visible thinning, scalp visibility, crown, temples, or full scalp concerns.", descAr: "ترقق الشعر أو ظهور فروة الرأس أو انخفاض الكثافة عند التاج أو الصدغين أو في كامل الرأس.", Icon: TrendingUp },
    { labelEn: "Scalp Health", labelAr: "صحة فروة الرأس", descEn: "Sensitivity, irritation, oiliness, dandruff, or scalp environment.", descAr: "الحساسية والتهيج والدهون والقشرة والحالة العامة لفروة الرأس.", Icon: ShieldCheck },
    { labelEn: "History", labelAr: "تاريخ الحالة", descEn: "Previous treatments, timelines, what worked, and what did not.", descAr: "العلاجات السابقة ومواعيدها وما نجح وما لم ينجح.", Icon: ClipboardList },
    { labelEn: "Biomarkers", labelAr: "المؤشرات الحيوية", descEn: "Ferritin, vitamin D, thyroid, hormones, and inflammation when relevant.", descAr: "الفيريتين وفيتامين د والغدة الدرقية والهرمونات ومؤشرات الالتهاب عند الحاجة.", Icon: Activity },
    { labelEn: "Photos", labelAr: "الصور", descEn: "Clinic-controlled photos help compare progress over time.", descAr: "الصور الموثّقة داخل العيادة تساعد على مقارنة التقدم عبر الزمن.", Icon: Camera },
  ];

  const HOW_STEPS = [
    { step: "1", titleEn: "Share your hair concerns", titleAr: "شارك ما يشغلك بشأن شعرك", descEn: "Tell us what you're noticing: shedding, thinning, scalp visibility, or density concerns.", descAr: "أخبرنا بما تلاحظه: تساقط أو ترقق أو ظهور فروة الرأس أو انخفاض الكثافة.", Icon: ClipboardList },
    { step: "2", titleEn: "Share Your History", titleAr: "شارك تجاربك السابقة", descEn: "Add previous treatments, timeline, fears, and what you want to improve.", descAr: "أخبرنا بعلاجاتك السابقة ومتى بدأت المشكلة وما يقلقك وما تريد تحسينه.", Icon: User },
    { step: "3", titleEn: "BATO Reviews the Case", titleAr: "يراجع فريق باتو حالتك", descEn: "Your team may review photos, scalp condition, and internal markers if needed.", descAr: "قد يراجع فريقك الصور وحالة فروة الرأس والمؤشرات الداخلية عند الحاجة.", Icon: Search },
    { step: "4", titleEn: "Get Your Next Step", titleAr: "حدد خطوتك التالية", descEn: "BATO guides you toward the right next action: consultation, biomarker review, session, or follow-up.", descAr: "نساعدك على اختيار الخطوة المناسبة: استشارة أو مراجعة التحاليل أو جلسة علاج أو متابعة.", Icon: CheckCircle2 },
  ];

  const APPROACH_ITEMS = [
    { titleEn: "Assessment before treatment", titleAr: "التقييم قبل العلاج", descEn: "No guessing before understanding the case.", descAr: "لا تخمين قبل فهم الحالة.", Icon: ClipboardList },
    { titleEn: "Inside + outside view", titleAr: "تقييم الحالة من الداخل والخارج", descEn: "Hair can be affected by scalp condition, biomarkers, history, and treatment response.", descAr: "يمكن أن يتأثر الشعر بحالة فروة الرأس والمؤشرات الحيوية والتاريخ واستجابة العلاج.", Icon: Activity },
    { titleEn: "Clinic-controlled progress photos", titleAr: "صور متابعة موثّقة داخل العيادة", descEn: "Progress is reviewed through consistent BATO photos, not random selfies.", descAr: "نتابع النتائج من خلال صور باتو الملتقطة بطريقة موحدة.", Icon: Camera },
    { titleEn: "Team-guided care", titleAr: "رعاية بإشراف الفريق", descEn: "You can message the Hair Team instead of a generic inbox.", descAr: "يمكنك مراسلة فريق الشعر مباشرة عبر القناة المخصصة له.", Icon: MessageSquare },
  ];

  const chips = isRTL
    ? ["النمط", "تاريخ الحالة", "المؤشرات الحيوية", "الخطوة التالية"]
    : ["Pattern", "History", "Biomarkers", "Next Step"];

  return (
    <div className="bato-hair-discovery space-y-5">

      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="bato-style-hero bato-hair-introduction relative overflow-hidden rounded-3xl p-5 min-[390px]:p-6"
        style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 55%, #2e2418 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 80% 10%, rgba(231,203,80,0.1) 0%, transparent 50%), radial-gradient(circle at 15% 85%, rgba(196,170,139,0.08) 0%, transparent 55%)" }} />
        <div className={`absolute ${isRTL ? "left-4" : "right-4"} bottom-4 opacity-10 pointer-events-none`}>
          <IlluHairGrowth size={100} color="#c4aa8b" />
        </div>
        <div className="relative z-10">
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-3" style={{ color: "rgba(196,170,139,0.7)" }}>{t("Your next step", "خطوتك التالية")}</p>
          <h2 className="text-white font-bold text-2xl mb-2 leading-snug">{t("Explore Bato’s Treatment", "تعرّف على علاج باتو")}</h2>
          <p className="text-sm leading-relaxed mb-7" style={{ color: "rgba(238,235,230,0.6)" }}>
            {t("Understand what’s affecting your hair and explore your next step with BATO.", "ابدأ بفهم ما يؤثر في شعرك، وتعرّف على خطوتك التالية مع باتو.")}
          </p>
          <div className="space-y-2.5 mb-6">
            {isExplorer && (
              <Button onClick={requestAssessment} className="w-full rounded-xl min-h-12 h-auto py-3 text-sm font-semibold border-0"
                style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
                {assessmentAction}
              </Button>
            )}
            <Button onClick={handleAskTeam} variant="outline" className="w-full rounded-xl h-11 text-sm font-semibold"
              style={{ borderColor: "rgba(196,170,139,0.4)", color: "#c4aa8b", background: "transparent" }}>
              {t("Connect with an advisor", "تواصل مع مرشد")}
            </Button>
            <button onClick={onStartAssessment} className="bato-hair-questionnaire w-full min-h-11 py-3 text-sm text-[#c4aa8b] underline underline-offset-4">{t("Share my concerns first (optional)", "شارك ما يشغلك أولاً (اختياري)")}</button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "rgba(238,235,230,0.45)" }}>
            <span>{appointment ? t("Your current appointment status is shown above.", "حالة موعدك الحالي موضحة أعلاه.") : t("Choose your preferred date and time. The clinic confirms availability.", "اختر التاريخ والوقت المفضلين. تؤكد العيادة توفر الموعد.")}</span>
            
          </div>
        </div>
      </motion.div>

      {/* ── DEEP DISCOVERY — labeled progressive disclosure; the CTA stays early in the hero ── */}
      <details className="bato-hair-details rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-[#333435]">
          {t("Learn more: how BATO approaches this journey", "اعرف المزيد: نهج باتو في هذه الرحلة")}
        </summary>
        <div className="bato-hair-details-body px-3 pb-4 space-y-5">
          <p className="bato-hair-expanded-intro text-sm leading-relaxed">{t("Want to understand whether Bato’s Treatment belongs in your hair-restoration plan? The hair team can review your concerns and history, explain the Hair Assessment, and discuss suitable next steps with you.", "هل تريد معرفة ما إذا كان علاج باتو مناسباً لخطة استعادة شعرك؟ يمكن لفريق الشعر مراجعة ما يشغلك وتاريخ حالتك، وشرح تقييم الشعر ومناقشة الخطوات المناسبة معك.")}</p>
          <p className="text-sm leading-relaxed">{t("You can share your concerns before your visit using the optional questionnaire.", "يمكنك مشاركة ما يشغلك قبل الزيارة عبر الأسئلة الاختيارية.")}</p>
      {/* ── WHAT BATO LOOKS AT ── */}
      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]">{t("What BATO looks at", "ما الذي يراجعه فريق باتو؟")}</p>
        <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-3">
          {LOOK_AT_ITEMS.map((item, idx) => (
            <motion.div key={item.labelEn} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="p-4 rounded-2xl bg-white border shadow-sm hover:shadow-md transition-shadow"
              style={{ borderColor: "rgba(196,170,139,0.15)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                style={{ background: "rgba(196,170,139,0.12)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <p className="text-sm font-semibold text-[#333435] mb-1">{isRTL ? item.labelAr : item.labelEn}</p>
              <p className="text-sm text-[#7c8689] leading-relaxed">{isRTL ? item.descAr : item.descEn}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHY ASSESSMENT COMES FIRST ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="rounded-2xl overflow-hidden border"
        style={{ borderColor: "rgba(196,170,139,0.2)", background: "linear-gradient(135deg, #faf9f7 0%, #f5f3ef 100%)" }}>
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-3">{t("Why assessment comes first", "لماذا يبدأ الأمر بالتقييم")}</p>
          <p className="text-base font-semibold text-[#333435] leading-snug mb-1.5">
            {t("Hair concerns can look similar — but the cause can be different.", "قد تبدو مشكلات الشعر متشابهة من الخارج — لكن السبب قد يكون مختلفًا.")}
          </p>
          <p className="text-sm text-[#7c8689] mb-4 leading-relaxed">
            {t("That's why BATO starts with assessment before recommending care.", "لهذا نبدأ في باتو بالتقييم قبل اقتراح العلاج.")}
          </p>
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <div key={chip} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(196,170,139,0.12)", border: "1px solid rgba(196,170,139,0.25)" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#c4aa8b" }} />
                <span className="text-xs font-medium" style={{ color: "#3a2e1e" }}>{chip}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]">{t("How it works", "كيف نبدأ؟")}</p>
        <div className="bg-white rounded-2xl border overflow-hidden divide-y"
          style={{ borderColor: "rgba(196,170,139,0.15)", "--tw-divide-opacity": 1 }}>
          {HOW_STEPS.map((item) => (
            <div key={item.step} className="flex gap-3 px-4 py-3.5 items-start"
              style={{ borderColor: "rgba(196,170,139,0.1)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(196,170,139,0.1)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "#c4aa8b" }}>{item.step}</span>
                  <p className="text-sm font-semibold text-[#333435]">{isRTL ? item.titleAr : item.titleEn}</p>
                </div>
                <p className="text-sm text-[#7c8689] leading-relaxed">{isRTL ? item.descAr : item.descEn}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── THE BATO HAIR APPROACH ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]">{t("The BATO hair approach", "نهج باتو للعناية بالشعر")}</p>
        <div className="grid grid-cols-1 gap-2">
          {APPROACH_ITEMS.map((item, idx) => (
            <motion.div key={item.titleEn} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.04 }}
              className="bg-white rounded-xl p-4 border flex gap-3 items-start"
              style={{ borderColor: "rgba(196,170,139,0.15)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,170,139,0.1)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#333435] mb-0.5">{isRTL ? item.titleAr : item.titleEn}</p>
                <p className="text-sm text-[#7c8689] leading-relaxed">{isRTL ? item.descAr : item.descEn}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>


      {/* The closing action follows the expanded reading, rather than duplicating the hero. */}
      {isExplorer && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bato-style-hero bato-closing-invitation relative overflow-hidden rounded-3xl p-6"
          style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, rgba(231,203,80,0.08) 0%, transparent 60%)" }} />
          <div className="relative z-10">
            <p className="text-white font-semibold text-base mb-1.5 leading-snug">
              {t("Ready to understand your hair concern?", "هل أنت مستعد لفهم حالة شعرك؟")}
            </p>
            <p className="text-xs mb-5" style={{ color: "rgba(238,235,230,0.5)" }}>
              {appointment ? t("View your appointment or ask an advisor what to expect.", "اعرض موعدك أو اسأل المرشد عما تتوقعه في الزيارة.") : t("Request a Hair Assessment, or connect with an advisor before deciding.", "اطلب تقييم الشعر، أو تواصل مع مرشد قبل اتخاذ القرار.")}
            </p>
            <div className="space-y-2">
              <Button onClick={requestAssessment} className="w-full rounded-xl min-h-12 h-auto py-3 text-sm font-semibold border-0"
                style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
                {assessmentAction}
              </Button>
              <Button onClick={handleAskTeam} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold"
                style={{ background: "transparent", color: "rgba(238,235,230,0.7)", border: "1px solid rgba(196,170,139,0.3)" }}>
                {t("Connect with an advisor", "تواصل مع مرشد")}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
        </div>
      </details>
    </div>
  );
}

// ─── Active full dossier view ─────────────────────────────────────────────────
function HairJourneyDossier({ user, activePackage, caseFile, sessions, packages, upcomingAppointments = [], onBook, onAskTeam }) {
  const { t, isRTL } = useLocation();
  const {used:sessionsUsed,total:totalSessions,progress,remaining}=programCounts(activePackage);
  const stageLabels = {
    initial_consultation: t("Assessment", "التقييم"),
    treatment_planned:    t("Planning", "التخطيط"),
    in_treatment:         t("Activation Phase", "مرحلة بدء العلاج"),
    post_treatment:       t("Post Treatment", "ما بعد العلاج"),
    completed:            t("Completed", "مكتمل"),
  };
  const stageKey = caseFile?.case_status || "pending";
  const stageName = stageLabels[stageKey] || t("Treatment details pending","بانتظار تحديث تفاصيل العلاج");


  // Care checklist
  const todayKey = new Date().toISOString().slice(0, 10);
  const storageKey = `hair_checklist_${user?.email}_${todayKey}`;
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "{}"); } catch { return {}; }
  });
  const toggleCheck = (key) => {
    const next = { ...checked, [key]: !checked[key] };
    setChecked(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };
  const doneCount = Object.values(checked).filter(Boolean).length;

  // Team notes
  const latestNote = sessions.find(s => s.specialist_notes);

  // Vitals from other packages
  const hasIron = packages.some(p => ["iron_ferritin_panel","iron_drip","ferinject"].includes(p.package_type));
  const hasHormones = packages.some(p => p.package_type === "hormone_panel");
  const hasVitD = packages.some(p => ["vitamin_mineral_panel","diagnostic_panel"].includes(p.package_type));

  // Calendar entries
  const completedSessions = sessions.slice().sort((a, b) => new Date(a.session_date) - new Date(b.session_date));

  return (
    <div className="space-y-4">

      {/* ── 1. HERO ── */}
      <HairJourneyHero
        activePackage={activePackage}
        caseFile={caseFile}
        sessions={sessions}
        onBook={onBook}
      />

      <section id="care-program" className="scroll-mt-24"><CustomerCareHub user={user} department="hair_restoration" programId={activePackage.id} journeyPage /></section>

      {/* ── 2. CASE PROFILE ── */}
      <HairCaseProfile caseFile={caseFile} />

      {/* ── 3. WHY THIS PLAN ── */}
      <SectionCard icon={FileText} title={t("Why This Plan", "لماذا هذه الخطة")} subtitle={t("How your programme was selected", "كيف تم اختيار برنامجك")}>
        <p className="text-sm text-[#7c8689] leading-relaxed mb-4">
          {t("This programme was selected based on your hair assessment, scalp condition, density pattern, treatment history, and goals.", "تم اختيار هذا البرنامج بناءً على تقييم شعرك وحالة فروة الرأس ونمط الكثافة وتاريخ العلاج وأهدافك.")}
        </p>
        <BulletList items={[
          t("Full scalp support was selected because the concern is not limited to one small area.", "اخترنا علاج كامل فروة الرأس لأن المشكلة لا تقتصر على منطقة واحدة."),
          t("Multiple sessions are required because hair response is gradual and needs consistency.", "تحتاج استجابة الشعر إلى عدة جلسات؛ فالتحسن تدريجي ويعتمد على الانتظام."),
          t("Progress will be reviewed through sessions, photos, scalp response, and team notes.", "سيُراجَع التقدم من خلال الجلسات والصور واستجابة فروة الرأس وملاحظات الفريق."),
          t("Support treatments may be added only when the team sees a clear reason.", "قد تُضاف علاجات دعم فقط عندما يرى الفريق سببًا واضحًا."),
          t("The goal is a structured programme — not random one-off treatments.", "الهدف خطة علاج منظمة، بدلاً من جلسات متفرقة دون خطة."),
        ]} />
      </SectionCard>

      {/* ── 4. TREATMENT GOALS ── */}
      <SectionCard icon={TrendingUp} title={t("Treatment Goals", "أهداف العلاج")} subtitle={t("Primary and secondary objectives", "الأهداف الرئيسية والثانوية")}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{t("Primary Goals", "الأهداف الرئيسية")}</p>
            <BulletList items={[
              t("Support visible density over the course of the programme.", "تحسين الكثافة الظاهرة خلال البرنامج."),
              t("Improve the scalp environment for healthier growth.", "تحسين بيئة فروة الرأس لنمو أكثر صحة."),
              t("Reduce uncontrolled shedding where possible.", "الحد من التساقط الزائد متى أمكن."),
              t("Build a consistent treatment rhythm.", "الانتظام في جدول العلاج"),
              t("Track progress with photos and team reviews.", "تتبع التقدم بالصور ومراجعات الفريق."),
            ]} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{t("Secondary Goals", "الأهداف الثانوية")}</p>
            <BulletList items={[
              t("Improve client confidence through structured, visible progress.", "تعزيز الثقة من خلال تحسن واضح يمكن متابعته."),
              t("Create a long-term maintenance plan after the core programme.", "وضع خطة للحفاظ على النتائج بعد البرنامج الأساسي."),
              t("Identify internal support needs if relevant to the hair case.", "تحديد العوامل الصحية التي قد تحتاج إلى دعم إذا كانت مرتبطة بحالة الشعر."),
            ]} />
          </div>
          <div className="p-3 rounded-xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
            <p className="text-sm text-[#7c8689] leading-relaxed italic">
              {t('"Hair progress is gradual. The goal is to track response over time — not judge the result from one mirror check."', "تحسن الشعر تدريجي. نتابع الاستجابة مع الوقت، ولا نحكم على النتيجة من نظرة واحدة في المرآة.")}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ── 5. COMPLETE TREATMENT PLAN ── */}
      <SectionCard icon={Package} title={t("Your Complete Treatment Plan", "خطة علاجك الكاملة")} subtitle={t("All components explained", "تفاصيل برنامجك")}>
        <p className="text-sm text-[#7c8689] mb-4 leading-relaxed">
          {t("Each component of your programme, its status, and its purpose.", "ما يتضمنه برنامجك والغرض من كل خطوة وحالتها.")}
        </p>
        <div className="space-y-2.5">
          {[
            { nameEn: "Hair Treatment Sessions", nameAr: "جلسات علاج الشعر", statusEn: "Included", statusAr: "ضمن البرنامج", purposeEn: "The main in-clinic protocol delivered across the programme.", purposeAr: "العلاج الأساسي الذي تتلقاه في العيادة خلال البرنامج.", whenEn: "Each scheduled session in the plan.", whenAr: "كل جلسة مجدولة في الخطة.", note: "" },
            { nameEn: "Scalp Preparation", nameAr: "تهيئة فروة الرأس", statusEn: "Included when needed", statusAr: "ضمن البرنامج عند الحاجة", purposeEn: "Helps keep the scalp environment clean and ready for treatment.", purposeAr: "يساعد في الحفاظ على بيئة فروة الرأس نظيفة وجاهزة للعلاج.", whenEn: "As needed before or between sessions.", whenAr: "عند الحاجة قبل الجلسات أو بينها.", note: "" },
            { nameEn: "PRP / Plasma Support", nameAr: "دعم بالبلازما (PRP)", statusEn: "Optional", statusAr: "اختياري", purposeEn: "Supportive treatment used only when the team believes it adds value.", purposeAr: "علاج داعم يُضاف عندما يرى الفريق فائدة لحالتك.", whenEn: "Prescribed by the team based on your case.", whenAr: "بحسب توصية الفريق وحالتك.", noteEn: "Not automatically included.", noteAr: "لا يُضاف تلقائياً إلى البرنامج." },
            { nameEn: "Hair Care Sessions", nameAr: "جلسات العناية بالشعر", statusEn: "Included or optional", statusAr: "ضمن البرنامج أو اختياري", purposeEn: "Supports scalp cleanliness, preparation, and aftercare.", purposeAr: "يدعم نظافة فروة الرأس والتهيئة والرعاية اللاحقة.", whenEn: "Depending on your plan type.", whenAr: "حسب نوع خطتك.", note: "" },
            { nameEn: "Progress Reviews", nameAr: "مراجعات التقدم", statusEn: "Included", statusAr: "ضمن البرنامج", purposeEn: "Team review of response, photos, and next steps.", purposeAr: "مراجعة الفريق للاستجابة والصور والخطوات التالية.", whenEn: "After the core programme sessions.", whenAr: "بعد جلسات البرنامج الأساسي.", note: "" },
            { nameEn: "Internal Support Review", nameAr: "مراجعة العوامل الصحية", statusEn: "Optional", statusAr: "اختياري", purposeEn: "Panels, ferritin, hormones, vitamin D, or drips if relevant to the hair case.", purposeAr: "تحاليل الفيريتين والهرمونات وفيتامين د أو المحاليل الوريدية عند ارتباطها بحالتك.", whenEn: "Only if the team identifies a relevant need.", whenAr: "إذا رأى الفريق حاجة لذلك.", noteEn: "Not required for every client.", noteAr: "غير مطلوب لكل عميل." },
            { nameEn: "Maintenance Planning", nameAr: "التخطيط للحفاظ على النتائج", statusEn: "Later stage", statusAr: "مرحلة لاحقة", purposeEn: "Long-term plan after the core programme.", purposeAr: "خطة طويلة الأمد بعد البرنامج الأساسي.", whenEn: "After completion of the core sessions.", whenAr: "بعد إتمام الجلسات الأساسية.", noteEn: "Defined at the progress review.", noteAr: "يُحدَّد في مراجعة التقدم." },
          ].map((c, i) => {
            const st = STATUS_STYLE[c.statusEn] || STATUS_STYLE["Optional"];
            return (
              <div key={i} className="bato-style-surface p-3 rounded-xl" style={{ background: "#f9f8f6", border: "1px solid rgba(196,170,139,0.08)" }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#333435]">{isRTL ? c.nameAr : c.nameEn}</p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}>
                    {isRTL ? c.statusAr : c.statusEn}
                  </span>
                </div>
                <p className="text-sm text-[#7c8689] leading-relaxed mb-1">{isRTL ? c.purposeAr : c.purposeEn}</p>
                <p className="text-xs text-[#7c8689]"><span className="font-medium">{t("When:", "متى:")} </span>{isRTL ? c.whenAr : c.whenEn}</p>
                {(c.noteEn || c.note) && <p className="text-xs" style={{ color: "rgba(196,170,139,0.7)" }}><CareText value={isRTL ? (c.noteAr || c.note) : (c.noteEn || c.note)} prose /></p>}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── 6. TREATMENT CALENDAR ── */}
      <BatoSectionIntro title={t("Your progress", "تقدمك")} description={t("Recorded sessions, photos and milestones", "الجلسات والصور والمراحل المسجلة")} />
        <section id="progress-history" className="scroll-mt-24"><SectionCard defaultOpen icon={Calendar} title={t("Treatment Calendar", "جدول العلاج")} subtitle={t("Dates, sessions, and milestones", "مواعيد الجلسات ومراحل البرنامج")}>
        <div className="space-y-4">
          {(activePackage?.start_date || caseFile?.start_date) && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{t("Programme Started", "بدأ البرنامج")}</p>
              <p className="text-sm text-[#333435] font-medium">
                {format(activePackage?.start_date || caseFile?.start_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})}
              </p>
            </div>
          )}

          {/* Completed sessions */}
          {completedSessions.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{t("Completed", "مكتملة")}</p>
              <div className="space-y-1.5">
                {completedSessions.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: "#c4aa8b" }}>
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                      <p className="text-sm text-[#333435]">{t("Session", "جلسة")} {s.session_number || i + 1}</p>
                    </div>
                    <p className="text-xs text-[#7c8689]">{format(s.session_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {sessionsUsed < totalSessions && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{t("Upcoming", "القادمة")}</p>
              <div className="space-y-1.5">
                {Array.from({ length: totalSessions - sessionsUsed }, (_, i) => {
                  const num = sessionsUsed + i + 1;
                  const isNext = i === 0;
                  return (
                    <div key={num} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center"
                          style={{ borderColor: isNext ? "#c4aa8b" : "rgba(196,170,139,0.3)" }}>
                          <div className={`w-2 h-2 rounded-full ${isNext ? "" : "opacity-30"}`}
                            style={{ background: "#c4aa8b" }} />
                        </div>
                        <p className="text-sm" style={{ color: isNext ? "#333435" : "#7c8689", fontWeight: isNext ? 600 : 400 }}>
                          {t("Session", "جلسة")} {num}
                          {isNext && (
                            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ background: "rgba(231,203,80,0.12)", color: "#3a2e1e", border: "1px solid rgba(231,203,80,0.25)" }}>
                              {t("Next", "التالية")}
                            </span>
                          )}
                        </p>
                      </div>
                      <p className="text-xs text-[#7c8689]">
                        {isNext && activePackage?.next_recommended_date
                          ? format(activePackage.next_recommended_date, isRTL ? "d MMM" : "MMM d", {locale:isRTL?ar:undefined})
                          : t("Expected after previous session", "متوقع بعد الجلسة السابقة")}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Milestones */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{t("Milestones", "مراحل البرنامج")}</p>
            <div className="space-y-1.5">
              {[
                { label: t("Progress Review", "مراجعة التقدم"), note: t("After Session", "بعد الجلسة") + " " + totalSessions, done: ["post_treatment","completed"].includes(stageKey) },
                { label: t("Maintenance Planning", "التخطيط للحفاظ على النتائج"), note: t("After core programme review", "بعد مراجعة البرنامج الأساسي"), done: stageKey === "completed" },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: m.done ? "#c4aa8b" : "#f9f8f6", border: m.done ? "none" : "1px solid rgba(196,170,139,0.2)" }}>
                      {m.done ? <CheckCircle2 className="w-3 h-3 text-white" /> : <Circle className="w-2.5 h-2.5" style={{ color: "rgba(196,170,139,0.3)" }} />}
                    </div>
                    <p className="text-sm" style={{ color: m.done ? "#333435" : "#7c8689" }}>{m.label}</p>
                  </div>
                  <p className="text-xs text-[#7c8689]">{m.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard></section>

      {/* ── 7. SESSION-BY-SESSION PLAN ── */}
      <SectionCard icon={ClipboardList} title={t("Session-by-Session Plan", "خطة الجلسات")} subtitle={t("What happens at each stage", "ما يحدث في كل مرحلة")}>
        <HairSessionPlan
          sessions={sessions}
          totalSessions={totalSessions}
          sessionsUsed={sessionsUsed}
          stageKey={stageKey}
          onBook={onBook}
          upcomingAppointments={upcomingAppointments}
          activePackage={activePackage}
        />
      </SectionCard>

      {/* ── 8. CURRENT PHASE DETAILS ── */}
      <SectionCard icon={Activity} title={`${t("Current Phase:", "المرحلة الحالية:")} ${stageName}`} subtitle={t("What's happening now", "ما يحدث الآن")}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{t("What is happening now", "ما يحدث الآن")}</p>
            <BulletList items={[
              t("The treatment rhythm is being established across sessions.", "الانتظام في الجلسات يساعد على بناء استجابة للعلاج."),
              t("The scalp response is being monitored by the team.", "يتابع الفريق استجابة فروة الرأس."),
              t("Visible change may still be early at this stage.", "قد يكون التحسن الظاهر ما زال في بدايته."),
              t("The team is watching consistency and overall response.", "يتابع الفريق انتظام الجلسات والاستجابة العامة."),
            ]} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{t("What is normal", "ما الذي قد تتوقعه؟")}</p>
            <BulletList items={[
              t("No major visible change yet — this is expected.", "قد لا يظهر تحسن كبير بعد في هذه المرحلة."),
              t("Mild scalp sensitivity after some sessions.", "حساسية خفيفة لفروة الرأس بعد بعض الجلسات."),
              t("Temporary shedding changes (contact your specialist if concerned).", "تغير مؤقت في التساقط؛ تواصل مع أخصائيك إذا كان يقلقك."),
              t("Slight dryness or oiliness depending on scalp type.", "جفاف أو دهنية خفيفة حسب نوع فروة الرأس."),
            ]} />
          </div>
          <div className="p-3 rounded-xl" style={{ background: "rgba(231,203,80,0.05)", border: "1px solid rgba(231,203,80,0.15)" }}>
            <p className="text-xs font-semibold mb-2" style={{ color: "#e7cb50" }}>{t("Contact your specialist if you notice:", "تواصل مع أخصائيك إذا لاحظت:")}</p>
            <BulletList items={[
              t("Strong irritation or unusual pain", "تهيج شديد أو ألم غير معتاد"),
              t("Heavy sudden shedding", "تساقط مفاجئ وغزير"),
              t("Redness that does not calm down within 48 hours", "احمرار لا يهدأ خلال 48 ساعة"),
              t("Unexpected reaction to products", "تفاعل غير متوقع مع المنتجات"),
              t("Unclear aftercare instructions", "تعليمات الرعاية اللاحقة غير واضحة"),
            ]} />
          </div>
        </div>
      </SectionCard>

      {/* ── 9. EXPECTATIONS TIMELINE ── */}
      <SectionCard icon={Clock} title={t("What To Expect Over Time", "ما الذي قد تتوقعه مع الوقت؟")} subtitle={t("Realistic, stage-by-stage guide", "دليل عام لمراحل العلاج")}>
        <p className="text-sm text-[#7c8689] mb-4 leading-relaxed">
          {t("Hair progress varies by person. This is a general guide. Your team will advise based on your individual response.", "يختلف التحسن من شخص لآخر. هذا دليل عام، وسيرشدك الفريق بحسب استجابتك.")}
        </p>
        <div className="space-y-3">
          {[
            { phaseEn: "Before Starting", phaseAr: "قبل البدء", descEn: "Assessment, photos, and programme selection. The team reviews your case and confirms the plan.", descAr: "التقييم والصور واختيار البرنامج. يراجع الفريق حالتك ويؤكد الخطة." },
            { phaseEn: "Sessions 1–2", phaseAr: "الجلسات 1–2", descEn: "Scalp preparation and early response. Visible change is usually minimal at this stage.", descAr: "تهيئة فروة الرأس والاستجابة المبكرة. التغيير الظاهر عادةً ضئيل في هذه المرحلة." },
            { phaseEn: "Sessions 3–4", phaseAr: "الجلسات 3–4", descEn: "Consistency phase. The team monitors shedding, scalp response, and early signs of progress.", descAr: "مرحلة الانتظام في العلاج. يتابع الفريق التساقط واستجابة فروة الرأس وعلامات التحسن المبكرة." },
            { phaseEn: "Sessions 5–6", phaseAr: "الجلسات 5–6", descEn: "Core programme completion. Progress photos and response are reviewed by the team.", descAr: "إتمام البرنامج الأساسي. يراجع الفريق صور التقدم والاستجابة." },
            { phaseEn: "After Core Programme", phaseAr: "بعد البرنامج الأساسي", descEn: "The team decides whether maintenance, renewal, additional support, or review-only is the right next step.", descAr: "يحدد الفريق الخطوة التالية: الحفاظ على النتائج أو تجديد البرنامج أو دعم إضافي أو المتابعة فقط." },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(196,170,139,0.12)" }}>
                <span className="text-[9px] font-bold" style={{ color: "#c4aa8b" }}>{i + 1}</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#333435]">{isRTL ? item.phaseAr : item.phaseEn}</p>
                <p className="text-sm text-[#7c8689] leading-relaxed">{isRTL ? item.descAr : item.descEn}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
          <p className="text-sm text-[#7c8689] italic leading-relaxed">
            {t('"Timelines vary by person. The team will guide you based on your response. We do not guarantee specific results."', '"تتفاوت الجداول الزمنية من شخص لآخر. سيرشدك الفريق بناءً على استجابتك. لا نضمن نتائج محددة."')}
          </p>
        </div>
      </SectionCard>

      {/* ── 10. PROGRESS TRACKING ── */}
      <SectionCard icon={TrendingUp} title={t("How We Track Progress", "كيف نتابع التقدم")} subtitle={t("Methods used across your journey", "كيف نتابع نتائجك خلال البرنامج")}>
        <p className="text-sm text-[#7c8689] mb-4 leading-relaxed">
          {t("Hair progress is not judged from one mirror check. It is tracked across sessions, photos, and response patterns.", "نتابع تحسن الشعر عبر الجلسات والصور واستجابتك للعلاج، ولا نحكم عليه من نظرة واحدة في المرآة.")}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            t("Session completion", "إتمام الجلسات"),
            t("Scalp response at each visit", "استجابة فروة الرأس في كل زيارة"),
            t("Shedding pattern (client reported + observed)", "نمط التساقط كما تصفه وكما يلاحظه الفريق"),
            t("Density appearance over time", "تغير الكثافة مع الوقت"),
            t("Progress photos (baseline and ongoing)", "صور قبل العلاج وصور المتابعة"),
            t("Team notes per session", "ملاحظات الفريق لكل جلسة"),
            t("Client feedback and comfort", "ملاحظات العميل وراحته"),
            t("Internal support markers if reviewed", "المؤشرات الصحية عند الحاجة إلى مراجعتها"),
          ].map((m, i) => (
            <div key={i} className="bato-style-surface flex items-start gap-2 p-2.5 rounded-xl" style={{ background: "#f9f8f6" }}>
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#c4aa8b" }} />
              <p className="text-sm text-[#333435] leading-relaxed">{m}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── 11. PROGRESS PHOTO TIMELINE ── */}
      <SectionCard icon={Camera} title={t("Progress Photo Timeline", "مواعيد صور المتابعة")} subtitle={t("Track your visual progress across consistent BATO photo check-ins", "قارن تقدمك من خلال صور باتو الملتقطة بطريقة موحدة")}>
        <ProgressPhotoTimeline
          userEmail={user?.email}
          sessions={sessions}
          onAskTeam={onAskTeam}
        />
      </SectionCard>

      {/* ── 12. SHEDDING TRACKER ── */}
      <SectionCard icon={Leaf} title={t("Shedding Tracker", "متابعة التساقط")} subtitle={t("Monitoring shedding across your journey", "تابع تغير التساقط خلال برنامجك")}>
        <div className="space-y-3">
          {[
            { label: t("Current Shedding Status", "حالة التساقط الحالية"), value: null },
            { label: t("Client-Reported Shedding", "التساقط المُبلَّغ عنه"), value: null },
            { label: t("Team Observation", "ملاحظة الفريق"), value: null },
            { label: t("Trend", "الاتجاه"), value: null },
            { label: t("Last Updated", "آخر تحديث"), value: latestNote?.session_date ? format(latestNote.session_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined}) : null },
          ].map(row => (
            <div key={row.label} className="flex items-start justify-between gap-3 py-2"
              style={{ borderBottom: "1px solid rgba(196,170,139,0.1)" }}>
              <p className="text-xs text-[#7c8689] w-[40%] shrink-0">{row.label}</p>
              <p className="text-sm font-medium text-start min-w-0 flex-1" style={{ color: row.value ? "#333435" : "rgba(124,134,137,0.7)" }}>
                {row.value || t("Not logged yet", "لم يُسجَّل بعد")}
              </p>
            </div>
          ))}
          <div className="p-3 rounded-xl mt-2" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
            <p className="text-sm text-[#7c8689] leading-relaxed italic">
              {t('"Temporary changes in shedding can happen during a hair journey. Your team will help you understand what is normal for your case."', "قد يتغير معدل التساقط مؤقتاً خلال العلاج. يساعدك الفريق على فهم ما هو متوقع في حالتك.")}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* ── 13. SCALP STATUS ── */}
      <SectionCard icon={Activity} title={t("Scalp Status", "حالة فروة الرأس")} subtitle={t("Scalp condition overview", "نظرة عامة على حالة فروة الرأس")}>
        <div className="space-y-0">
          {[
            { label: t("Scalp Condition", "حالة فروة الرأس"), value: null },
            { label: t("Sensitivity", "الحساسية"), value: null },
            { label: t("Oiliness / Dryness", "الدهنية / الجفاف"), value: null },
            { label: t("Irritation", "التهيج"), value: null },
            { label: t("Buildup", "تراكم المنتجات على فروة الرأس"), value: null },
            { label: t("Product Tolerance", "تحمُّل المنتجات"), value: null },
            { label: t("Last Reviewed", "آخر مراجعة"), value: latestNote?.session_date ? format(latestNote.session_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined}) : null },
          ].map(row => (
            <div key={row.label} className="flex items-start justify-between gap-3 py-2.5"
              style={{ borderBottom: "1px solid rgba(196,170,139,0.1)" }}>
              <p className="text-xs text-[#7c8689] w-[40%] shrink-0">{row.label}</p>
              <p className="text-sm font-medium text-start min-w-0 flex-1"
                style={{ color: row.value ? "#333435" : "rgba(124,134,137,0.7)" }}>
                {row.value || t("To be updated by your hair team.", "سيحدّث فريق الشعر هذه المعلومات.")}
              </p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── 14. CARE RULES ── */}
      <BatoSectionIntro title={t("Care and support", "العناية والدعم")} />
      <SectionCard icon={ShieldCheck} title={t("Care Rules", "تعليمات العناية")} subtitle={t("Before, after, and at home", "قبل الجلسة وبعدها وفي المنزل")}>
        <div className="space-y-5">
          {[
            {
              heading: t("Before Your Session", "قبل جلستك"),
              items: [
                t("Follow the team's preparation instructions.", "اتبع تعليمات التحضير الخاصة بالفريق."),
                t("Avoid unapproved topical products 24h before your session.", "تجنب المنتجات الموضعية غير المعتمدة 24 ساعة قبل جلستك."),
                t("Arrive with your scalp condition as instructed.", "حضّر فروة رأسك بحسب تعليمات الفريق."),
                t("Contact your specialist if you have any irritation or concerns before attending.", "تواصل مع أخصائيك قبل الحضور إذا لاحظت تهيجاً أو كان لديك سؤال."),
              ],
            },
            {
              heading: t("After Your Session", "بعد جلستك"),
              items: [
                t("Follow washing instructions provided by your specialist.", "اتبع تعليمات الغسيل التي قدّمها مختصك."),
                t("Avoid intense sweating if advised.", "تجنب التعرق الشديد إذا نُصحت بذلك."),
                t("Avoid scratching or rubbing the scalp.", "تجنب حك فروة الرأس أو فركها."),
                t("Report unusual reactions to the team.", "أبلغ الفريق عن أي تفاعلات غير عادية."),
              ],
            },
            {
              heading: t("Home Routine", "الروتين المنزلي"),
              items: [
                t("Use BATO-approved or prescribed products only.", "استخدم منتجات باتو المعتمدة أو المنتجات الموصوفة لك فقط."),
                t("Follow timing and application instructions.", "اتبع تعليمات وقت الاستخدام وطريقته."),
                t("Keep your routine consistent between sessions.", "التزم بروتين العناية بين الجلسات."),
                t("Do not add new products without checking with your specialist.", "اسأل أخصائيك قبل إضافة منتج جديد."),
              ],
            },
            {
              heading: t("Things To Avoid", "أشياء يجب تجنبها"),
              items: [
                t("Skipping sessions without rescheduling — consistency matters.", "تفويت الجلسات دون حجز موعد بديل؛ الانتظام مهم."),
                t("Mixing treatments or products without team approval.", "خلط العلاجات أو المنتجات دون موافقة الفريق."),
                t("Harsh scalp products or chemical treatments.", "منتجات فروة الرأس القاسية أو العلاجات الكيميائية."),
                t("Judging your progress too early — the team tracks this properly.", "الحكم على النتائج مبكراً؛ يتابع الفريق التحسن خلال البرنامج."),
              ],
            },
          ].map(group => (
            <div key={group.heading}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{group.heading}</p>
              <BulletList items={group.items} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── 15. DAILY CARE CHECKLIST ── */}
      <SectionCard icon={CheckCircle2} title={t("Daily Care Checklist", "قائمة الرعاية اليومية")} subtitle={t("Track today's routine", "تابع روتين اليوم")} defaultOpen>
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#7c8689]">{t("Today's routine", "روتين اليوم")}</span>
            <span className="font-semibold" style={{ color: "#c4aa8b" }}>{doneCount} / 5 {t("done", "مكتمل")}</span>
          </div>
          <div className="bato-progress-track h-1.5 rounded-full overflow-hidden bg-[#f9f8f6]">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(doneCount / 5) * 100}%`, background: "linear-gradient(to right, #c4aa8b, #e7cb50)" }} />
          </div>
        </div>
        <div className="space-y-2">
          {[
            { key: "wash",       label: t("Scalp wash with prescribed shampoo", "غسل فروة الرأس بالشامبو الموصوف") },
            { key: "serum",      label: t("Apply serum as directed", "استخدام السيروم بحسب التعليمات") },
            { key: "avoid_heat", label: t("Avoid heat styling tools", "تجنب أدوات التصفيف بالحرارة") },
            { key: "hydrate",    label: t("Stay well hydrated", "شرب كمية كافية من الماء") },
            { key: "no_scratch", label: t("Avoid scratching the scalp", "تجنب حك فروة الرأس") },
          ].map(item => (
            <button key={item.key} onClick={() => toggleCheck(item.key)}
              className="w-full flex items-center gap-3 p-2.5 rounded-xl transition-colors text-start"
              style={{ background: checked[item.key] ? "rgba(196,170,139,0.08)" : "#f9f8f6" }}>
              <div className="w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0"
                style={{ borderColor: checked[item.key] ? "#c4aa8b" : "rgba(196,170,139,0.3)", background: checked[item.key] ? "#c4aa8b" : "transparent" }}>
                {checked[item.key] && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
              <p className="text-sm" style={{ color: checked[item.key] ? "#7c8689" : "#333435", textDecoration: checked[item.key] ? "line-through" : "none" }}>
                {item.label}
              </p>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* ── 16. PRODUCT ROUTINE ── */}
      <SectionCard icon={Sparkles} title={t("Product Routine", "روتين المنتجات")} subtitle={t("Your assigned home care products", "منتجات العناية المنزلية المخصصة لك")}>
        <div className="text-center py-4">
          <div className="flex justify-center mb-2">
            <IlluHairCare size={60} color="#c4aa8b" />
          </div>
          <p className="text-sm text-[#7c8689]">{t("No product routine assigned yet.", "لم يُحدَّد روتين منتجات بعد.")}</p>
          <p className="text-xs text-[#7c8689] mt-1">{t("Your team will update this after your next review.", "سيُحدِّث فريقك هذا بعد مراجعتك التالية.")}</p>
        </div>
      </SectionCard>

      {/* ── 17. INTERNAL SUPPORT ── */}
      <SectionCard icon={Droplets} title={t("Internal Support For Hair", "دعم صحة الشعر من الداخل")} subtitle={t("Internal health markers relevant to hair", "المؤشرات الصحية الداخلية ذات الصلة بالشعر")}>
        <p className="text-sm text-[#7c8689] mb-4 leading-relaxed">
          {t("Internal support may be reviewed if the team believes it could affect your hair journey. It is not required for every client.", "قد يراجع الفريق العوامل الصحية إذا كانت مرتبطة بحالة شعرك. لا يحتاج كل عميل إلى هذه الخطوة.")}
        </p>
        <div className="space-y-2.5">
          {[
            { label: t("Iron & Ferritin", "الحديد والفيريتين"), active: hasIron },
            { label: t("Hormones", "الهرمونات"), active: hasHormones },
            { label: t("Vitamin D", "فيتامين د"), active: hasVitD },
            { label: t("Thyroid", "الغدة الدرقية"), active: false },
            { label: t("Drip Support", "دعم بالمحاليل الوريدية"), active: packages.some(p => ["iron_drip","ferinject","glutathione_drip","iv_therapy"].includes(p.package_type)) },
          ].map(item => {
            const s = item.active
              ? { label: t("Reviewed", "تمت المراجعة"), bg: "rgba(196,170,139,0.12)", color: "#3a2e1e", border: "rgba(196,170,139,0.3)" }
              : { label: t("Not reviewed", "لم تُراجَع"), bg: "#f9f8f6", color: "#7c8689", border: "rgba(124,134,137,0.15)" };
            return (
              <div key={item.label} className="bato-style-surface flex items-center justify-between p-2.5 rounded-xl"
                style={{ background: "#f9f8f6" }}>
                <p className="text-sm text-[#333435]">{item.label}</p>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── 18. TEAM NOTES ── */}
      <SectionCard icon={MessageSquare} title={t("Team Notes", "ملاحظات الفريق")} accent>
        {latestNote ? (
          <div>
            <div className="p-4 rounded-xl mb-3" style={{ background: "rgba(231,203,80,0.05)", border: "1px solid rgba(231,203,80,0.15)" }}>
              <p className="text-sm text-[#333435] leading-relaxed italic">"{latestNote.specialist_notes}"</p>
            </div>
            <div className="flex items-center justify-between text-xs text-[#7c8689]">
              {latestNote.specialist_name && <span>— {latestNote.specialist_name}</span>}
              {latestNote.session_date && <span>{format(latestNote.session_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})}</span>}
            </div>
            {sessions.filter(s => s.specialist_notes).length > 1 && (
              <div className="mt-3 pt-3 space-y-2" style={{ borderTop: "1px solid rgba(196,170,139,0.12)" }}>
                <p className="text-xs font-semibold" style={{ color: "#c4aa8b" }}>{t("Earlier notes", "ملاحظات سابقة")}</p>
                {sessions.filter(s => s.specialist_notes).slice(1).map((s, i) => (
                  <div key={i} className="bato-style-surface p-2.5 rounded-lg" style={{ background: "#f9f8f6" }}>
                    <p className="text-xs text-[#333435] italic mb-1"><CareText value={s.specialist_notes} prose /></p>
                    <p className="text-xs text-[#7c8689]">
                      {s.specialist_name && `${s.specialist_name} · `}
                      {s.session_date && format(s.session_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="flex justify-center mb-2">
              <IlluMessages size={52} color="#c4aa8b" />
            </div>
            <p className="text-sm text-[#7c8689]">{t("No team notes yet.", "لا توجد ملاحظات للفريق بعد.")}</p>
            <p className="text-xs text-[#7c8689] mt-0.5">{t("Updates will appear after your next review.", "ستظهر التحديثات بعد مراجعتك التالية.")}</p>
          </div>
        )}
      </SectionCard>

      {/* ── 19. QUESTIONS TO ASK ── */}
      <SectionCard icon={HelpCircle} title={t("Questions to ask your specialist", "أسئلة لطرحها على أخصائيك")} subtitle={t("Suggested at your next session", "مقترحة لجلستك القادمة")}>
        <div className="space-y-2 mb-4">
          {[
            t("Is my shedding normal at this stage?", "هل تساقطي طبيعي في هذه المرحلة؟"),
            t("When should I expect visible progress?", "متى يجب أن أتوقع تقدمًا ظاهرًا؟"),
            t("Should I take progress photos now?", "هل يجب أن ألتقط صور التقدم الآن؟"),
            t("Do I need internal panels?", "هل أحتاج إلى تحاليل؟"),
            t("Can I wash my hair today?", "هل يمكنني غسل شعري اليوم؟"),
            t("What happens if I miss a session?", "ماذا يحدث إذا فاتتني جلسة؟"),
            t("What should I avoid after treatment?", "ما الذي يجب تجنبه بعد العلاج؟"),
          ].map((q, i) => (
            <div key={i} className="bato-style-surface flex items-start gap-2.5 p-2.5 rounded-xl" style={{ background: "#f9f8f6" }}>
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#c4aa8b" }} />
              <p className="text-sm text-[#333435]">{q}</p>
            </div>
          ))}
        </div>
        <Button onClick={onAskTeam} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0"
          style={{ background: "rgba(196,170,139,0.12)", color: "#3a2e1e" }}>
          <MessageSquare className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
          {t("Contact your specialist", "تواصل مع أخصائيك")}
        </Button>
      </SectionCard>

      {/* ── 20. AFTER THE CORE PROGRAMME ── */}
      <SectionCard icon={Clock} title={t("After The Core Programme", "بعد البرنامج الأساسي")} subtitle={t("What happens next", "ما الذي يحدث بعد ذلك")}>
        <p className="text-sm text-[#7c8689] mb-4 leading-relaxed">
          {t("After the core sessions are complete, the team reviews your response and recommends the next path.", "بعد اكتمال الجلسات الأساسية، يراجع الفريق استجابتك ويوصي بالمسار التالي.")}
        </p>
        <div className="space-y-2.5">
          {[
            { labelEn: "Maintenance Plan", labelAr: "خطة الحفاظ على النتائج", descEn: "Scheduled sessions to sustain results long-term.", descAr: "جلسات مجدولة للحفاظ على النتائج على المدى الطويل." },
            { labelEn: "Renew Protocol", labelAr: "تجديد البرنامج", descEn: "A targeted renewal if the team sees further benefit.", descAr: "تجديد علاج المناطق المحددة إذا رأى الفريق فائدة إضافية." },
            { labelEn: "Additional Sessions", labelAr: "جلسات إضافية", descEn: "If more sessions are needed based on response.", descAr: "إذا كانت هناك حاجة لمزيد من الجلسات بناءً على الاستجابة." },
            { labelEn: "Internal Support Review", labelAr: "مراجعة العوامل الصحية", descEn: "If internal factors are relevant to the ongoing case.", descAr: "إذا كانت العوامل الصحية الداخلية مرتبطة بحالتك." },
            { labelEn: "Progress Review Only", labelAr: "مراجعة التقدم فقط", descEn: "If results are stable and no immediate action is needed.", descAr: "إذا كانت النتائج مستقرة ولا يلزم اتخاذ أي إجراء فوري." },
          ].map(p => (
            <div key={p.labelEn} className="bato-style-surface p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
              <p className="text-sm font-semibold text-[#333435] mb-0.5">{isRTL ? p.labelAr : p.labelEn}</p>
              <p className="text-xs text-[#7c8689]">{isRTL ? p.descAr : p.descEn}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
          <p className="text-xs text-[#7c8689] italic">
            {t("The next path is determined by your team based on your actual response — not automatically offered.", "يحدد الفريق الخطوة التالية بحسب استجابتك الفعلية، ولا تُضاف تلقائياً.")}
          </p>
        </div>
      </SectionCard>

      {/* ── 21. FAQ ── */}
      <SectionCard icon={HelpCircle} title={t("Frequently Asked Questions", "الأسئلة الشائعة")} subtitle={t("Common questions about the hair journey", "أسئلة شائعة حول رحلة الشعر")}>
        <HairFAQ />
      </SectionCard>

      {/* ── 22. DOCUMENTS ── */}
      <SectionCard icon={FileText} title={t("Documents", "المستندات")} subtitle={t("Treatment summary and aftercare files", "ملخص العلاج وملفات الرعاية اللاحقة")}>
        <div className="text-center py-5">
          <div className="flex justify-center mb-2">
            <IlluChecklist size={56} color="#c4aa8b" />
          </div>
          <p className="text-sm text-[#7c8689]">{t("No documents available yet.", "لا توجد مستندات متاحة بعد.")}</p>
          <p className="text-xs text-[#7c8689] mt-1">{t("Treatment summaries, aftercare guides, and reports will appear here.", "ستظهر هنا ملخصات العلاج وأدلة الرعاية اللاحقة والتقارير.")}</p>
        </div>
      </SectionCard>

      {/* ── 23. CTA FOOTER ── */}
      <div className="bato-style-hero relative overflow-hidden rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, rgba(231,203,80,0.08) 0%, transparent 60%)" }} />
        <div className="absolute right-4 bottom-3 opacity-10 pointer-events-none">
          <IlluHairGrowth size={80} color="#c4aa8b" />
        </div>
        <div className="relative z-10">
          <p className="text-white font-semibold text-sm mb-1">{t("Ready for your next session?", "هل أنت مستعد لجلستك القادمة؟")}</p>
          <p className="text-xs mb-4" style={{ color: "rgba(238,235,230,0.55)" }}>{t("Keep your journey moving forward.", "واصل برنامجك وتابع تقدمك.")}</p>
          <div className="space-y-2">
            {remaining > 0 && (<Button onClick={onBook} className={`w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0 `}
              style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("Request Session", "اطلب جلسة")} {sessionsUsed + 1}
            </Button>)}
            <Button onClick={onAskTeam} className={`w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold `}
              style={{ background: "transparent", color: "rgba(238,235,230,0.8)", border: "1px solid rgba(196,170,139,0.3)" }}>
              <MessageSquare className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {t("Contact your specialist", "تواصل مع أخصائيك")}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}

// ─── Page entry point ─────────────────────────────────────────────────────────
export default function HairJourney() {
  const routerLocation=useRouterLocation();
  const [programParams] = useSearchParams();
  const { user: contextUser, isLoadingAuth } = useAuth();
  // Resolve the SDK's signed-in session locally, just as Dashboard does.
  // Builder previews may have a session without a user in AuthContext.
  const accountQuery = useQuery({
    queryKey: ["hairJourneyAccount"],
    queryFn: () => base44.auth.me(),
    enabled: !isLoadingAuth && !contextUser,
    retry: 1,
    gcTime: 0,
    refetchOnMount: "always",
  });
  const user = contextUser || (!accountQuery.isFetching ? accountQuery.data : null);
  const [showBooking, setShowBooking] = useState(false);
  const queryClient = useQueryClient();
  const { isRTL, t } = useLocation();
  const navigate = useNavigate();

  const handleAskTeam = () => {
    navigate("/Messages?channel=hair_team&context=hair_review");
  };

  const handleStartAssessment = () => {
    navigate("/HairAssessment?source=hair_journey");
  };

  const { data: caseFiles = [], isLoading: caseFileLoading, isError: caseFileError } = useQuery({
    queryKey: ["journeyCaseFiles", user?.email, "hair_restoration"],
    queryFn: async () => { const c = await base44.entities.CaseFile.filter({ client_email: user.email, primary_department: "hair_restoration" }, "-created_date"); return c; },
    enabled: !!user, initialData: undefined, retry: 1, staleTime: 1000 * 60,
  });
  const { data: sessions = [], isPending: sessionsLoading, isError: sessionsError } = useQuery({
    queryKey: ["hairSessions", user?.email],
    queryFn: () => loadCompletedTreatmentSessions(user.email).then(rows=>rows.filter(row=>row.department==="hair_restoration")),
    enabled: !!user,
  });
  const { data: packages = [], isPending: packagesPending, isError: packagesError } = useQuery({
    queryKey: ["packages", user?.email, "hairJourney"],
    queryFn: () => base44.entities.Package.filter({ client_email: user.email }, "-created_date"),
    enabled: !!user, retry: 1, staleTime: 1000 * 60,
  });
  const { data: upcomingAppointments = [], isPending: appointmentsLoading, isError: appointmentsError } = useQuery({
    queryKey: ["upcomingAppointments", user?.email, "hair_restoration"],
    queryFn: async () => {
      const apts = await base44.entities.Appointment.filter({ client_email: user.email, department: "hair_restoration" }, "-appointment_date");
      return apts.filter(a => ["requested", "scheduled", "confirmed"].includes(a.status) && new Date(a.appointment_date) > new Date()).sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date)).slice(0, 3);
    },
    enabled: !!user,
  });

  const { data: batoProfile } = useQuery({
    queryKey: ["batoProfile", user?.email],
    queryFn: () => base44.entities.BATOProfile.filter({ client_email: user.email }).then(p => p[0] || null),
    enabled: !!user,
    initialData: null,
  });

  const hairPackages = packages.filter(p => programDepartment(p) === "hair_restoration");
  const displayedPackage = hairPackages.find(p => p.id === programParams.get("program")) || hairPackages.find(p => p.status === "active") || hairPackages[0] || null;
  const activePackage = displayedPackage?.status === "active" ? displayedPackage : null;
  const caseFile = caseForProgram(caseFiles,displayedPackage,packages);
  const hasQueryError = (!contextUser && accountQuery.isError) || caseFileError || packagesError || sessionsError || appointmentsError;

  useEffect(()=>{
    if(caseFileLoading || packagesPending || sessionsLoading || appointmentsLoading)return;
    const id=routerLocation.hash.slice(1);
    if(!id)return;
    const frame=requestAnimationFrame(()=>{
      const section=document.getElementById(id);
      if(section){section.querySelector("details")?.setAttribute("open","");section.scrollIntoView({block:"start"});}
    });
    return ()=>cancelAnimationFrame(frame);
  },[routerLocation.hash,caseFileLoading,packagesPending,sessionsLoading,appointmentsLoading]);

  if (isLoadingAuth || (!contextUser && (accountQuery.isPending || accountQuery.isFetching)) || (!!user && (caseFileLoading || packagesPending || sessionsLoading || appointmentsLoading))) {
    return <JourneySkeleton isRTL={isRTL} />;
  }

  if (!packagesPending && programParams.get("program") && !hairPackages.some(p=>p.id===programParams.get("program"))) return <div role="alert" className="p-6 space-y-3"><p>{t("This program is not available in your care records.","هذا البرنامج غير متاح في سجلات رعايتك.")}</p><button className="underline py-3" onClick={()=>navigate("/HairJourney")}>{t("View my journey","عرض رحلتي")}</button></div>;

  // Query error fallback
  if (hasQueryError) {
    return (
      <div className={`min-h-screen pb-10 flex items-center justify-center ${isRTL ? "text-right" : "text-left"}`} style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-md text-center px-4">
          <h2 className="text-lg font-bold text-[#333435] mb-2">{t("Something went wrong", "حدث خطأ ما")}</h2>
          <p className="text-sm text-[#7c8689] mb-5">{t("We couldn't load your hair journey. Try refreshing the page or message Customer service for help.", "لم نتمكن من تحميل رحلة شعرك. حاول تحديث الصفحة أو راسل خدمة العملاء للمساعدة.")}</p>
          <div className="space-y-2">
            <button onClick={() => window.location.reload()} className="w-full px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              {t("Refresh Page", "تحديث الصفحة")}
            </button>
            <button onClick={() => navigate("/Messages?channel=client_care&context=error")} className="w-full px-4 py-2 rounded-lg text-sm font-semibold" style={{ background: "transparent", color: "#c4aa8b", border: "1px solid #c4aa8b" }}>
              {t("Message Customer service", "راسل خدمة العملاء")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`hair-glass-page relative min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`}
      style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      {/* Ambient warm backdrop — gives the frosted cards something to catch */}
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(231,203,80,0.16) 0%, transparent 70%)" }} />
        <div className="absolute top-1/3 -right-28 w-80 h-80 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(196,170,139,0.24) 0%, transparent 70%)" }} />
        <div className="absolute bottom-0 left-1/4 w-72 h-72 rounded-full"
          style={{ background: "radial-gradient(circle, rgba(196,170,139,0.18) 0%, transparent 70%)" }} />
      </div>
      <div className="relative z-10 max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Header */}
        <div className="bato-page-heading grid grid-cols-1 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#333435]">{displayedPackage ? t("Hair Journey", "رحلة الشعر") : t("Hair Assessment", "تقييم الشعر")}</h1>
            <p className="text-xs text-[#7c8689]">
              {activePackage
                ? t("Your complete hair treatment plan, timeline, and progress", "خطة علاج شعرك الكاملة والجدول الزمني وسجل التقدم")
                : displayedPackage ? t("Your recorded care history.","سجل رعايتك المسجل.") : t("Understand your hair concern before starting treatment.", "افهم حالة شعرك قبل البدء بالعلاج.")}
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full mt-0.5 flex-shrink-0"
            style={activePackage
              ? { background: "rgba(196,170,139,0.15)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.35)" }
              : { background: "#f9f8f6", color: "#7c8689", border: "1px solid rgba(124,134,137,0.2)" }}>
            {activePackage ? t("Active Programme", "برنامج نشط") : displayedPackage ? t("Care History", "سجل الرعاية") : t("Explore options", "استكشف الخيارات")}
          </span>
        </div>

        {!activePackage&&<section id="care-program" className="scroll-mt-24"><CustomerCareHub user={user} department="hair_restoration" programId={displayedPackage?.id} journeyPage /></section>}
        {/* Main content */}
        {activePackage
          ? <HairJourneyDossier
              user={user}
              activePackage={activePackage}
              caseFile={caseFile}
              sessions={sessionsForProgram(sessions,activePackage,packages)}
              packages={packages}
              upcomingAppointments={appointmentsForProgram(upcomingAppointments,activePackage,packages)}
              onBook={() => setShowBooking(true)}
              onAskTeam={handleAskTeam}
            />
          : displayedPackage ? <ProgramHistory program={displayedPackage} sessions={sessionsForProgram(sessions,displayedPackage,packages)} /> : <HairJourneyExplore user={user} isRTL={isRTL} t={t} onStartAssessment={handleStartAssessment} batoProfile={batoProfile} appointment={upcomingAppointments[0]} />
        }
      </div>

      {user && activePackage && (
        <BookingCalendar
          open={showBooking}
          onClose={() => setShowBooking(false)}
          userEmail={user.email}
          packageData={activePackage}
          department="hair_restoration" appointmentType="treatment"
          onBookingSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["packages"] });
            setShowBooking(false);
          }}
        />
      )}

      {/* Modal replaced by /HairAssessment route */}
    </div>
  );
}