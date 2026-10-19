import React, { useState } from "react";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { Save, X } from "lucide-react";

const OUTCOME_OPTIONS = [
  { value: "blood_test_done", label: "Blood Test Done" },
  { value: "blood_test_booked", label: "Blood Test Booked" },
  { value: "session_1_done", label: "Session 1 Done" },
  { value: "session_1_booked", label: "Session 1 Booked" },
  { value: "plan_presented_pending", label: "Plan Presented — Client Pending" },
  { value: "follow_up_needed", label: "Follow-Up Needed" },
  { value: "not_interested", label: "Client Not Interested" },
  { value: "not_suitable", label: "Client Not Suitable" },
  { value: "needs_doctor_review", label: "Needs Doctor Review" },
  { value: "other", label: "Other" },
];

const NEXT_STEP_OPTIONS = [
  { value: "blood_test_panels", label: "Blood Test / Panels" },
  { value: "session_1", label: "Session 1" },
  { value: "follow_up_consultation", label: "Follow-Up Consultation" },
  { value: "doctor_review", label: "Doctor Review" },
  { value: "message_client_care", label: "Message Customer service" },
  { value: "no_action_needed", label: "No Action Needed" },
];

function deriveConversionStatus(outcome) {
  if (outcome === "blood_test_done" || outcome === "blood_test_booked") return "converted_blood_test";
  if (outcome === "session_1_done" || outcome === "session_1_booked") return "converted_session_1";
  if (outcome === "plan_presented_pending") return "pending_decision";
  if (outcome === "follow_up_needed") return "follow_up_needed";
  if (outcome === "not_interested") return "not_interested";
  if (outcome === "not_suitable") return "not_suitable";
  if (outcome === "needs_doctor_review") return "needs_doctor_review";
  return "pending_decision";
}

function deriveBloodTestStatus(outcome) {
  if (outcome === "blood_test_done") return "completed";
  if (outcome === "blood_test_booked") return "booked";
  return "not_applicable";
}

function deriveSession1Status(outcome) {
  if (outcome === "session_1_done") return "completed";
  if (outcome === "session_1_booked") return "booked";
  return "not_applicable";
}

function deriveRecoveryStatus(outcome) {
  // These states do NOT need follow-up recovery
  const noRecovery = [
    "blood_test_done", "blood_test_booked",
    "session_1_done", "session_1_booked",
    "not_suitable", "no_action_needed",
  ];
  return noRecovery.includes(outcome) ? "not_needed" : "needed";
}

function deriveJourneyStatus(outcome) {
  if (outcome === "blood_test_done" || outcome === "blood_test_booked") return "health_review_started";
  if (outcome === "session_1_done" || outcome === "session_1_booked") return "treatment_started";
  return "pending_next_step";
}

