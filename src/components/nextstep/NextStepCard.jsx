import React from "react";
import { motion } from "framer-motion";
import { ChevronRight, ArrowRight, CheckCircle2, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLocation } from "../LocationContext";

const STATE_CONFIG_AR = {
  converted_blood_test: { title: "بدأت متابعة صحتك", body: "يمكنك الآن متابعة الخطوة التالية في صفحة الصحة.", cta: "عرض رحلة الصحة" },
  converted_session_1:  { title: "بدأت رحلة العلاج", body: "جلستك الأولى محجوزة أو مكتملة.", cta: "عرض الرحلة" },
  pending_decision:     { title: "خطوتك التالية جاهزة", body: "أعدّ فريق باتو توصية بناءً على استشارتك.", cta: "عرض الخطوة التالية" },
  follow_up_needed:     { title: "خطوتك التالية جاهزة", body: "لدى فريق باتو توصية لك بعد الاستشارة.", cta: "عرض الخطوة التالية" },
  needs_doctor_review:  { title: "حالتك قيد المراجعة", body: "يراجع فريق باتو حالتك وسيؤكد الخطوة التالية.", cta: "عرض الخطوة التالية" },
  not_interested:       { title: "هل لديك المزيد من الأسئلة؟", body: "يمكنك التواصل مع خدمة العملاء لمراجعة خياراتك.", cta: "تواصل مع خدمة العملاء" },
  not_suitable:         { title: "سيوجهك فريقك", body: "سيساعدك فريق باتو على اختيار الخطوة المناسبة لحالتك.", cta: "تواصل مع خدمة العملاء" },
};

// States that render as a compact passive strip (no competition with hero)
const COMPACT_STATES = new Set([
  "converted_blood_test",
  "converted_session_1",
  "not_interested",
  "not_suitable",
]);

// States that render as a slightly more visible action card (but still below hero in hierarchy)
const ACTION_STATES = new Set([
  "pending_decision",
  "follow_up_needed",
  "needs_doctor_review",
]);

const STATE_CONFIG = {
  converted_blood_test: {
    title: "Health Review Started",
    body: "Your next step is now in your Health Journey.",
    cta: "View Health Journey",
    ctaUrl: createPageUrl("HealthJourney"),
    color: "#c4aa8b",
    bg: "rgba(196,170,139,0.07)",
    border: "rgba(196,170,139,0.2)",
    icon: CheckCircle2,
    iconColor: "#c4aa8b",
  },
  converted_session_1: {
    title: "Treatment Journey Started",
    body: "Your first session is booked or complete.",
    cta: "View Hair Journey",
    ctaUrl: createPageUrl("HairJourney"),
    color: "#4ade80",
    bg: "rgba(74,222,128,0.04)",
    border: "rgba(74,222,128,0.18)",
    icon: CheckCircle2,
    iconColor: "#4ade80",
  },
  pending_decision: {
    title: "Your Next Step Is Ready",
    body: "Your BATO team has prepared a recommended next step based on your consultation.",
    cta: "View Next Step",
    ctaUrl: null,
    color: "#c4aa8b",
    bg: "#fff",
    border: "rgba(196,170,139,0.25)",
    icon: ArrowRight,
    iconColor: "#c4aa8b",
  },
  follow_up_needed: {
    title: "Your Next Step Is Ready",
    body: "Your BATO team has a recommended next step following your consultation.",
    cta: "View Next Step",
    ctaUrl: null,
    color: "#c4aa8b",
    bg: "#fff",
    border: "rgba(196,170,139,0.25)",
    icon: ArrowRight,
    iconColor: "#c4aa8b",
  },
  needs_doctor_review: {
    title: "Your Case Is Being Reviewed",
    body: "Your BATO team is reviewing your case. They will confirm the next step.",
    cta: "View Next Step",
    ctaUrl: null,
    color: "#c4aa8b",
    bg: "#fff",
    border: "rgba(196,170,139,0.2)",
    icon: ArrowRight,
    iconColor: "#c4aa8b",
  },
  not_interested: {
    title: "Have More Questions?",
    body: "The team is available if you'd like to revisit your options.",
    cta: "Contact customer service",
    ctaUrl: "/Messages?channel=client_care",
    color: "#7c8689",
    bg: "rgba(196,170,139,0.04)",
    border: "rgba(196,170,139,0.15)",
    icon: MessageSquare,
    iconColor: "#7c8689",
  },
  not_suitable: {
    title: "Your Team Will Guide You",
    body: "Your BATO team will advise on the appropriate next step for your case.",
    cta: "Contact customer service",
    ctaUrl: "/Messages?channel=client_care",
    color: "#7c8689",
    bg: "rgba(196,170,139,0.04)",
    border: "rgba(196,170,139,0.15)",
    icon: MessageSquare,
    iconColor: "#7c8689",
  },
};

export default function NextStepCard({ outcome, onOpen }) {
  const { isRTL } = useLocation();
  if (!outcome) return null;

  // Resolve state — prefer post_consultation_state, fall back to conversion_status
  const state = outcome.post_consultation_state || outcome.conversion_status;
  const config = STATE_CONFIG[state];
  const arConfig = STATE_CONFIG_AR[state] || {};

  // Unknown state — render nothing rather than broken UI
  if (!config) return null;

  const isCompact = COMPACT_STATES.has(state);

  // ── Compact strip (passive info, no competition with hero) ──
  if (isCompact) {
    const inner = (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl ${isRTL ? 'flex-row-reverse' : ''}`}
        style={{ background: config.bg, border: `1px solid ${config.border}` }}
      >
        <config.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: config.iconColor }} />
        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-xs font-semibold text-[#333435]">{isRTL ? (arConfig.title || config.title) : config.title}</p>
          <p className="text-[10px] text-[#7c8689] leading-snug">{isRTL ? (arConfig.body || config.body) : config.body}</p>
        </div>
        {config.ctaUrl && (
          <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 ${isRTL ? "rotate-180" : ""}`} style={{ color: config.color }} />
        )}
      </motion.div>
    );

    if (config.ctaUrl) {
      return <Link to={config.ctaUrl}>{inner}</Link>;
    }
    return inner;
  }

  // ── Action card (pending/follow-up/doctor review) ──
  // Still smaller than the hero — no large header image, no progress bar
  const handleClick = () => {
    if (config.ctaUrl) return; // Link handles it
    onOpen?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={handleClick}
      className="rounded-2xl border overflow-hidden cursor-pointer"
      style={{ background: config.bg, borderColor: config.border }}
    >
      <div className={`px-4 py-3 flex items-center gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(196,170,139,0.1)" }}>
          <config.icon className="w-3.5 h-3.5" style={{ color: config.iconColor }} />
        </div>
        <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
          <p className="text-xs font-semibold text-[#333435]">{isRTL ? (arConfig.title || config.title) : config.title}</p>
          <p className="text-[10px] text-[#7c8689] leading-snug">{isRTL ? (arConfig.body || config.body) : config.body}</p>
        </div>
        <span className={`text-[10px] font-semibold whitespace-nowrap flex-shrink-0 flex items-center gap-0.5 ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{ color: config.color }}>
          {isRTL ? (arConfig.cta || config.cta) : config.cta} <ChevronRight className={`w-3 h-3 ${isRTL ? "rotate-180" : ""}`} />
        </span>
      </div>
    </motion.div>
  );
}