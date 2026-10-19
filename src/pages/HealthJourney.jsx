import SectionCard from "@/components/design/JourneySectionCard";
import BatoSectionIntro from "@/components/design/BatoSectionIntro";
import CustomerLoadState from "@/components/CustomerLoadState";
import { ar } from "date-fns/locale";
import { format } from "@/lib/customerFormatting";
import CustomerCareHub from "@/components/care/CustomerCareHub";
import CareText from "@/components/CareText";
import { getBiomarkerDisplayResult } from "@/lib/biomarkerUtils";
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { Button } from "@/components/ui/button";
import {
  ChevronDown, ChevronUp, MessageSquare, Droplets, Activity, Sun, Heart,
  FileText, HelpCircle, ShieldCheck, TrendingUp, Package, ClipboardList, User, Clock,
  Zap, FlaskConical, Layers, Search, CheckCircle2, Sparkles, AlertCircle
} from "lucide-react";

import { useLocation } from "../components/LocationContext";
import { useNavigate } from "react-router-dom";
import BiomarkersSection from "../components/biomarkers/BiomarkersSection";

const BLOOD_TYPES   = ["blood_test_panel","hormone_panel","vitamin_mineral_panel","iron_ferritin_panel","liver_function_panel","kidney_function_panel","crp_inflammation_marker","urine_test","diagnostic_panel"];
const DRIP_TYPES    = ["iron_drip","ferinject","glutathione_drip","glutathione_drip_course_of_4","iv_therapy"];
const CONSULT_TYPES = ["medical_consultation","follow_up_consultation"];
const ALL_HEALTH    = [...BLOOD_TYPES, ...DRIP_TYPES, ...CONSULT_TYPES];

const VITALS = [
  { key: "iron",     icon: Droplets, label: "Iron & Ferritin",    types: ["iron_ferritin_panel","iron_drip","ferinject"],              desc: "Low ferritin is commonly linked to hair shedding, fatigue, and slow recovery." },
  { key: "hormones", icon: Activity, label: "Hormones",            types: ["hormone_panel"],                                           desc: "Hormonal imbalances can affect hair, skin, energy, and mood." },
  { key: "vitD",     icon: Sun,      label: "Vitamin D",           types: ["vitamin_mineral_panel","diagnostic_panel"],                 desc: "Vitamin D deficiency may slow hair growth, affect mood, and reduce immunity." },
  { key: "thyroid",  icon: Heart,    label: "Thyroid",             types: ["diagnostic_panel"],                                        desc: "Thyroid function can affect metabolism, hair density, and skin quality." },
];

const PLAN_COMPONENTS = [
  { name: "Medical Consultation", status: "Included when relevant", purpose: "Doctor reviews your case and recommends any internal investigations.", when: "Before or alongside your main treatment programme." },
  { name: "Blood Panels", status: "Optional", purpose: "Targeted panels to review iron, hormones, vitamins, or inflammation markers.", when: "Only if the doctor or specialist identifies a relevant need.", note: "Not required for every client." },
  { name: "Iron / Ferinject Drip", status: "Optional", purpose: "IV iron support when ferritin is clinically low.", when: "Prescribed by the doctor based on blood results.", note: "Not automatically offered." },
  { name: "Glutathione / IV Therapy", status: "Optional", purpose: "IV nutrition support for skin, energy, or recovery.", when: "Only when the team recommends it.", note: "Not a standard part of every health journey." },
  { name: "Follow-up Consultations", status: "Included when relevant", purpose: "Review of results and next steps with the doctor.", when: "After initial panels or drip courses." },
  { name: "Long-term Monitoring", status: "Later stage", purpose: "Ongoing health tracking if relevant to your case.", when: "Defined at the review stage." },
];

const STATUS_STYLE = {
  "Included when relevant": { bg: "rgba(196,170,139,0.12)", color: "#3a2e1e", border: "rgba(196,170,139,0.3)" },
  "Optional":               { bg: "#f9f8f6", color: "#7c8689", border: "rgba(124,134,137,0.18)" },
  "Later stage":            { bg: "#f9f8f6", color: "#7c8689", border: "rgba(124,134,137,0.15)" },
};

