import {useSearchParams,Link} from "react-router-dom";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import {
  Users, ChevronRight, ChevronLeft, Shield, MessageSquare,
  HelpCircle, ChevronDown, ChevronUp, ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "../components/LocationContext";

const CIRCLES = [
 {id:"health",emoji:"🩸",name:"Health & Energy",nameAr:"الصحة والطاقة",tags:["Health","Lifestyle"],description:"For people exploring their health, energy and recorded test results with the BATO team.",descriptionAr:"للمهتمين بالصحة والطاقة ومناقشة نتائج التحاليل المسجلة مع فريق باتو.",whatFor:"Prepare questions about your goals and recorded results for your Health Team.",color:"#f9f4ee",borderColor:"rgba(196,170,139,0.25)"},
  {
    id: "moms",
    emoji: "🌸",
    name: "Moms",
    nameAr: "الأمهات",
    tags: ["Lifestyle", "Women", "Moms"],
    description: "For mothers navigating hair, skin, energy, and self-care after busy life changes.",
    descriptionAr: "للأمهات المهتمات بالعناية بالشعر والبشرة والطاقة والاهتمام بأنفسهن وسط مسؤوليات الحياة.",
    whatFor: "Hair concerns after pregnancy, skin changes, fatigue, and finding a sustainable self-care rhythm as a mother.",
    color: "#f9f4ee",
    borderColor: "rgba(196,170,139,0.25)",
  },
  {
    id: "women50plus",
    emoji: "✨",
    name: "Women 50+",
    nameAr: "النساء فوق ٥٠ عاماً",
    tags: ["Lifestyle", "Women"],
    description: "For women focused on hair density, skin quality, confidence, and long-term care.",
    descriptionAr: "للنساء المهتمات بكثافة الشعر وجودة البشرة والثقة والعناية طويلة الأمد.",
    whatFor: "Hair thinning, scalp health, skin texture, and building confidence through consistent care routines.",
    color: "#f9f4ee",
    borderColor: "rgba(196,170,139,0.25)",
  },
  {
    id: "men2030",
    emoji: "💪",
    name: "Men 20–30",
    nameAr: "الرجال من ٢٠ إلى ٣٠ عاماً",
    tags: ["Lifestyle", "Men"],
    description: "For younger men dealing with early hair changes, confidence, grooming, and prevention.",
    descriptionAr: "للشباب المهتمين بالتغيرات المبكرة في الشعر والثقة بالمظهر والعناية والوقاية.",
    whatFor: "Early hair loss signs, prevention strategies, grooming habits, and building confidence.",
    color: "#f9f4ee",
    borderColor: "rgba(196,170,139,0.25)",
  },
  {
    id: "padel-women",
    emoji: "🎾",
    name: "Padel Women",
    nameAr: "لاعبات البادل",
    tags: ["Sport", "Lifestyle", "Women"],
    description: "For women balancing sport, sweat, skin, hair care, and an active lifestyle.",
    descriptionAr: "للنساء اللواتي يمارسن الرياضة ويرغبن في العناية بالشعر والبشرة مع نمط حياتهن النشط.",
    whatFor: "Post-sport skin and hair care, managing sweat effects, aftercare for active women.",
    color: "#f9f4ee",
    borderColor: "rgba(196,170,139,0.25)",
  },
  {
    id: "running-men",
    emoji: "🏃",
    name: "Running Men",
    nameAr: "العدّاؤون",
    tags: ["Sport", "Lifestyle", "Men"],
    description: "For men who run, train, sweat, and want simple care routines that fit an active life.",
    descriptionAr: "للرجال الذين يمارسون الجري والتدريب ويريدون روتين عناية بسيطاً يناسب نشاطهم.",
    whatFor: "Scalp care post-exercise, skin maintenance, and keeping up with treatment during training schedules.",
    color: "#f9f4ee",
    borderColor: "rgba(196,170,139,0.25)",
  },
  {
    id: "hair-density",
    emoji: "🌱",
    name: "Hair Density Journey",
    nameAr: "العناية بكثافة الشعر",
    tags: ["Hair"],
    description: "For clients focused on hair strength, density, shedding, and long-term progress.",
    descriptionAr: "للعملاء المهتمين بقوة الشعر وكثافته والتساقط ومتابعة التحسن على المدى الطويل.",
    whatFor: "Understanding shedding phases, tracking density over time, supporting a hair restoration programme.",
    color: "#f9f4ee",
    borderColor: "rgba(196,170,139,0.25)",
  },
  {
    id: "skin-glow",
    emoji: "💎",
    name: "Skin Glow Plan",
    nameAr: "العناية بنضارة البشرة",
    tags: ["Skin"],
    description: "For clients interested in skin clarity, hydration, glow, and treatment guidance.",
    descriptionAr: "للعملاء المهتمين بصفاء البشرة وترطيبها ونضارتها واختيار العلاج المناسب.",
    whatFor: "Skincare routines, hydration tips, treatment expectations, and maintaining skin results.",
    color: "#f9f4ee",
    borderColor: "rgba(196,170,139,0.25)",
  },
  {
    id: "laser",
    emoji: "⚡",
    name: "Laser Maintenance",
    nameAr: "متابعة الليزر",
    tags: ["Laser"],
    description: "For clients managing laser sessions, aftercare, and smoother-skin maintenance.",
    descriptionAr: "للعملاء المهتمين بجلسات الليزر والعناية بعدها والحفاظ على نعومة البشرة.",
    whatFor: "Laser aftercare, session spacing, managing sensitivity, and maintaining long-term results.",
    color: "#f9f4ee",
    borderColor: "rgba(196,170,139,0.25)",
  },
];

const FILTERS = ["All", "Hair", "Skin", "Health", "Laser", "Lifestyle", "Women", "Men", "Sport", "Moms"];
const getFilterLabels = (t) => ({ All: t("All", "الكل"), Hair: t("Hair", "الشعر"), Skin: t("Skin", "البشرة"), Health: t("Health", "الصحة"), Laser: t("Laser", "الليزر"), Lifestyle: t("Lifestyle", "أسلوب الحياة"), Women: t("Women", "النساء"), Men: t("Men", "الرجال"), Sport: t("Sport", "الرياضة"), Moms: t("Moms", "الأمهات") });

const CIRCLE_FAQS = {
  "hair-density": [
    { q: "Is shedding normal during treatment?", a: "Yes — a temporary shedding phase can occur during early treatment. The BATO team monitors this closely." },
    { q: "How long until I see results?", a: "Most clients notice changes between sessions 3–5. The timeline varies by programme and individual response." },
  ],
  "skin-glow": [
    { q: "How often should I have a Hydrafacial?", a: "Most clients benefit from monthly sessions. Your specialist will advise based on your skin type and goals." },
    { q: "Can I wear makeup after a skin treatment?", a: "Generally, avoid heavy makeup for 24 hours post-treatment. Your specialist will advise based on the specific procedure." },
  ],
  "laser": [
    { q: "How long do I need to avoid sun after laser?", a: "Avoid direct sun exposure for at least 72 hours after each session. Apply SPF 30+ on treated areas." },
    { q: "How many sessions will I need?", a: "Typically 6–10 sessions depending on treatment area, hair type, and individual response." },
  ],
};

const CIRCLE_TIPS = {
  "moms": ["Stay consistent with your home care routine even on busy days.", "Post-pregnancy hair shedding is normal and temporary. Your team tracks this."],
  "women50plus": ["Density changes gradually. Progress photos help track improvement accurately.", "Combine scalp care with internal health monitoring for best results."],
  "men2030": ["Early prevention is more effective than waiting. Starting treatment now matters.", "Consistent home care between sessions is as important as the sessions themselves."],
  "padel-women": ["Rinse hair with cool water within 2 hours after sport.", "Use mineral SPF on skin before outdoor padel."],
  "running-men": ["Avoid washing hair for 48 hours after a scalp treatment session.", "Hydration matters — your skin and scalp reflect your internal health."],
  "hair-density": ["Progress photos are taken at each stage to compare density objectively.", "Avoid switching products without checking with the BATO Hair Team first."],
  "skin-glow": ["SPF daily is the single most impactful skin habit.", "Avoid actives (retinol, acids) for 48 hours before and after skin treatments."],
  "laser": ["Avoid heat, saunas, and intense exercise for 48 hours post-session.", "Shave (don't wax) the treatment area 24 hours before each session."],
};

// ─── Circle Detail View ───────────────────────────────────────────────────────

function CircleDetail({ circle, onBack, isRTL, t }) {
  const [openFaq, setOpenFaq] = useState(null);
  const faqs = [
   {q:t("How do I start?","كيف أبدأ؟"),a:t("Explore the relevant journey and connect with an advisor to understand the available assessments.","استكشف الرحلة المناسبة وتواصل مع مرشد لفهم التقييمات المتاحة.")},
   {q:t("Where can I find my personal care instructions?","أين أجد تعليمات العناية الخاصة بي؟"),a:t("Your journey shows instructions recorded by your care team. Ask your specialist if instructions are missing or unclear.","تعرض رحلتك التعليمات التي سجلها فريق رعايتك. اسأل أخصائيك إذا كانت التعليمات غير موجودة أو غير واضحة.")}
  ];
  const tips = [t("Keep your questions together so your team can help you at your next review.","اجمع أسئلتك ليتمكن فريقك من مساعدتك في المراجعة التالية."),t("Use your recorded care plan for personal guidance and ask your team about changes.","ارجع إلى خطة العناية المسجلة للإرشادات الخاصة بك واسأل فريقك عن أي تغييرات.")];

  return (
    <div className="space-y-4">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-[#7c8689] hover:text-[#333435] transition-colors">
        <ArrowLeft className="w-4 h-4" />
        {t("Back to Circles", "العودة إلى الدوائر")}
      </button>

      {/* Hero */}
      <div className="bato-style-hero rounded-2xl p-5" style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{circle.emoji}</span>
          <div>
            <h2 className="font-bold text-white text-base">{isRTL ? circle.nameAr : circle.name}</h2>
            <div className="flex gap-1 mt-1 flex-wrap">
              {circle.tags.map(tag => (
                <span key={getFilterLabels(t)[tag]||tag} className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(196,170,139,0.2)", color: "#c4aa8b" }}>
                  {getFilterLabels(t)[tag]||tag}
                </span>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(238,235,230,0.8)" }}>
          {isRTL ? circle.descriptionAr : circle.description}
        </p>
      </div>

      {/* What this circle is for */}
      <div className="bg-white rounded-2xl p-4 border border-[#eeebe6]">
        <p className="text-xs font-semibold text-[#333435] mb-2 uppercase tracking-wider">{t("What this circle is for", "هذه المجموعة تناسب")}</p>
        <p className="text-sm text-[#7c8689] leading-relaxed">{isRTL?circle.descriptionAr:circle.whatFor}</p>
      </div>

      {/* Tips */}
      {tips.length > 0 && (
        <div className="bg-white rounded-2xl p-4 border border-[#eeebe6] space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4" style={{ color: "#c4aa8b" }} />
            <p className="text-xs font-semibold text-[#333435] uppercase tracking-wider">{t("Tips for this circle", "نصائح لأعضاء المجموعة")}</p>
          </div>
          {tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#c4aa8b" }} />
              <p className="text-sm text-[#333435] leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      )}

      {/* FAQs */}
      {faqs.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-4 h-4" style={{ color: "#c4aa8b" }} />
            <p className="text-xs font-semibold text-[#333435] uppercase tracking-wider">{t("Circle FAQs", "أسئلة المجموعة")}</p>
          </div>
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl border border-[#eeebe6] overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq===i} className="w-full p-4 flex items-center justify-between text-start gap-3 hover:bg-[#f9f8f6] transition-colors"
              >
                <p className="font-medium text-[#333435] text-sm leading-snug">{faq.q}</p>
                {openFaq === i
                  ? <ChevronUp className="w-4 h-4 text-[#7c8689] flex-shrink-0" />
                  : <ChevronDown className="w-4 h-4 text-[#7c8689] flex-shrink-0" />}
              </button>
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 pt-2" style={{ borderTop: "1px solid rgba(196,170,139,0.12)" }}>
                      <p className="text-sm text-[#7c8689] leading-relaxed">{faq.a}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Empty feed state */}
      <div className="bg-white rounded-2xl p-6 text-center border border-[#eeebe6]">
        <MessageSquare className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(196,170,139,0.35)" }} />
        <p className="font-semibold text-[#333435] text-sm mb-1">{t("Explore approved discussions in Community.", "استكشف النقاشات المعتمدة في المجتمع.")}</p>
        <p className="text-xs text-[#7c8689]">{t("Circles currently help you discover topics. Join the Community to read and submit discussions.", "تساعدك المجموعات حالياً على اكتشاف المواضيع. انتقل إلى المجتمع لقراءة النقاشات وإرسال مشاركاتك.")}</p>
      </div>

      <Link to="/Community" className="block rounded-xl bg-white p-4 underline">{t("Open Community","افتح المجتمع")}</Link>
      {/* Ask the Team CTA */}
      <div className="bato-style-hero relative overflow-hidden rounded-2xl p-5"
        style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(196,170,139,0.15)" }}>
            <MessageSquare className="w-4 h-4" style={{ color: "#c4aa8b" }} />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-white text-sm mb-1">{t("Have a question?", "لديك سؤال؟")}</p>
            <p className="text-xs leading-relaxed mb-3" style={{ color: "rgba(238,235,230,0.6)" }}>
              {t(
                "For personal questions about your case, message the relevant BATO team directly.",
                "للأسئلة الشخصية حول حالتك، راسل فريق باتو المعني مباشرة."
              )}
            </p>
            <a href="/Messages">
              <button className="text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
                style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
                {t("Choose who to contact", "اختر جهة التواصل")}
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Circle Card ──────────────────────────────────────────────────────────────

function CircleCard({ circle, onClick, isRTL }) {
  const {t}=useLocation();
  return (
    <motion.button
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      whileTap={{ scale: 0.98 }}
      className="w-full bg-white rounded-2xl p-4 border text-start flex items-center gap-3 hover:shadow-md active:scale-[0.98] transition-all min-h-16"
      style={{ borderColor: circle.borderColor }}
    >
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl"
        style={{ background: "rgba(196,170,139,0.1)" }}>
        {circle.emoji}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[#333435] text-sm">{isRTL ? circle.nameAr : circle.name}</p>
        <p className="text-sm text-[#7c8689] leading-relaxed mt-0.5">
          {isRTL ? circle.descriptionAr : circle.description}
        </p>
        <div className="flex gap-1 mt-1.5 flex-wrap">
          {circle.tags.map(tag => (
            <span key={getFilterLabels(t)[tag]||tag} className="text-[11px] font-medium px-2 py-0.5 rounded-full"
              style={{ background: "rgba(196,170,139,0.1)", color: "#c4aa8b", border: "1px solid rgba(196,170,139,0.2)" }}>
              {getFilterLabels(t)[tag]||tag}
            </span>
          ))}
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[#7c8689] flex-shrink-0" />
    </motion.button>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BATOCircles() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [params,setParams]=useSearchParams();
  const selectedCircle=params.get("circle");
  const setSelectedCircle=id=>{const next=new URLSearchParams(params);if(id)next.set("circle",id);else next.delete("circle");setParams(next);};
  const { isRTL, t } = useLocation();
  const FILTER_LABELS = getFilterLabels(t);

  const filteredCircles = CIRCLES.filter(c =>
    activeFilter === "All" || c.tags.includes(activeFilter)
  );

  const activeCircle = CIRCLES.find(c => c.id === selectedCircle);

  return (
    <div className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`}
      style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {activeCircle ? (
          <CircleDetail
            circle={activeCircle}
            onBack={() => setSelectedCircle(null)}
            isRTL={isRTL}
            t={t}
          />
        ) : (
          <>
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold text-[#333435]">{t("BATO Circles", "دوائر باتو")}</h1>
              <p className="text-xs text-[#7c8689] mt-0.5">
                {t("Groups built around your lifestyle, stage, and goals.", "مجموعات تناسب نمط حياتك واهتماماتك وأهدافك.")}
              </p>
            </div>

            {/* Description card */}
            <div className="bg-white rounded-2xl p-4 border border-[#eeebe6]">
              <p className="text-sm text-[#7c8689] leading-relaxed">
                {t(
                  "Explore circles that match your interests and care goals. Open Community for approved discussions, or message your team for personal questions.",
                  "استكشف المجموعات التي تناسب اهتماماتك وأهداف العناية. انتقل إلى المجتمع للنقاشات المعتمدة أو راسل فريقك للأسئلة الشخصية."
                )}
              </p>
            </div>

            {/* Filters */}
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  aria-pressed={activeFilter === f}
                  className="bato-filter-option flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                  style={activeFilter === f
                    ? { background: "#3a2e1e", color: "#c4aa8b" }
                    : { background: "#ffffff", color: "#7c8689", border: "1px solid rgba(196,170,139,0.2)" }}
                >
                  {FILTER_LABELS[f] || f}
                </button>
              ))}
            </div>

            {/* Circles */}
            <div className="space-y-2">
              {filteredCircles.map(circle => (
                <CircleCard
                  key={circle.id}
                  circle={circle}
                  onClick={() => setSelectedCircle(circle.id)}
                  isRTL={isRTL}
                />
              ))}
            </div>

            {/* Bottom note */}
            <div className="bato-style-hero relative overflow-hidden rounded-2xl p-5"
              style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(196,170,139,0.15)" }}>
                  <Users className="w-4 h-4" style={{ color: "#c4aa8b" }} />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm mb-1">
                    {t("Curated by BATO", "بإشراف باتو")}
                  </p>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(238,235,230,0.6)" }}>
                    {t(
                      "Circles are topic guides. Community submissions are reviewed before publication; personal care questions belong with your BATO team.",
                      "المجموعات أدلة للمواضيع. تُراجع مشاركات المجتمع قبل نشرها؛ ناقش أسئلة العناية الشخصية مع فريق باتو."
                    )}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}