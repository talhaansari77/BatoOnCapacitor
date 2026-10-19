import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, MessageSquare, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const STEP_DETAILS = {
  blood_test_panels: {
    title: "Blood Test / Panels",
    why_template: (reason) => reason || "Your team wants to understand whether internal factors may be affecting your hair, skin, energy, or recovery.",
    what_after: "Your results will be reviewed by the BATO medical team. Based on the findings, the team will guide the appropriate next step — whether that's a drip, medication, or simply knowing your levels are fine.",
    cta: "Book Blood Test",
    ctaUrl: createPageUrl("ClinicAppointments"),
    secondary: "Contact your specialist",
    secondaryUrl: "/Messages?channel=medical_team",
    questions: [
      "Do I need to fast before the blood test?",
      "Which panels are being recommended?",
      "How long until results are ready?",
      "Will the results affect my treatment plan?",
    ],
  },
  session_1: {
    title: "Start Session 1",
    why_template: (reason) => reason || "Your consultation showed that you may be ready to begin your treatment journey.",
    what_after: "Your team will track your sessions, aftercare, and progress through the app. After each session, you'll receive guidance on what to do at home and when to return.",
    cta: "Book Session 1",
    ctaUrl: createPageUrl("ClinicAppointments"),
    secondary: "Contact your specialist",
    secondaryUrl: createPageUrl("Messages"),
    questions: [
      "What should I do to prepare for Session 1?",
      "How many sessions will I need?",
      "What should I expect after the first session?",
      "Will I see results quickly?",
    ],
  },
  follow_up_consultation: {
    title: "Follow-Up Consultation",
    why_template: (reason) => reason || "A follow-up helps the team review your situation and clarify the right next step.",
    what_after: "After the follow-up, the team will have a clearer picture and will recommend whether to proceed with a blood test, treatment session, or another path.",
    cta: "Book Follow-Up",
    ctaUrl: createPageUrl("ClinicAppointments"),
    secondary: "Contact customer service",
    secondaryUrl: "/Messages?channel=client_care",
    questions: [
      "What will the follow-up cover?",
      "Do I need to prepare anything?",
      "Will this decide my treatment plan?",
    ],
  },
  doctor_review: {
    title: "Doctor Review",
    why_template: (reason) => reason || "The team wants a doctor to review your case before deciding on the next step.",
    what_after: "After the doctor review, you will receive a clear recommendation — whether that involves tests, treatment, or a different approach.",
    cta: "Contact your specialist",
    ctaUrl: "/Messages?channel=medical_team",
    secondary: "Ask a Question",
    secondaryUrl: createPageUrl("Messages"),
    questions: [
      "What will the doctor review?",
      "Do I need to bring anything?",
      "How long does a doctor review take?",
    ],
  },
  message_client_care: {
    title: "Connect with Customer service",
    why_template: (reason) => reason || "The team recommends reaching out to clarify your options before deciding.",
    what_after: "Customer service will help you understand your options, answer your questions, and guide you to the right next step without pressure.",
    cta: "Contact customer service",
    ctaUrl: "/Messages?channel=client_care",
    secondary: "View Services",
    secondaryUrl: "/ClinicServices",
    questions: [
      "What are my options after the consultation?",
      "Can I take more time to decide?",
      "Is there anything else I should know?",
    ],
  },
  no_action_needed: {
    title: "No Action Needed",
    why_template: () => "Your team has reviewed your case and there is no immediate action required at this time.",
    what_after: "If anything changes or you have questions, the team is always available to help.",
    cta: "Contact your specialist",
    ctaUrl: createPageUrl("Messages"),
    secondary: null,
    secondaryUrl: null,
    questions: [],
  },
};

