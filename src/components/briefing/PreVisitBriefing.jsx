import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp,
  FileImage, FileText, MessageSquare, ArrowLeft, Shield, Clock,
  Star, Heart, User, Phone, ExternalLink, Edit3, Save, X
} from "lucide-react";
import { format } from "date-fns";
import { base44 } from "@/api/base44Client";
import { computeReadinessItems, computeReadinessStatus, READINESS_CONFIG } from "../readiness/readinessUtils";
import { toast } from "sonner";

// ── Helpers ──────────────────────────────────────────────────────────────────

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

function getProfileQuality(profile) {
  const hasCore = profile?.booked_service_type && profile?.main_concern && profile?.consent_acknowledged;
  const hasSafety = profile?.has_allergies !== undefined && profile?.has_medications !== undefined && profile?.has_medical_conditions !== undefined;
  if (hasCore && hasSafety && profile?.completed) return "Complete";
  if (profile?.completed || hasSafety) return "Partial";
  return "Missing Key Info";
}

function generateSuggestedOpening(profile) {
  if (!profile?.main_concern) return null;
  const concern = profile.main_concern;
  const fear = profile.biggest_worry;
  const prev = (profile.previous_treatments || []).filter(t => t !== "Nothing yet");
  const result = profile.previous_experience_result;
  const service = (profile.booked_service_type || "").toLowerCase();

  let base = `I saw your main concern is ${concern.toLowerCase()}`;
  if (fear && fear !== "Other") base += ` and that you're worried about ${fear.toLowerCase()}`;

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

function generateConsultationFocus(profile, safetyLevel) {
  const focus = [];
  if (profile?.main_concern) focus.push(`Start by acknowledging the client's main concern: ${profile.main_concern}.`);
  if (profile?.biggest_worry) focus.push(`Address their fear: "${profile.biggest_worry}" — this matters to them.`);
  if (profile?.previous_experience_result && profile.previous_experience_result !== "Good result" && profile.previous_experience_result !== "Not sure") {
    focus.push(`Explain how BATO's approach differs from their previous experience (${profile.previous_experience_result}).`);
  }
  if ((profile?.uploaded_photos || []).length > 0) focus.push("Review uploaded photos before the consultation.");
  if ((profile?.uploaded_documents || []).length > 0) focus.push("Review uploaded lab results before the consultation.");
  if (safetyLevel !== "none") focus.push("Check safety flags before recommending any treatment.");
  if ((profile?.client_questions || []).length > 0) focus.push("Allow time to address client's pre-submitted questions.");
  if ((profile?.additional_concerns || []).filter(c => c !== "Nothing else for now").length > 0) {
    focus.push("Note additional interests — mention only if clinically relevant.");
  }
  return focus;
}

// ── Sub-components ────────────────────────────────────────────────────────────

function SectionHeader({ title, icon: Icon }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {Icon && <Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />}
      <p className="text-xs font-semibold uppercase tracking-wider text-[#7c8689]">{title}</p>
    </div>
  );
}

function DataRow({ label, value, muted, flag }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: "rgba(196,170,139,0.08)" }}>
      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] w-36 flex-shrink-0 mt-0.5">{label}</span>
      <span className={`text-xs flex-1 leading-relaxed ${flag ? "text-amber-700 font-medium" : muted ? "text-[#7c8689] italic" : "text-[#333435]"}`}>
        {value || "Not provided"}
      </span>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border p-4 mb-3" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
      <SectionHeader title={title} icon={icon} />
      {children}
    </div>
  );
}

function StatusBadge({ label, type }) {
  const colors = {
    success: { bg: "rgba(74,222,128,0.08)", color: "#16a34a" },
    warn: { bg: "rgba(251,191,36,0.1)", color: "#d97706" },
    danger: { bg: "rgba(239,68,68,0.08)", color: "#dc2626" },
    neutral: { bg: "rgba(196,170,139,0.1)", color: "#7c8689" },
  };
  const c = colors[type] || colors.neutral;
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: c.bg, color: c.color }}>{label}</span>
  );
}

