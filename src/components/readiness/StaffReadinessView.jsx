import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, AlertTriangle, Clock } from "lucide-react";
import { computeReadinessItems, computeReadinessStatus, READINESS_CONFIG } from "./readinessUtils";
import { format } from "date-fns";

function StaffRow({ label, complete, value, flag }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5 border-b last:border-0"
      style={{ borderColor: "rgba(196,170,139,0.1)" }}>
      <div className="flex items-center gap-2 flex-1">
        {flag
          ? <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 text-amber-500" />
          : complete
            ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-green-500" />
            : <XCircle className="w-3.5 h-3.5 flex-shrink-0 text-red-400" />
        }
        <span className="text-xs text-[#333435]">{label}</span>
      </div>
      <span className="text-xs font-medium flex-shrink-0"
        style={{ color: flag ? "#d97706" : complete ? "#16a34a" : "#dc2626" }}>
        {value}
      </span>
    </div>
  );
}

export default function StaffReadinessView({ profile, appointment }) {
  const items = computeReadinessItems(profile, appointment);
  const status = computeReadinessStatus(items, appointment);
  const config = READINESS_CONFIG[status];

  const healthItem = items.find(i => i.key === "health_safety");
  const hasSafetyFlag = healthItem?.hasSafetyFlag || false;
  const missingRequired = items.filter(i => i.required && !i.complete);
  const questions = profile?.client_questions || [];

  const statusLabels = {
    ready: "Ready",
    almost_ready: "Almost Ready",
    needs_attention: "Needs Attention",
    no_appointment: "No Appointment Linked",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border overflow-hidden"
      style={{ borderColor: "rgba(196,170,139,0.2)" }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(196,170,139,0.12)" }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold text-[#333435]">Client Readiness</p>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full"
            style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
            {statusLabels[status]}
          </span>
        </div>
        {profile?.last_updated_at && (
          <p className="text-[10px] text-[#7c8689]">
            Last updated: {format(new Date(profile.last_updated_at), "d MMM yyyy · HH:mm")}
          </p>
        )}
      </div>

      {/* Checklist */}
      <div className="px-4 py-1">
        <StaffRow label="Appointment confirmed" complete={!!appointment} value={appointment ? "Yes" : "No"} />
        <StaffRow label="BATO Profile completed" complete={!!profile?.completed} value={profile?.completed ? "Yes" : "No"} />
        <StaffRow label="Health & Safety completed" complete={healthItem?.complete} value={healthItem?.complete ? "Yes" : "No"} />
        <StaffRow
          label="Safety flags"
          complete={false}
          flag={hasSafetyFlag}
          value={hasSafetyFlag ? "Review required" : "None"}
        />
        <StaffRow label="Photos uploaded" complete={(profile?.uploaded_photos || []).length > 0}
          value={(profile?.uploaded_photos || []).length > 0 ? `${profile.uploaded_photos.length} photo(s)` : "No"} />
        <StaffRow label="Lab results uploaded" complete={(profile?.uploaded_documents || []).length > 0}
          value={(profile?.uploaded_documents || []).length > 0 ? `${profile.uploaded_documents.length} file(s)` : "No"} />
        <StaffRow label="Visit prep viewed" complete={!!profile?.visit_prep_read} value={profile?.visit_prep_read ? "Yes" : "Not yet"} />
        <StaffRow label="Questions added" complete={questions.length > 0}
          value={questions.length > 0 ? `${questions.length} question(s)` : "None"} />
        <StaffRow label="Profile quality"
          complete={profile?.completed && healthItem?.complete}
          value={profile?.completed && healthItem?.complete ? "Complete" : profile?.completed ? "Partial" : "Missing Key Info"} />
      </div>

      {/* Missing items */}
      {missingRequired.length > 0 && (
        <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(251,146,60,0.15)", background: "rgba(251,146,60,0.04)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-600 mb-1.5">Missing</p>
          <div className="space-y-1">
            {missingRequired.map(item => (
              <div key={item.key} className="flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-700">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client questions */}
      {questions.length > 0 && (
        <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(196,170,139,0.12)" }}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-2">Client Questions</p>
          <div className="space-y-1.5">
            {questions.map((q, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[10px] font-semibold text-[#c4aa8b] flex-shrink-0 mt-0.5">Q{i + 1}</span>
                <p className="text-xs text-[#333435]">{q}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="px-4 py-3 border-t" style={{ borderColor: "rgba(196,170,139,0.12)", background: "rgba(196,170,139,0.03)" }}>
        <button className="flex items-center gap-2 text-xs font-medium text-[#7c8689]">
          <span>Contact Client</span>
          <span style={{ color: "#c4aa8b" }}>→</span>
        </button>
      </div>
    </motion.div>
  );
}