export default function NextStepDetailView({ outcome, onClose }) {
  if (!outcome) return null;

  const state = outcome.post_consultation_state || outcome.conversion_status;
  const isNotInterested = state === "not_interested";
  const isNotSuitable = state === "not_suitable";
  const isDoctorReview = state === "needs_doctor_review";

  // Map state to step details — special cases override recommended_next_step field
  const stepKey = isDoctorReview
    ? "doctor_review"
    : isNotInterested || isNotSuitable
    ? "message_client_care"
    : (outcome.recommended_next_step || "message_client_care");
  const step = STEP_DETAILS[stepKey] || STEP_DETAILS["message_client_care"];

  return (
    <div className="min-h-screen pb-10" style={{ background: "#eeebe6" }}>
      <div className="max-w-lg mx-auto px-4 py-5">

        {/* Back */}
        <button onClick={onClose} className="flex items-center gap-1.5 text-xs text-[#7c8689] mb-5">
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        {/* Header */}
        <div className="mb-5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-0.5">Based on your consultation</p>
          <h1 className="text-xl font-bold text-[#333435]">Your Next Step</h1>
        </div>

        {/* Main card */}
        {(isNotInterested || isNotSuitable || isDoctorReview) ? (
          <div className="bg-white rounded-2xl border p-5 mb-4" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
            <p className="text-sm font-semibold text-[#333435] mb-2">
              {isNotSuitable
                ? "Your team will guide the next step."
                : isDoctorReview
                ? "Your case is being reviewed."
                : "Have more questions?"}
            </p>
            <p className="text-sm text-[#7c8689] leading-relaxed">
              {isNotSuitable
                ? "Based on your consultation, your BATO team will advise what is appropriate for your case. There is no pressure to decide anything today."
                : isDoctorReview
                ? "Your BATO team wants a doctor to review your case before confirming the next step. This ensures the recommendation is right for you. The team will be in touch once the review is complete."
                : "If you still have questions after your consultation, the BATO team can help you understand your options before you decide anything."}
            </p>
          </div>
        ) : (
          <>
            {/* Recommended step */}
            <div className="bato-style-hero relative overflow-hidden rounded-2xl p-5 mb-4"
              style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
              <div className="absolute inset-0 pointer-events-none"
                style={{ backgroundImage: "radial-gradient(circle at 80% 10%, rgba(196,170,139,0.1) 0%, transparent 50%)" }} />
              <div className="relative z-10">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(196,170,139,0.7)" }}>
                  Recommended next step
                </p>
                <h2 className="text-lg font-bold text-white mb-3">{step.title}</h2>

                <div className="mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(196,170,139,0.5)" }}>Why</p>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(238,235,230,0.8)" }}>
                    {step.why_template(outcome.recommendation_reason)}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mb-1" style={{ color: "rgba(196,170,139,0.5)" }}>What happens after</p>
                  <p className="text-sm leading-relaxed" style={{ color: "rgba(238,235,230,0.65)" }}>{step.what_after}</p>
                </div>
              </div>
            </div>

            {/* Questions to ask */}
            {step.questions.length > 0 && (
              <div className="bg-white rounded-2xl border p-4 mb-4" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#7c8689] mb-3">Questions you may want to ask</p>
                <div className="space-y-2">
                  {step.questions.map((q, i) => (
                    <div key={i} className="bato-style-surface flex items-start gap-2.5 p-2.5 rounded-xl"
                      style={{ background: "#f9f8f6" }}>
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#c4aa8b" }} />
                      <p className="text-xs text-[#333435]">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* CTA buttons */}
        <div className="space-y-2.5">
          <Link to={step.ctaUrl || createPageUrl("Messages")}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-semibold"
            style={{ background: "#3a2e1e", color: "#c4aa8b" }}>
            {step.cta}
          </Link>
          {step.secondary && step.secondaryUrl && (
            <Link to={step.secondaryUrl}
              className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl text-sm font-medium"
              style={{ background: "rgba(196,170,139,0.08)", color: "#7c8689", border: "1px solid rgba(196,170,139,0.2)" }}>
              <MessageSquare className="w-4 h-4" />
              {step.secondary}
            </Link>
          )}
          <p className="text-center text-[10px] text-[#7c8689] pt-1">
            Your team is available to clarify anything before you decide.
          </p>
        </div>

      </div>
    </div>
  );
}