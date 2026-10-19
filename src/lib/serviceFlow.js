export const CARE_DEPARTMENTS = [
  { key: "hair_restoration", channel: "hair_team", journey: "HairJourney", en: "Hair", ar: "الشعر" },
  { key: "skin_care", channel: "skin_team", journey: "SkinJourney", en: "Skin", ar: "البشرة" },
  { key: "laser_hair_removal", channel: "laser_team", journey: "LaserJourney", en: "Laser", ar: "الليزر" },
  { key: "injections", channel: "aesthetic_team", journey: "AestheticCare", en: "Aesthetic care", ar: "العناية التجميلية" },
  { key: "general_health", channel: "medical_team", journey: "HealthJourney", en: "Health", ar: "الصحة" },
  { key: "general_consultation", channel: "client_care", journey: null, en: "General consultation", ar: "استشارة عامة" },
];

export function departmentForChannel(channel) {
  return CARE_DEPARTMENTS.find(d => d.channel === channel)?.key || null;
}
export function resolveBookingDepartment(explicit, packageData, service, selected) {
  return [explicit, service?.department, packageData?.department, selected]
    .find(value => CARE_DEPARTMENTS.some(d => d.key === value)) || null;
}
export function partitionAppointments(appointments, now = new Date()) {
  const upcoming = [], history = [];
  for (const appointment of appointments) {
    const future = new Date(appointment.appointment_date).getTime() > now.getTime();
    const open = ["requested", "scheduled", "confirmed"].includes(appointment.status);
    (future && open ? upcoming : history).push(appointment);
  }
  upcoming.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
  return { upcoming, history };
}
