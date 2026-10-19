import { format } from "date-fns";
import {appointmentBranch} from "./clinicBranches.js";
// Clinic wall time is independent of the patient's device timezone.
export function clinicDateTime(date, time, branch) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error("Invalid preferred date or time");
  return new Date(`${date}T${time}:00${branch === "kuwait" ? "+03:00" : "+04:00"}`).toISOString();
}
export function clinicToday(branch, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: branch === "kuwait" ? "Asia/Kuwait" : "Asia/Dubai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const get = type => parts.find(p => p.type === type).value;
  return new Date(Number(get("year")), Number(get("month")) - 1, Number(get("day")));
}

export function formatAppointment(appointment, pattern, options = {}) {
  const instant = new Date(appointment.appointment_date);
  if (Number.isNaN(instant.getTime())) return options.locale?.code?.startsWith("ar") ? "يحتاج التاريخ إلى مراجعة العيادة" : "Date needs clinic review";
  const timeZone = ["Asia/Kuwait","Asia/Dubai"].includes(appointment.timezone) ? appointment.timezone : appointmentBranch(appointment)?.timezone || "Asia/Dubai";
  const parts = new Intl.DateTimeFormat("en-GB", {timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23"}).formatToParts(instant);
  const get = type => Number(parts.find(p => p.type === type).value);
  const wallTime = new Date(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  return format(wallTime, pattern, options);
}
