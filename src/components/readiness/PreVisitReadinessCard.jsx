import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, ChevronRight, Clock } from "lucide-react";
import {
  computeReadinessItems,
  computeReadinessStatus,
  getAppointmentUrgency,
  READINESS_CONFIG,
} from "./readinessUtils";

function UrgencyBadge({ urgency }) {
  const configs = {
    today: { label: "Today", bg: "#fee2e2", color: "#dc2626" },
    tomorrow: { label: "Tomorrow", bg: "#fef3c7", color: "#d97706" },
    soon: { label: "In a few days", bg: "rgba(196,170,139,0.12)", color: "#7c8689" },
    upcoming: { label: "Coming up", bg: "rgba(196,170,139,0.08)", color: "#7c8689" },
  };
  const c = configs[urgency];
  if (!c) return null;
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

export default function PreVisitReadinessCard({ profile, appointment, onOpen }) {
  const items = computeReadinessItems(profile, appointment);
  const status = computeReadinessStatus(items, appointment);
  const urgency = getAppointmentUrgency(appointment);
  const config = READINESS_CONFIG[status];

  // Exclude appointment from client-controlled progress — BATO confirms it
  const clientItems = items.filter(i => i.required && i.key !== "appointment");
  const requiredComplete = clientItems.filter(i => i.complete).length;
  const totalRequired = clientItems.length;
  const requiredItems = items.filter(i => i.required);

  // After appointment passed — show "Visit Completed" state
  if (urgency === "past") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border p-4"
        style={{ borderColor: "rgba(196,170,139,0.2)" }}
      >
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="w-4 h-4" style={{ color: "#c4aa8b" }} />
          <p className="text-sm font-semibold text-[#333435]">Visit Completed</p>
        </div>
        <p className="text-xs text-[#7c8689] mb-3">
          Your next step will appear here after the BATO team updates your plan.
        </p>
        <button
          onClick={onOpen}
          className="text-xs font-medium px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(196,170,139,0.1)", color: "#7c8689" }}
        >
          View My Journey →
        </button>
      </motion.div>
    );
  }

  // Explorer with no appointment
  if (!profile || profile.onboarding_path === "explorer") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl border p-4"
        style={{ borderColor: "rgba(196,170,139,0.2)" }}
      >
        <p className="text-sm font-semibold text-[#333435] mb-1">Pre-Visit Readiness</p>
        <p className="text-xs text-[#7c8689] mb-3">Your visit preparation will appear here after booking.</p>
        <button
          className="text-xs font-medium px-3 py-1.5 rounded-xl"
          style={{ background: "rgba(196,170,139,0.1)", color: "#7c8689" }}
        >
          Book Consultation →
        </button>
      </motion.div>
    );
  }

  const isComplete = status === "ready";
  const missingRequired = requiredItems.filter(i => !i.complete);

  // Urgency heading
  const isPendingConfirmation = status === "pending_confirmation";

  const urgencyHeadings = {
    today: "Complete before you arrive",
    tomorrow: "Your visit is tomorrow",
    soon: "Your visit is coming soon",
    upcoming: isComplete ? "You're ready for your visit" : "Prepare for your visit",
  };
  const heading = isPendingConfirmation
    ? "Your profile is ready"
    : (urgencyHeadings[urgency] || (isComplete ? "You're ready for your visit" : "Prepare for your visit"));

  const body = isPendingConfirmation
    ? "Your BATO Profile is saved. Your appointment details are being confirmed by the BATO team."
    : config.copy;

  const isUrgent = !isPendingConfirmation && (urgency === "today" || urgency === "tomorrow");

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border overflow-hidden cursor-pointer"
      style={{
        background: isComplete ? "rgba(74,222,128,0.04)" : "#fff",
        borderColor: isUrgent && !isComplete ? "rgba(251,146,60,0.35)" : "rgba(196,170,139,0.2)",
      }}
      onClick={onOpen}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold text-[#333435]">{heading}</p>
              <UrgencyBadge urgency={urgency} />
            </div>
            <p className="text-xs text-[#7c8689] leading-relaxed">{body}</p>
          </div>
          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: config.bg, border: `1px solid ${config.border}` }}>
            <span className="text-[10px] font-bold" style={{ color: config.color }}>
              {requiredComplete}/{totalRequired}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(196,170,139,0.12)" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(requiredComplete / totalRequired) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="h-full rounded-full"
            style={{ background: isComplete ? "#4ade80" : config.color }}
          />
        </div>
        <p className="text-[10px] text-[#7c8689] mt-1">{requiredComplete} of {totalRequired} steps complete</p>
      </div>

      {/* Pending confirmation: show appointment being confirmed pill */}
      {isPendingConfirmation && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{ background: "rgba(196,170,139,0.08)", border: "1px solid rgba(196,170,139,0.2)" }}>
            <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#c4aa8b" }} />
            <p className="text-xs text-[#7c8689]">Appointment details being confirmed by BATO</p>
          </div>
        </div>
      )}

      {/* Quick checklist preview — top missing item only (non-appointment) */}
      {!isComplete && !isPendingConfirmation && missingRequired.filter(i => i.key !== "appointment").length > 0 && (
        <div className="px-4 pb-3 space-y-1.5">
          {missingRequired.filter(i => i.key !== "appointment").slice(0, 2).map(item => (
            <div key={item.key} className="flex items-center gap-2">
              <Circle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "rgba(196,170,139,0.5)" }} />
              <p className="text-xs text-[#7c8689]">{item.label}</p>
            </div>
          ))}
          {missingRequired.filter(i => i.key !== "appointment").length > 2 && (
            <p className="text-[10px] text-[#7c8689] pl-5">+{missingRequired.filter(i => i.key !== "appointment").length - 2} more</p>
          )}
        </div>
      )}

      {/* CTA footer */}
      <div className="px-4 py-3 border-t flex items-center justify-between"
        style={{ borderColor: "rgba(196,170,139,0.12)", background: "rgba(196,170,139,0.03)" }}>
        <span className="text-xs font-medium" style={{ color: config.color }}>
          {isPendingConfirmation ? "View My Profile" : isComplete ? "View Visit Prep" : "Continue Setup"}
        </span>
        <ChevronRight className="w-4 h-4" style={{ color: config.color }} />
      </div>
    </motion.div>
  );
}