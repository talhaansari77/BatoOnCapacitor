// Shared readiness computation logic

export function computeReadinessItems(profile, appointment) {
  const items = [
    {
      key: "appointment",
      label: "Appointment Details",
      description: "Your visit date, time, branch, and booked service.",
      required: true,
      complete: appointment?.status==="confirmed",
      // Never say "not linked" — BATO is confirming it
      statusLabel: appointment?.status==="confirmed"?"Confirmed":appointment?.status==="requested"?"Request submitted":appointment?.status==="scheduled"?"Scheduled, not confirmed":"Being confirmed",
    },
    {
      key: "service_type",
      label: "Booked Service",
      description: "The service you're coming in for.",
      required: true,
      complete: !!profile?.booked_service_type && profile.booked_service_type !== "Not sure",
      statusLabel: profile?.booked_service_type || "Not specified",
    },
    {
      key: "bato_profile",
      label: "BATO Profile",
      description: "Your main concern, goals, and visit details.",
      required: true,
      complete: !!(profile?.main_concern && profile?.completed),
      statusLabel: profile?.main_concern ? "Complete" : "Incomplete",
    },
    {
      key: "health_safety",
      label: "Health & Safety",
      description: "Allergies, medications, conditions, and previous reactions.",
      required: true,
      complete: !!(
        profile?.has_allergies !== undefined &&
        profile?.has_medications !== undefined &&
        profile?.has_medical_conditions !== undefined
      ),
      statusLabel: (
        profile?.has_allergies !== undefined &&
        profile?.has_medications !== undefined &&
        profile?.has_medical_conditions !== undefined
      ) ? "Complete" : "Incomplete",
      hasSafetyFlag: !!(
        profile?.has_allergies ||
        profile?.has_medications ||
        profile?.has_medical_conditions ||
        profile?.had_bad_reaction ||
        profile?.is_pregnant_or_breastfeeding
      ),
    },
    {
      key: "consent",
      label: "Consent Acknowledged",
      description: "You've confirmed your profile is for visit preparation.",
      required: true,
      complete: !!profile?.consent_acknowledged,
      statusLabel: profile?.consent_acknowledged ? "Acknowledged" : "Not yet",
    },
    {
      key: "visit_prep",
      label: "Visit Preparation",
      description: "Important instructions before your visit.",
      required: true,
      complete: !!profile?.visit_prep_read,
      statusLabel: profile?.visit_prep_read ? "Read" : "Not reviewed yet",
    },
    {
      key: "photos",
      label: "Photos",
      description: "Progress photos if available.",
      required: false,
      complete: (profile?.uploaded_photos || []).length > 0,
      statusLabel: (profile?.uploaded_photos || []).length > 0
        ? `${profile.uploaded_photos.length} uploaded`
        : "Optional",
    },
    {
      key: "documents",
      label: "Lab Results / Documents",
      description: "Previous lab results or records.",
      required: false,
      complete: (profile?.uploaded_documents || []).length > 0,
      statusLabel: (profile?.uploaded_documents || []).length > 0
        ? `${profile.uploaded_documents.length} uploaded`
        : "Optional",
    },
    {
      key: "questions",
      label: "Questions for the Team",
      description: "Anything you want to ask during your consultation.",
      required: false,
      complete: (profile?.client_questions || []).length > 0,
      statusLabel: (profile?.client_questions || []).length > 0
        ? `${profile.client_questions.length} added`
        : "Optional",
    },
  ];
  return items;
}

export function computeReadinessStatus(items, appointment) {
  const requiredItems = items.filter(i => i.required);
  // Exclude appointment item from profile-side completeness check
  const profileItems = requiredItems.filter(i => i.key !== "appointment");
  const allProfileDone = profileItems.every(i => i.complete);
  const criticalMissing = profileItems.filter(i =>
    !i.complete && ["health_safety", "service_type", "consent"].includes(i.key)
  );

  // Appointment not linked = always "pending_confirmation", never a hard block
  if (!appointment || appointment.status!=="confirmed") return "pending_confirmation";
  if (allProfileDone) return "ready";
  if (criticalMissing.length > 0) return "needs_attention";
  return "almost_ready";
}

export function getAppointmentUrgency(appointment) {
  if (!appointment) return "no_appointment";
  const now = new Date();
  const apptDate = new Date(appointment.appointment_date);
  if(!Number.isFinite(apptDate.getTime()))return "no_appointment";
  const diffMs = apptDate - now;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffMs < 0) return "past";
  if (diffDays < 1) return "today";
  if (diffDays < 2) return "tomorrow";
  if (diffDays < 3) return "soon";
  return "upcoming";
}

export const READINESS_CONFIG = {
  ready: {
    label: "Ready for your visit",
    color: "#4ade80",
    bg: "rgba(74,222,128,0.08)",
    border: "rgba(74,222,128,0.25)",
    copy: "Your BATO Profile is complete and your team can review your case before you arrive.",
  },
  almost_ready: {
    label: "Almost ready",
    color: "#c4aa8b",
    bg: "rgba(196,170,139,0.08)",
    border: "rgba(196,170,139,0.25)",
    copy: "You're almost ready. Complete the remaining steps so your team can prepare better.",
  },
  needs_attention: {
    label: "A few details needed",
    color: "#fb923c",
    bg: "rgba(251,146,60,0.08)",
    border: "rgba(251,146,60,0.25)",
    copy: "A few important details are still needed before your visit.",
  },
  // Appointment not yet synced from CRM — BATO is confirming internally
  pending_confirmation: {
    label: "Appointment being confirmed",
    color: "#c4aa8b",
    bg: "rgba(196,170,139,0.08)",
    border: "rgba(196,170,139,0.25)",
    copy: "Your profile is saved. Your appointment details are being confirmed by the BATO team.",
  },
};