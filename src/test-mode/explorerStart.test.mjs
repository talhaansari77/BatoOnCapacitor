import assert from "node:assert/strict";
import {EXPLORER_STARTS,GENERAL_START,explorerStart,explorerBookingUrl,explorerMessageUrl,explorerAppointment} from "../lib/explorerStart.js";
for(const start of EXPLORER_STARTS){
 const profile={explorer_interests:[start.interest],explorer_recommended_start:start.title};
 assert.equal(explorerStart(profile),start);
 const url=new URL(explorerBookingUrl(start,"Kuwait"),"https://test.invalid");
 assert.equal(url.searchParams.get("department"),start.department);
 assert.equal(url.searchParams.get("branch"),"kuwait");
 assert.equal(new URL(explorerMessageUrl(start),"https://test.invalid").searchParams.get("channel"),"advisors");
 assert.ok(start.en && start.descriptionAr && start.ar);
}
assert.equal(explorerStart({explorer_interests:["Hair","Skin"]}),null);
assert.equal(explorerStart({explorer_interests:["Hair","Skin"],explorer_recommended_start:"Skin Consultation"}).interest,"Skin");
assert.equal(explorerStart({explorer_interests:["Skin"],explorer_recommended_start:"Hair Assessment"}).interest,"Skin");
assert.equal(explorerStart({explorer_interests:["Not sure yet"]}),GENERAL_START);
assert.equal(explorerStart({}),GENERAL_START);
const start=EXPLORER_STARTS[0],now=Date.parse("2026-10-06");
const row={client_email:"customer@test.invalid",department:start.department,appointment_date:"2026-10-08",status:"requested"};
assert.equal(explorerAppointment([] ,row.client_email,start,now),null);
assert.equal(explorerAppointment([row],row.client_email,start,now),row);
assert.equal(explorerAppointment([{...row,client_email:"someone@test.invalid"}],row.client_email,start,now),null);
assert.equal(explorerAppointment([{...row,department:"skin_care"}],row.client_email,start,now),null);
assert.equal(explorerAppointment([{...row,status:"completed"}],row.client_email,start,now),null);
assert.equal(explorerAppointment([{...row,status:"cancelled"},row],row.client_email,start,now),row);
console.log("PASS: five department routes, Arabic explanations, explicit multi-interest priority, legacy profiles, no request without a record, customer and department isolation, appointment status precedence.");
