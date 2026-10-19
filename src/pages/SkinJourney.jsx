import SectionCard from "@/components/design/JourneySectionCard";
import BatoSectionIntro from "@/components/design/BatoSectionIntro";
import {loadCompletedTreatmentSessions} from "@/lib/treatmentSessions";
import {caseForProgram} from "@/lib/customerCare";
import { format } from "@/lib/customerFormatting";
import CustomerCareHub from "@/components/care/CustomerCareHub";
import {ar} from "date-fns/locale";
import {programDepartment, programCounts, sessionsForProgram} from "@/lib/carePrograms";
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
  Camera, MessageSquare, ShieldCheck, Sparkles, ClipboardList,
  User, TrendingUp, Package, FileText, HelpCircle, Clock, Sun, Droplets,
  Layers, Zap, Search, Activity, FlaskConical
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useLocation } from "../components/LocationContext";
import BookingCalendar from "../components/appointments/BookingCalendar";
import { JourneySkeleton } from "../components/ui/BatoSkeleton";


const PLAN_COMPONENTS = [
  { name: "Skin Consultation", status: "Included", purpose: "Review of skin type, concern, and condition to guide the plan.", when: "Before or at the start of the programme." },
  { name: "In-Clinic Skin Sessions", status: "Included", purpose: "Core treatment sessions targeting skin texture, tone, or concern.", when: "Each scheduled session in the plan." },
  { name: "Skin Booster / Hydration", status: "Optional", purpose: "Supportive hydration treatment to improve moisture and glow.", when: "Prescribed by the team as a complement." },
  { name: "Chemical Peels", status: "Included or optional", purpose: "Exfoliation to improve skin tone and texture.", when: "Depends on your programme type." },
  { name: "Injectables / Botox / Fillers", status: "Optional", purpose: "Cosmetic injectable support, only if part of your plan.", when: "Only if clinically appropriate and requested.", note: "Not automatically included." },
  { name: "Progress Reviews", status: "Included", purpose: "Team review of skin response, photos, and next steps.", when: "After the core programme sessions." },
  { name: "Maintenance Planning", status: "Later stage", purpose: "Long-term skin maintenance after the core programme.", when: "Defined at the progress review." },
];

const STATUS_STYLE = {
  "Included":             { bg: "rgba(196,170,139,0.12)", color: "#3a2e1e", border: "rgba(196,170,139,0.3)" },
  "Included or optional": { bg: "rgba(196,170,139,0.08)", color: "#3a2e1e", border: "rgba(196,170,139,0.2)" },
  "Optional":             { bg: "#f9f8f6", color: "#7c8689", border: "rgba(124,134,137,0.18)" },
  "Later stage":          { bg: "#f9f8f6", color: "#7c8689", border: "rgba(124,134,137,0.15)" },
};

const TIMELINE_EXPECTATIONS = [
  { phase: "Before Starting", desc: "Skin assessment, photos, and programme selection based on your skin type and concern." },
  { phase: "Sessions 1–2", desc: "Skin preparation and early response. Some redness or peeling after treatment is normal." },
  { phase: "Sessions 3–4", desc: "Consistency phase. The team monitors skin response, texture improvement, and sensitivity." },
  { phase: "Sessions 5+", desc: "Core programme completion. Progress photos and response are reviewed by the team." },
  { phase: "After Core Programme", desc: "The team recommends maintenance, renewal, or review depending on your skin's response." },
];

const SKIN_FAQS = [
  { q: "When will I see visible results?", a: "Skin response varies. Some improvements are visible after 1–2 sessions; deeper results develop over the full programme. The team tracks progress through photos and reviews." },
  { q: "Is redness or peeling normal?", a: "Temporary redness, dryness, or mild peeling is expected after some treatments. This usually resolves within 24–72 hours. Contact your specialist if it persists." },
  { q: "Can I wear makeup after treatment?", a: "Your specialist will advise on timing. Generally, mineral or gentle makeup is preferable immediately after treatment." },
  { q: "Can I use my usual skincare products?", a: "Follow the BATO team's product guidance. Some active ingredients (like retinoids or acids) may need to be paused around sessions." },
  { q: "Do I need to use SPF?", a: "Yes. Daily SPF is essential during and after any skin treatment programme to protect results and prevent pigmentation." },
  { q: "What if I miss a session?", a: "Reschedule as soon as possible. Consistency is important for best results. The team can advise on adjusted timing." },
  { q: "Do I need injectables?", a: "Only if they are part of your specific plan. Botox, fillers, and boosters are not automatically included in every skin programme." },
  { q: "What happens after my last session?", a: "The team reviews your results and recommends a maintenance plan or next phase based on your skin's response." },
  { q: "Can I combine skin treatments?", a: "Combinations are sometimes appropriate. The team will advise what can be safely combined for your skin type." },
  { q: "When should I contact your specialist?", a: "If you experience prolonged redness, pain, unexpected breakouts, swelling, or an unclear reaction after treatment." },
];

