import { format } from "@/lib/customerFormatting";
import CareText from "@/components/CareText";
import { ar } from "date-fns/locale";
import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { Droplets, Activity, Sun, Sparkles, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";



const SERVICE_URLS = {
  skin:  "/SkinJourney",
  laser: "/LaserJourney",
  drips: "/HealthJourney",
};

const VITALS = [
  {
    key: "iron",
    icon: Droplets,
    label: { en: "Iron & Ferritin", ar: "الحديد والفيريتين" },
    iconColor: "#8e721d",
    glowColor: "rgba(231,203,80,0.12)",
    packageTypes: ["iron_ferritin_panel", "iron_drip", "ferinject"],
  },
  {
    key: "hormones",
    icon: Activity,
    label: { en: "Hormones", ar: "الهرمونات" },
    iconColor: "#c4aa8b",
    glowColor: "rgba(196,170,139,0.12)",
    packageTypes: ["hormone_panel"],
  },
  {
    key: "vitaminD",
    icon: Sun,
    label: { en: "Vitamin D", ar: "فيتامين د" },
    iconColor: "#c4aa8b",
    glowColor: "rgba(196,170,139,0.12)",
    packageTypes: ["vitamin_mineral_panel", "diagnostic_panel"],
  },
];

const VITAL_STATUS = {
  active:    { en: "On track",     ar: "يسير حسب الخطة",      style: { color: "#3a2e1e", background: "rgba(196,170,139,0.15)", border: "rgba(196,170,139,0.35)" } },
  completed: { en: "Reviewed",     ar: "تمت المراجعة",    style: { color: "#7c8689", background: "rgba(255,255,255,0.05)", border: "rgba(196,170,139,0.2)" } },
  none:      { en: "Not reviewed", ar: "لم تتم المراجعة", style: { color: "#7c8689", background: "#fff", border: "rgba(255,255,255,0.1)" } },
};

const SECONDARY_SERVICES = [
  {
    key: "skin",
    icon: Sparkles,
    iconColor: "#c4aa8b",
    accentColor: "rgba(196,170,139,0.12)",
    label: { en: "Skin", ar: "البشرة" },
    packageTypes: [
      "skin_consultation","skin_assessment","hydrafacial","hydrafacial_dermapen",
      "dermapen","rf_microneedling","rf_skin_treatment","green_peel_face","green_peel_back",
      "cosmelan_program","salicylic_peel","rf_double_chin","meso_double_chin",
    ],
    activeSummary:   { en: "Your skin plan is in progress", ar: "خطة البشرة قيد التنفيذ" },
    activeDetail:    { en: "Your skin sessions are active. Continue as scheduled and reach out if you have questions.", ar: "برنامج العناية ببشرتك مستمر. التزم بالجدول وتواصل معنا إذا كان لديك سؤال." },
    activeCTA:       { en: "View Skin Plan", ar: "عرض خطة البشرة" },
    availSummary:    { en: "Skin care can be added after assessment", ar: "يمكن إضافة عناية البشرة بعد التقييم" },
    availDetail:     { en: "Skin care is available as part of the broader BATO programme. Your care team can guide you if it becomes relevant.", ar: "يمكنك الاستفادة من خدمات البشرة ضمن خدمات باتو. يساعدك فريق العناية على اختيار ما يناسبك بعد التقييم." },
    availCTA:        { en: "Explore Skin Care", ar: "استكشف العناية بالبشرة" },
  },
  {
    key: "laser",
    icon: Zap,
    iconColor: "#8e721d",
    accentColor: "rgba(231,203,80,0.1)",
    label: { en: "Laser", ar: "الليزر" },
    packageTypes: [
      "laser_full_body","laser_full_body_student_rate","laser_full_body_custom",
      "laser_targeted_area","laser_half_back","tattoo_removal_session",
    ],
    activeSummary:   { en: "Your laser plan is in progress", ar: "خطة الليزر قيد التنفيذ" },
    activeDetail:    { en: "Laser sessions are underway. Track your progress and book your next session when due.", ar: "جلسات الليزر جارية. تابع تقدمك واحجز جلستك التالية عند حلول موعدها." },
    activeCTA:       { en: "View Laser Plan", ar: "عرض خطة الليزر" },
    availSummary:    { en: "Smooth-skin maintenance, when you're ready", ar: "حافظ على نعومة بشرتك عندما تكون مستعداً" },
    availDetail:     { en: "Laser hair removal and skin treatments are available at BATO. Explore your options or ask your care team.", ar: "إزالة الشعر بالليزر وعلاجات البشرة متوفرة في باتو. استكشف خياراتك أو اسأل فريق العناية." },
    availCTA:        { en: "Explore Laser", ar: "استكشف الليزر" },
  },
  {
    key: "drips",
    icon: Droplets,
    iconColor: "#c4aa8b",
    accentColor: "rgba(196,170,139,0.12)",
    label: { en: "Drips", ar: "المحاليل الوريدية" },
    packageTypes: [
      "iron_drip","ferinject","glutathione_drip","glutathione_drip_course_of_4","iv_therapy",
    ],
    activeSummary:   { en: "Internal support plan active", ar: "برنامج الدعم الصحي مستمر" },
    activeDetail:    { en: "Your IV drip plan is active. Continue as advised by your doctor and attend scheduled sessions.", ar: "برنامج المحاليل الوريدية مستمر. اتبع توصية طبيبك واحضر الجلسات المحددة." },
    activeCTA:       { en: "View Drip Plan", ar: "عرض برنامج المحاليل" },
    availSummary:    { en: "IV support if your case needs it", ar: "المحاليل الوريدية إذا كانت مناسبة لحالتك" },
    availDetail:     { en: "IV drip therapy is available at BATO to support hair health and general wellbeing, based on your blood work and doctor assessment.", ar: "تتوفر المحاليل الوريدية في باتو لدعم صحة الشعر والصحة العامة، وفق نتائج تحاليلك وتقييم طبيبك." },
    availCTA:        { en: "Explore Drips", ar: "استكشف المحاليل الوريدية" },
  },
];

function ServiceCard({ service, packages, isRTL, t }) {
  const [open, setOpen] = useState(false);

  const activePackage = packages?.find(
    p => service.packageTypes.includes(p.package_type) && p.status === "active"
  );
  const anyPackage = packages?.find(p => service.packageTypes.includes(p.package_type));
  const isActive = !!activePackage;

  const statusStyle = isActive
    ? { color: "#3a2e1e", background: "rgba(196,170,139,0.15)", border: "rgba(196,170,139,0.35)" }
    : { color: "#7c8689", background: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)" };
  const statusLabel = isActive ? { en: "Active", ar: "نشط" } : { en: "Available", ar: "متاح" };

  const summary = isActive
    ? (isRTL ? service.activeSummary.ar : service.activeSummary.en)
    : (isRTL ? service.availSummary.ar  : service.availSummary.en);

  const detail = isActive
    ? (isRTL ? service.activeDetail.ar  : service.activeDetail.en)
    : (isRTL ? service.availDetail.ar   : service.availDetail.en);

  const cta = isActive
    ? (isRTL ? service.activeCTA.ar     : service.activeCTA.en)
    : (isRTL ? service.availCTA.ar      : service.availCTA.en);

  return (
    <div className="bato-style-surface rounded-xl overflow-hidden"
      style={{ background: "#fff", border: "1px solid rgba(196,170,139,0.15)" }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open} className="w-full grid grid-cols-[28px_minmax(0,1fr)_16px] items-start gap-3 px-3 py-3 transition-colors text-start"
        style={{ background: "transparent" }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(196,170,139,0.06)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: service.accentColor }}>
          <service.icon className="w-3.5 h-3.5" style={{ color: service.iconColor }} />
        </div>
        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-sm font-medium text-[#3a2e1e]">
            {isRTL ? service.label.ar : service.label.en}
          </p>
          <p className="text-sm leading-6 mt-1" style={{ color: "#7c8689" }}>{summary}</p>
        <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ color: statusStyle.color, background: statusStyle.background, border: `1px solid ${statusStyle.border}` }}>
          {isRTL ? statusLabel.ar : statusLabel.en}
        </span>

        </div>
        {open
          ? <ChevronUp className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(196,170,139,0.5)" }} />
          : <ChevronDown className="w-4 h-4 flex-shrink-0" style={{ color: "rgba(196,170,139,0.5)" }} />
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-3 space-y-3"
              style={{ borderTop: "1px solid rgba(196,170,139,0.15)" }}>
              <p className="text-sm leading-relaxed" style={{ color: "#7c8689" }}>{detail}</p>

              {anyPackage && (
                <div className="rounded-lg p-3 text-xs space-y-1"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(196,170,139,0.15)" }}>
                  <p className="font-medium" style={{ color: "#3a2e1e" }}><CareText value={anyPackage.package_name}/></p>
                  <p style={{ color: "#7c8689" }}>
                    {anyPackage.sessions_used ?? 0} / {anyPackage.total_sessions} {t("sessions", "جلسات")}
                  </p>
                  {anyPackage.next_recommended_date && (
                    <p style={{ color: "#7c8689" }}>
                      {t("Next", "التالي")}: {format(anyPackage.next_recommended_date, "d MMM yyyy", {locale:isRTL?ar:undefined})}
                    </p>
                  )}
                </div>
              )}

              <Link
                to={SERVICE_URLS[service.key] || createPageUrl("MyTreatment")}
                className="flex items-center justify-center text-sm min-h-11 rounded-lg w-full mt-1"
                style={{
                  background: "transparent",
                  border: "1px solid rgba(196,170,139,0.35)",
                  color: "#3a2e1e",
                }}
              >
                {cta}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function InternalSupport({ packages, isRTL, t }) {
  const getVitalStatus = (panel) => {
    const match = packages?.find(p => panel.packageTypes.includes(p.package_type));
    if (!match) return "none";
    return match.status === "active" ? "active" : "completed";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      dir={isRTL ? "rtl" : "ltr"} className="relative overflow-hidden rounded-2xl p-5 shadow-sm border border-[#c4aa8b]/25"
      style={{ background: "#f6f3ee" }}
    >
      {/* Warm ambient glow */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "radial-gradient(circle at 80% 15%, rgba(231,203,80,0.08) 0%, transparent 50%), radial-gradient(circle at 15% 80%, rgba(196,170,139,0.08) 0%, transparent 50%)"
      }} />

      <div className="relative z-10">
        <p className={`text-xs font-medium tracking-widest uppercase mb-0.5 ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: "#7c8689" }}>
          {t("Internal Support", "الدعم الصحي")}
        </p>
        <h2 className={`text-[#3a2e1e] text-lg leading-7 font-bold mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t("Hair health from within", "صحة الشعر من الداخل")}
        </h2>

        {/* Vitals */}
        <div className="space-y-2.5 mb-5">
          {VITALS.map((panel) => {
            const statusKey = getVitalStatus(panel);
            const status = VITAL_STATUS[statusKey];
            return (
              <div key={panel.key} className="grid grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: panel.glowColor }}>
                  <panel.icon className="w-4 h-4" style={{ color: panel.iconColor }} />
                </div>
                <p className="text-sm flex-1" style={{ color: "#3a2e1e" }}>
                  {isRTL ? panel.label.ar : panel.label.en}
                </p>
                <span className="text-xs leading-5 max-w-[90px] text-center font-medium px-2 py-1 rounded-full"
                  style={{
                    color: status.style.color,
                    background: status.style.background,
                    border: `1px solid ${status.style.border}`,
                  }}>
                  {isRTL ? status.ar : status.en}
                </span>
              </div>
            );
          })}
        </div>

        {/* Divider + Care Map */}
        <div className="pt-4 mb-3" style={{ borderTop: "1px solid rgba(196,170,139,0.2)" }}>
          <p className={`text-[#3a2e1e] text-sm font-semibold mb-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>{t("Your Care Map", "خطة رعايتك")}</p>
          <p className={`text-xs mb-3 ${isRTL ? 'text-right' : 'text-left'}`} style={{ color: "#7c8689" }}>
            {t("Hair-first care, with support when relevant", "عناية تبدأ بالشعر، مع دعم إضافي عند الحاجة")}
          </p>
          <div className="space-y-2">
            {SECONDARY_SERVICES.map(service => (
              <ServiceCard
                key={service.key}
                service={service}
                packages={packages}
                isRTL={isRTL}
                t={t}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}