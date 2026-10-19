import {CARE_DEPARTMENTS} from "./serviceFlow.js";
const HAIR_TYPES = ["full_head_hair_program","full_head_hair_program_plus","targeted_hair_program","targeted_hair_program_plus","renew_full_head","renew_targeted","prp_hair","plasma_hair_support","hair_follow_up","hair_care_session","hair_wash","hair_assessment","scalp_assessment","hair_loss_evaluation"];
export function programDepartment(program) {
  if(CARE_DEPARTMENTS.some(d=>d.key===program?.department))return program.department;
  if(program?.department)return null; // Do not reinterpret a known multi-department record.
  const type=program?.package_type||"";
  if(HAIR_TYPES.includes(type))return "hair_restoration";
  if(/^(laser_|tattoo_removal)/.test(type))return "laser_hair_removal";
  if(/^(skin_consultation|skin_assessment|hydrafacial|dermapen|rf_|green_peel|cosmelan|salicylic|meso_double)/.test(type))return "skin_care";
  if(/^(botox|skin_booster|profhilo|salmon_dna|mesotherapy|filler|teosyal|juvederm|lip_tawreed|microblading|eyeliner)/.test(type))return "injections";
  if(/^(medical_|follow_up_consultation|blood_|hormone_|vitamin_|iron_|liver_|kidney_|crp_|urine_|diagnostic_|ferinject|glutathione_|iv_)/.test(type))return "general_health";
  return null;
}
export function programCounts(program) {
  const total=Number.isFinite(Number(program?.total_sessions))?Math.max(0,Number(program.total_sessions)):0;
  const used=Number.isFinite(Number(program?.sessions_used))?Math.max(0,Number(program.sessions_used)):0;
  return {total,used,remaining:Math.max(0,total-used),progress:total>0?Math.min(100,Math.round(used/total*100)):0};
}
export function sessionsForProgram(sessions, program, programs) {
  if(!program)return [];
  const department=programDepartment(program);
  const siblings=programs.filter(p=>programDepartment(p)===department);
  return sessions.filter(s=>s.package_id===program.id || (!s.package_id && department && s.department===department && siblings.length===1));
}
export function appointmentsForProgram(appointments, program, programs) {
  if(!program)return [];
  const department=programDepartment(program);
  const siblings=programs.filter(p=>p.status==="active"&&programDepartment(p)===department);
  return appointments.filter(a=>a.package_id===program.id || (!a.package_id&&department&&a.department===department&&siblings.length===1));
}
