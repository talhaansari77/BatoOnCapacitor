import {CARE_DEPARTMENTS} from "./serviceFlow.js";
import {programDepartment, sessionsForProgram} from "./carePrograms.js";
export const careDepartment = key => CARE_DEPARTMENTS.find(d => d.key === key) || CARE_DEPARTMENTS.at(-1);
export const careMessageUrl = department => "/Messages?channel=" + careDepartment(department).channel;
const timestamp = value => {const n = new Date(value).getTime(); return Number.isFinite(n) ? n : 0;};
export function latestRecord(rows, field) {return [...rows].sort((a,b)=>timestamp(b[field])-timestamp(a[field]) || timestamp(b.updated_date)-timestamp(a.updated_date))[0] || null;}
export function appointmentState(appointment, now = new Date()) {
  if (!appointment) return "none";
  if (["cancelled","rescheduled","completed"].includes(appointment.status)) return appointment.status;
  const date=timestamp(appointment.appointment_date);
  if (!date) return "needs_review";
  if (["requested","scheduled","confirmed"].includes(appointment.status) && date <= now.getTime()) return "needs_review";
  return ["requested","scheduled","confirmed"].includes(appointment.status) ? appointment.status : "needs_review";
}
export function careAppointments(rows, now = new Date()) {
  const live=rows.filter(a=>["requested","scheduled","confirmed"].includes(appointmentState(a,now))).sort((a,b)=>timestamp(a.appointment_date)-timestamp(b.appointment_date));
  const unresolved=rows.filter(a=>appointmentState(a,now)==="needs_review").sort((a,b)=>timestamp(b.appointment_date)-timestamp(a.appointment_date));
  return {live, unresolved};
}
export function outcomeDepartment(outcome, appointments) {
  return appointments.find(a=>a.id===outcome?.appointment_id)?.department || null;
}
export function clientNextStep(outcome) {
  const state=outcome?.post_consultation_state || outcome?.conversion_status;
  if (state==="needs_doctor_review") return "doctor_review";
  if (["not_interested","not_suitable"].includes(state)) return "message_client_care";
  return outcome?.recommended_next_step || null;
}
export const NEXT_STEPS = {
  blood_test_panels: {en:"Discuss the recommended tests",ar:"ناقش التحاليل الموصى بها",department:"general_health"},
  session_1: {en:"Discuss your first session",ar:"ناقش جلستك الأولى"},
  follow_up_consultation: {en:"Arrange a follow-up consultation",ar:"رتّب استشارة متابعة"},
  doctor_review: {en:"Doctor review",ar:"مراجعة الطبيب",department:"general_health"},
  message_client_care: {en:"Speak with Customer service",ar:"تواصل مع خدمة العملاء",department:"general_consultation"},
  no_action_needed: {en:"No immediate action needed",ar:"لا يلزم إجراء حالياً"}
};
export function programStage(program) {
  if (program?.status==="completed") return "completed";
  if (["expired","cancelled"].includes(program?.status)) return program.status;
  if (program?.status==="active") {
    const total=Number(program.total_sessions),used=Number(program.sessions_used);
    return total>0 && used>=total ? "review_due" : "active";
  }
  return "needs_review";
}
export function caseForProgram(cases, program, programs) {
  if (!program) return null;
  const linked=cases.filter(c=>c.package_id===program.id);
  if(linked.length)return latestRecord(linked,"start_date");
  const dept=programDepartment(program);
  if (!dept || programs.filter(p=>programDepartment(p)===dept).length!==1) return null;
  return latestRecord(cases.filter(c=>!c.package_id&&c.primary_department===dept),"start_date");
}
export function latestProgramSession(sessions, program, programs, now = new Date()) {
  return latestRecord(sessionsForProgram(sessions,program,programs).filter(s=>timestamp(s.session_date)>0&&timestamp(s.session_date)<=now.getTime()),"session_date");
}
export function instructionItems(text) {
  if(typeof text!=="string")return [];
  return [...new Set(text.split(/\r?\n/).map(s=>s.replace(/^\s*[-•]\s*/,"").trim()).filter(Boolean))];
}
export function instructionStorageKey(email,session,day) {
  return "bato-care-check:"+encodeURIComponent(email)+":"+encodeURIComponent(session.id)+":"+encodeURIComponent(session.next_steps||"")+":"+day;
}

export function appointmentSelection(rows, id, now = new Date()) {
 const {live,unresolved}=careAppointments(rows,now);
 const selected=id ? rows.find(row=>row.id===id) || null : null;
 const primary=selected||live[0]||null;
 return {primary,others:live.filter(row=>row.id!==primary?.id),unresolved:unresolved.filter(row=>row.id!==primary?.id),history:rows.filter(row=>!live.some(item=>item.id===row.id)),missing:!!id&&!selected};
}