const CARE_RULES = [
  {
    heading: "Before Your Session",
    items: [
      "Arrive with clean skin — no heavy makeup or products unless instructed otherwise.",
      "Avoid exfoliation treatments for at least 48–72 hours before.",
      "Inform the specialist of any new products, medications, or skin reactions.",
      "Contact your specialist if you have active breakouts or sensitivity on the day.",
    ],
  },
  {
    heading: "After Your Session",
    items: [
      "Follow the specialist's aftercare instructions exactly.",
      "Apply SPF 30+ daily on all treated areas.",
      "Avoid heat (saunas, steam rooms) for at least 48 hours post-treatment.",
      "Do not pick, scratch, or rub treated areas.",
      "Report any unexpected reactions to the team promptly.",
    ],
  },
  {
    heading: "Home Routine",
    items: [
      "Use BATO-recommended or team-prescribed products only.",
      "Keep the skin hydrated with a gentle, fragrance-free moisturiser.",
      "Do not introduce new actives (retinoids, acids, vitamin C serums) without checking first.",
      "Maintain SPF as a daily non-negotiable.",
    ],
  },
  {
    heading: "Things To Avoid",
    items: [
      "Sun exposure without SPF on treated areas.",
      "Harsh or active exfoliants between sessions.",
      "Mixing treatments without team approval.",
      "Judging results too early — the team tracks progress properly.",
    ],
  },
];

// ─── Shared sub-components ────────────────────────────────────────────────────

