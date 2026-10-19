import {CARE_DEPARTMENTS} from './serviceFlow.js';
// Advisor enquiries carry department context without entering a specialist inbox.
export function messageTags(channel, department) {
 const tags=[channel];
 if(channel==='advisors' && CARE_DEPARTMENTS.some(d=>d.key===department))tags.push('department:'+department);
 return tags;
}