function StaffNoteEditor({ category, label, value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(value || "");

  const handleSave = () => {
    onSave(text);
    setEditing(false);
  };

  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689]">{label}</p>
        {!editing && (
          <button onClick={() => setEditing(true)}
            className="flex items-center gap-1 text-[10px] text-[#c4aa8b]">
            <Edit3 className="w-3 h-3" /> {value ? "Edit" : "Add"}
          </button>
        )}
      </div>
      {editing ? (
        <div>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            placeholder={`Add ${label.toLowerCase()}...`}
            className="w-full rounded-xl border px-3 py-2.5 text-xs text-[#333435] outline-none resize-none"
            style={{ borderColor: "rgba(196,170,139,0.3)", background: "#fafaf9" }}
          />
          <div className="flex gap-2 mt-1.5">
            <button onClick={handleSave}
              className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg"
              style={{ background: "#3a2e1e", color: "#c4aa8b" }}>
              <Save className="w-3 h-3" /> Save
            </button>
            <button onClick={() => { setEditing(false); setText(value || ""); }}
              className="text-[10px] text-[#7c8689] px-2.5 py-1.5">Cancel</button>
          </div>
        </div>
      ) : (
        <p className={`text-xs leading-relaxed p-2.5 rounded-lg ${value ? "text-[#333435]" : "text-[#7c8689] italic"}`}
          style={{ background: "rgba(196,170,139,0.05)", border: "1px dashed rgba(196,170,139,0.2)" }}>
          {value || `No ${label.toLowerCase()} added yet.`}
        </p>
      )}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function PreVisitBriefing({ profile, appointment, clientName, onClose, onProfileUpdate }) {
  const [reviewed, setReviewed] = useState(profile?.pre_visit_briefing_reviewed || false);
  const [saving, setSaving] = useState(false);
  const [staffNotes, setStaffNotes] = useState({
    clinical: profile?.staff_notes_clinical || "",
    trust: profile?.staff_notes_trust || "",
    opportunity: profile?.staff_notes_opportunity || "",
  });

  const safetyLevel = getSafetyLevel(profile);
  const profileQuality = getProfileQuality(profile);
  const suggestedOpening = generateSuggestedOpening(profile);
  const consultationFocus = generateConsultationFocus(profile, safetyLevel);
  const questions = profile?.client_questions || [];
  const photos = profile?.uploaded_photos || [];
  const docs = profile?.uploaded_documents || [];
  const additionalInterests = (profile?.additional_concerns || []).filter(c => c !== "Nothing else for now");
  const prevTreatments = (profile?.previous_treatments || []).filter(t => t !== "Nothing yet");

  const items = computeReadinessItems(profile, appointment);
  const readinessStatus = computeReadinessStatus(items, appointment);
  const readinessConfig = READINESS_CONFIG[readinessStatus];
  const readinessLabels = {
    ready: "Ready", almost_ready: "Almost Ready",
    needs_attention: "Needs Attention", pending_confirmation: "No Appointment Linked",
  };

  // Visit-specific answers
  const vsa = profile?.visit_specific_answers || {};

  const hasCriticalAttention = safetyLevel !== "none" || profileQuality === "Missing Key Info";

  const handleMarkReviewed = async () => {
    setSaving(true);
    const updates = {
      pre_visit_briefing_reviewed: true,
      briefing_reviewed_by: "staff",
      briefing_reviewed_at: new Date().toISOString(),
    };
    await onProfileUpdate(updates);
    setReviewed(true);
    setSaving(false);
    toast.success("Briefing marked as reviewed.");
  };

  const handleSaveNote = async (field, value) => {
    setStaffNotes(n => ({ ...n, [field]: value }));
    const key = `staff_notes_${field}`;
    await onProfileUpdate({ [key]: value });
    toast.success("Note saved.");
  };

  return (
    <div className="min-h-screen pb-10" style={{ background: "#eeebe6" }}>
      <div className="max-w-2xl mx-auto px-4 py-5">

        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={onClose} className="flex items-center gap-1.5 text-xs text-[#7c8689]">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            {reviewed ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full"
                style={{ background: "rgba(74,222,128,0.1)", color: "#16a34a" }}>
                <CheckCircle2 className="w-3 h-3" /> Reviewed
              </span>
            ) : (
              <button
                onClick={handleMarkReviewed}
                disabled={saving}
                className="text-[10px] font-semibold px-3 py-1.5 rounded-full"
                style={{ background: "#3a2e1e", color: "#c4aa8b" }}
              >
                {saving ? "Saving..." : "Mark as Reviewed"}
              </button>
            )}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-0.5">Staff · Pre-Visit Briefing</p>
          <h1 className="text-xl font-bold text-[#333435]">{clientName || profile?.client_email}</h1>
          {appointment && (
            <p className="text-xs text-[#7c8689] mt-0.5">
              {format(new Date(appointment.appointment_date), "EEEE, d MMMM yyyy · HH:mm")}
              {appointment.location ? ` · ${appointment.location}` : ""}
            </p>
          )}
        </div>

        {/* Critical Attention Strip */}
        {hasCriticalAttention && (
          <div className="rounded-2xl border p-4 mb-3 flex items-start gap-3"
            style={{
              background: safetyLevel === "flag" ? "rgba(239,68,68,0.05)" : "rgba(251,191,36,0.07)",
              borderColor: safetyLevel === "flag" ? "rgba(239,68,68,0.25)" : "rgba(251,191,36,0.3)",
            }}>
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5"
              style={{ color: safetyLevel === "flag" ? "#dc2626" : "#d97706" }} />
            <div>
              <p className="text-sm font-semibold mb-2"
                style={{ color: safetyLevel === "flag" ? "#dc2626" : "#d97706" }}>Review Required</p>
              <div className="space-y-1">
                {profile?.has_allergies && <p className="text-xs text-[#7c8689]">· Allergy reported — confirm details before treatment</p>}
                {profile?.had_bad_reaction && <p className="text-xs text-[#7c8689]">· Previous bad reaction reported</p>}
                {profile?.is_pregnant_or_breastfeeding && <p className="text-xs text-[#7c8689]">· Pregnant or breastfeeding — doctor review needed</p>}
                {profile?.has_medications && <p className="text-xs text-[#7c8689]">· Current medication reported — check compatibility</p>}
                {profile?.has_medical_conditions && <p className="text-xs text-[#7c8689]">· Medical condition reported — review before treatment</p>}
                {profile?.had_recent_surgery && <p className="text-xs text-[#7c8689]">· Recent surgery or illness reported</p>}
                {docs.length > 0 && <p className="text-xs text-[#7c8689]">· Lab results uploaded — review recommended</p>}
                {profileQuality === "Missing Key Info" && <p className="text-xs text-[#7c8689]">· Profile incomplete — consider contacting client before visit</p>}
              </div>
            </div>
          </div>
        )}

        {/* 1. Visit Snapshot */}
        <Section title="Visit Snapshot" icon={User}>
          <DataRow label="Client" value={clientName || profile?.client_email} />
          <DataRow label="Booked for" value={profile?.booked_service_type} muted={!profile?.booked_service_type} />
          <DataRow label="Appointment" value={appointment ? format(new Date(appointment.appointment_date), "EEE d MMM · HH:mm") : "Being confirmed"} muted={!appointment} />
          <DataRow label="Location" value={appointment?.location} muted={!appointment?.location} />
          <DataRow label="Specialist" value={appointment?.specialist_name} muted={!appointment?.specialist_name} />
          <div className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: "rgba(196,170,139,0.08)" }}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] w-36 flex-shrink-0 mt-1">Readiness</span>
            <StatusBadge
              label={readinessLabels[readinessStatus] || readinessStatus}
              type={readinessStatus === "ready" ? "success" : readinessStatus === "needs_attention" ? "danger" : "warn"}
            />
          </div>
          <div className="flex items-start gap-3 py-2 border-b last:border-0" style={{ borderColor: "rgba(196,170,139,0.08)" }}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] w-36 flex-shrink-0 mt-1">Profile Quality</span>
            <StatusBadge
              label={profileQuality}
              type={profileQuality === "Complete" ? "success" : profileQuality === "Partial" ? "warn" : "danger"}
            />
          </div>
          <div className="flex items-start gap-3 py-2" style={{ borderColor: "rgba(196,170,139,0.08)" }}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] w-36 flex-shrink-0 mt-1">Briefing</span>
            <StatusBadge label={reviewed ? "Reviewed" : "Not Reviewed"} type={reviewed ? "success" : "neutral"} />
          </div>
        </Section>

        {/* 2. Main Concern */}
        <Section title="Main Concern" icon={Heart}>
          <DataRow label="Main concern" value={profile?.main_concern} muted={!profile?.main_concern} />
          <DataRow label="Biggest fear" value={profile?.biggest_worry} muted={!profile?.biggest_worry} />

          {/* Service-specific visit answers */}
          {Object.keys(vsa).length > 0 && (
            <>
              {vsa.duration && <DataRow label="Duration" value={vsa.duration} />}
              {vsa.getting_worse !== undefined && <DataRow label="Getting worse?" value={vsa.getting_worse ? "Yes" : "No"} />}
              {vsa.areas && Array.isArray(vsa.areas) && <DataRow label="Affected areas" value={vsa.areas.join(", ")} />}
              {vsa.shedding && <DataRow label="Shedding level" value={vsa.shedding} />}
              {vsa.scalp_symptoms && Array.isArray(vsa.scalp_symptoms) && vsa.scalp_symptoms.length > 0 && <DataRow label="Scalp symptoms" value={vsa.scalp_symptoms.join(", ")} />}
              {vsa.family_history !== undefined && <DataRow label="Family history" value={vsa.family_history ? "Yes" : "No"} />}
              {vsa.skin_concerns && Array.isArray(vsa.skin_concerns) && <DataRow label="Skin concerns" value={vsa.skin_concerns.join(", ")} />}
              {vsa.is_sensitive !== undefined && <DataRow label="Sensitive skin?" value={vsa.is_sensitive ? "Yes" : "No"} />}
              {vsa.current_products && <DataRow label="Current skincare" value={vsa.current_products} />}
              {vsa.injectable_type && <DataRow label="Injectable type" value={vsa.injectable_type} />}
              {vsa.preferred_result && <DataRow label="Preferred result" value={vsa.preferred_result} />}
              {vsa.drip_type && <DataRow label="Drip type" value={vsa.drip_type} />}
              {vsa.panels && Array.isArray(vsa.panels) && <DataRow label="Panels requested" value={vsa.panels.join(", ")} />}
              {vsa.general_reason && <DataRow label="Visit reason" value={vsa.general_reason} />}
            </>
          )}
        </Section>

        {/* 3. Emotional Context */}
        <Section title="Emotional Context" icon={Star}>
          <DataRow label="Desired outcome" value={profile?.desired_result} muted={!profile?.desired_result} />
          <DataRow label="Fears / concerns" value={profile?.fears_and_concerns} muted={!profile?.fears_and_concerns} />
          <DataRow label="Goals" value={(profile?.goals || []).join(", ")} muted={(profile?.goals || []).length === 0} />

          {(profile?.biggest_worry || profile?.fears_and_concerns) && (
            <div className="mt-3 rounded-xl p-3"
              style={{ background: "rgba(196,170,139,0.07)", border: "1px solid rgba(196,170,139,0.15)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-1">Consultation Note</p>
              <p className="text-xs text-[#333435] leading-relaxed">
                {profile?.biggest_worry
                  ? `Client is worried about "${profile.biggest_worry.toLowerCase()}". Address this early to build trust.`
                  : profile?.fears_and_concerns
                    ? `Client shared concerns about: "${profile.fears_and_concerns}". Acknowledge this before moving into the plan.`
                    : "No specific emotional concern provided."}
              </p>
            </div>
          )}
        </Section>

        {/* 4. Previous Experience */}
        <Section title="Previous Experience" icon={Clock}>
          <DataRow
            label="Treatments tried"
            value={prevTreatments.length > 0 ? prevTreatments.join(", ") : null}
            muted={prevTreatments.length === 0}
          />
          <DataRow label="Result" value={profile?.previous_experience_result} muted={!profile?.previous_experience_result} />
          <DataRow label="Client notes" value={profile?.previous_experience_notes} muted={!profile?.previous_experience_notes} />

          {prevTreatments.length > 0 && profile?.previous_experience_result && profile.previous_experience_result !== "Good result" && (
            <div className="mt-3 rounded-xl p-3"
              style={{ background: "rgba(196,170,139,0.07)", border: "1px solid rgba(196,170,139,0.15)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-1">Team Note</p>
              <p className="text-xs text-[#333435] leading-relaxed">
                Client has tried treatment before with a {profile.previous_experience_result.toLowerCase()}. Explain how BATO's approach differs from what they experienced previously.
              </p>
            </div>
          )}
        </Section>

        {/* 5. Clinical / Safety */}
        <Section title="Clinical & Safety" icon={Shield}>
          <div className="flex items-center gap-2 mb-3">
            <StatusBadge
              label={safetyLevel === "flag" ? "Safety Flag" : safetyLevel === "review" ? "Review Required" : "No Flags Reported"}
              type={safetyLevel === "flag" ? "danger" : safetyLevel === "review" ? "warn" : "success"}
            />
          </div>
          <DataRow label="Allergies" value={profile?.has_allergies === true ? (profile?.allergies_detail || "Yes — details not provided") : profile?.has_allergies === false ? "None" : null} muted={profile?.has_allergies === undefined} flag={profile?.has_allergies} />
          <DataRow label="Medications" value={profile?.has_medications === true ? (profile?.medications_detail || "Yes — details not provided") : profile?.has_medications === false ? "None" : null} muted={profile?.has_medications === undefined} flag={profile?.has_medications} />
          <DataRow label="Supplements" value={profile?.has_supplements === true ? (profile?.supplements_detail || "Yes — details not provided") : profile?.has_supplements === false ? "None" : null} muted={profile?.has_supplements === undefined} />
          <DataRow label="Conditions" value={profile?.has_medical_conditions === true ? (profile?.medical_conditions_detail || "Yes — details not provided") : profile?.has_medical_conditions === false ? "None" : null} muted={profile?.has_medical_conditions === undefined} flag={profile?.has_medical_conditions} />
          <DataRow label="Recent surgery" value={profile?.had_recent_surgery === true ? "Yes" : profile?.had_recent_surgery === false ? "No" : null} muted={profile?.had_recent_surgery === undefined} flag={profile?.had_recent_surgery} />
          <DataRow label="Bad reaction" value={profile?.had_bad_reaction === true ? (profile?.bad_reaction_detail || "Yes — details not provided") : profile?.had_bad_reaction === false ? "No" : null} muted={profile?.had_bad_reaction === undefined} flag={profile?.had_bad_reaction} />
          <DataRow label="Pregnant / BF" value={profile?.is_pregnant_or_breastfeeding === true ? "Yes" : profile?.is_pregnant_or_breastfeeding === false ? "No" : null} muted={profile?.is_pregnant_or_breastfeeding === undefined} flag={profile?.is_pregnant_or_breastfeeding} />
          <DataRow label="Lab concerns" value={(profile?.known_deficiencies || []).join(", ")} muted={(profile?.known_deficiencies || []).length === 0} />
        </Section>

        {/* 6. Uploaded Files */}
        <Section title="Uploaded Files" icon={FileImage}>
          {photos.length === 0 && docs.length === 0 ? (
            <p className="text-xs text-[#7c8689] italic">No files uploaded yet.</p>
          ) : (
            <>
              {photos.length > 0 && (
                <div className="mb-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-2">{photos.length} Photo(s)</p>
                  <div className="grid grid-cols-3 gap-2">
                    {photos.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="aspect-square rounded-xl overflow-hidden block"
                        style={{ border: "1px solid rgba(196,170,139,0.2)" }}>
                        <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {docs.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-2">{docs.length} Document(s)</p>
                  <div className="space-y-1.5">
                    {docs.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs text-[#333435]"
                        style={{ background: "rgba(196,170,139,0.07)", border: "1px solid rgba(196,170,139,0.15)" }}>
                        <FileText className="w-4 h-4 flex-shrink-0" style={{ color: "#c4aa8b" }} />
                        <span className="flex-1 truncate">Document {i + 1}</span>
                        <ExternalLink className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </Section>

        {/* 7. Client Questions */}
        <Section title="Client Questions" icon={MessageSquare}>
          {questions.length === 0 ? (
            <p className="text-xs text-[#7c8689] italic">No questions added by client.</p>
          ) : (
            <div className="space-y-2">
              {questions.map((q, i) => (
                <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                  style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
                  <span className="text-[10px] font-bold flex-shrink-0 mt-0.5" style={{ color: "#c4aa8b" }}>Q{i + 1}</span>
                  <p className="text-xs text-[#333435]">{q}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* 8. Additional Care Interests */}
        {additionalInterests.length > 0 && (
          <Section title="Additional Interests" icon={Star}>
            <div className="flex flex-wrap gap-2 mb-3">
              {additionalInterests.map(i => (
                <span key={i} className="text-xs px-2.5 py-1 rounded-full font-medium"
                  style={{ background: "rgba(196,170,139,0.1)", color: "#7c8689" }}>{i}</span>
              ))}
            </div>
            <div className="rounded-xl p-3"
              style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-1">Conversation opportunity</p>
              <p className="text-xs text-[#333435] leading-relaxed">Client may be open to discussing additional care areas if clinically relevant during consultation.</p>
            </div>
          </Section>
        )}

        {/* 9. Referral Source */}
        <Section title="Referral Source" icon={User}>
          <DataRow label="Source" value={profile?.referral_source} muted={!profile?.referral_source} />
          <DataRow label="Influencer" value={profile?.referral_influencer} muted={!profile?.referral_influencer} />
          <DataRow label="Referred by" value={profile?.referral_person} muted={!profile?.referral_person} />
        </Section>

        {/* 10. Suggested Consultation Focus */}
        <div className="bg-white rounded-2xl border p-4 mb-3" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
          <SectionHeader title="Suggested Consultation Focus" />
          {suggestedOpening && (
            <div className="bato-style-hero rounded-xl p-3 mb-3"
              style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 100%)" }}>
              <p className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "rgba(196,170,139,0.7)" }}>Suggested Opening</p>
              <p className="text-xs leading-relaxed italic" style={{ color: "rgba(238,235,230,0.85)" }}>"{suggestedOpening}"</p>
            </div>
          )}
          {consultationFocus.length > 0 ? (
            <div className="space-y-2">
              {consultationFocus.map((point, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#c4aa8b" }} />
                  <p className="text-xs text-[#333435] leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#7c8689] italic">Provide more profile data for tailored focus points.</p>
          )}
        </div>

        {/* 11. Staff Notes */}
        <div className="bg-white rounded-2xl border p-4 mb-3" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
          <SectionHeader title="Internal Staff Notes" icon={Edit3} />
          <p className="text-[10px] text-[#7c8689] mb-3 italic">Visible to staff only. Never shown to the client.</p>
          <StaffNoteEditor
            category="clinical"
            label="Clinical / Safety Notes"
            value={staffNotes.clinical}
            onSave={v => handleSaveNote("clinical", v)}
          />
          <div className="border-t my-3" style={{ borderColor: "rgba(196,170,139,0.1)" }} />
          <StaffNoteEditor
            category="trust"
            label="Consultation / Trust Notes"
            value={staffNotes.trust}
            onSave={v => handleSaveNote("trust", v)}
          />
          <div className="border-t my-3" style={{ borderColor: "rgba(196,170,139,0.1)" }} />
          <StaffNoteEditor
            category="opportunity"
            label="Opportunity Notes"
            value={staffNotes.opportunity}
            onSave={v => handleSaveNote("opportunity", v)}
          />
        </div>

        {/* Actions */}
        <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-3">Staff Actions</p>
          <div className="grid grid-cols-2 gap-2">
            {!reviewed && (
              <button onClick={handleMarkReviewed} disabled={saving}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold col-span-2"
                style={{ background: "#3a2e1e", color: "#c4aa8b" }}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {saving ? "Saving..." : "Mark as Reviewed"}
              </button>
            )}
            <a href={`mailto:${profile?.client_email}`}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-[#333435]"
              style={{ background: "rgba(196,170,139,0.08)", border: "1px solid rgba(196,170,139,0.2)" }}>
              <MessageSquare className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} /> Contact Client
            </a>
            <button onClick={onClose}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-[#333435]"
              style={{ background: "rgba(196,170,139,0.08)", border: "1px solid rgba(196,170,139,0.2)" }}>
              <ArrowLeft className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} /> Back to List
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}