export default function ConsultationOutcomeForm({ clientEmail, existingOutcome, onSaved, onClose }) {
  const [form, setForm] = useState({
    consultation_outcome: existingOutcome?.consultation_outcome || "",
    recommended_next_step: existingOutcome?.recommended_next_step || "",
    recommendation_reason: existingOutcome?.recommendation_reason || "",
    client_objection: existingOutcome?.client_objection || "",
    follow_up_priority: existingOutcome?.follow_up_priority || "medium",
    staff_note: existingOutcome?.staff_note || "",
    assigned_follow_up_owner: existingOutcome?.assigned_follow_up_owner || "",
  });
  const [saving, setSaving] = useState(false);

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    if (!form.consultation_outcome) {
      toast.error("Please select a consultation outcome.");
      return;
    }
    setSaving(true);
    const conversionStatus = deriveConversionStatus(form.consultation_outcome);
    const payload = {
      ...form,
      client_email: clientEmail,
      // Only set consultation_date on first create, not on update
      ...(existingOutcome?.id ? {} : { consultation_date: new Date().toISOString() }),
      conversion_status: conversionStatus,
      post_consultation_state: conversionStatus,
      blood_test_status: deriveBloodTestStatus(form.consultation_outcome),
      session_1_status: deriveSession1Status(form.consultation_outcome),
      recovery_status: deriveRecoveryStatus(form.consultation_outcome),
      journey_activation_status: deriveJourneyStatus(form.consultation_outcome),
    };

    try {
      if (existingOutcome?.id) {
        await base44.entities.ConsultationOutcome.update(existingOutcome.id, payload);
      } else {
        await base44.entities.ConsultationOutcome.create(payload);
      }

      // Create internal notification for recovery needed
      if (payload.recovery_status === "needed") {
        await base44.entities.Notification.create({
          client_email: "admin@batoclinic.com",
          type: "general",
          title: "⚠️ Post-Consultation Follow-Up Needed",
          message: `${clientEmail} — Outcome: ${form.consultation_outcome}. Priority: ${form.follow_up_priority}. Assigned to: ${form.assigned_follow_up_owner || "Unassigned"}`,
          priority: form.follow_up_priority === "high" ? "urgent" : "normal",
        });
      }

      toast.success("Consultation outcome saved.");
      onSaved?.();
    } catch (e) {
      toast.error("Failed to save outcome.");
      setSaving(false);
      return;
    }
    setSaving(false);
  };

  const inputClass = "w-full rounded-xl border px-3.5 py-2.5 text-sm text-[#333435] outline-none";
  const inputStyle = { borderColor: "rgba(196,170,139,0.3)", background: "#fafaf9" };
  const labelClass = "block text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-1.5";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border overflow-hidden"
      style={{ borderColor: "rgba(196,170,139,0.2)" }}
    >
      <div className="px-4 py-3.5 border-b flex items-center justify-between"
        style={{ borderColor: "rgba(196,170,139,0.12)" }}>
        <div>
          <p className="text-sm font-semibold text-[#333435]">Consultation Outcome</p>
          <p className="text-[10px] text-[#7c8689]">Staff only — not visible to client</p>
        </div>
        {onClose && (
          <button onClick={onClose}><X className="w-4 h-4 text-[#7c8689]" /></button>
        )}
      </div>

      <div className="px-4 py-4 space-y-4">

        {/* Outcome */}
        <div>
          <label className={labelClass}>Consultation Outcome *</label>
          <select value={form.consultation_outcome} onChange={e => set("consultation_outcome", e.target.value)}
            className={inputClass} style={inputStyle}>
            <option value="">Select outcome...</option>
            {OUTCOME_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Recommended next step */}
        <div>
          <label className={labelClass}>Recommended Next Step</label>
          <select value={form.recommended_next_step} onChange={e => set("recommended_next_step", e.target.value)}
            className={inputClass} style={inputStyle}>
            <option value="">Select next step...</option>
            {NEXT_STEP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Reason */}
        <div>
          <label className={labelClass}>Reason for Recommendation</label>
          <textarea value={form.recommendation_reason} onChange={e => set("recommendation_reason", e.target.value)}
            rows={2} placeholder="Why this next step is recommended..."
            className={inputClass} style={{ ...inputStyle, resize: "none" }} />
        </div>

        {/* Objection */}
        <div>
          <label className={labelClass}>Client Objection / Hesitation</label>
          <textarea value={form.client_objection} onChange={e => set("client_objection", e.target.value)}
            rows={2} placeholder="Any hesitation the client expressed..."
            className={inputClass} style={{ ...inputStyle, resize: "none" }} />
        </div>

        {/* Priority + Owner row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Follow-Up Priority</label>
            <select value={form.follow_up_priority} onChange={e => set("follow_up_priority", e.target.value)}
              className={inputClass} style={inputStyle}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Assigned Owner</label>
            <input value={form.assigned_follow_up_owner} onChange={e => set("assigned_follow_up_owner", e.target.value)}
              placeholder="Staff email..."
              className={inputClass} style={inputStyle} />
          </div>
        </div>

        {/* Internal note */}
        <div>
          <label className={labelClass}>Internal Staff Note</label>
          <textarea value={form.staff_note} onChange={e => set("staff_note", e.target.value)}
            rows={2} placeholder="Internal note — not shown to client..."
            className={inputClass} style={{ ...inputStyle, resize: "none" }} />
        </div>
      </div>

      <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(196,170,139,0.12)", background: "rgba(196,170,139,0.03)" }}>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-semibold"
          style={{ background: "#3a2e1e", color: "#c4aa8b" }}>
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Save Outcome"}
        </button>
      </div>
    </motion.div>
  );
}