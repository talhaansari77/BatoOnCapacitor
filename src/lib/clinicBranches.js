export const CLINIC_BRANCHES = {
  kuwait: {id:"kuwait", en:"Kuwait", ar:"الكويت", timezone:"Asia/Kuwait", mapsUrl:"https://maps.app.goo.gl/p2WiUSpWfRzQg6px9?g_st=ic"},
  dubai: {id:"dubai", en:"Dubai", ar:"دبي", timezone:"Asia/Dubai", mapsUrl:"https://maps.app.goo.gl/FWLHBajLEk7hHiSa9?g_st=ic"}
};
export function appointmentBranch(appointment) {
  const location = String(appointment?.location || "").toLowerCase();
  if (/kuwait|الكويت/.test(location)) return CLINIC_BRANCHES.kuwait;
  if (/dubai|دبي/.test(location)) return CLINIC_BRANCHES.dubai;
  if (appointment?.timezone === "Asia/Kuwait") return CLINIC_BRANCHES.kuwait;
  if (appointment?.timezone === "Asia/Dubai") return CLINIC_BRANCHES.dubai;
  return null;
}
