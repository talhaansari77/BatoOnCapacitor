import React from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, FileText, MessageSquare,
  ChevronRight, User, Zap, Heart, Star
} from "lucide-react";
import { format } from "date-fns";

function InfoRow({ label, value, muted }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-1.5">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] w-28 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-xs flex-1 ${muted ? "text-[#7c8689] italic" : "text-[#333435]"}`}>{value}</span>
    </div>
  );
}

function SafetyBadge({ level }) {
  const configs = {
    none: { label: "No Flags Reported", bg: "rgba(74,222,128,0.08)", color: "#16a34a" },
    review: { label: "Review Required", bg: "rgba(251,191,36,0.1)", color: "#d97706" },
    flag: { label: "Safety Flag", bg: "rgba(239,68,68,0.08)", color: "#dc2626" },
  };
  const c = configs[level] || configs.none;
  return (
    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background: c.bg, color: c.color }}>
      {c.label}
    </span>
  );
}

function getSafetyLevel(profile) {
  if (!profile) return "none";
  const hasFlag = profile.has_allergies || profile.had_bad_reaction || profile.is_pregnant_or_breastfeeding;
  const reviewNeeded = profile.has_medications || profile.has_medical_conditions || profile.had_recent_surgery
    || (profile.uploaded_documents || []).length > 0;
  const healthComplete = profile.has_allergies !== undefined && profile.has_medications !== undefined && profile.has_medical_conditions !== undefined;
  if (!healthComplete) return "review";
  if (hasFlag) return "flag";
  if (reviewNeeded) return "review";
  return "none";
}

function generateSuggestedOpening(profile) {
  if (!profile) return null;
  const concern = profile.main_concern;
  const fear = profile.biggest_worry;
  const prev = (profile.previous_treatments || []).filter(t => t !== "Nothing yet");
  const result = profile.previous_experience_result;
  const service = (profile.booked_service_type || "").toLowerCase();

  if (!concern) return null;

  let base = `I saw your main concern is ${concern.toLowerCase()}`;

  if (fear && fear !== "Other") {
    base += ` and that you're worried about ${fear.toLowerCase()}`;
  }

  if (prev.length > 0 && result && result !== "Good result" && result !== "Not sure") {
    base += `. You've tried ${prev.slice(0, 2).join(" and ").toLowerCase()} before with ${result.toLowerCase()}`;
    base += ". Let's start there so we understand what may have been missing.";
  } else if (service.includes("inject")) {
    base += ". Let's start with the result you want and what you'd like to avoid.";
  } else if (service.includes("laser")) {
    base += ". We'll walk through the area, timing, and what to expect before starting.";
  } else if (service.includes("skin")) {
    base += ". Let's understand what your skin has reacted to before, then discuss suitable options.";
  } else if (service.includes("drip") || service.includes("panel") || service.includes("lab") || service.includes("health")) {
    base += ". Let's review your history and any previous results first.";
  } else {
    base += ". Let's start there and put together the right plan.";
  }

  return base.charAt(0).toUpperCase() + base.slice(1);
}

function getProfileQuality(profile) {
  const hasCore = profile?.booked_service_type && profile?.main_concern && profile?.consent_acknowledged;
  const hasSafety = profile?.has_allergies !== undefined && profile?.has_medications !== undefined && profile?.has_medical_conditions !== undefined;
  if (hasCore && hasSafety && profile?.completed) return "Complete";
  if (profile?.completed || hasSafety) return "Partial";
  return "Missing Key Info";
}

