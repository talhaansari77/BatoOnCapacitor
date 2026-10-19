import {format as dateFormat,formatDistanceToNow as distance} from 'date-fns';
export function parseCustomerDate(value){if(value==null||value==='')return null;const date=value instanceof Date?value:new Date(/^\d{4}-\d{2}-\d{2}$/.test(String(value))?value+'T12:00:00':value);return Number.isFinite(date.getTime())?date:null;}
const missing=options=>options?.locale?.code?.startsWith('ar')?'لم يُسجل التاريخ':'Date not recorded';
export function format(value,pattern,options){const date=parseCustomerDate(value);return date?dateFormat(date,pattern,options):missing(options);}
export function formatDistanceToNow(value,options){const date=parseCustomerDate(value);return date?distance(date,options):missing(options);}
export function resourceUrl(value){try {const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:null;}catch{return null;}}
