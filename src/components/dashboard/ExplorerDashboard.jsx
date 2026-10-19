import JourneyDiscovery from "./JourneyDiscovery";
import ExplorerNextStep from "./ExplorerNextStep";
import CustomerCareHub from "@/components/care/CustomerCareHub";
import React, { useState } from "react";
import { motion } from "@/components/motion/BatoMotion";
import { Button } from "@/components/ui/button";
import { ArrowRight, MessageSquare, Phone, Zap, Wand2, Droplet, Waves, Smile, Check } from "lucide-react";
import { useLocation } from "../LocationContext";
import { useNavigate } from "react-router-dom";

const BATO_METHOD = [
  {
    titleEn: "Assessment-first care",
    titleAr: "التقييم قبل العلاج",
    bodyEn: "We understand the case before recommending treatment.",
    bodyAr: "نفهم الحالة قبل التوصية بالعلاج.",
  },
  {
    titleEn: "Inside + outside view",
    titleAr: "مراجعة الحالة من الداخل والخارج",
    bodyEn: "Hair and skin can be affected by internal markers, history, and treatment response.",
    bodyAr: "قد تتأثر صحة الشعر والبشرة بالعوامل الداخلية والتاريخ الصحي والاستجابة للعلاج.",
  },
  {
    titleEn: "Progress you can follow",
    titleAr: "التقدم الذي يمكنك متابعته",
    bodyEn: "Your app keeps your journey, updates, photos, care instructions, and team communication in one place.",
    bodyAr: "يحتفظ تطبيقك برحلتك والتحديثات والصور والتعليمات والتواصل في مكان واحد.",
  },
];

const ASSESSMENT_STEPS = [
  {
    titleEn: "Understand the concern",
    titleAr: "فهم المشكلة",
    bodyEn: "Hair, skin, health, laser, or aesthetic goals.",
    bodyAr: "أهداف الشعر أو البشرة أو الصحة أو الليزر أو التجميل.",
  },
  {
    titleEn: "Review the right signals",
    titleAr: "مراجعة ما يرتبط بحالتك",
    bodyEn: "Photos, history, symptoms, biomarkers, or previous treatment experience.",
    bodyAr: "الصور والتاريخ الصحي والأعراض والمؤشرات الحيوية أو تجارب العلاج السابقة.",
  },
  {
    titleEn: "Recommend the right next step",
    titleAr: "اقتراح الخطوة المناسبة",
    bodyEn: "Your team guides you based on what fits your case.",
    bodyAr: "يوجهك فريقك بناءً على ما يناسب حالتك.",
  },
];