function BulletList({ items }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#c4aa8b" }} />
          <p className="text-sm text-[#333435] leading-relaxed"><CareText value={item} /></p>
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
        <p className="text-sm font-medium text-[#333435]"><CareText value={q} /></p>
        {open ? <ChevronUp className="w-4 h-4 text-[#7c8689] flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-[#7c8689] flex-shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <p className="text-sm text-[#7c8689] leading-relaxed pb-3"><CareText value={a} /></p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Session Row Component ────────────────────────────────────────────────────
function SkinSessionRow({ step, isLast, onBook, isRTL, t: tFn }) {
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
            <p className="text-sm font-semibold" style={{ color: textColor }}><CareText value={step.label} /></p>
            {step.status === "next" && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: "rgba(231,203,80,0.12)", color: "#3a2e1e", border: "1px solid rgba(231,203,80,0.3)" }}><CareText value={"Next"} /></span>}
            {step.status === "completed" && <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: "rgba(196,170,139,0.12)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.25)" }}><CareText value={"Done"} /></span>}
          </div>
          {open ? <ChevronUp className="w-3.5 h-3.5 text-[#7c8689] flex-shrink-0" /> : <ChevronDown className="w-3.5 h-3.5 text-[#7c8689] flex-shrink-0" />}
        </button>
        {step.sessionData?.session_date && <p className="text-xs text-[#7c8689] mb-1"><CareText value={format(step.sessionData.session_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})} /></p>}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="det" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
              <div className="pt-2 space-y-2">
                {step.purpose && <div><p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#c4aa8b" }}><CareText value={"Purpose"} /></p><p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={step.purpose} /></p></div>}
                {step.what && <div><p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#c4aa8b" }}><CareText value={"What happens"} /></p><p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={step.what} /></p></div>}
                {step.aftercare && <div><p className="text-[10px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: "#c4aa8b" }}><CareText value={"Aftercare"} /></p><p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={step.aftercare} /></p></div>}
                {step.sessionData?.specialist_notes && <div className="p-2.5 rounded-lg" style={{ background: "rgba(231,203,80,0.05)", border: "1px solid rgba(231,203,80,0.15)" }}><p className="text-xs text-[#333435] italic">"<CareText prose value={step.sessionData.specialist_notes} />"</p>{step.sessionData.specialist_name && <p className="text-[10px] text-[#7c8689] mt-1">— <CareText value={step.sessionData.specialist_name} /></p>}</div>}
                {step.status === "next" && <Button onClick={onBook} size="sm" className={`w-full rounded-lg min-h-11 h-auto py-3 text-sm font-semibold border-0 mt-1 `} style={{ background: "#c4aa8b", color: "#3a2e1e" }}><Calendar className={`w-3 h-3 ${isRTL ? 'ml-1' : 'mr-1'}`} />{t("Request Next Session", "اطلب الجلسة التالية")}</Button>}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Explore ─────────────────────────────────────────────────────────────────
function SkinExplore({ isRTL, t }) {
  const navigate = useNavigate();

  const handleStartAssessment = () => navigate("/ClinicAppointments?book=1&type=consultation&department=skin_care");
  const handleAskTeam = () => navigate("/Messages?channel=advisors&department=skin_care&context=skin_assessment");

  const LOOK_AT_ITEMS = [
    { labelEn: "Skin Concern", labelAr: "حالة البشرة", descEn: "Acne, pigmentation, texture, dullness, redness, pores, or ageing concerns.", descAr: "حب الشباب، والتصبغات، وملمس البشرة، والاحمرار، والمسام، وعلامات التقدم في العمر.", Icon: Layers },
    { labelEn: "Skin Quality", labelAr: "جودة البشرة", descEn: "Glow, smoothness, hydration, firmness, tone, and visible texture.", descAr: "إشراقة البشرة ونعومتها وترطيبها وتماسكها ولونها وملمسها.", Icon: Sparkles },
    { labelEn: "Sensitivity & Barrier", labelAr: "الحساسية وحاجز البشرة", descEn: "Irritation, dryness, reactivity, redness, or barrier weakness.", descAr: "التهيج والجفاف وسرعة تأثر البشرة والاحمرار وضعف حاجزها الواقي.", Icon: ShieldCheck },
    { labelEn: "History", labelAr: "تاريخ الحالة", descEn: "Previous treatments, products, reactions, timelines, and what did or did not work.", descAr: "العلاجات والمنتجات السابقة، وكيف استجابت بشرتك لها، ومتى استخدمتها، وما أفادك منها.", Icon: ClipboardList },
    { labelEn: "Internal Factors", labelAr: "العوامل الداخلية", descEn: "Hormones, inflammation, deficiencies, stress, or other markers when relevant.", descAr: "الهرمونات والالتهاب ونقص العناصر الغذائية والتوتر ومؤشرات أخرى عند الحاجة.", Icon: FlaskConical },
    { labelEn: "Progress Photos", labelAr: "صور متابعة التقدم", descEn: "Clinic-controlled photos help compare skin progress over time.", descAr: "تساعد الصور الملتقطة في العيادة على مقارنة حالة بشرتك مع مرور الوقت.", Icon: Camera },
  ];

  const SKIN_MAP_ITEMS = [
    { labelEn: "Surface", labelAr: "سطح البشرة", descEn: "Texture, pores, dullness, redness, pigmentation.", descAr: "الملمس والمسام والإشراقة والاحمرار والتصبغ.", Icon: Layers },
    { labelEn: "Barrier", labelAr: "حاجز البشرة", descEn: "Sensitivity, dryness, irritation, and reactivity.", descAr: "الحساسية والجفاف والتهيج وسرعة تأثر البشرة.", Icon: ShieldCheck },
    { labelEn: "History", labelAr: "تاريخ الحالة", descEn: "Products, procedures, reactions, and past results.", descAr: "المنتجات والإجراءات السابقة، وكيف استجابت بشرتك لها، ونتائجها.", Icon: ClipboardList },
    { labelEn: "Inside", labelAr: "العوامل الداخلية", descEn: "Hormones, inflammation, biomarkers, stress, and recovery.", descAr: "الهرمونات والالتهاب والمؤشرات الحيوية والتوتر والتعافي.", Icon: Activity },
    { labelEn: "Progress", labelAr: "التقدم", descEn: "Clinic photos and follow-up over time.", descAr: "صور العيادة ومتابعة تحسن البشرة مع مرور الوقت.", Icon: Camera },
  ];

  const HOW_STEPS = [
    { step: "1", titleEn: "Connect with an advisor", titleAr: "تواصل مع مرشد", descEn: "Tell us what you're noticing: acne, pigmentation, dullness, texture, sensitivity, or ageing concerns.", descAr: "أخبرنا بما يزعجك في بشرتك: حب الشباب أو التصبغات أو الملمس أو الحساسية أو علامات التقدم في العمر.", Icon: ClipboardList },
    { step: "2", titleEn: "Share Your History", titleAr: "شارك تجاربك السابقة", descEn: "Add previous treatments, products, reactions, timeline, fears, and what you want to improve.", descAr: "اذكر العلاجات والمنتجات السابقة، وكيف استجابت بشرتك لها، ومتى بدأت المشكلة، وما ترغب في تحسينه.", Icon: User },
    { step: "3", titleEn: "BATO Reviews the Case", titleAr: "يراجع فريق باتو حالتك", descEn: "Your team may review skin photos, sensitivity, treatment history, and internal factors if needed.", descAr: "قد يراجع الفريق صور بشرتك وحساسيتها وتاريخ علاجاتك والعوامل الداخلية عند الحاجة.", Icon: Search },
    { step: "4", titleEn: "Get Your Next Step", titleAr: "حدد خطوتك التالية", descEn: "BATO guides you toward the right next action: consultation, treatment, biomarker review, skin programme, or follow-up.", descAr: "يوجهك فريق باتو إلى الخطوة المناسبة: استشارة أو علاج أو تحاليل أو برنامج للعناية بالبشرة أو متابعة.", Icon: CheckCircle2 },
  ];

  const APPROACH_ITEMS = [
    { titleEn: "Assessment before treatment", titleAr: "التقييم قبل العلاج", descEn: "No guessing before understanding the skin.", descAr: "نفهم بشرتك قبل التوصية بالعلاج.", Icon: ClipboardList },
    { titleEn: "Barrier-aware care", titleAr: "عناية تراعي حاجز البشرة", descEn: "Skin progress depends on respecting sensitivity, barrier health, and treatment timing.", descAr: "نراعي حساسية بشرتك وصحة حاجزها الواقي عند اختيار العلاج وتحديد توقيته.", Icon: ShieldCheck },
    { titleEn: "Inside + outside view", titleAr: "تقييم الحالة من الداخل والخارج", descEn: "Skin can be affected by products, hormones, inflammation, biomarkers, stress, and lifestyle.", descAr: "يمكن أن تتأثر البشرة بالمنتجات والهرمونات والالتهاب والمؤشرات الحيوية والتوتر ونمط الحياة.", Icon: Activity },
    { titleEn: "Clinic-controlled progress photos", titleAr: "صور متابعة موثّقة داخل العيادة", descEn: "Progress is reviewed through consistent BATO photos, not random selfies.", descAr: "نتابع النتائج من خلال صور باتو الملتقطة بطريقة موحدة.", Icon: Camera },
    { titleEn: "Team-guided care", titleAr: "رعاية بإشراف الفريق", descEn: "You can message the Skin Team instead of a generic inbox.", descAr: "يمكنك مراسلة فريق البشرة مباشرةً بدلاً من صندوق رسائل عام.", Icon: MessageSquare },
  ];

  const chips = isRTL
    ? ["حالة البشرة", "حاجز البشرة", "تاريخ الحالة", "العوامل الداخلية", "الخطوة التالية"]
    : ["Concern", "Barrier", "History", "Internal factors", "Next step"];

  return (
    <div className="space-y-5">

      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="bato-style-hero relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(150deg, #2e2418 0%, #3a2e1e 40%, #3e352c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: [
            "radial-gradient(ellipse 60% 50% at 85% 15%, rgba(196,170,139,0.18) 0%, transparent 60%)",
            "radial-gradient(ellipse 40% 60% at 10% 80%, rgba(231,203,80,0.06) 0%, transparent 55%)",
          ].join(", ")
        }} />
        <div className="relative z-10 p-5 min-[390px]:p-6 pb-8">
          <div className="flex items-start justify-between mb-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "rgba(196,170,139,0.65)" }}>{t("Skin Consultation", "استشارة البشرة")}</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(196,170,139,0.12)", border: "1px solid rgba(196,170,139,0.2)" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#c4aa8b" }} />
            </div>
          </div>
          <h2 className="text-white font-bold text-2xl leading-snug mb-2.5">{t("Your Skin, Understood", "بشرتك… نفهمها بعناية")}</h2>
          <p className="text-sm leading-relaxed mb-7" style={{ color: "rgba(238,235,230,0.58)" }}>
            {t("BATO starts by understanding your skin concern, sensitivity, history, lifestyle, and possible internal factors — before recommending anything.", "نبدأ في باتو بفهم حالة بشرتك وحساسيتها وتاريخ علاجاتك ونمط حياتك والعوامل الداخلية المحتملة، قبل التوصية بأي خطوة.")}
          </p>
          <div className="space-y-2.5 mb-7">
            <Button onClick={handleStartAssessment} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold border-0"
              style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              {t("Request a Skin Consultation", "اطلب استشارة البشرة")}
            </Button>
            <Button onClick={handleAskTeam} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold"
              style={{ background: "transparent", color: "#c4aa8b", border: "1px solid rgba(196,170,139,0.35)" }}>
              {t("Connect with an advisor", "تواصل مع مرشد")}
            </Button>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "rgba(238,235,230,0.4)" }}>
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
          {LOOK_AT_ITEMS.map((item, idx) => (
            <motion.div key={item.labelEn} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bato-style-surface p-4 rounded-2xl border"
              style={{ background: "#faf9f7", borderColor: "rgba(196,170,139,0.15)", boxShadow: "0 1px 6px rgba(58,46,30,0.04)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.15)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <p className="text-sm font-semibold text-[#333435] mb-1 leading-tight"><CareText value={isRTL ? item.labelAr : item.labelEn} /></p>
              <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={isRTL ? item.descAr : item.descEn} /></p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── YOUR SKIN MAP ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="bato-style-surface rounded-2xl overflow-hidden"
        style={{ background: "#faf9f7", border: "1px solid rgba(196,170,139,0.18)", boxShadow: "0 2px 12px rgba(58,46,30,0.05)" }}>
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-1.5">{t("Your Skin Map", "خريطة بشرتك")}</p>
          <p className="text-sm font-semibold text-[#333435] mb-0.5">{t("BATO looks at skin from multiple angles", "نقيّم بشرتك من جوانب متعددة")}</p>
          <p className="text-xs text-[#7c8689] mb-4">{t("Before recommending care, your team reviews all relevant dimensions.", "يراجع الفريق العوامل المؤثرة في بشرتك قبل التوصية بالعناية المناسبة.")}</p>
          <div className="grid grid-cols-2 gap-2">
            {SKIN_MAP_ITEMS.map((item) => (
              <div key={item.labelEn} className="bato-style-surface flex gap-2.5 items-start p-3 rounded-xl"
                style={{ background: "white", border: "1px solid rgba(196,170,139,0.1)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(196,170,139,0.08)" }}>
                  <item.Icon className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#333435] mb-0.5"><CareText value={isRTL ? item.labelAr : item.labelEn} /></p>
                  <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={isRTL ? item.descAr : item.descEn} /></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── WHY ASSESSMENT COMES FIRST ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(135deg, #faf9f7 0%, #f4f1ec 100%)", border: "1px solid rgba(196,170,139,0.22)", boxShadow: "0 2px 16px rgba(58,46,30,0.06)" }}>
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,170,139,0.12) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-2.5">{t("Why assessment comes first", "لماذا يبدأ الأمر بالتقييم")}</p>
          <p className="text-base font-semibold text-[#333435] leading-snug mb-1.5">
            {t("Skin concerns can look similar — but the cause can be different.", "قد تبدو مشكلات البشرة متشابهة من الخارج — لكن السبب قد يكون مختلفًا.")}
          </p>
          <p className="text-sm text-[#7c8689] leading-relaxed mb-4">
            {t("That's why BATO starts with assessment before recommending care.", "لهذا نبدأ في باتو بالتقييم قبل اقتراح العلاج.")}
          </p>
          <div className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <div key={chip} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.22)" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#c4aa8b" }} />
                <span className="text-xs font-medium" style={{ color: "#3a2e1e" }}><CareText value={chip} /></span>
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
          style={{ background: "#faf9f7", borderColor: "rgba(196,170,139,0.15)", boxShadow: "0 1px 8px rgba(58,46,30,0.04)" }}>
          {HOW_STEPS.map((item, idx, arr) => (
            <div key={item.step} className="flex gap-3 px-4 py-3.5 items-start"
              style={{ borderBottom: idx < arr.length - 1 ? "1px solid rgba(196,170,139,0.1)" : "none" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.12)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "rgba(196,170,139,0.7)" }}><CareText value={item.step} /></span>
                  <p className="text-sm font-semibold text-[#333435]"><CareText value={isRTL ? item.titleAr : item.titleEn} /></p>
                </div>
                <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={isRTL ? item.descAr : item.descEn} /></p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── THE BATO SKIN APPROACH ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]">{t("The BATO skin approach", "نهج باتو في العناية بالبشرة")}</p>
        <div className="grid grid-cols-1 gap-2">
          {APPROACH_ITEMS.map((item, idx) => (
            <motion.div key={item.titleEn} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.04 }}
              className="bato-style-surface flex gap-3 items-start p-4 rounded-xl border"
              style={{ background: "white", borderColor: "rgba(196,170,139,0.13)", boxShadow: "0 1px 4px rgba(58,46,30,0.03)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,170,139,0.09)", border: "1px solid rgba(196,170,139,0.13)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#333435] mb-0.5"><CareText value={isRTL ? item.titleAr : item.titleEn} /></p>
                <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={isRTL ? item.descAr : item.descEn} /></p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

        </div>
      </details>

      {/* ── BOTTOM CTA ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="bato-style-hero bato-closing-invitation relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(150deg, #2e2418 0%, #3a2e1e 40%, #3e352c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(ellipse 50% 60% at 90% 20%, rgba(196,170,139,0.15) 0%, transparent 60%)",
        }} />
        <div className="relative z-10 p-5 min-[390px]:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(196,170,139,0.6)" }}>{t("Ready when you are", "ابدأ عندما تكون مستعداً")}</p>
          <p className="text-white font-bold text-xl leading-snug mb-2">{t("Ready to understand your skin?", "هل أنت مستعد لفهم بشرتك؟")}</p>
          <p className="text-sm mb-7 leading-relaxed" style={{ color: "rgba(238,235,230,0.5)" }}>
            {t("Request a consultation or connect with an advisor to understand your options.", "اطلب استشارة أو تواصل مع مرشد لفهم خياراتك.")}
          </p>
          <div className="space-y-2.5">
            <Button onClick={handleStartAssessment} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold border-0"
              style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              {t("Request a Skin Consultation", "اطلب استشارة البشرة")}
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

// ─── Active Dossier ───────────────────────────────────────────────────────────
function SkinDossier({ user, activePackage, sessions, caseFile, onBook, isRTL, t, onAskTeam }) {
  const gradientId=useId().replace(/:/g,"");
  const {used: sessionsUsed, total: totalSessions, progress, remaining} = programCounts(activePackage);
  const isActive = activePackage.status === "active";
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
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 85% 8%, rgba(231,203,80,0.12) 0%, transparent 50%), radial-gradient(circle at 10% 88%, rgba(196,170,139,0.08) 0%, transparent 55%)" }} />
        <div className="relative z-10">
          <p className="text-[10px] font-semibold tracking-widest uppercase mb-0.5" style={{ color: "rgba(196,170,139,0.7)" }}>
            {isActive ? t("Skin Journey · Active Programme", "رحلة البشرة · برنامج نشط") : t("Skin Journey · Care History", "رحلة البشرة · سجل الرعاية")}
          </p>
          <h2 className="text-white font-bold text-lg leading-snug mb-1"><CareText value={activePackage.package_name} /></h2>
          <p className="text-xs mb-4" style={{ color: "rgba(238,235,230,0.5)" }}>
            {t("Clinical skin care programme", "برنامج العناية بالبشرة بإشراف الفريق الطبي")}
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
                <span className="text-white text-xl font-bold leading-none"><CareText value={progress} />%</span>
                <span className="text-[9px] mt-0.5 font-medium" style={{ color: "rgba(196,170,139,0.7)" }}>{t("complete", "مكتمل")}</span>
              </div>
            </div>
            <div className={`flex-1 space-y-2 ${isRTL ? 'text-right' : 'text-left'}`}>
              <div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(196,170,139,0.55)" }}>{t("Sessions", "الجلسات")}</p>
                <p className="text-white font-semibold text-sm">{t("Session", "الجلسة")} <CareText value={sessionsUsed} /> {t("of", "من")} <CareText value={totalSessions} /></p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(196,170,139,0.55)" }}>{t("Remaining", "المتبقي")}</p>
                <p className="text-white font-semibold text-sm"><CareText value={remaining} /> {t(remaining !== 1 ? "sessions" : "session", remaining !== 1 ? "جلسات" : "جلسة")}</p>
              </div>
              {isActive && activePackage.next_recommended_date && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(196,170,139,0.55)" }}>{t("Next Recommended", "الخطوة التالية المقترحة")}</p>
                  <p className="text-white font-semibold text-sm" dir="ltr"><CareText value={format(activePackage.next_recommended_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})} /></p>
                </div>
              )}
            </div>
          </div>
          {isActive && remaining > 0 && (
            <Button onClick={onBook} className={`w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0 `} style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t("Request Next Skin Session", "اطلب جلسة البشرة التالية")}
            </Button>
          )}
        </div>
      </motion.div>

      <CustomerCareHub user={user} department="skin_care" programId={activePackage.id} journeyPage />
      <SectionCard icon={User} title={t("Your Skin Case","حالة بشرتك")} subtitle={t("Personal skin profile summary","ملخص حالة بشرتك")}>
        <div>
          {[
            { labelEn: "Main Concern", labelAr: "المشكلة الرئيسية", value: caseFile?.diagnosis },
            { labelEn: "Skin Type", labelAr: "نوع البشرة", value: null },
            { labelEn: "Focus Areas", labelAr: "المناطق المستهدفة", value: null },
            { labelEn: "Sensitivity", labelAr: "الحساسية", value: null },
            { labelEn: "Pigmentation", labelAr: "التصبغ", value: null },
            { labelEn: "Skin Goals", labelAr: "أهداف العناية بالبشرة", value: caseFile?.treatment_goals },
            { labelEn: "Assigned Specialist", labelAr: "الأخصائي المسؤول", value: caseFile?.assigned_specialist },
          ].map(row => (
            <div key={row.labelEn} className={`flex items-start gap-3 py-2.5 `} style={{ borderBottom: "1px solid rgba(196,170,139,0.1)" }}>
              <p className="text-xs text-[#7c8689] w-[40%] shrink-0 pt-0.5"><CareText value={isRTL ? row.labelAr : row.labelEn} /></p>
              <p className={`text-sm text-[#333435] font-medium min-w-0 break-words flex-1 ${isRTL ? 'text-right' : ''}`}><CareText value={row.value || t("To be updated by your skin team.", "سيحدّث فريق البشرة هذه المعلومات.")} /></p>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Why this plan */}
      <SectionCard icon={FileText} title={t("Why This Plan", "لماذا هذه الخطة")} subtitle={t("How your skin programme was selected", "لماذا اخترنا هذا البرنامج لبشرتك؟")}>
        <p className="text-sm text-[#7c8689] leading-relaxed mb-4">
          {t("This programme was selected based on your skin assessment, concern, sensitivity, lifestyle, and goals.", "تم اختيار هذا البرنامج بناءً على تقييم بشرتك وحالتها وحساسيتها ونمط حياتك وأهدافك.")}
        </p>
        <BulletList items={[
          t("The treatment type was matched to your skin concern and skin type.", "اختير نوع العلاج بما يناسب حالة بشرتك ونوعها."),
          t("Multiple sessions are required because skin cell renewal is gradual.", "قد تحتاج إلى عدة جلسات لأن تجدد البشرة يحدث تدريجيًا."),
          t("Progress is reviewed through sessions, photos, and skin response.", "يُراجَع التقدم من خلال الجلسات والصور واستجابة البشرة."),
          t("Additional treatments may be introduced only if the team sees a clear benefit.", "قد نضيف علاجات أخرى إذا رأى الفريق أنها ستفيد بشرتك."),
          t("The goal is a structured programme — not random one-off treatments.", "الهدف خطة علاج منظمة، بدلاً من جلسات متفرقة دون خطة."),
        ]} />
      </SectionCard>

      {/* Treatment Goals */}
      <SectionCard icon={TrendingUp} title={t("Treatment Goals", "أهداف العلاج")} subtitle={t("Primary and secondary skin objectives", "أهداف برنامج العناية بالبشرة")}>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{t("Primary Goals", "الأهداف الرئيسية")}</p>
            <BulletList items={[
              t("Improve skin texture and smoothness.", "تحسين ملمس البشرة ونعومتها."),
              t("Support an even, balanced skin tone.", "تحسين تجانس لون البشرة."),
              t("Boost hydration and barrier function.", "تحسين الترطيب ودعم الحاجز الواقي للبشرة."),
              t("Track visible improvement through photos and sessions.", "متابعة التحسن بالصور والجلسات."),
              t("Build a consistent, clinically-guided skin routine.", "بناء روتين منتظم للعناية بالبشرة بإشراف الفريق الطبي."),
            ]} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{t("Secondary Goals", "الأهداف الثانوية")}</p>
            <BulletList items={[
              t("Improve skin confidence over time.", "تعزيز ثقتك ببشرتك مع مرور الوقت."),
              t("Create a long-term maintenance plan post-programme.", "وضع خطة للحفاظ على النتائج بعد انتهاء البرنامج."),
              t("Identify product routine that supports results.", "اختيار منتجات عناية تدعم النتائج."),
            ]} />
          </div>
          <div className="p-3 rounded-xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
            <p className="text-sm text-[#7c8689] italic leading-relaxed">
              {t('"Skin progress is cumulative. The goal is to track response over the full programme — not judge results after one session."', "\"تحسن البشرة تدريجي. نتابع استجابتها طوال البرنامج، ولا نحكم على النتائج بعد جلسة واحدة.\"")}
            </p>
          </div>
        </div>
      </SectionCard>

      {/* Complete Plan */}
      <SectionCard icon={Package} title="Your Complete Treatment Plan" subtitle="All components explained">
        <div className="space-y-2.5">
          {PLAN_COMPONENTS.map((c, i) => {
            const st = STATUS_STYLE[c.status] || STATUS_STYLE["Optional"];
            return (
              <div key={i} className="bato-style-surface p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#333435]"><CareText value={c.name} /></p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                    style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}><CareText value={c.status} /></span>
                </div>
                <p className="text-sm text-[#7c8689] leading-relaxed mb-1"><CareText value={c.purpose} /></p>
                <p className="text-xs text-[#7c8689]"><span className="font-medium"><CareText value={"When:"} />{" "}</span><CareText value={c.when} /></p>
                {c.note && <p className="text-xs" style={{ color: "rgba(196,170,139,0.7)" }}><CareText value={c.note} /></p>}
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
            { key: "assessment", label: "Skin Consultation", status: ["treatment_planned","in_treatment","post_treatment","completed"].includes(caseFile?.case_status) ? "completed" : "upcoming", purpose: "Skin type, concern, and history evaluated. Programme confirmed.", what: "Specialist reviews skin condition and recommends the plan." },
            ...Array.from({ length: totalSessions }, (_, i) => {
              const num = i + 1;
              const s = completedSessions[i];
              return {
                key: `s${num}`, label: `Session ${num}`,
                status: num <= sessionsUsed ? "completed" : isActive && num === sessionsUsed + 1 ? "next" : "upcoming",
                sessionData: s,
                purpose: num <= 2 ? "Begin the protocol and prepare the skin." : num <= 4 ? "Continue treatment rhythm and monitor response." : "Complete the core programme and prepare for review.",
                what: t(`Protocol session ${num} applied as per the skin plan.`, `تُنفذ الجلسة ${num} وفق خطة علاج البشرة.`),
                aftercare: "Follow SPF, product, and washing instructions given after each session.",
              };
            }),
            { key: "review", label: "Progress Review", status: ["post_treatment","completed"].includes(caseFile?.case_status) ? "completed" : "locked", purpose: "Team reviews visible progress, photos, and next steps." },
            { key: "maintenance", label: "Maintenance Phase", status: "locked", purpose: "Long-term skin care plan defined after the core programme." },
          ].map((step, idx, arr) => (
            <SkinSessionRow key={step.key} step={step} isLast={idx === arr.length - 1} onBook={onBook} isRTL={isRTL} t={t} />
          ))}
        </div>
      </SectionCard>

      {/* Expectations Timeline */}
      <SectionCard icon={Clock} title="What To Expect Over Time" subtitle="Realistic, stage-by-stage guide">
        <p className="text-sm text-[#7c8689] mb-4 leading-relaxed"><CareText value={"Skin response varies by person. Your team will advise based on your individual case."} /></p>
        <div className="space-y-3">
          {TIMELINE_EXPECTATIONS.map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: "rgba(196,170,139,0.12)" }}>
                <span className="text-[9px] font-bold" style={{ color: "#c4aa8b" }}><CareText value={i + 1} /></span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#333435]"><CareText value={item.phase} /></p>
                <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={item.desc} /></p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
          <p className="text-xs text-[#7c8689] italic"><CareText value={"\"We do not guarantee specific skin outcomes. Progress is tracked individually.\""} /></p>
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
            <p className="text-sm font-medium text-[#333435] mb-1"><CareText value={"No progress photos yet"} /></p>
            <p className="text-xs text-[#7c8689]"><CareText value={"The clinic team will upload photos to track your skin improvement over time."} /></p>
          </div>
        )}
      </SectionCard>

      {/* Care Rules */}
      <BatoSectionIntro title={t("Care and support", "العناية والدعم")} />
      <SectionCard icon={ShieldCheck} title="Care Rules" subtitle="Before, after, and at home">
        <div className="space-y-5">
          {CARE_RULES.map(group => (
            <div key={group.heading}>
              <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}><CareText value={group.heading} /></p>
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
              {latestNote.specialist_name && <span>— <CareText value={latestNote.specialist_name} /></span>}
              {latestNote.session_date && <span><CareText value={format(latestNote.session_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})} /></span>}
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(196,170,139,0.3)" }} />
            <p className="text-sm text-[#7c8689]"><CareText value={"No team notes yet. Updates will appear after your next review."} /></p>
          </div>
        )}
      </SectionCard>

      {/* FAQ */}
      <SectionCard icon={HelpCircle} title="Frequently Asked Questions">
        {SKIN_FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
      </SectionCard>

      {/* Documents */}
      <SectionCard icon={FileText} title="Documents" subtitle="Treatment summary and aftercare files">
        <div className="text-center py-5">
          <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(196,170,139,0.3)" }} />
          <p className="text-sm text-[#7c8689]"><CareText value={"No documents available yet."} /></p>
          <p className="text-xs text-[#7c8689] mt-1"><CareText value={"Treatment summaries and aftercare guides will appear here."} /></p>
        </div>
      </SectionCard>

      {/* CTA Footer */}
      <div className="bato-style-hero relative overflow-hidden rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, rgba(231,203,80,0.08) 0%, transparent 60%)" }} />
        <div className="relative z-10">
          <p className="text-white font-semibold text-sm mb-1">{isActive ? t("Ready for your next session?", "هل أنت مستعد لجلستك القادمة؟") : t("Your care history stays with you.", "سجل رعايتك محفوظ هنا.")}</p>
          <p className="text-xs mb-4" style={{ color: "rgba(238,235,230,0.55)" }}>{t("Keep your skin journey on track.", "واصل العناية ببشرتك.")}</p>
          <div className="space-y-2">
            {isActive && remaining > 0 && <Button onClick={onBook} className={`w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0 `} style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              <Calendar className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t("Request Next Skin Session", "اطلب جلسة البشرة التالية")}
            </Button>}
            <Button onClick={onAskTeam} className={`w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold `} style={{ background: "transparent", color: "rgba(238,235,230,0.8)", border: "1px solid rgba(196,170,139,0.3)" }}>
              <MessageSquare className={`w-4 h-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />{t("Contact your specialist", "تواصل مع أخصائيك")}
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default function SkinJourney() {
  const [programParams] = useSearchParams();
  const { user: contextUser, isLoadingAuth } = useAuth();
  // Resolve the signed-in SDK session when the preview has no context user.
  const accountQuery = useQuery({
    queryKey: ["skinJourneyAccount"],
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

  const { data: caseFiles = [], isLoading: caseFileLoading, isError: caseFileError } = useQuery({
    queryKey: ["journeyCaseFiles", user?.email, "skin_care"],
    queryFn: async () => { const c = await base44.entities.CaseFile.filter({ client_email: user.email, primary_department: "skin_care" }, "-created_date"); return c; },
    enabled: !!user, initialData: undefined, retry: 1, staleTime: 1000 * 60,
  });
  const { data: sessions = [], isPending: sessionsLoading, isError: sessionsError } = useQuery({
    queryKey: ["skinSessions", user?.email],
    queryFn: () => loadCompletedTreatmentSessions(user.email).then(rows=>rows.filter(row=>row.department==="skin_care")),
    enabled: !!user,
  });
  const { data: packages = [], isPending: packagesPending, isError: packagesError } = useQuery({
    queryKey: ["packages", user?.email, "skinJourney"],
    queryFn: () => base44.entities.Package.filter({ client_email: user.email }, "-created_date"),
    enabled: !!user, retry: 1, staleTime: 1000 * 60,
  });

  const skinPackages = packages.filter(p => programDepartment(p) === "skin_care");
  const displayedPackage = skinPackages.find(p => p.id === programParams.get("program")) || skinPackages.find(p => p.status === "active") || skinPackages[0] || null;
  const activePackage = displayedPackage?.status === "active" ? displayedPackage : null;
  const caseFile = caseForProgram(caseFiles,displayedPackage,packages);
  const displayedSessions = sessionsForProgram(sessions, displayedPackage, packages);
  const hasQueryError = (!contextUser && accountQuery.isError) || caseFileError || packagesError || sessionsError;

  if (isLoadingAuth || (!contextUser && (accountQuery.isPending || accountQuery.isFetching)) || (!!user && (caseFileLoading || packagesPending || sessionsLoading))) {
    return <JourneySkeleton isRTL={isRTL} />;
  }

  if (!packagesPending && programParams.get("program") && !skinPackages.some(p=>p.id===programParams.get("program"))) return <div role="alert" className="p-6 space-y-3"><p>{t("This program is not available in your care records.","هذا البرنامج غير متاح في سجلات رعايتك.")}</p><button className="underline py-3" onClick={()=>navigate("/SkinJourney")}>{t("View my journey","عرض رحلتي")}</button></div>;

  if (hasQueryError) {
    return (
      <div className={`min-h-screen pb-10 flex items-center justify-center ${isRTL ? "text-right" : "text-left"}`} style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-md text-center px-4">
          <h2 className="text-lg font-bold text-[#333435] mb-2">{t("Something went wrong", "حدث خطأ ما")}</h2>
          <p className="text-sm text-[#7c8689] mb-5">{t("We couldn't load your skin journey. Try refreshing the page or message Customer service for help.", "لم نتمكن من تحميل رحلة بشرتك. حاول تحديث الصفحة أو راسل خدمة العملاء للمساعدة.")}</p>
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
            <h1 className="text-2xl font-bold text-[#333435]"><CareText value={displayedPackage ? t("Skin Journey", "رحلة البشرة") : t("Skin Consultation", "استشارة البشرة")} /></h1>
            <p className="text-xs text-[#7c8689]">
              <CareText value={displayedPackage ? t("Your complete skin treatment plan, timeline, and progress", "خطة علاج بشرتك ومواعيد الجلسات وسجل المتابعة") : t("Understand your skin before starting treatment.", "افهم بشرتك قبل البدء بالعلاج.")} />
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full mt-0.5 flex-shrink-0"
            style={displayedPackage ? { background: "rgba(196,170,139,0.15)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.35)" } : { background: "#f9f8f6", color: "#7c8689", border: "1px solid rgba(124,134,137,0.2)" }}>
            <CareText value={activePackage ? t("Active Programme", "برنامج نشط") : displayedPackage ? t("Care History", "سجل الرعاية") : t("First step", "الخطوة الأولى")} />
          </span>
        </div>
        {!displayedPackage&&<CustomerCareHub user={user} department="skin_care" programId={displayedPackage?.id} journeyPage />}
        {displayedPackage
          ? <SkinDossier user={user} activePackage={displayedPackage} sessions={displayedSessions} caseFile={caseFile}
              onBook={() => setShowBooking(true)} isRTL={isRTL} t={t}
              onAskTeam={() => navigate("/Messages?channel=skin_team&context=skin_review")} />
          : <SkinExplore isRTL={isRTL} t={t} />}
      </div>
      {user && activePackage && (
        <BookingCalendar open={showBooking} onClose={() => setShowBooking(false)} userEmail={user.email} packageData={activePackage} department="skin_care" appointmentType="treatment"
          onBookingSuccess={() => { queryClient.invalidateQueries({ queryKey: ["packages"] }); setShowBooking(false); }} />
      )}
    </div>
  );
}