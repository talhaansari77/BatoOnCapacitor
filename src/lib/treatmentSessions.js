import { base44 } from "@/api/base44Client";

// TreatmentSession stores performed treatments, not appointment requests.
// Load every page so counters do not depend on the dashboard's recent-history limit.
export async function loadCompletedTreatmentSessions(email, now = new Date()) {
  const records = [];
  for (let skip = 0; ; skip += 100) {
    const batch = await base44.entities.TreatmentSession.filter({ client_email: email }, "-session_date", 100, skip);
    records.push(...batch);
    if (batch.length < 100) break;
  }
  return [...new Map(records.map(s => [s.id, s])).values()]
    .filter(s => { const date = new Date(s.session_date); return Number.isFinite(date.getTime()) && date <= now; })
    .sort((a, b) => new Date(b.session_date) - new Date(a.session_date));
}