const HEALTH_FAQS = [
  { q: "Do I need blood tests?", a: "Not necessarily. Blood panels are only recommended if the team believes internal factors may be relevant to your case (e.g., hair shedding linked to low ferritin)." },
  { q: "Will my hair team automatically ask for panels?", a: "Only if they believe it is relevant. Internal support is never automatically pushed to every client." },
  { q: "What is ferritin and why does it matter?", a: "Ferritin stores iron in your body. Low ferritin is commonly linked to hair shedding. A panel can check your levels." },
  { q: "What does a hormone panel check?", a: "It may assess thyroid function, androgens, oestrogen, and other hormones that can affect hair, skin, and energy." },
  { q: "Are drips safe?", a: "When prescribed by a qualified doctor and administered correctly, IV therapies are considered safe. Your BATO doctor oversees all prescriptions." },
  { q: "How will I know if I need a drip?", a: "Your doctor will advise you based on your consultation and any relevant blood results." },
  { q: "Do I have to do all of these?", a: "No. Health support is always optional and individually tailored. Nothing is done without your knowledge and agreement." },
  { q: "When should I contact your specialist about health concerns?", a: "If you feel unwell, notice new symptoms, or have concerns about medication, supplements, or energy levels." },
];


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
          <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <p className="text-sm text-[#7c8689] leading-relaxed pb-3"><CareText value={a} /></p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function HealthExplore({ isRTL, t }) {
  const navigate = useNavigate();
  const handleStartReview = () => navigate("/ClinicAppointments?book=1&type=consultation&department=general_health");
  const handleAskTeam = () => navigate("/Messages?channel=advisors&department=general_health&context=health_review");
  const handleAskPanel = () => navigate("/Messages?channel=advisors&department=general_health&context=full_bato_panel");

  return (
    <div className="space-y-5">

      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="bato-style-hero relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(150deg, #1e1a14 0%, #2e2418 35%, #3a2e1e 70%, #3e352c 100%)" }}>

        {/* layered glow */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: [
            "radial-gradient(ellipse 55% 45% at 88% 12%, rgba(196,170,139,0.2) 0%, transparent 55%)",
            "radial-gradient(ellipse 35% 50% at 8% 85%, rgba(231,203,80,0.07) 0%, transparent 50%)",
          ].join(", ")
        }} />
        {/* subtle grid data motif */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
          backgroundImage: "linear-gradient(rgba(196,170,139,1) 1px, transparent 1px), linear-gradient(90deg, rgba(196,170,139,1) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }} />

        <div className="relative z-10 p-5 min-[390px]:p-6 pb-8">
          <div className="flex items-start justify-between mb-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "rgba(196,170,139,0.6)" }}><CareText value={"BATO Health Review"} /></p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.2)" }}>
              <FlaskConical className="w-4 h-4" style={{ color: "#c4aa8b" }} />
            </div>
          </div>

          <h2 className="text-white font-bold text-2xl leading-snug mb-2.5">{t("Complete the picture.", "فهم حالتك يبدأ من الداخل.")}</h2>
          <p className="text-sm leading-relaxed mb-7" style={{ color: "rgba(238,235,230,0.55)", maxWidth: "32ch" }}>
            {t("Hair, skin, energy, and recovery can be affected by internal markers. BATO reviews health signals like biomarkers, deficiencies, inflammation, hormones, and treatment readiness when relevant.", "قد ترتبط صحة الشعر والبشرة والطاقة والتعافي بعوامل داخلية. يراجع فريق باتو التحاليل والنقص الغذائي والالتهاب والهرمونات ومدى جاهزيتك للعلاج عند الحاجة.")}
          </p>

          <div className="space-y-2.5 mb-7">
            <Button onClick={handleStartReview} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold border-0"
              style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              {t("Request a Health Review", "اطلب مراجعة صحية")}
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

      {/* ── CORE POSITIONING ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="bato-style-surface relative overflow-hidden rounded-2xl p-5"
        style={{ background: "#faf9f7", border: "1px solid rgba(196,170,139,0.2)", boxShadow: "0 2px 12px rgba(58,46,30,0.05)" }}>
        <div className="absolute right-0 top-0 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,170,139,0.1) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-2.5"><CareText value={"The BATO difference"} /></p>
        <p className="text-sm font-semibold text-[#333435] mb-1.5 leading-snug">
          {t("Your blood test should not just be a PDF.", "لا ينبغي أن يكون تحليل الدم مجرد ملف PDF.")}
        </p>
        <p className="text-sm text-[#7c8689] leading-relaxed">
          {t("Most labs give you numbers. BATO helps you understand what those numbers may mean for hair, skin, energy, recovery, and treatment readiness.", "تمنحك المختبرات أرقاماً. نساعدك في باتو على فهم ارتباطها بصحة شعرك وبشرتك وطاقتك وتعافيك وجاهزيتك للعلاج.")}
        </p>
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
            { labelEn: "Biomarkers", labelAr: "المؤشرات الحيوية", descEn: "Ferritin, vitamin D, B12, zinc, thyroid, hormones, inflammation, and other markers when relevant.", descAr: "الفيريتين وفيتامين د وب١٢ والزنك والغدة الدرقية والهرمونات ومؤشرات الالتهاب وغيرها عند الحاجة.", Icon: FlaskConical },
            { labelEn: "Hair Support", labelAr: "دعم الشعر", descEn: "Internal markers may be reviewed when shedding, thinning, or density concerns are present.", descAr: "قد نراجع التحاليل عند وجود تساقط أو ترقق أو انخفاض في كثافة الشعر.", Icon: TrendingUp },
            { labelEn: "Skin & Glow", labelAr: "البشرة والنضارة", descEn: "BATO may look at inflammation, hormones, deficiencies, glucose/insulin, and recovery signals.", descAr: "قد يراجع الفريق مؤشرات الالتهاب والهرمونات والنقص الغذائي وسكر الدم والإنسولين والتعافي.", Icon: Sparkles },
            { labelEn: "Energy & Recovery", labelAr: "الطاقة والتعافي", descEn: "Fatigue, low energy, recovery, stress, and deficiencies may be part of the bigger picture.", descAr: "قد يساعد تقييم الإرهاق وانخفاض الطاقة والتعافي والتوتر والنقص الغذائي على فهم حالتك بشكل أشمل.", Icon: Zap },
            { labelEn: "Treatment Readiness", labelAr: "الجاهزية للعلاج", descEn: "Some treatments are better supported when internal factors are reviewed first.", descAr: "قد تساعد مراجعة العوامل الداخلية أولاً على دعم بعض العلاجات.", Icon: CheckCircle2 },
            { labelEn: "Medical Review", labelAr: "المراجعة الطبية", descEn: "Your team can review safety markers when needed before recommending next steps.", descAr: "يمكن لفريقك مراجعة مؤشرات السلامة عند الحاجة قبل التوصية بالخطوات التالية.", Icon: ShieldCheck },
          ].map((item, idx) => (
            <motion.div key={item.labelEn} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.04 }}
              className="bato-style-surface p-4 rounded-2xl border"
              style={{ background: "white", borderColor: "rgba(196,170,139,0.15)", boxShadow: "0 1px 6px rgba(58,46,30,0.04)" }}>
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

      {/* ── WHOOP-STYLE BIOMARKER TEASER ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="bato-style-surface rounded-2xl overflow-hidden border"
        style={{ background: "#faf9f7", borderColor: "rgba(196,170,139,0.18)", boxShadow: "0 2px 12px rgba(58,46,30,0.05)" }}>
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-1"><CareText value={"BATO Biomarker Review"} /></p>
          <p className="text-sm font-semibold text-[#333435] mb-0.5"><CareText value={"A clearer way to understand your blood results."} /></p>
          <p className="text-sm text-[#7c8689] mb-4 leading-relaxed"><CareText value={"BATO compares standard health ranges with BATO hair, skin, and recovery targets when clinically relevant."} /></p>

          <div className="space-y-2.5 mb-4">
            {[
              { name: "Ferritin", context: "Hair Support" },
              { name: "Vitamin D", context: "Skin & Recovery" },
              { name: "Zinc", context: "Hair & Skin" },
            ].map((marker) => (
              <div key={marker.name} className="bg-white rounded-xl p-3.5 border"
                style={{ borderColor: "rgba(196,170,139,0.12)" }}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-[#333435]"><CareText value={marker.name} /></p>
                    <p className="text-xs font-medium" style={{ color: "#c4aa8b" }}>{marker.context === "Hair & Skin" ? t("Hair & Skin", "الشعر والبشرة") : <CareText value={marker.context} />}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                      style={{ background: "#f4f1ec", color: "#7c8689", border: "1px solid rgba(124,134,137,0.15)" }}><CareText value={"Result after review"} /></div>
                  </div>
                </div>
                {/* Placeholder bars */}
                <div className="space-y-1.5">
                  <div>
                    <div className="flex justify-between text-[10px] text-[#7c8689] mb-0.5">
                      <span><CareText value={"General Health Range"} /></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#eeebe6] overflow-hidden">
                      <div className="h-full w-0 rounded-full" style={{ background: "rgba(196,170,139,0.3)" }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[10px] mb-0.5" style={{ color: "#c4aa8b" }}>
                      <span><CareText value={"BATO Target"} /></span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#eeebe6] overflow-hidden">
                      <div className="h-full w-0 rounded-full" style={{ background: "rgba(196,170,139,0.2)" }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <p className="text-sm text-[#7c8689] italic mb-4 leading-relaxed"><CareText value={"Results appear after your health review. BATO does not show values without medical team review."} /></p>

          <Button onClick={handleStartReview} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0"
            style={{ background: "rgba(196,170,139,0.12)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.2)" }}><CareText value={"Explore Biomarker Review"} /></Button>
        </div>
      </motion.section>

      {/* ── PANEL COMPLETENESS ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
        className="bato-style-surface rounded-2xl overflow-hidden border"
        style={{ background: "#faf9f7", borderColor: "rgba(196,170,139,0.18)", boxShadow: "0 2px 12px rgba(58,46,30,0.05)" }}>
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-1.5"><CareText value={"Is your panel complete?"} /></p>
          <p className="text-sm text-[#7c8689] mb-4 leading-relaxed"><CareText value={"If you already tested elsewhere, your results may still show only part of the picture. BATO can help identify which markers may be missing for a fuller hair, skin, energy, and recovery review."} /></p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label: "Standard panel", desc: "Basic health markers only.", muted: true },
              { label: "BATO review", desc: "Hair, skin, energy, hormones, inflammation, deficiencies, and treatment-readiness markers when relevant.", muted: false },
            ].map((item) => (
              <div key={item.label} className="p-3.5 rounded-xl border"
                style={{
                  background: item.muted ? "#f4f1ec" : "white",
                  borderColor: item.muted ? "rgba(124,134,137,0.12)" : "rgba(196,170,139,0.25)",
                  boxShadow: item.muted ? "none" : "0 1px 6px rgba(58,46,30,0.04)"
                }}>
                <p className="text-xs font-semibold mb-1"
                  style={{ color: item.muted ? "#7c8689" : "#333435" }}><CareText value={item.label} /></p>
                <p className="text-sm leading-relaxed" style={{ color: "#7c8689" }}><CareText value={item.desc} /></p>
              </div>
            ))}
          </div>
          <Button onClick={handleAskPanel} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0"
            style={{ background: "rgba(196,170,139,0.12)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.2)" }}><CareText value={"Ask About Full BATO Panel"} /></Button>
        </div>
      </motion.section>

      {/* ── WHY HEALTH REVIEW MATTERS ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.27 }}
        className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(135deg, #faf9f7 0%, #f4f1ec 100%)", border: "1px solid rgba(196,170,139,0.22)", boxShadow: "0 2px 16px rgba(58,46,30,0.06)" }}>
        <div className="absolute top-0 right-0 w-28 h-28 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,170,139,0.12) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="relative z-10 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-2.5"><CareText value={"Why health review matters"} /></p>
          <p className="text-base font-semibold text-[#333435] leading-snug mb-1.5"><CareText value={"The outside can be affected by the inside."} /></p>
          <p className="text-sm text-[#7c8689] leading-relaxed mb-4"><CareText value={"Hair and skin concerns can be connected to internal markers, history, lifestyle, inflammation, hormones, deficiencies, and recovery. BATO uses Health Review to understand what may be relevant before guiding the next step."} /></p>
          <div className="flex flex-wrap gap-2">
            {["Hair", "Skin", "Energy", "Recovery", "Hormones", "Inflammation", "Safety"].map((chip) => (
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
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]"><CareText value={"How it works"} /></p>
        <div className="bato-style-surface rounded-2xl border overflow-hidden"
          style={{ background: "#faf9f7", borderColor: "rgba(196,170,139,0.15)", boxShadow: "0 1px 8px rgba(58,46,30,0.04)" }}>
          {[
            { step: "1", title: "Start Health Review", desc: "Tell us what you want to understand: hair support, skin glow, energy, recovery, deficiencies, or general wellness.", Icon: ClipboardList },
            { step: "2", title: "Share Your Context", desc: "Add symptoms, past results, supplements, medications, lifestyle notes, or previous lab tests if available.", Icon: User },
            { step: "3", title: "BATO Reviews the Signals", desc: "Your team may review biomarkers, deficiencies, inflammation, hormones, and safety markers when relevant.", Icon: Search },
            { step: "4", title: "Get Your Next Step", desc: "BATO guides you toward the right action: biomarker panel, medical review, drip, supplement support, follow-up, or care recommendation.", Icon: CheckCircle2 },
          ].map((item, idx, arr) => (
            <div key={item.step} className="flex gap-3 px-4 py-3.5 items-start"
              style={{ borderBottom: idx < arr.length - 1 ? "1px solid rgba(196,170,139,0.1)" : "none" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.12)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "rgba(196,170,139,0.7)" }}><CareText value={item.step} /></span>
                  <p className="text-sm font-semibold text-[#333435]"><CareText value={item.title} /></p>
                </div>
                <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={item.desc} /></p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── THE BATO HEALTH APPROACH ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.33 }}
        className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]"><CareText value={"The BATO health approach"} /></p>
        <div className="grid grid-cols-1 gap-2">
          {[
            { title: "Beyond basic numbers", desc: "BATO helps interpret markers in the context of hair, skin, energy, recovery, and care readiness.", Icon: TrendingUp },
            { title: "General range + BATO targets", desc: "Some markers may be normal for general health but still below BATO's preferred support target.", Icon: Layers },
            { title: "Missing marker awareness", desc: "If your outside panel is incomplete, BATO can show what may still be missing from the picture.", Icon: Search },
            { title: "Doctor/team review", desc: "Health insights are always reviewed by the BATO medical team before interpretation.", Icon: ShieldCheck },
            { title: "Connected care", desc: "Health Review connects to Hair Journey, Skin Journey, Drips, Panels, and Medical Team support.", Icon: Activity },
          ].map((item, idx) => (
            <motion.div key={item.title} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.33 + idx * 0.04 }}
              className="bato-style-surface flex gap-3 items-start p-4 rounded-xl border"
              style={{ background: "white", borderColor: "rgba(196,170,139,0.13)", boxShadow: "0 1px 4px rgba(58,46,30,0.03)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,170,139,0.09)", border: "1px solid rgba(196,170,139,0.13)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#333435] mb-0.5"><CareText value={item.title} /></p>
                <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={item.desc} /></p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── BIOMARKER CATEGORIES TEASER ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37 }}
        className="bato-style-surface rounded-2xl border overflow-hidden"
        style={{ background: "#faf9f7", borderColor: "rgba(196,170,139,0.18)", boxShadow: "0 2px 12px rgba(58,46,30,0.05)" }}>
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-1.5"><CareText value={"Marker categories"} /></p>
          <p className="text-sm font-semibold text-[#333435] mb-3"><CareText value={"BATO can review markers across:"} /></p>
          <div className="space-y-2.5">
            {[
              { label: "Hair Support", markers: "Iron, ferritin, vitamin D, zinc, thyroid, hormones, inflammation.", Icon: TrendingUp },
              { label: "Skin & Glow", markers: "Zinc, vitamin D, B12, inflammation, hormones, glucose/insulin, liver markers.", Icon: Sun },
              { label: "Energy & Recovery", markers: "Iron, B12, vitamin D, magnesium, thyroid, glucose, cortisol, electrolytes.", Icon: Zap },
              { label: "Hormonal Balance", markers: "Thyroid, testosterone, SHBG, DHEA-S, estradiol, progesterone, LH, FSH, prolactin.", Icon: Activity },
              { label: "Medical Safety", markers: "Liver, kidney, CBC, electrolytes, inflammation, and safety markers.", Icon: ShieldCheck },
            ].map((cat) => (
              <div key={cat.label} className="flex gap-3 items-start p-3 rounded-xl bg-white border"
                style={{ borderColor: "rgba(196,170,139,0.1)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(196,170,139,0.08)" }}>
                  <cat.Icon className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#333435] mb-0.5"><CareText value={cat.label} /></p>
                  <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={cat.markers} /></p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#7c8689] italic mt-3 leading-relaxed"><CareText value={"Not every marker is reviewed for every client. Your team guides what is relevant to your case."} /></p>
        </div>
      </motion.section>

        </div>
      </details>

      {/* ── BOTTOM CTA ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bato-style-hero bato-closing-invitation relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(150deg, #1e1a14 0%, #2e2418 35%, #3a2e1e 70%, #3e352c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: [
            "radial-gradient(ellipse 50% 60% at 90% 20%, rgba(196,170,139,0.16) 0%, transparent 55%)",
            "radial-gradient(circle at 15% 80%, rgba(231,203,80,0.05) 0%, transparent 50%)",
          ].join(", ")
        }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(196,170,139,1) 1px, transparent 1px), linear-gradient(90deg, rgba(196,170,139,1) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }} />
        <div className="relative z-10 p-5 min-[390px]:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(196,170,139,0.6)" }}><CareText value={"Ready when you are"} /></p>
          <p className="text-white font-bold text-xl leading-snug mb-2"><CareText value={"Ready to complete the picture?"} /></p>
          <p className="text-sm mb-7 leading-relaxed" style={{ color: "rgba(238,235,230,0.48)" }}>{t("Request a health review or connect with an advisor to understand your options.","اطلب مراجعة صحية أو تواصل مع مرشد لفهم خياراتك.")}</p>
          <div className="space-y-2.5">
            <Button onClick={handleStartReview} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold border-0"
              style={{ background: "#c4aa8b", color: "#3a2e1e" }}>{t("Request a Health Review", "اطلب مراجعة صحية")}</Button>
            <Button onClick={handleAskTeam} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold"
              style={{ background: "transparent", color: "#c4aa8b", border: "1px solid rgba(196,170,139,0.3)" }}>{t("Connect with an advisor", "تواصل مع مرشد")}</Button>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

function HealthDossier({ packages, sessions, biomarkers: storedBiomarkers = [] }) {
  const biomarkers = storedBiomarkers.map(getBiomarkerDisplayResult);
  const navigate = useNavigate();
  const { t, isRTL } = useLocation();
  const bloodPackages   = packages.filter(p => BLOOD_TYPES.includes(p.package_type));
  const dripPackages    = packages.filter(p => DRIP_TYPES.includes(p.package_type));
  const consultPackages = packages.filter(p => CONSULT_TYPES.includes(p.package_type));
  const latestNote      = sessions.find(s => s.specialist_notes);

  // ── Hero state logic based on real biomarker data ──
  const reviewedMarkers  = biomarkers.filter(b => b.review_status === "reviewed_by_bato" || b.review_status === "reviewed_by_doctor" || b.review_status === "updated");
  const pendingMarkers   = biomarkers.filter(b => b.review_status === "pending_review");
  const priorityMarkers  = biomarkers.filter(b => b.is_priority);
  const totalMarkers     = biomarkers.length;
  const reviewedCount    = reviewedMarkers.length;
  const pendingCount     = pendingMarkers.length;

  // Determine hero state
  let heroState = "no_data";
  if (totalMarkers > 0 && reviewedCount === 0) heroState = "awaiting_review";
  else if (totalMarkers > 0 && reviewedCount > 0 && pendingCount > 0) heroState = "in_progress";
  else if (totalMarkers > 0 && reviewedCount > 0 && pendingCount === 0) heroState = "review_ready";

  // For "review_ready" — compute category summaries (keys match BiomarkerResult.category enum)
  const CATEGORIES = [
    { key: "hair_support",    label: "Hair Support" },
    { key: "skin_recovery",   label: "Skin & Recovery" },
    { key: "energy_wellness", label: "Energy & Wellness" },
    { key: "hormonal_balance", label: "Hormonal Balance" },
    { key: "inflammation",    label: "Inflammation" },
    { key: "medical_safety",  label: "Medical Safety" },
    { key: "cardiometabolic", label: "Cardiometabolic" },
    { key: "advanced",        label: "Advanced" },
  ];

  const catSummaries = CATEGORIES.map(cat => {
    const catMarkers = reviewedMarkers.filter(b => b.category === cat.key);
    if (catMarkers.length === 0) return null;
    const optimal = catMarkers.filter(b => {
      const v = b.current_value;
      const hasBato = typeof b.bato_target_min === "number" && typeof b.bato_target_max === "number";
      if (hasBato) {
        return v >= b.bato_target_min && v <= b.bato_target_max;
      }
      return v >= b.general_health_min && v <= b.general_health_max;
    }).length;
    const needsReview = catMarkers.filter(b => b.is_priority).length;
    return { ...cat, label: t(cat.label, cat.label), total: catMarkers.length, optimal, needsReview };
  }).filter(Boolean);

  // Status pill config per state
  const STATUS_PILL = {
    no_data:        { label: "No panel on file",    bg: "rgba(124,134,137,0.2)",  color: "rgba(238,235,230,0.6)" },
    awaiting_review:{ label: "Awaiting BATO Review",bg: "rgba(196,170,139,0.18)", color: "#c4aa8b" },
    in_progress:    { label: "Review In Progress",  bg: "rgba(196,170,139,0.18)", color: "#c4aa8b" },
    review_ready:   { label: "Review Ready",        bg: "rgba(196,170,139,0.22)", color: "#c4aa8b" },
  };
  const pill = STATUS_PILL[heroState];

  return (
    <div className="space-y-4">

      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="bato-style-hero relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(150deg, #1e1a14 0%, #2e2418 35%, #3a2e1e 70%, #3e352c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: [
            "radial-gradient(ellipse 55% 45% at 88% 12%, rgba(196,170,139,0.18) 0%, transparent 55%)",
            "radial-gradient(circle at 10% 85%, rgba(231,203,80,0.05) 0%, transparent 50%)",
          ].join(", ")
        }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: "linear-gradient(rgba(196,170,139,1) 1px, transparent 1px), linear-gradient(90deg, rgba(196,170,139,1) 1px, transparent 1px)",
          backgroundSize: "28px 28px"
        }} />

        <div className="relative z-10 p-6">
          {/* Eyebrow + status pill */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "rgba(196,170,139,0.6)" }}><CareText value={"BATO Health Review"} /></p>
            <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full flex-shrink-0"
              style={{ background: pill.bg, color: pill.color, border: "1px solid rgba(196,170,139,0.25)" }}>
              <CareText value={pill.label} />
            </span>
          </div>

          {/* ── STATE: no_data ── */}
          {heroState === "no_data" && (
            <>
              <h2 className="text-white font-bold text-lg leading-snug mb-2"><CareText value={"No panel on file yet"} /></h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(238,235,230,0.55)" }}><CareText value={"Your health review will appear here once your lab results are uploaded and reviewed by the BATO medical team."} /></p>
              <Button onClick={() => navigate("/Messages?channel=medical_team&context=health_review")} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0"
                style={{ background: "rgba(196,170,139,0.15)", color: "rgba(238,235,230,0.9)", border: "1px solid rgba(196,170,139,0.3)" }}>
                <MessageSquare className="w-4 h-4 mr-2" /><CareText value={"Contact your specialist"} /></Button>
            </>
          )}

          {/* ── STATE: awaiting_review ── */}
          {heroState === "awaiting_review" && (
            <>
              <h2 className="text-white font-bold text-lg leading-snug mb-2"><CareText value={"Results received — awaiting BATO review"} /></h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(238,235,230,0.55)" }}><CareText value={"Your results have been received. The BATO team will review your biomarkers before showing interpretation or next steps."} /></p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: "Results received", value: totalMarkers },
                  { label: "Awaiting review", value: pendingCount },
                  { label: "BATO interpretation", value: "Pending" },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl p-3 text-center"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(196,170,139,0.15)" }}>
                    <p className="text-white font-bold text-lg leading-none mb-1"><CareText value={stat.value} /></p>
                    <p className="text-[10px] leading-tight" style={{ color: "rgba(196,170,139,0.6)" }}><CareText value={stat.label} /></p>
                  </div>
                ))}
              </div>
              <Button onClick={() => navigate("/Messages?channel=medical_team&context=health_review")} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0"
                style={{ background: "rgba(196,170,139,0.15)", color: "rgba(238,235,230,0.9)", border: "1px solid rgba(196,170,139,0.3)" }}>
                <MessageSquare className="w-4 h-4 mr-2" /><CareText value={"Contact your specialist"} /></Button>
            </>
          )}

          {/* ── STATE: in_progress ── */}
          {heroState === "in_progress" && (
            <>
              <h2 className="text-white font-bold text-lg leading-snug mb-2"><CareText value={"Your Health Review is in progress"} /></h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(238,235,230,0.55)" }}><CareText value={"BATO is reviewing your biomarkers across hair, skin, energy, recovery, hormones, and medical safety."} /></p>
              <div className="grid grid-cols-3 gap-2 mb-5">
                {[
                  { label: "Markers reviewed", value: reviewedCount },
                  { label: "Pending review", value: pendingCount },
                  { label: "Priority flags", value: priorityMarkers.length || "—" },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl p-3 text-center"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(196,170,139,0.15)" }}>
                    <p className="text-white font-bold text-lg leading-none mb-1"><CareText value={stat.value} /></p>
                    <p className="text-[10px] leading-tight" style={{ color: "rgba(196,170,139,0.6)" }}><CareText value={stat.label} /></p>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <Button onClick={() => document.getElementById("biomarkers-section")?.scrollIntoView({ behavior: "smooth" })} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0"
                  style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
                  <Activity className="w-4 h-4 mr-2" /><CareText value={"View Biomarker Review"} /></Button>
                <Button onClick={() => navigate("/Messages?channel=medical_team&context=health_review")} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold"
                  style={{ background: "transparent", color: "rgba(238,235,230,0.8)", border: "1px solid rgba(196,170,139,0.3)" }}>
                  <MessageSquare className="w-4 h-4 mr-2" /><CareText value={"Contact your specialist"} /></Button>
              </div>
            </>
          )}

          {/* ── STATE: review_ready ── */}
          {heroState === "review_ready" && (
            <>
              <h2 className="text-white font-bold text-lg leading-snug mb-2"><CareText value={"Your Health Review is ready"} /></h2>
              <p className="text-sm leading-relaxed mb-4" style={{ color: "rgba(238,235,230,0.55)" }}><CareText value={"BATO has reviewed your internal markers across hair, skin, energy, recovery, hormones, and treatment readiness."} /></p>

              {/* Top-line stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {[
                  { label: "Markers reviewed", value: reviewedCount },
                  { label: "Priority flags", value: priorityMarkers.length || "—" },
                  { label: "Total tested", value: totalMarkers },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl p-3 text-center"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(196,170,139,0.15)" }}>
                    <p className="text-white font-bold text-lg leading-none mb-1"><CareText value={stat.value} /></p>
                    <p className="text-[10px] leading-tight" style={{ color: "rgba(196,170,139,0.6)" }}><CareText value={stat.label} /></p>
                  </div>
                ))}
              </div>

              {/* Category summary pills */}
              {catSummaries.length > 0 && (
                <div className="space-y-2 mb-4">
                  {catSummaries.map(cat => (
                    <div key={cat.key} className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(196,170,139,0.12)" }}>
                      <p className="text-sm" style={{ color: "rgba(238,235,230,0.8)" }}><CareText value={cat.label} /></p>
                      <div className="flex items-center gap-2">
                        {cat.needsReview > 0 && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ background: "rgba(231,203,80,0.12)", color: "#e7cb50", border: "1px solid rgba(231,203,80,0.25)" }}>
                            <CareText value={cat.needsReview} /><CareText value={"flagged"} /></span>
                        )}
                        <span className="text-[10px] font-semibold" style={{ color: "rgba(196,170,139,0.7)" }}>
                          <CareText value={cat.optimal} />/<CareText value={cat.total} /><CareText value={"in target"} /></span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <Button onClick={() => document.getElementById("biomarkers-section")?.scrollIntoView({ behavior: "smooth" })} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0"
                  style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
                  <Activity className="w-4 h-4 mr-2" /><CareText value={"View Biomarker Review"} /></Button>
                <Button onClick={() => navigate("/Messages?channel=medical_team&context=health_review")} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold"
                  style={{ background: "transparent", color: "rgba(238,235,230,0.8)", border: "1px solid rgba(196,170,139,0.3)" }}>
                  <MessageSquare className="w-4 h-4 mr-2" /><CareText value={"Contact your specialist"} /></Button>
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Biomarkers Section */}
      <div id="biomarkers-section">
        {biomarkers.length > 0 && <BiomarkersSection biomarkers={biomarkers} />}
      </div>

      {/* Why health is part of the journey */}
      <SectionCard icon={FileText} title="Why Internal Health Matters" subtitle="How it connects to your care">
        <p className="text-sm text-[#7c8689] leading-relaxed mb-4"><CareText value={"Internal health is reviewed only when the team believes it may be contributing to your hair, skin, or general wellbeing. It is not a mandatory part of every client's journey."} /></p>
        <BulletList items={[
          "Low ferritin (iron stores) is one of the most common treatable causes of hair shedding.",
          "Hormonal imbalances can contribute to diffuse hair thinning and skin changes.",
          "Vitamin D deficiency is widespread and can affect hair growth and immunity.",
          "Internal drips are only offered when clinically appropriate — not as standard.",
          "All health reviews are led by the BATO medical team, not suggested arbitrarily.",
        ]} />
      </SectionCard>

      {/* Plan components */}
      <SectionCard icon={Package} title="Your Health Plan Components" subtitle="What's been reviewed or is available">
        <div className="space-y-2.5">
          {PLAN_COMPONENTS.map((c, i) => {
            const st = STATUS_STYLE[c.status] || STATUS_STYLE["Optional"];
            return (
              <div key={i} className="bato-style-surface p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-[#333435]"><CareText value={c.name} /></p>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: st.bg, color: st.color, border: `1px solid ${st.border}` }}><CareText value={c.status} /></span>
                </div>
                <p className="text-sm text-[#7c8689] leading-relaxed mb-1"><CareText value={c.purpose} /></p>
                <p className="text-xs text-[#7c8689]"><span className="font-medium"><CareText value={"When:"} />{" "}</span><CareText value={c.when} /></p>
                {c.note && <p className="text-xs" style={{ color: "rgba(196,170,139,0.7)" }}><CareText value={c.note} /></p>}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Consultations */}
      {consultPackages.length > 0 && (
        <SectionCard icon={User} title="Medical Consultations" defaultOpen>
          <div className="space-y-2">
            {consultPackages.map(pkg => (
              <div key={pkg.id} className="bato-style-surface flex items-center justify-between p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
                <div>
                  <p className="text-sm font-medium text-[#333435]"><CareText value={pkg.package_name} /></p>
                  {pkg.start_date && <p className="text-xs text-[#7c8689]"><CareText value={format(pkg.start_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})} /></p>}
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={pkg.status === "active" ? { background: "rgba(196,170,139,0.15)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.3)" } : { background: "#eeebe6", color: "#7c8689", border: "1px solid rgba(124,134,137,0.15)" }}>
                  <CareText value={pkg.status} />
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Panels */}
      {bloodPackages.length > 0 && (
        <SectionCard icon={Droplets} title="Panels Reviewed" subtitle={`${bloodPackages.length} panel${bloodPackages.length !== 1 ? "s" : ""} on record`} defaultOpen>
          <div className="space-y-2">
            {bloodPackages.map(pkg => (
              <div key={pkg.id} className="bato-style-surface flex items-center justify-between p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
                <div>
                  <p className="text-sm font-medium text-[#333435]"><CareText value={pkg.package_name} /></p>
                  {pkg.start_date && <p className="text-xs text-[#7c8689]"><CareText value={format(pkg.start_date, isRTL ? "d MMM yyyy" : "MMM d, yyyy", {locale:isRTL?ar:undefined})} /></p>}
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={pkg.status === "active" ? { background: "rgba(196,170,139,0.15)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.3)" } : { background: "#eeebe6", color: "#7c8689", border: "1px solid rgba(124,134,137,0.15)" }}>
                  <CareText value={pkg.status} />
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* Drips */}
      {dripPackages.length > 0 && (
        <SectionCard icon={Heart} title="Drip Support" subtitle={`${dripPackages.length} drip programme${dripPackages.length !== 1 ? "s" : ""}`} defaultOpen>
          <div className="space-y-2">
            {dripPackages.map(pkg => (
              <div key={pkg.id} className="bato-style-surface flex items-center justify-between p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
                <div>
                  <p className="text-sm font-medium text-[#333435]"><CareText value={pkg.package_name} /></p>
                  <p className="text-xs text-[#7c8689]"><CareText value={pkg.sessions_used || 0} /> / <CareText value={pkg.total_sessions} />{" "}<CareText value={"sessions"} /></p>
                </div>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={pkg.status === "active" ? { background: "rgba(196,170,139,0.15)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.3)" } : { background: "#eeebe6", color: "#7c8689", border: "1px solid rgba(124,134,137,0.15)" }}>
                  <CareText value={pkg.status} />
                </span>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* What each vital means */}
      <BatoSectionIntro title={t("Understand your results", "افهم نتائجك")} />
      <SectionCard icon={Activity} title="Understanding Your Vitals" subtitle="What each marker means for you">
        <div className="space-y-3">
          {VITALS.map(v => (
            <div key={v.key} className="bato-style-surface p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
              <div className="flex items-center gap-2 mb-1">
                <v.icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
                <p className="text-sm font-semibold text-[#333435]"><CareText value={v.label} /></p>
              </div>
              <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={v.desc} /></p>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 rounded-xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
          <p className="text-xs text-[#7c8689] italic"><CareText value={"\"Not every client needs all panels. Your team reviews only what is relevant to your case.\""} /></p>
        </div>
      </SectionCard>

      {/* Care rules */}
      <SectionCard icon={ShieldCheck} title="Before & After Health Reviews" subtitle="How to prepare and what to expect">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}><CareText value={"Before a Panel or Drip"} /></p>
            <BulletList items={[
              "Fast if instructed — some panels require fasting blood draws.",
              "Stay hydrated (water is fine, avoid coffee before blood tests).",
              "Inform the doctor of any medications or supplements.",
              "Arrive on time — drip sessions have specific slot times.",
            ]} />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}><CareText value={"After a Drip Session"} /></p>
            <BulletList items={[
              "Stay hydrated and rest if needed.",
              "Avoid strenuous activity for a few hours post-drip.",
              "Report any unexpected feelings (nausea, headache, site reaction).",
              "Follow any specific instructions from the doctor.",
            ]} />
          </div>
        </div>
      </SectionCard>

      {/* Team / Doctor Notes */}
      <BatoSectionIntro title={t("Records and support", "السجلات والدعم")} />
      <SectionCard icon={MessageSquare} title="Doctor Notes" accent>
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
            <p className="text-sm text-[#7c8689]"><CareText value={"No doctor notes yet. Updates will appear after your next review."} /></p>
          </div>
        )}
      </SectionCard>

      {/* FAQ */}
      <SectionCard icon={HelpCircle} title="Frequently Asked Questions">
        {HEALTH_FAQS.map((f, i) => <FAQItem key={i} q={f.q} a={f.a} />)}
      </SectionCard>

      {/* Documents */}
      <SectionCard icon={FileText} title="Documents" subtitle="Reports and consultation summaries">
        <div className="text-center py-5">
          <FileText className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(196,170,139,0.3)" }} />
          <p className="text-sm text-[#7c8689]"><CareText value={"No documents available yet."} /></p>
          <p className="text-xs text-[#7c8689] mt-1"><CareText value={"Panel results and consultation summaries will appear here."} /></p>
        </div>
      </SectionCard>

      {/* CTA Footer */}
      <div className="bato-style-hero relative overflow-hidden rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 80% 50%, rgba(231,203,80,0.08) 0%, transparent 60%)" }} />
        <div className="relative z-10">
          <p className="text-white font-semibold text-sm mb-1"><CareText value={"Questions about your health?"} /></p>
          <p className="text-xs mb-4" style={{ color: "rgba(238,235,230,0.55)" }}><CareText value={"The team can advise what reviews are relevant for you."} /></p>
          <Button onClick={() => navigate("/Messages?channel=medical_team&context=health_review")} className="w-full rounded-xl min-h-11 h-auto py-3 text-sm font-semibold" style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
            <MessageSquare className="w-4 h-4 mr-2" />{t("Contact your specialist", "تواصل مع أخصائيك")}
          </Button>
        </div>
      </div>

    </div>
  );
}

export default function HealthJourney() {
  const accountQuery = useQuery({
    queryKey: ["HealthJourneyAccount"],
    queryFn: () => base44.auth.me(),
    retry: 1, gcTime: 0, refetchOnMount: "always",
  });
  const user = !accountQuery.isFetching ? accountQuery.data : null;
  const { isRTL, t } = useLocation();
  const [selectedTestDate, setSelectedTestDate] = useState(null);

  const { data: packages = [], isPending: packagesPending, isError: packagesError } = useQuery({
    queryKey: ["packages", user?.email, "HealthJourney"],
    queryFn: () => base44.entities.Package.filter({ client_email: user.email }, "-created_date"),
    enabled: !!user,
  });
  const { data: sessions = [], isPending: sessionsPending, isError: sessionsError } = useQuery({
    queryKey: ["healthSessions", user?.email],
    queryFn: () => base44.entities.TreatmentSession.filter({ client_email: user.email, department: "general_health" }, "-session_date"),
    enabled: !!user,
  });
  const { data: biomarkers = [], isPending: biomarkersPending, isError: biomarkersError } = useQuery({
    queryKey: ["biomarkers", user?.email],
    queryFn: () => base44.entities.BiomarkerResult.filter({ client_email: user.email, archived_duplicate: { $ne: true } }, "-test_date"),
    enabled: !!user,
  });

  const testDates = [...new Set(biomarkers.map(b => b.test_date))].sort().reverse();
  const activeTestDate = testDates.includes(selectedTestDate) ? selectedTestDate : testDates[0];
  const panelBiomarkers = biomarkers.filter(b => b.test_date === activeTestDate);

  const healthPackages = packages.filter(p => p.department === "general_health" || ALL_HEALTH.includes(p.package_type));
  const hasAny = healthPackages.length > 0 || biomarkers.length > 0;
  const hasActive = healthPackages.some(p => p.status === "active");
  if (accountQuery.isPending || accountQuery.isFetching || (!!user && (packagesPending || sessionsPending || biomarkersPending))) return <div role="status" className="p-6 bg-[#eeebe6] text-[#7c8689]">{t("Loading your health file…", "جارٍ تحميل ملفك الصحي…")}</div>;
  if (accountQuery.isError || packagesError || sessionsError || biomarkersError) return <CustomerLoadState error/>;

  return (
    <div className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`} style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <div className="bato-page-heading grid grid-cols-1 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#333435]"><CareText value={hasAny ? t("Health Journey", "رحلة الصحة") : t("Health Review", "مراجعة الصحة")} /></h1>
            <p className="text-xs text-[#7c8689]">
              <CareText value={hasAny ? t("Your complete internal health and wellness file", "ملفك الصحي ومتابعة صحتك") : t("Understand what your body may be showing before starting care.", "افهم نتائجك الصحية قبل البدء بالعلاج.")} />
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full mt-0.5 flex-shrink-0"
            style={hasAny ? { background: "rgba(196,170,139,0.15)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.35)" } : { background: "#f9f8f6", color: "#7c8689", border: "1px solid rgba(124,134,137,0.2)" }}>
            <CareText value={hasActive ? t("Active", "نشط") : hasAny ? t("Health history", "السجل الصحي") : t("Internal view", "فهم الصحة من الداخل")} />
          </span>
        </div>
        <CustomerCareHub user={user} department="general_health" journeyPage />
        {testDates.length > 0 && <div className="bg-white rounded-2xl border border-[#eeebe6] p-4">
          <label htmlFor="health-test-date" className="text-sm font-semibold text-[#333435]">{t("Test date", "تاريخ التحليل")}</label>
          <select id="health-test-date" className="w-full mt-2 p-2 rounded-xl border border-[#c4aa8b] bg-white text-sm" value={activeTestDate} onChange={e => setSelectedTestDate(e.target.value)}>
            {testDates.map(date => <option key={date} value={date}>{new Date(date + "T12:00:00").toLocaleDateString(isRTL ? "ar-AE" : "en-GB", { year: "numeric", month: "long", day: "numeric" })}</option>)}
          </select>
          <p className="text-xs text-[#7c8689] mt-2">{t("Results and summary below are for this test date.", "النتائج والملخص أدناه تخص تاريخ التحليل المحدد.")}</p>
        </div>}
        {hasAny ? <HealthDossier packages={healthPackages} sessions={sessions} biomarkers={panelBiomarkers} /> : <HealthExplore isRTL={isRTL} t={t} />}
      </div>
    </div>
  );
}