export default function PreVisitBriefingQuickCard({ profile, appointment, clientName, onViewFull }) {
  const safetyLevel = getSafetyLevel(profile);
  const suggestedOpening = generateSuggestedOpening(profile);
  const profileQuality = getProfileQuality(profile);
  const questions = profile?.client_questions || [];
  const photos = profile?.uploaded_photos || [];
  const docs = profile?.uploaded_documents || [];
  const additionalInterests = (profile?.additional_concerns || []).filter(c => c !== "Nothing else for now");
  const prevTreatments = (profile?.previous_treatments || []).filter(t => t !== "Nothing yet");

  const hasCriticalAttention = safetyLevel === "flag" || safetyLevel === "review" || profileQuality === "Missing Key Info";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border overflow-hidden"
      style={{ borderColor: "rgba(196,170,139,0.2)" }}
    >
      {/* Critical Attention Strip */}
      {hasCriticalAttention && (
        <div className="px-4 py-3 border-b flex items-start gap-2.5"
          style={{
            background: safetyLevel === "flag" ? "rgba(239,68,68,0.05)" : "rgba(251,191,36,0.07)",
            borderColor: safetyLevel === "flag" ? "rgba(239,68,68,0.2)" : "rgba(251,191,36,0.25)",
          }}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: safetyLevel === "flag" ? "#dc2626" : "#d97706" }} />
          <div>
            <p className="text-xs font-semibold mb-1"
              style={{ color: safetyLevel === "flag" ? "#dc2626" : "#d97706" }}>Review Required</p>
            <div className="space-y-0.5">
              {profile?.has_allergies && <p className="text-[10px] text-[#7c8689]">· Allergy reported</p>}
              {profile?.had_bad_reaction && <p className="text-[10px] text-[#7c8689]">· Previous bad reaction reported</p>}
              {profile?.is_pregnant_or_breastfeeding && <p className="text-[10px] text-[#7c8689]">· Pregnant or breastfeeding</p>}
              {profile?.has_medications && <p className="text-[10px] text-[#7c8689]">· Current medication reported</p>}
              {profile?.has_medical_conditions && <p className="text-[10px] text-[#7c8689]">· Medical condition reported</p>}
              {profile?.had_recent_surgery && <p className="text-[10px] text-[#7c8689]">· Recent surgery or illness</p>}
              {docs.length > 0 && <p className="text-[10px] text-[#7c8689]">· Lab results uploaded — review needed</p>}
              {profileQuality === "Missing Key Info" && <p className="text-[10px] text-[#7c8689]">· Profile incomplete — contact client</p>}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(196,170,139,0.1)" }}>
        <div className="flex items-center justify-between mb-0.5">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" style={{ color: "#c4aa8b" }} />
            <p className="text-sm font-semibold text-[#333435]">Pre-Visit Briefing</p>
          </div>
          <SafetyBadge level={safetyLevel} />
        </div>
        <p className="text-[10px] text-[#7c8689]">
          Quick brief · {appointment
            ? format(new Date(appointment.appointment_date), "EEE d MMM · HH:mm")
            : "Appointment being confirmed"}
        </p>
      </div>

      {/* Quick snapshot rows */}
      <div className="px-4 py-2 divide-y" style={{ divideColor: "rgba(196,170,139,0.08)" }}>
        <InfoRow label="Client" value={clientName || profile?.client_email} />
        <InfoRow label="Booked for" value={profile?.booked_service_type} muted={!profile?.booked_service_type} />
        <InfoRow label="Main concern" value={profile?.main_concern} muted={!profile?.main_concern} />
        <InfoRow label="Biggest fear" value={profile?.biggest_worry} muted={!profile?.biggest_worry} />
        <InfoRow label="Desired outcome" value={profile?.desired_result} muted={!profile?.desired_result} />
        <InfoRow
          label="Previous Tx"
          value={prevTreatments.length > 0
            ? `${prevTreatments.slice(0, 2).join(", ")}${prevTreatments.length > 2 ? ` +${prevTreatments.length - 2} more` : ""}${profile?.previous_experience_result ? ` — ${profile.previous_experience_result}` : ""}`
            : "Nothing tried yet"}
          muted={prevTreatments.length === 0}
        />
        <InfoRow
          label="Safety"
          value={safetyLevel === "flag" ? "Safety Flag — review before treatment" : safetyLevel === "review" ? "Review Required" : "No Flags Reported"}
        />
        <InfoRow
          label="Files"
          value={photos.length + docs.length > 0
            ? `${photos.length > 0 ? `${photos.length} photo(s)` : ""}${photos.length > 0 && docs.length > 0 ? ", " : ""}${docs.length > 0 ? `${docs.length} document(s)` : ""}`.trim()
            : "No files uploaded"}
          muted={photos.length + docs.length === 0}
        />
        <InfoRow
          label="Questions"
          value={questions.length > 0 ? `${questions.length} question(s) added` : "None added"}
          muted={questions.length === 0}
        />
        <InfoRow
          label="Other interests"
          value={additionalInterests.length > 0 ? additionalInterests.join(", ") : "None"}
          muted={additionalInterests.length === 0}
        />
        <InfoRow label="Source" value={profile?.referral_source} muted={!profile?.referral_source} />
      </div>

      {/* Suggested opening */}
      {suggestedOpening && (
        <div className="mx-4 my-3 rounded-xl p-3"
          style={{ background: "rgba(196,170,139,0.07)", border: "1px solid rgba(196,170,139,0.18)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-1.5">Suggested Opening</p>
          <p className="text-xs text-[#333435] leading-relaxed italic">"{suggestedOpening}"</p>
        </div>
      )}

      {/* Footer CTA */}
      <div className="px-4 py-3 border-t flex items-center justify-between"
        style={{ borderColor: "rgba(196,170,139,0.12)", background: "rgba(196,170,139,0.03)" }}>
        <p className="text-[10px] text-[#7c8689]">Profile quality: <span className="font-semibold" style={{ color: profileQuality === "Complete" ? "#16a34a" : profileQuality === "Partial" ? "#d97706" : "#dc2626" }}>{profileQuality}</span></p>
        <button
          onClick={onViewFull}
          className="flex items-center gap-1 text-xs font-medium"
          style={{ color: "#c4aa8b" }}
        >
          Full Briefing <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
}