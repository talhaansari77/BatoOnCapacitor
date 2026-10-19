import test from 'node:test';
import assert from 'node:assert/strict';
import {messageTags} from '../lib/contactRouting.js';
import {CARE_DEPARTMENTS} from '../lib/serviceFlow.js';
import {explorerMessageUrl,EXPLORER_STARTS,GENERAL_START} from '../lib/explorerStart.js';
test('pre-consultation enquiries retain every department while entering only advisors',()=>{
 for(const start of [...EXPLORER_STARTS,GENERAL_START]){
 const params=new URL(explorerMessageUrl(start),'https://test.invalid').searchParams;
 assert.equal(params.get('channel'),'advisors');
 assert.equal(params.get('department'),start.department);
 const tags=messageTags(params.get('channel'),params.get('department'));
 assert.deepEqual(tags,['advisors','department:'+start.department]);
 assert.ok(!tags.includes(start.channel));
 }
});
test('clinical and administrative messages remain separate; invalid metadata adds no tags',()=>{
 for(const dept of CARE_DEPARTMENTS)assert.deepEqual(messageTags(dept.channel,dept.key),[dept.channel]);
 assert.deepEqual(messageTags('client_care','hair_restoration'),['client_care']);
 assert.deepEqual(messageTags('advisors','hair_team'),['advisors']);
 assert.deepEqual(messageTags('advisors',null),['advisors']);
});

import {BATO_SERVICE_DEPARTMENTS,serviceInquiryUrl,serviceAppointmentUrl} from '../lib/batoServices.js';
test('every service enquiry goes to advisors without changing its consultation booking',()=>{
 for(const department of BATO_SERVICE_DEPARTMENTS)for(const section of department.sections)for(const service of section.services){
  const inquiry=new URL(serviceInquiryUrl(service),'https://test.invalid').searchParams;
  assert.equal(inquiry.get('channel'),'advisors');
  assert.equal(inquiry.get('department'),service.department);
  assert.equal(inquiry.get('service'),service.nameEn);
  assert.equal(new URL(serviceAppointmentUrl(service),'https://test.invalid').searchParams.get('service'),service.nameEn);
 }
});
