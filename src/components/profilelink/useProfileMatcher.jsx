import { base44 } from "@/api/base44Client";

// Normalize phone: strip spaces, dashes, parens. Keep + and digits only.
export function normalizePhone(raw) {
  if (!raw) return "";
  return raw.replace(/[\s\-().]/g, "").replace(/[^\d+]/g, "");
}

// Try to match a user to existing BATO records by email, then by phone.
// Returns: { status, profileId, appointmentId, caseFileId, matchedBy, possibleAppointments }
export async function runMatcher({ email, phone, countryCode }) {
  // Reject invalid input before matching; letters must never normalize to an empty suffix.
  if (phone && (!/^[+\d\s().-]+$/.test(phone) || normalizePhone(phone).replace(/\D/g, '').length < 7)) {
    throw new Error("Please enter a valid phone number with at least 7 digits.");
  }
  const result = {
    status: "new_profile",
    profileId: null,
    appointmentId: null,
    caseFileId: null,
    matchedBy: "none",
    possibleAppointments: [],
  };

  // 1. Email match — fetch appointments once, reuse for both checks
  if (email) {
    const [profiles, apptsByEmail] = await Promise.all([
      base44.entities.BATOProfile.filter({ client_email: email }),
      base44.entities.Appointment.filter({ client_email: email }),
    ]);

    if (profiles.length > 0) {
      result.status = "matched";
      result.profileId = profiles[0].id;
      result.matchedBy = "email";
      if (apptsByEmail.length > 0) result.appointmentId = apptsByEmail[0].id;

      const cases = await base44.entities.CaseFile.filter({ client_email: email });
      if (cases.length > 0) result.caseFileId = cases[0].id;

      return result;
    }

    // 2. Email match against Appointment (no profile yet)
    if (apptsByEmail.length > 0) {
      result.status = "matched";
      result.matchedBy = "email";
      result.appointmentId = apptsByEmail[0].id;
      return result;
    }
  }

  // 3. Phone match
  if (phone) {
    const cleaned = normalizePhone(phone);
    const normalized = cleaned.startsWith('+') ? cleaned : normalizePhone(`${countryCode || ""}${cleaned.replace(/^0/, "")}`);
    if (!/^\+[1-9]\d{6,14}$/.test(normalized)) {
      throw new Error("Please check the country code and phone number.");
    }

    // Check all appointments for phone in notes or client_email containing the phone
    // Since Appointment doesn't have a phone field, we check BATOProfile explorer_contact_phone
    // Limit scan to a reasonable number — phone matching is best-effort
    const allProfiles = await base44.entities.BATOProfile.filter({}, "-created_date", 500);
    const phoneMatches = allProfiles.filter(p => {
      const profilePhone = normalizePhone(p.explorer_contact_phone || "");
      // Match the complete international number only. Local or partial numbers
      // need staff confirmation; suffixes are not a reliable identity match.
      return profilePhone === normalized;
    });

    if (phoneMatches.length === 1) {
      result.status = "matched";
      result.profileId = phoneMatches[0].id;
      result.matchedBy = "phone";

      const appts = await base44.entities.Appointment.filter({ client_email: phoneMatches[0].client_email });
      if (appts.length > 0) result.appointmentId = appts[0].id;

      return result;
    }

    if (phoneMatches.length > 1) {
      // Multiple possible matches — collect appointment IDs for selection
      result.status = "duplicate_possible";
      result.matchedBy = "phone";
      const apptIds = [];
      for (const p of phoneMatches) {
        const appts = await base44.entities.Appointment.filter({ client_email: p.client_email });
        appts.forEach(a => apptIds.push(a.id));
      }
      result.possibleAppointments = apptIds;
      return result;
    }
  }

  // No match found
  result.status = "new_profile";
  return result;
}