export default function ExplorerDashboard({ user, batoProfile, isReturningUser = false, isRTL, t }) {
  const navigate = useNavigate();

  const handleConnectProfile = () => {
    navigate("/ProfileConnection");
  };

  const handleMessageCare = () => {
    navigate("/Messages?channel=advisors");
  };

  const handleJourneyClick = (link) => {
    navigate(link);
  };

  const scrollToSection = (id) => {
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 0);
  };

  return (
    <div
      className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`}
      style={{ background: "#eeebe6" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <h1 className="sr-only">{t("Dashboard","لوحة التحكم")}</h1>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-8">
        {batoProfile?.completed ? <CustomerCareHub user={user} profile={batoProfile} fallback={<ExplorerNextStep user={user} profile={batoProfile} isRTL={isRTL} t={t} />} /> : <>
        <CustomerCareHub user={user} />
        {/* ── HERO ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bato-style-hero rounded-3xl overflow-hidden"
          style={{ background: "#3a2e1e" }}
        >
          <div className="px-7 py-10">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-4"
              style={{ color: "#c4aa8b" }}
            >
              {isReturningUser ? t("Welcome back", "مرحبا بعودتك") : t("Welcome to BATO", "مرحبا بك في باتو")}
            </p>
            <h1
              className="text-3xl font-bold leading-snug mb-3"
              style={{ color: "#eeebe6" }}
            >
              {isReturningUser ? t("Find your next BATO step.", "اختر خطوتك التالية مع باتو.") : t("Start with the right BATO path.", "اختر المسار الأنسب لك.")}
            </h1>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "rgba(238,235,230,0.65)" }}
            >
              {t(
                "Tell us what you're here for — hair, skin, health, laser, or aesthetic care — and BATO will guide you to the right first step.",
                "أخبرنا بما تهتم به: الشعر أو البشرة أو الصحة أو الليزر أو التجميل. سنساعدك على اختيار الخطوة الأولى."
              )}
            </p>
            
            {/* Reassurance text */}
            <div className="flex flex-col gap-1.5 mb-8">
              <p className="text-xs" style={{ color: "rgba(238,235,230,0.5)" }}>
                {t("Explore at your own pace.", "استكشف بالوتيرة التي تناسبك.")}
              </p>
              <p className="text-xs" style={{ color: "rgba(238,235,230,0.5)" }}>
                {t("No treatment recommendation before assessment.", "لا توصية بالعلاج قبل التقييم.")}
              </p>
            </div>

            <Button
              onClick={() => scrollToSection("first-split")}
              className={`w-full h-12 px-6 rounded-2xl text-sm font-semibold border-0 ${isRTL ? 'flex-row-reverse' : ''}`}
              style={{ background: "#c4aa8b", color: "#3a2e1e" }}
            >
              <ArrowRight className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
              {t("Find My Starting Point", "ساعدني أختار من أين أبدأ")}
            </Button>
          </div>
        </motion.div>

        </>}
        {batoProfile && !batoProfile.completed && (
          <Button onClick={() => navigate("/Onboarding")} variant="outline" className="w-full border-[#c4aa8b] text-[#3a2e1e]">
            {t("Complete your profile", "أكمل ملفك الشخصي")}
          </Button>
        )}

        {/* ── FIRST SPLIT: TWO PRIMARY PATHS ── */}
        {!batoProfile?.completed && <>
        <section id="first-split" className="space-y-3">
          <p
            className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-4"
          >
            {t("How can we help you start?", "كيف يمكننا مساعدتك في البدء؟")}
          </p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onClick={handleConnectProfile}
            className={`w-full bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${isRTL ? 'text-right' : 'text-left'}`}
            style={{ borderColor: "rgba(196,170,139,0.25)" }}
          >
            <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,170,139,0.1)" }}
              >
                <Phone className="w-5 h-5" style={{ color: "#c4aa8b" }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#333435] text-sm mb-1">
                  {t("I already booked", "لقد حجزت بالفعل")}
                </p>
                <p className="text-xs text-[#7c8689] leading-relaxed">
                  {t(
                    "Connect your WhatsApp number so we can find your appointment and prepare your BATO profile.",
                    "أضف رقم واتساب لنتمكن من العثور على موعدك وتجهيز ملفك."
                  )}
                </p>
              </div>
              <ArrowRight className={`w-4 h-4 text-[#c4aa8b] flex-shrink-0 mt-1 ${isRTL ? 'rotate-180' : ''}`} />
            </div>
          </motion.button>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => navigate("/Onboarding")}
            className={`w-full bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${isRTL ? 'text-right' : 'text-left'}`}
            style={{ borderColor: "rgba(196,170,139,0.25)" }}
          >
            <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,170,139,0.1)" }}
              >
                <Waves className="w-5 h-5" style={{ color: "#c4aa8b" }} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-[#333435] text-sm mb-1">
                  {t("I'm exploring BATO", "أتعرف على خدمات باتو")}
                </p>
                <p className="text-xs text-[#7c8689] leading-relaxed">
                  {t(
                    "Answer a few quick questions and we'll guide you to the right first step.",
                    "أجب عن أسئلة سريعة لنساعدك على اختيار الخطوة الأولى."
                  )}
                </p>
              </div>
              <ArrowRight className={`w-4 h-4 text-[#c4aa8b] flex-shrink-0 mt-1 ${isRTL ? 'rotate-180' : ''}`} />
            </div>
          </motion.button>
        </section>

        </>}
        <JourneyDiscovery />

        {/* ── WHY BATO STARTS WITH ASSESSMENT ── */}
        <section className="space-y-4">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-3"
            >
              {t("Understanding your case", "فهم حالتك")}
            </p>
            <h2 className="text-lg font-bold text-[#333435]">
              {t("Why BATO starts with assessment", "لماذا يبدأ باتو بالتقييم")}
            </h2>
            <p className="text-sm text-[#7c8689] leading-relaxed mt-2">
              {t(
                "We don't start by guessing. Your first step helps the team understand your concern, history, photos, and internal factors before recommending care.",
                "يساعدنا التقييم على فهم مشكلتك وتاريخك الصحي وصورك والعوامل الداخلية قبل اقتراح العلاج."
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {ASSESSMENT_STEPS.map((step, idx) => (
              <motion.div
                key={step.titleEn}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className={`flex gap-3 bg-white rounded-2xl p-4 border ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                style={{ borderColor: "rgba(196,170,139,0.15)" }}
              >
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{
                    background: "rgba(196,170,139,0.1)",
                    color: "#c4aa8b",
                  }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#333435] text-xs mb-1">
                    {isRTL ? step.titleAr : step.titleEn}
                  </p>
                  <p className="text-xs text-[#7c8689]">
                    {isRTL ? step.bodyAr : step.bodyEn}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── THE BATO METHOD ── */}
        <section className="space-y-4">
          <div>
            <p
              className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-3"
            >
              {t("Our approach", "نهجنا")}
            </p>
            <h2 className="text-lg font-bold text-[#333435]">
              {t("The BATO Method", "طريقة باتو")}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {BATO_METHOD.map((method, idx) => (
              <motion.div
                key={method.titleEn}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.05 }}
                className={`bg-white rounded-2xl p-4 border flex gap-3 ${isRTL ? 'flex-row-reverse text-right' : ''}`}
                style={{ borderColor: "rgba(196,170,139,0.15)" }}
              >
                <div
                  className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center mt-0.5"
                  style={{ background: "rgba(196,170,139,0.1)" }}
                >
                  <Check className="w-4 h-4" style={{ color: "#c4aa8b" }} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[#333435] text-xs mb-1">
                    {isRTL ? method.titleAr : method.titleEn}
                  </p>
                  <p className="text-xs text-[#7c8689] leading-relaxed">
                    {isRTL ? method.bodyAr : method.bodyEn}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── BATO BIOMARKER REVIEW TEASER ── */}
        <section>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="bg-white rounded-2xl p-6 border"
            style={{ borderColor: "rgba(196,170,139,0.2)" }}
          >
            <div className={`flex items-start gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,170,139,0.1)" }}
              >
                <Droplet className="w-5 h-5" style={{ color: "#c4aa8b" }} />
              </div>
              <div className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                <p className="font-semibold text-[#333435] text-sm mb-1">
                  {t("BATO Biomarker Review", "مراجعة مؤشرات باتو الحيوية")}
                </p>
                <p className="text-sm text-[#7c8689] leading-relaxed mb-4">
                  {t(
                    "Understand your results through hair, skin, energy, recovery, and health targets — not just basic lab numbers.",
                    "نفهم نتائجك في ضوء صحة شعرك وبشرتك وطاقتك وتعافيك وأهدافك الصحية، إلى جانب القيم المرجعية للمختبر."
                  )}
                </p>
                <button
                  onClick={() => handleJourneyClick("/HealthJourney")}
                  className={`text-xs font-semibold flex items-center gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}
                  style={{ color: "#c4aa8b" }}
                >
                  {t("Explore Health Review", "استكشف متابعة الصحة")}
                  <ArrowRight className={`w-3 h-3 ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
          </motion.div>
        </section>

        {!batoProfile?.completed && <>
        {/* ── BOTTOM CTA ── */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bato-style-hero rounded-3xl overflow-hidden"
          style={{ background: "#3a2e1e" }}
        >
          <div className="px-7 py-8 text-center">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "#c4aa8b" }}
            >
              {t("Still unsure?", "لم تتأكد من الخيار المناسب بعد؟")}
            </p>
            <p
              className="text-sm leading-relaxed mb-6"
              style={{ color: "rgba(238,235,230,0.65)" }}
            >
              {t(
                "Answer a few quick questions and BATO will guide you to the best first step — without guessing.",
                "أجب عن أسئلة سريعة لنساعدك على اختيار الخطوة الأولى المناسبة."
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => navigate("/Onboarding")}
                className={`h-12 px-6 rounded-2xl text-sm font-semibold border-0 w-full sm:w-auto ${isRTL ? 'flex-row-reverse' : ''}`}
                style={{ background: "#c4aa8b", color: "#3a2e1e" }}
              >
                <ArrowRight className={`w-4 h-4 ${isRTL ? 'ml-2 rotate-180' : 'mr-2'}`} />
                {t("Find My Starting Point", "ساعدني أختار من أين أبدأ")}
              </Button>
              <Button
                onClick={handleMessageCare}
                variant="outline"
                className="h-12 px-6 rounded-2xl text-sm font-semibold w-full sm:w-auto"
                style={{
                  borderColor: "rgba(196,170,139,0.4)",
                  color: "#c4aa8b",
                  background: "transparent",
                }}
              >
                {t("Connect with an advisor", "تواصل مع مرشد")}
              </Button>
            </div>
          </div>
        </motion.section>        </>}

      </div>
    </div>
  );
}