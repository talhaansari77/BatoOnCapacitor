import assert from "node:assert/strict";
import {TEST_PERSONAS,seedPersona} from "./personas.js";
import {createPreviewClient,selectPersona,setTestFault} from "./previewClient.js";
import {appointmentsForProgram,sessionsForProgram,programCounts} from "../lib/carePrograms.js";
import {careAppointments} from "../lib/customerCare.js";
import {rescheduleRequestContent} from "../lib/rescheduleRequest.js";
import {selectCareLanguage,selectCareProse} from "../lib/careArabic.js";
class Storage { data=new Map();getItem(k){return this.data.get(k)??null;}setItem(k,v){this.data.set(k,String(v));}removeItem(k){this.data.delete(k);} }
globalThis.window={sessionStorage:new Storage(),localStorage:new Storage(),location:{assign(){},reload(){}}};
let liveCalls=0;
const live=new Proxy({}, {get:()=>new Proxy({}, {get:()=>()=>{liveCalls++;throw Error("Live calls forbidden");}})});
const client=createPreviewClient(live);
for (const persona of TEST_PERSONAS) {
  selectPersona(persona.id);
  const email=(await client.auth.me()).email;
  const before=await client.entities.Appointment.list();
  const programs=await client.entities.Package.list();
  const payload={client_email:email,department:programs[0]?.department||"hair_restoration",package_id:programs[0]?.id,status:"requested",appointment_date:"2030-10-20T08:00:00Z"};
  setTestFault("writes");
  await assert.rejects(client.entities.Appointment.create(payload),/Simulated preview save/);
  assert.deepEqual(await client.entities.Appointment.list(),before);
  assert.deepEqual(await client.entities.Package.list(),programs);
  setTestFault("none");
  const saved=await client.entities.Appointment.create(payload);
  assert.equal((await client.entities.Appointment.list()).length,before.length+1);
  assert.equal(saved.department,payload.department);
  assert.equal(saved.package_id,payload.package_id);
  assert.deepEqual(await client.entities.Package.list(),programs);
}
const now=new Date("2026-10-06T12:00:00Z");
const multiple=seedPersona(TEST_PERSONAS.find(p=>p.id==="multi"),now).records;
assert.deepEqual(multiple.Package.map(p=>programCounts(p).used),[2,1,2]);
for(const pkg of multiple.Package) {
  assert.equal(sessionsForProgram(multiple.TreatmentSession,pkg,multiple.Package).length,pkg.sessions_used);
}
assert.equal(multiple.BiomarkerResult.find(r=>r.marker_name==="Vitamin B12").current_value,null);
const laser=seedPersona(TEST_PERSONAS.find(p=>p.id==="laser"),now).records;
const scoped=appointmentsForProgram(laser.Appointment,laser.Package[0],laser.Package);
assert.deepEqual(careAppointments(scoped,now).live.map(a=>a.status),["confirmed","requested"]);
assert.deepEqual(careAppointments(scoped.filter(a=>a.status!=="confirmed"),now).live.map(a=>a.status),["requested"]);
assert.equal(careAppointments(scoped.filter(a=>a.status==="cancelled"),now).live.length,0);
const common={appointmentId:"123",preferredDate:"2026-10-20",timeRange:"afternoon"};
const arabic=rescheduleRequestContent({...common,isRTL:true,branch:"دبي",service:selectCareLanguage("treatment","ar"),currentAppointment:"١١ أكتوبر",reason:"  سبب تجريبي  "});
assert.match(arabic,/سبب التغيير: سبب تجريبي$/);
assert.ok(!/[A-Za-z]/.test(arabic),"Arabic wrapper must not insert English instructions");
assert.match(arabic,/بعد الظهر/);
assert.equal(selectCareProse(arabic,"ar"),arabic,"Technical appointment identifiers do not invalidate Arabic requests");
assert.ok(!/[A-Za-z]/.test(selectCareProse(englishMessage(),"ar")));
function englishMessage(){return "A recorded instruction not yet translated.";}
for(const label of ["Full Body Laser","laser hair removal body","iv therapy"])assert.ok(!/[A-Za-z]/.test(selectCareLanguage(label,"ar")));
const english=rescheduleRequestContent({...common,isRTL:false,branch:"Dubai",service:"treatment",currentAppointment:"October 11",reason:"  Fictional request  "});
assert.ok(!/[\u0600-\u06ff]/.test(english));
assert.match(english,/Afternoon/);
assert.match(english,/Reason: Fictional request$/);
assert.equal(liveCalls,0);
console.log("PASS: five-persona failed-save/retry isolation, program counts and histories, missing biomarkers, confirmed/pending/cancelled Laser actions and single-language reschedule wrappers; zero live calls.");
