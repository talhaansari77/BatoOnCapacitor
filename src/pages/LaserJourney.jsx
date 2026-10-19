import SectionCard from "@/components/design/JourneySectionCard";
import BatoSectionIntro from "@/components/design/BatoSectionIntro";
import {loadCompletedTreatmentSessions} from "@/lib/treatmentSessions";
import {caseForProgram, careAppointments} from "@/lib/customerCare";
import { format } from "@/lib/customerFormatting";
import CustomerCareHub from "@/components/care/CustomerCareHub";
import {ar} from "date-fns/locale";
import ProgramHistory from "@/components/dashboard/ProgramHistory";
import {programDepartment,programCounts,sessionsForProgram,appointmentsForProgram} from "@/lib/carePrograms";
import CareText from "@/components/CareText";
import React, { useId, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/AuthContext";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { Button } from "@/components/ui/button";
import {
  Calendar, CheckCircle2, Circle, ChevronDown, ChevronUp,
  Camera, MessageSquare, ShieldCheck, Zap, ClipboardList,
  User, TrendingUp, Package, FileText, HelpCircle, Clock,
  Search, Layers, Sun, Sparkles, AlertCircle
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useLocation } from "../components/LocationContext";
import BookingCalendar from "../components/appointments/BookingCalendar";
import { JourneySkeleton } from "../components/ui/BatoSkeleton";


const PLAN_COMPONENTS = [
  { name: "Laser Treatment Sessions", status: "Included", purpose: "Core laser sessions targeting hair follicles or the specified skin area.", when: "Each scheduled session in the programme." },
  { name: "Skin Preparation", status: "Included when needed", purpose: "Ensuring the skin is ready for treatment (no tan, no active irritation).", when: "Before each session as advised." },
  { name: "Patch Test", status: "Included", purpose: "Safety test on a small area before beginning the full programme.", when: "Before the first full session." },
  { name: "Progress Reviews", status: "Included", purpose: "Team reviews reduction progress and adjusts settings if needed.", when: "Periodically throughout the programme." },
  { name: "Maintenance Sessions", status: "Later stage", purpose: "Occasional sessions after the core programme to maintain results.", when: "Every 4–8 weeks depending on response.", note: "Maintenance needs vary by person." },
  { name: "Tattoo Removal (if applicable)", status: "Optional", purpose: "Laser removal of unwanted tattoo ink using targeted sessions.", when: "Only if part of your specific plan." },
];

const STATUS_STYLE = {
  "Included":             { bg: "rgba(196,170,139,0.12)", color: "#3a2e1e", border: "rgba(196,170,139,0.3)" },
  "Included when needed": { bg: "rgba(196,170,139,0.08)", color: "#3a2e1e", border: "rgba(196,170,139,0.2)" },
  "Optional":             { bg: "#f9f8f6", color: "#7c8689", border: "rgba(124,134,137,0.18)" },
  "Later stage":          { bg: "#f9f8f6", color: "#7c8689", border: "rgba(124,134,137,0.15)" },
};

const TIMELINE_EXPECTATIONS = [
  { phase: "Before Starting", desc: "Patch test, skin assessment, and programme confirmation. Avoid sun and waxing before sessions." },
  { phase: "Sessions 1–2", desc: "Early reduction phase. Some hair may appear to grow before shedding. This is normal." },
  { phase: "Sessions 3–4", desc: "Visible reduction begins for most clients. The team adjusts settings based on response." },
  { phase: "Sessions 5–6", desc: "Continued reduction. Finer, lighter, and sparser regrowth is typical." },
  { phase: "Sessions 7+", desc: "Core programme completion. Most clients see significant long-term reduction." },
  { phase: "After Core Programme", desc: "Maintenance sessions may be recommended every 4–8 weeks depending on your response." },
];

const LASER_FAQS = [
  { q: "Is laser hair removal permanent?", a: "Laser provides long-term significant reduction, not always 100% permanent. Results vary by skin type, hair colour, and area. Maintenance sessions may be needed." },
  { q: "Does it hurt?", a: "Sensation varies. Most clients describe it as a mild snap or warmth. Modern lasers use cooling technology to minimise discomfort." },
  { q: "Can I shave between sessions?", a: "Yes, shaving is allowed between sessions. Do not wax, thread, pluck, or use depilatory creams — these disrupt the follicle the laser needs to target." },
  { q: "Can I go in the sun before treatment?", a: "Avoid tanning and direct sun exposure on the treated area for at least 4 weeks before each session. Tanned skin increases the risk of side effects." },
  { q: "How many sessions will I need?", a: "Typically 6–10 sessions depending on the area, hair type, and individual response. Your specialist will advise based on your progress." },
  { q: "What if I miss a session?", a: "Reschedule as soon as possible. Delays between sessions can affect the overall programme effectiveness." },
  { q: "Is it safe for all skin tones?", a: "Modern laser technology can treat a wider range of skin tones. Your specialist will assess suitability at your initial consultation." },
  { q: "What happens after the programme?", a: "Most clients move to occasional maintenance sessions. The team will advise your specific maintenance schedule after reviewing your results." },
  { q: "Can I exercise after a session?", a: "Avoid intense exercise and heat (saunas, steam) for 24–48 hours after treatment to reduce irritation risk." },
  { q: "When should I contact your specialist?", a: "If you experience blistering, prolonged redness beyond 48 hours, unusual skin texture changes, or any unexpected reaction." },
];

const CARE_RULES = [
  {
    heading: "Before Your Session",
    items: [
      "Shave the area 24 hours before your session.",
      "Avoid sun exposure and tanning on treated areas for at least 4 weeks prior.",
      "Do not wax, thread, or pluck — only shave between sessions.",
      "Arrive with clean skin — no heavy creams, deodorants, or makeup on treatment areas.",
      "Inform your specialist of any new medications, skincare, or sun exposure.",
    ],
  },
  {
    heading: "After Your Session",
    items: [
      "Apply aloe vera or prescribed soothing cream if recommended.",
      "Avoid sun exposure and apply SPF 30+ on treated areas.",
      "Avoid heat sources: saunas, steam rooms, and very hot showers for 24–48 hours.",
      "Do not exfoliate or use active skincare on treated areas immediately after.",
      "Report any unexpected blistering or prolonged redness to the team.",
    ],
  },
  {
    heading: "Between Sessions",
    items: [
      "Only shave — no waxing, threading, or plucking.",
      "Maintain SPF on treated areas, especially in summer.",
      "Keep the area moisturised and hydrated.",
      "Do not use tanning beds or apply fake tan to treated areas.",
    ],
  },
  {
    heading: "Things To Avoid",
    items: [
      "Sun exposure without SPF — this is the most common cause of complications.",
      "Waxing, threading, or epilation between sessions.",
      "Skipping sessions without rescheduling — gaps affect the overall result.",
      "Judging results too early — hair sheds gradually over 2–3 weeks post-session.",
    ],
  },
];


function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#c4aa8b" }} />
          <p className="text-sm text-[#333435] leading-relaxed"><CareText prose value={item} /></p>
        </li>
      ))}
    </ul>
  );
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: "1px solid rgba(196,170,139,0.12)" }}>
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-3 py-3 text-start">
        <p className="text-sm font-medium text-[#333435]"><CareText prose value={q} /></p>
        {open ? <ChevronUp className="w-4 h-4 text-[#7c8689] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#7c8689] flex-shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <p className="text-sm text-[#7c8689] leading-relaxed pb-3"><CareText prose value={a} /></p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Session Row Component ────────────────────────────────────────────────────
function LaserSessionRow({ step, isLast, onBook, isRTL, t: tFn, nextActionLabel }) {
  const [open, setOpen] = useState(step.status === "next" || step.status === "completed");
  const textColor = step.status === "completed" ? "#333435" : step.status === "next" ? "#3a2e1e" : "#7c8689";
  const t = tFn || ((en) => en);
  return (
    <div className={`flex items-start gap-3 `}>
      <div className="flex flex-col items-center flex-shrink-0 w-8">
        {step.status === "completed" && <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#c4aa8b" }}><CheckCircle2 className="w-3.5 h-3.5 text-white" /></div>}
        {step.status === "next" && <div className="bato-style-surface w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#fff", border: "2px solid #c4aa8b", boxShadow: "0 0 0 4px rgba(196,170,139,0.15)" }}><div className="w-2.5 h-2.5 rounded-full" style={{ background: "#c4aa8b" }} /></div>}
        {(step.status === "upcoming" || step.status === "locked") && <div className="bato-style-surface w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#f9f8f6", border: "1px solid rgba(196,170,139,0.2)" }}><Circle className="w-3 h-3" style={{ color: "rgba(196,170,139,0.3)" }} /></div>}
        {!isLast && <div className="w-0.5 flex-1 min-h-[20px] mt-0.5" style={{ background: step.status === "completed" ? "linear-gradient(to bottom, #c4aa8b, #d4bfa0)" : "rgba(196,170,139,0.18)" }} />}
      </div>
      <div className="flex-1 min-w-0 pb-4">
        <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-2 text-start mb-0.5">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold" style={{ color: textColor }}><CareText prose value={step.label} /></p>
            {step.status === "next" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(231,203,80,0.12)", color: "#3a2e1e", border: "1px solid rgba(231,203,80,0.3)" }}>{t("Next", "التالية")}</span>}
            {step.status === "completed" && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(196,170,139,0.12)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.25)" }}>{t("Done", "مكتمل")}</span>}
          </div>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-[#7c8689] flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-[#7c8689] flex-shrink-0" />}
        </button>
        {step.sessionData?.session_date && <p className="text-xs text-[#7c8689] mb-1"><CareText prose value={format(step.sessionData.session_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})} /></p>}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="det" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="pt-2 space-y-2">
                {step.purpose && <div><p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#c4aa8b" }}>{t("Purpose", "الهدف")}</p><p className="text-sm text-[#7c8689] leading-relaxed"><CareText prose value={step.purpose} /></p></div>}
                {step.what && <div><p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#c4aa8b" }}>{t("What happens", "ما يحدث")}</p><p className="text-sm text-[#7c8689] leading-relaxed"><CareText prose value={step.what} /></p></div>}
                {step.aftercare && <div><p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#c4aa8b" }}>{t("Aftercare", "الرعاية اللاحقة")}</p><p className="text-sm text-[#7c8689] leading-relaxed"><CareText prose value={step.aftercare} /></p></div>}
                {step.sessionData?.specialist_notes && <div className="p-2.5 rounded-lg" style={{ background: "rgba(231,203,80,0.05)", border: "1px solid rgba(231,203,80,0.15)" }}><p className="text-xs text-[#333435] italic">"<CareText prose value={step.sessionData.specialist_notes} />"</p>{step.sessionData.specialist_name && <p className="text-[10px] text-[#7c8689] mt-1">— <CareText prose value={step.sessionData.specialist_name} /></p>}</div>}
                {step.status === "next" && <Button onClick={onBook} size="sm" className={`w-full rounded-lg min-h-11 h-auto py-3 text-sm font-semibold border-0 mt-1 `} style={{ background: "#c4aa8b", color: "#3a2e1e" }}><Calendar className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{nextActionLabel || t("Request Laser Session", "اطلب جلسة الليزر")}</Button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LaserExplore({ isRTL, t }) {
  const navigate = useNavigate();
  const handleStartAssessment = () => navigate("/ClinicAppointments?book=1&type=consultation&department=laser_hair_removal");
  const handleAskTeam = () => navigate("/Messages?channel=advisors&department=laser_hair_removal&context=laser_assessment");

  return (
    <div className="space-y-5">

      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="bato-style-hero relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(150deg, #1e1a14 0%, #2e2418 35%, #3a2e1e 70%, #3e352c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: [
            "radial-gradient(ellipse 55% 45% at 88% 12%, rgba(196,170,139,0.18) 0%, transparent 55%)",
            "radial-gradient(ellipse 35% 50% at 8% 85%, rgba(231,203,80,0.06) 0%, transparent 50%)",
          ].join(", ")
        }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(rgba(196,170,139,1) 1px, transparent 1px), linear-gradient(90deg, rgba(196,170,139,1) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }} />
        <div className="relative z-10 p-5 min-[390px]:p-6 pb-8">
        <div className={`flex items-start justify-between mb-5 `}>
          <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "rgba(196,170,139,0.6)" }}>{t("Laser Consultation", "استشارة الليزر")}</p>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.2)" }}>
            <Zap className="w-4 h-4" style={{ color: "#c4aa8b" }} />
          </div>
        </div>
        <h2 className="text-white font-bold text-2xl leading-snug mb-2.5">{t("Understand before you start.", "افهم قبل أن تبدأ.")}</h2>
        <p className="text-sm leading-relaxed mb-7" style={{ color: "rgba(238,235,230,0.55)" }}>
          {t("Laser results depend on skin tone, hair colour, area, and history. BATO reviews these signals before recommending a programme — not after.", "تتأثر نتائج الليزر بلون البشرة والشعر ومنطقة العلاج وتاريخك. نراجع هذه التفاصيل قبل اقتراح البرنامج.")}
        </p>
        <div className="space-y-2.5 mb-7">
          <Button onClick={handleStartAssessment} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold border-0"
            style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
            {t("Request a Laser Consultation", "اطلب استشارة الليزر")}
          </Button>
          <Button onClick={handleAskTeam} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold"
            style={{ background: "transparent", color: "#c4aa8b", border: "1px solid rgba(196,170,139,0.35)" }}>
            {t("Connect with an advisor", "تواصل مع مرشد")}
          </Button>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "rgba(238,235,230,0.38)" }}>
          <span>{t("Choose a preferred visit time or ask a question.", "اختر الوقت المفضل لزيارتك أو اطرح سؤالك.")}</span>
          <span>{t("Appointment requests need clinic confirmation.", "تحتاج طلبات المواعيد إلى تأكيد العيادة.")}</span>
        </div>
        </div>
      </motion.div>

      {/* ── DEEP DISCOVERY — labeled progressive disclosure; the CTA stays early ── */}
      <details className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-[#333435]">
          {t("Learn more: how BATO approaches this journey", "اعرف المزيد: نهج باتو في هذه الرحلة")}
        </summary>
        <div className="px-3 pb-4 space-y-5">
      {/* ── WHAT BATO LOOKS AT ── */}
      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]">{t("What BATO looks at", "ما الذي يراجعه فريق باتو؟")}</p>
        <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-3">
          {[
            { label: "Skin Tone", desc: "BATO assesses your Fitzpatrick skin type to determine safe, effective laser settings.", Icon: Sun },
            { label: "Hair Colour & Texture", desc: "Laser targets pigment in the follicle. Hair colour, coarseness, and density all affect the programme.", Icon: Layers },
            { label: "Treatment Areas", desc: "Face, body, bikini, underarm, half back, full body — each area has different session requirements.", Icon: Zap },
            { label: "History & Skin Sensitivity", desc: "Previous laser experience, reactions, medications, and skin sensitivity all inform the approach.", Icon: ClipboardList },
            { label: "Sun Exposure & Tanning", desc: "Recent tanning or sun exposure affects safety and treatment timing.", Icon: AlertCircle },
            { label: "Goals & Timeline", desc: "How much reduction you want and how quickly — informs the programme structure and session spacing.", Icon: TrendingUp },
          ].map((item, idx) => (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.04 }}
              className="bato-style-surface p-4 rounded-2xl border"
              style={{ background: "white", borderColor: "rgba(196,170,139,0.15)", boxShadow: "0 1px 6px rgba(58,46,30,0.04)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.15)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <p className="text-sm font-semibold text-[#333435] mb-1 leading-tight"><CareText prose value={item.label} /></p>
              <p className="text-sm text-[#7c8689] leading-relaxed"><CareText prose value={item.desc} /></p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHY ASSESSMENT COMES FIRST ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(135deg, #faf9f7 0%, #f4f1ec 100%)", border: "1px solid rgba(196,170,139,0.22)" }}>
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,170,139,0.12) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-2.5">{t("Why assessment comes first", "لماذا يبدأ الأمر بالتقييم")}</p>
          <p className="text-base font-semibold text-[#333435] leading-snug mb-1.5">
            {t("Laser is not one-size-fits-all.", "الليزر ليس علاجًا واحدًا يناسب الجميع.")}
          </p>
          <p className="text-sm text-[#7c8689] leading-relaxed mb-4">
            {t("Results depend on skin tone, hair colour, area, and history. A programme that works for one person may not suit another. That's why BATO starts with assessment before recommending sessions or settings.", "تتأثر نتائج الليزر بلون البشرة والشعر والمنطقة وتاريخك؛ فما يناسب شخصاً قد لا يناسب آخر. نبدأ بالتقييم قبل اختيار الجلسات والإعدادات.")}
          </p>
          <div className="flex flex-wrap gap-2">
            {(isRTL
              ? ["لون البشرة", "نوع الشعر", "المنطقة", "التاريخ", "الجدول الزمني"]
              : ["Skin Tone", "Hair Type", "Area", "History", "Timeline"]).map((chip) => (
              <div key={chip} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.22)" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#c4aa8b" }} />
                <span className="text-xs font-medium" style={{ color: "#3a2e1e" }}><CareText prose value={chip} /></span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]">{t("How it works", "كيف نبدأ؟")}</p>
        <div className="bato-style-surface rounded-2xl border overflow-hidden"
          style={{ background: "#faf9f7", borderColor: "rgba(196,170,139,0.15)" }}>
          {[
            { step: "1", titleEn: "Connect with an advisor", titleAr: "تواصل مع مرشد", descEn: "Tell us about your area of concern, hair type, skin tone, and goals.", descAr: "أخبرنا بالمنطقة التي ترغب في علاجها ونوع الشعر ولون البشرة وأهدافك.", Icon: ClipboardList },
            { step: "2", titleEn: "Share Your History", titleAr: "شارك تجاربك السابقة", descEn: "Add previous laser experience, skin sensitivity, sun exposure, and any reactions.", descAr: "أضف تجارب الليزر السابقة وحساسية البشرة والتعرض للشمس وأي تفاعلات.", Icon: User },
            { step: "3", titleEn: "BATO Reviews the Case", titleAr: "يراجع فريق باتو حالتك", descEn: "The laser team reviews your suitability, skin tone, and recommends the right programme.", descAr: "يراجع فريق الليزر مدى ملاءمة العلاج ولون بشرتك، ثم يقترح البرنامج المناسب.", Icon: Search },
            { step: "4", titleEn: "Get Your Next Step", titleAr: "حدد خطوتك التالية", descEn: "BATO guides you toward the right first action: patch test, consultation, or first session.", descAr: "يساعدك فريق باتو على تحديد الخطوة الأولى: اختبار الليزر على منطقة صغيرة، أو الاستشارة، أو الجلسة الأولى.", Icon: CheckCircle2 },
          ].map((item, idx, arr) => (
            <div key={item.step} className="flex gap-3 px-4 py-3.5 items-start"
              style={{ borderBottom: idx < arr.length - 1 ? "1px solid rgba(196,170,139,0.1)" : "none" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.12)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "rgba(196,170,139,0.7)" }}><CareText prose value={item.step} /></span>
                  <p className="text-sm font-semibold text-[#333435]"><CareText prose value={isRTL ? item.titleAr : item.titleEn} /></p>
                </div>
                <p className="text-sm text-[#7c8689] leading-relaxed"><CareText prose value={isRTL ? item.descAr : item.descEn} /></p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── THE BATO LASER APPROACH ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]">{t("The BATO laser approach", "نهج باتو في العلاج بالليزر")}</p>
        <div className="grid grid-cols-1 gap-2">
          {[
            { titleEn: "Assessment before a single session", titleAr: "التقييم قبل أي جلسة", descEn: "Skin tone, hair type, and sensitivity are reviewed before any settings are chosen.", descAr: "يُراجَع لون البشرة ونوع الشعر والحساسية قبل اختيار أي إعدادات.", Icon: ClipboardList },
            { titleEn: "Patch test, always", titleAr: "اختبار الليزر على منطقة صغيرة أولاً", descEn: "A safety patch test is standard before beginning the core programme.", descAr: "نختبر الليزر على منطقة صغيرة من البشرة قبل بدء البرنامج الأساسي.", Icon: ShieldCheck },
            { titleEn: "Settings adjusted per session", titleAr: "الإعدادات تُعدَّل في كل جلسة", descEn: "The laser team monitors your skin's response and adapts settings at each visit.", descAr: "يراقب فريق الليزر استجابة بشرتك ويعدّل الإعدادات في كل زيارة.", Icon: Zap },
            { titleEn: "Realistic timeline guidance", titleAr: "توقعات واضحة لمدة العلاج", descEn: "Hair sheds 2–3 weeks post-session. The team helps you understand what's normal.", descAr: "يتساقط الشعر خلال أسبوعين إلى ثلاثة بعد الجلسة. يساعدك الفريق على معرفة ما هو متوقع.", Icon: Clock },
            { titleEn: "Team-guided aftercare", titleAr: "رعاية لاحقة بإشراف الفريق", descEn: "You can message the Laser Team directly for aftercare questions — not a generic inbox.", descAr: "يمكنك مراسلة فريق الليزر مباشرة عبر القناة المخصصة للعناية بعد الجلسات.", Icon: MessageSquare },
          ].map((item, idx) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.04 }}
              className="bato-style-surface flex gap-3 items-start p-4 rounded-xl border"
              style={{ background: "white", borderColor: "rgba(196,170,139,0.13)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,170,139,0.09)", border: "1px solid rgba(196,170,139,0.13)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#333435] mb-0.5"><CareText prose value={isRTL ? item.titleAr : item.titleEn} /></p>
                <p className="text-sm text-[#7c8689] leading-relaxed"><CareText prose value={isRTL ? item.descAr : item.descEn} /></p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── TREATMENT OPTIONS TEASER ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bato-style-surface rounded-2xl border overflow-hidden"
        style={{ background: "#faf9f7", borderColor: "rgba(196,170,139,0.18)" }}>
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-1.5"><CareText prose value={"What BATO laser covers"} /></p>
          <p className="text-sm font-semibold text-[#333435] mb-3"><CareText prose value={"Areas and programmes available at BATO:"} /></p>
          <div className="space-y-2">
            {[
              { label: "Full Body", desc: "Comprehensive full-body laser hair removal programme." },
              { label: "Targeted Areas", desc: "Face, underarm, bikini, half back, or specific zones." },
              { label: "Tattoo Removal", desc: "Laser removal of unwanted tattoos across sessions." },
              { label: "Permanent Makeup Correction", desc: "Lip tawreed, microblading, and eyeliner pigment correction." },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 items-start p-3 rounded-xl bg-white border"
                style={{ borderColor: "rgba(196,170,139,0.1)" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5" style={{ background: "#c4aa8b" }} />
                <div>
                  <p className="text-xs font-semibold text-[#333435]"><CareText prose value={item.label} /></p>
                  <p className="text-sm text-[#7c8689] leading-relaxed"><CareText prose value={item.desc} /></p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#7c8689] italic mt-3 leading-relaxed"><CareText prose value={"The right programme is confirmed after your assessment — not before. Your team will advise based on your case."} /></p>
        </div>
      </motion.section>

        </div>
      </details>

      {/* ── BOTTOM CTA ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bato-style-hero bato-closing-invitation relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(150deg, #1e1a14 0%, #2e2418 35%, #3a2e1e 70%, #3e352c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(ellipse 50% 60% at 90% 20%, rgba(196,170,139,0.16) 0%, transparent 55%)",
        }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(196,170,139,1) 1px, transparent 1px), linear-gradient(90deg, rgba(196,170,139,1) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }} />
        <div className="relative z-10 p-5 min-[390px]:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(196,170,139,0.6)" }}>{t("Ready when you are", "ابدأ عندما تكون مستعداً")}</p>
          <p className="text-white font-bold text-xl leading-snug mb-2">{t("Ready to understand your laser options?", "هل أنت مستعد لفهم خيارات الليزر؟")}</p>
          <p className="text-sm mb-7 leading-relaxed" style={{ color: "rgba(238,235,230,0.48)" }}>
            {t("Request a consultation or connect with an advisor to understand your options.", "اطلب استشارة أو تواصل مع مرشد لفهم خياراتك.")}
          </p>
          <div className="space-y-2.5">
            <Button onClick={handleStartAssessment} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold border-0"
              style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              {t("Request a Laser Consultation", "اطلب استشارة الليزر")}
            </Button>
            <Button onClick={handleAskTeam} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold"
              style={{ background: "transparent", color: "#c4aa8b", border: "1px solid rgba(196,170,139,0.3)" }}>
              {t("Connect with an advisor", "تواصل مع مرشد")}
            </Button>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

function LaserDossier({ user, activePackage, sessions, caseFile, onBook, isRTL, t, onAskTeam, nextActionLabel }) {
  const gradientId=useId().replace(/:/g,"");
  const {used:sessionsUsed,total:totalSessions,progress,remaining}=programCounts(activePackage);
  const circumference = 2 * Math.PI * 40;
  const dashOffset = circumference - (progress / 100) * circumference;
  const latestNote = sessions.find(s => s.specialist_notes);
  const allPhotos = sessions.flatMap(s => s.photos || []);
  const completedSessions = sessions.slice().sort((a, b) => new Date(a.session_date) - new Date(b.session_date));

  return (
    <div className="space-y-4">

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="bato-style-hero relative overflow-hidden rounded-3xl p-5 min-[390px]:p-6 shadow-lg"
        style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 55%, #2e2418 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 85% 8%, rgba(231,203,80,0.12) 0%, transparent 50%), radial-gradient(circle at 10% 88%, rgba(196,170,139,0.08) 0%, transparent 55%)" }} />
        <div className="relative z-10">
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: "rgba(196,170,139,0.7)" }}>
            {t("Laser Journey · Active Programme", "رحلة الليزر · برنامج نشط")}
          </p>
          <h2 className="text-white font-bold text-lg leading-snug mb-1"><CareText prose value={activePackage.package_name} /></h2>
          <p className="text-xs mb-4" style={{ color: "rgba(238,235,230,0.5)" }}>
            {t("Laser hair removal programme", "برنامج إزالة الشعر بالليزر")}
          </p>
          <div className="grid grid-cols-[80px_minmax(0,1fr)] min-[390px]:grid-cols-[88px_minmax(0,1fr)] items-center gap-4 mb-5">
            <div className="relative flex-shrink-0">
              <svg viewBox="0 0 88 88" className="w-20 h-20 min-[390px]:w-[88px] min-[390px]:h-[88px] -rotate-90" role="img" aria-label={t("Sessions completed: ","الجلسات المكتملة: ")+progress+"%"}>
                <circle cx="44" cy="44" r="40" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="6" />
                <motion.circle cx="44" cy="44" r="40" fill="none" stroke={"url(#"+gradientId+")"}
                  strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: dashOffset }}
                  transition={{ duration: 1.4, ease: "easeOut" }} />
                <defs><linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#c4aa8b" /><stop offset="100%" stopColor="#e7cb50" />
                </linearGradient></defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-white text-xl font-bold leading-none"><CareText prose value={progress} />%</span>
                <span className="text-[9px] mt-0.5 font-medium" style={{ color: "rgba(196,170,139,0.7)" }}>{t("complete", "مكتمل")}</span>
              </div>
            </div>
            <div className={`flex-1 space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(196,170,139,0.55)" }}>{t("Sessions", "الجلسات")}</p>
                <p className="text-white font-semibold text-sm">{t("Session", "الجلسة")} <CareText prose value={sessionsUsed} /> {t("of", "من")} <CareText prose value={totalSessions} /></p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(196,170,139,0.55)" }}>{t("Remaining", "المتبقي")}</p>
                <p className="text-white font-semibold text-sm"><CareText prose value={remaining} /> {t(remaining !== 1 ? "sessions" : "session", remaining !== 1 ? "جلسات" : "جلسة")}</p>
              </div>
              {activePackage.next_recommended_date && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(196,170,139,0.55)" }}>{t("Next Recommended", "الخطوة التالية المقترحة")}</p>
                  <p className="text-white font-semibold text-sm" dir="ltr"><CareText prose value={format(activePackage.next_recommended_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})} /></p>
                </div>
              )}
            </div>
          </div>
          {remaining > 0 && (
            <Button onClick={onBook} className={`w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0 `} style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{nextActionLabel || t("Request Laser Session", "اطلب جلسة الليزر")}
            </Button>
          )}
          {remaining === 0 && (
            <div className="p-3 rounded-xl" style={{ background: "rgba(231,203,80,0.08)", border: "1px solid rgba(231,203,80,0.2)" }}>
              <p className="text-xs" style={{ color: "rgba(238,235,230,0.75)" }}><CareText prose value={"Programme complete — maintenance sessions are typically recommended every 4–8 weeks based on response."} /></p>
            </div>
          )}
        </div>
      </motion.div>

      <CustomerCareHub user={user} department="laser_hair_removal" programId={activePackage.id} journeyPage />
      <SectionCard icon={User} title={t("Your Laser Case","برنامج الليزر الخاص بك")} subtitle={t("Laser programme profile","ملف برنامج الليزر")}>
        <div>
          {[
            { labelEn: "Treatment Type", labelAr: "نوع العلاج", value: activePackage.package_type?.replace(/_/g, " ") },
            { labelEn: "Treatment Areas", labelAr: "مناطق العلاج", value: null },
            { labelEn: "Skin Type", labelAr: "نوع البشرة", value: null },
            { labelEn: "Hair Colour/Thickness", labelAr: "لون الشعر / سُمكه", value: null },
            { labelEn: "Laser Goals", labelAr: "أهداف الليزر", value: caseFile?.treatment_goals },
            { labelEn: "Assigned Specialist", labelAr: "الأخصائي المسؤول", value: caseFile?.assigned_specialist },
          ].map(row => (
            <div key={row.labelEn} className={`flex items-start gap-3 py-2.5 `} style={{ borderBottom: "1px solid rgba(196,170,139,0.1)" }}>
              <p className="text-xs text-[#7c8689] w-[40%] shrink-0 pt-0.5"><CareText prose value={isRTL ? row.labelAr : row.labelEn} /></p>
              <p className={`text-sm text-[#333435] font-medium min-w-0 break-words flex-1 capitalize ${isRTL ? 'text-right' : ''}`}><CareText prose value={row.value || t("To be updated by your laser team.", "سيحدّث فريق الليزر هذه المعلومات.")} /></p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Why this plan */}
      <SectionCard icon={FileText} title="Why This Plan" subtitle="How your laser programme was selected">
        <p className="text-sm text-[#7c8689] leading-relaxed mb-4"><CareText prose value={"This programme was selected based on your skin tone, hair type, treatment areas, and goals."} /></p>
        <BulletList items={[
          "The number of sessions is based on the area and typical response for your hair and skin type.",
          "Multiple sessions are needed because only active hair follicles can be targeted per session.",
          "Progress is monitored through hair reduction, skin response, and team notes.",
          "Settings may be adjusted between sessions based on your skin's response.",
          "The goal is long-term, measurable reduction — not a one-off treatment.",
        ]} />
      </SectionCard>

      {/* Plan components */}
      <SectionCard icon={Package} title="Your Complete Laser Plan" subtitle="All components explained">
        <div className="space-y-2.5">
          {PLAN_COMPONENTS.map((c, i) => {
            const st = STATUS_STYLE[c.status] || STATUS_STYLE["Optional"];
            return (
              <div key={i} className="bato-style-surface p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#333435]"><CareText prose value={c.name} /></p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}><CareText prose value={c.status} /></span>
                </div>
                <p className="text-sm text-[#7c8689] leading-relaxed mb-1"><CareText prose value={c.purpose} /></p>
                <p className="text-xs text-[#7c8689]"><span className="font-medium"><CareText prose value={"When:"} />{" "}</span><CareText prose value={c.when} /></p>
                {c.note && <p className="text-xs" style={{ color: "rgba(196,170,139,0.7)" }}><CareText prose value={c.note} /></p>}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Session Plan */}
      <BatoSectionIntro title={t("Your progress", "تقدمك")} />
      <SectionCard icon={ClipboardList} title="Session-by-Session Plan" subtitle="What happens at each stage">
        <div className="pt-1 space-y-0">
          {[
            { key: "assessment", label: "Assessment & Patch Test", status: ["treatment_planned","in_treatment","post_treatment","completed"].includes(caseFile?.case_status) ? "completed" : "upcoming", purpose: "Skin assessment, hair type review, and patch test before the programme begins.", what: "Specialist evaluates suitability and performs safety patch test." },
            ...Array.from({ length: totalSessions }, (_, i) => {
              const num = i + 1;
              const s = completedSessions[i];
              return {
                key: `s${num}`, label: `Session ${num}`,
                status: num <= sessionsUsed ? "completed" : num === sessionsUsed + 1 ? "next" : "upcoming",
                sessionData: s,
                purpose: num <= 2 ? "Early reduction phase. Hair may shed over 2–3 weeks post-session." : num <= 4 ? "Continued reduction. The team monitors response and may adjust settings." : "Advanced reduction phase. Finer, lighter regrowth is expected.",
                what: `Laser protocol applied to the treatment area as per the programme plan.`,
                aftercare: "Avoid sun, heat, and exfoliation for 24–48 hours. Apply SPF daily.",
              };
            }),
            { key: "review", label: "Progress Review", status: ["post_treatment","completed"].includes(caseFile?.case_status) ? "completed" : "locked", purpose: "Team reviews hair reduction, photos, and recommends next steps." },
            { key: "maintenance", label: "Maintenance Phase", status: "locked", purpose: "Occasional maintenance sessions to sustain long-term results." },
          ].map((step, idx, arr) => (
            <LaserSessionRow key={step.key} step={step} isLast={idx === arr.length - 1} onBook={onBook} isRTL={isRTL} t={t} nextActionLabel={nextActionLabel} />
          ))}
        </div>
      </SectionCard>

      {/* Expectations Timeline */}
      <SectionCard icon={Clock} title="What To Expect Over Time" subtitle="Realistic stage-by-stage guide">
        <p className="text-sm text-[#7c8689] mb-4 leading-relaxed"><CareText prose value={"Results vary by skin type, hair colour, and area. The team tracks your specific response."} /></p>
        <div className="space-y-3">
          {TIMELINE_EXPECTATIONS.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(196,170,139,0.12)" }}>
                <span className="text-[9px] font-bold" style={{ color: "#c4aa8b" }}><CareText prose value={i + 1} /></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#333435]"><CareText prose value={item.phase} /></p>
                <p className="text-sm text-[#7c8689] leading-relaxed"><CareText prose value={item.desc} /></p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
          <p className="text-xs text-[#7c8689] italic"><CareText prose value={"\"Hair appears to grow after sessions before shedding. This is normal — the follicle is in its natural cycle. Results build progressively.\""} /></p>
        </div>
      </SectionCard>

      {/* Progress Photos */}
      <SectionCard icon={Camera} title="Progress Photos" subtitle={allPhotos.length > 0 ? `${allPhotos.length} photo${allPhotos.length !== 1 ? "s" : ""} on file` : "No photos yet"}>
        {allPhotos.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {allPhotos.slice(0, 9).map((p, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <img src={p} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <Camera className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(196,170,139,0.3)" }} />
            <p className="text-sm font-medium text-[#333435] mb-1"><CareText prose value={"No progress photos yet"} /></p>
            <p className="text-xs text-[#7c8689]"><CareText prose value={"The clinic team will upload photos to track hair reduction over time."} /></p>
          </div>
        )}
      </SectionCard>

      {/* Care Rules */}
      <BatoSectionIntro title={t("Care and support", "العناية والدعم")} />
      <SectionCard icon={ShieldCheck} title="Care Rules" subtitle="Before, between, and after sessions">
        <div className="space-y-5">
          {CARE_RULES.map(group => (
            <div key={group.heading}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}><CareText prose value={group.heading} /></p>
              <BulletList items={group.items} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Team Notes */}
      <SectionCard icon={MessageSquare} title="Team Notes" accent>
        {latestNote ? (
          <div>
            <div className="p-4 rounded-xl mb-3" style={{ background: "rgba(231,203,80,0.05)", border: "1px solid rgba(231,203,80,0.15)" }}>
              <p className="text-sm text-[#333435] leading-relaxed italic">"<CareText prose value={latestNote.specialist_notes} />"</p>
            </div>
            <div className="flex items-center justify-between text-xs text-[#7c8689]">
              {latestNote.specialist_name && <span>— <CareText prose value={latestNote.specialist_name} /></span>}
              {latestNote.session_date && <span><CareText prose value={format(latestNote.session_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})} /></span>}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(196,170,139,0.3)" }} />
            <p className="text-sm text-[#7c8689]"><CareText prose value={"No team notes yet. Updates will appear after your next review."} /></p>
          </div>
        )}
      </SectionCard>

      {/* FAQ */}
      <SectionCard icon={HelpCircle} title="Frequently Asked Questions">
        {LASER_FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
      </SectionCard>

      {/* Documents */}
      <SectionCard icon={FileText} title="Documents" subtitle="Treatment summary and aftercare files">
        <div className="text-center py-5">
          <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(196,170,139,0.3)" }} />
          <p className="text-sm text-[#7c8689]"><CareText prose value={"No documents available yet."} /></p>
          <p className="text-xs text-[#7c8689] mt-1"><CareText prose value={"Aftercare guides and session summaries will appear here."} /></p>
        </div>
      </SectionCard>

      {/* CTA Footer */}
      <div className="bato-style-hero relative overflow-hidden rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, rgba(231,203,80,0.08) 0%, transparent 60%)" }} />
        <div className="relative z-10">
          <p className="text-white font-semibold text-sm mb-1"><CareText prose value={"Ready for your next session?"} /></p>
          <p className="text-xs mb-4" style={{ color: "rgba(238,235,230,0.55)" }}><CareText prose value={"Keep your laser journey consistent for best results."} /></p>
          <div className="space-y-2">
            {remaining > 0 && (<Button onClick={onBook} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0" style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              <Calendar className="w-4 h-4 mr-2" />{nextActionLabel || t("Request Laser Session", "اطلب جلسة الليزر")}</Button>)}
            <Button onClick={onAskTeam} className={`w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold `} style={{ background: "transparent", color: "rgba(238,235,230,0.8)", border: "1px solid rgba(196,170,139,0.3)" }}>
              <MessageSquare className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t("Contact your specialist", "تواصل مع أخصائيك")}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function LaserJourney() {
  const [programParams] = useSearchParams();
  const { user: contextUser, isLoadingAuth } = useAuth();
  const accountQuery = useQuery({
    queryKey: ["laserJourneyAccount"],
    queryFn: () => base44.auth.me(),
    enabled: !isLoadingAuth && !contextUser,
    retry: 1, gcTime: 0, refetchOnMount: "always",
  });
  const user = contextUser || (!accountQuery.isFetching ? accountQuery.data : null);
  const [showBooking, setShowBooking] = useState(false);
  const queryClient = useQueryClient();
  const { isRTL, t } = useLocation();
  const navigate = useNavigate();

  const { data: caseFiles = [], isLoading: caseFileLoading, isError: caseFileError } = useQuery({
    queryKey: ["journeyCaseFiles", user?.email, "laser_hair_removal"],
    queryFn: async () => { const c = await base44.entities.CaseFile.filter({ client_email: user.email, primary_department: "laser_hair_removal" }, "-created_date"); return c; },
    enabled: !!user, initialData: undefined, retry: 1, staleTime: 1000 * 60,
  });
  const { data: sessions = [], isPending: sessionsLoading, isError: sessionsError } = useQuery({
    queryKey: ["laserSessions", user?.email],
    queryFn: () => loadCompletedTreatmentSessions(user.email).then(rows=>rows.filter(row=>row.department==="laser_hair_removal")),
    enabled: !!user,
  });
  const { data: packages = [], isPending: packagesPending, isError: packagesError } = useQuery({
    queryKey: ["packages", user?.email, "laserJourney"],
    queryFn: () => base44.entities.Package.filter({ client_email: user.email }, "-created_date"),
    enabled: !!user, retry: 1, staleTime: 1000 * 60,
  });

  const {data: appointmentRows = [], isPending: appointmentsLoading, isError: appointmentsError} = useQuery({
    queryKey: ["upcomingAppointments", user?.email, "laserJourney"],
    queryFn: () => base44.entities.Appointment.filter({client_email:user.email}),
    enabled: !!user, retry: 1,
  });
  const laserPackages = packages.filter(p => programDepartment(p) === "laser_hair_removal");
  const displayedPackage = laserPackages.find(p => p.id === programParams.get("program")) || laserPackages.find(p => p.status === "active") || laserPackages[0] || null;
  const activePackage = displayedPackage?.status === "active" ? displayedPackage : null;
  const caseFile = caseForProgram(caseFiles,displayedPackage,packages);
  const nextAppointment = careAppointments(appointmentsForProgram(appointmentRows,activePackage,packages)).live[0];
  const nextActionLabel = nextAppointment ? (nextAppointment.status === "confirmed" ? t("View appointment","عرض الموعد") : t("View pending request","عرض الطلب المعلق")) : undefined;
  const hasQueryError = (!contextUser && accountQuery.isError) || caseFileError || packagesError || sessionsError || appointmentsError;

  if (isLoadingAuth || (!contextUser && (accountQuery.isPending || accountQuery.isFetching)) || (!!user && (caseFileLoading || packagesPending || sessionsLoading || appointmentsLoading))) {
    return <JourneySkeleton isRTL={isRTL} />;
  }

  if (!packagesPending && programParams.get("program") && !laserPackages.some(p=>p.id===programParams.get("program"))) return <div role="alert" className="p-6 space-y-3"><p>{t("This program is not available in your care records.","هذا البرنامج غير متاح في سجلات رعايتك.")}</p><button className="underline py-3" onClick={()=>navigate("/LaserJourney")}>{t("View my journey","عرض رحلتي")}</button></div>;

  if (hasQueryError) {
    return (
      <div className={`min-h-screen pb-10 flex items-center justify-center ${isRTL ? "text-right" : "text-left"}`} style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-md text-center px-4">
          <h2 className="text-lg font-bold text-[#333435] mb-2">{t("Something went wrong", "حدث خطأ ما")}</h2>
          <p className="text-sm text-[#7c8689] mb-5">{t("We couldn't load your laser journey. Try refreshing the page or message Customer service for help.", "لم نتمكن من تحميل رحلة الليزر. حاول تحديث الصفحة أو راسل خدمة العملاء للمساعدة.")}</p>
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
    <div className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`} style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <div className="bato-page-heading grid grid-cols-1 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#333435]"><CareText prose value={displayedPackage ? t("Laser Journey", "رحلة الليزر") : t("Laser Consultation", "استشارة الليزر")} /></h1>
            <p className="text-xs text-[#7c8689]">
              <CareText prose value={activePackage ? t("Your complete laser treatment plan, timeline, and progress", "خطة علاج الليزر الكاملة والجدول الزمني وسجل التقدم") : displayedPackage ? t("Your recorded care history.","سجل رعايتك المسجل.") : t("Understand your skin and hair before starting laser treatment.", "افهم بشرتك وشعرك قبل البدء بعلاج الليزر.")} />
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full mt-0.5 flex-shrink-0"
            style={activePackage ? { background: "rgba(196,170,139,0.15)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.35)" } : { background: "#f9f8f6", color: "#7c8689", border: "1px solid rgba(124,134,137,0.2)" }}>
            <CareText prose value={activePackage ? t("Active Programme", "برنامج نشط") : displayedPackage ? t("Care History", "سجل الرعاية") : t("Explore options", "استكشف الخيارات")} />
          </span>
        </div>
        {!activePackage&&<CustomerCareHub user={user} department="laser_hair_removal" programId={displayedPackage?.id} journeyPage />}
        {activePackage
          ? <LaserDossier user={user} activePackage={activePackage} sessions={sessionsForProgram(sessions,activePackage,packages)} caseFile={caseFile}
              onBook={() => nextAppointment ? navigate("/ClinicAppointments?appointment="+encodeURIComponent(nextAppointment.id)) : setShowBooking(true)} isRTL={isRTL} t={t} nextActionLabel={nextActionLabel}
              onAskTeam={() => navigate("/Messages?channel=laser_team&context=laser_review")} />
          : displayedPackage ? <ProgramHistory program={displayedPackage} sessions={sessionsForProgram(sessions,displayedPackage,packages)} /> : <LaserExplore isRTL={isRTL} t={t} />}
      </div>
      {user && activePackage && (
        <BookingCalendar open={showBooking} onClose={() => setShowBooking(false)} userEmail={user.email} packageData={activePackage} department="laser_hair_removal" appointmentType="treatment"
          onBookingSuccess={() => { queryClient.invalidateQueries({ queryKey: ["packages"] }); setShowBooking(false); }} />
      )}
    </div>
  );
}