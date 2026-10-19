export function navigationPath(value) {
  const path=String(value||'/').split(/[?#]/)[0].replace(/\/+$/,'').toLowerCase();
  if(!path||path==='/')return '/dashboard';
  return ({'/appointments':'/clinicappointments','/mycase':'/hairjourney','/mytreatment':'/hairjourney','/progress':'/hairjourney'})[path]||path;
}
export const isCurrentPage=(pathname,target)=>navigationPath(pathname)===navigationPath(target);
const aliases={
  '/hairjourney':'progress photos instructions care plan my treatment hair scalp الشعر صور تعليمات',
  '/skinjourney':'skin facial البشرة', '/healthjourney':'blood tests panels labs biomarkers تحاليل مؤشرات',
  '/laserjourney':'laser hair removal الليزر', '/aestheticcare':'aesthetic botox fillers injections تجميل بوتوكس فيلر حقن',
  '/clinicappointments':'next session visit reschedule book موعد مواعيد حجز تعديل جلسة',
  '/messages':'contact help support care team doctor chat conversation تواصل مساعدة طبيب فريق محادثة',
  '/mybilling':'invoice receipt payment فاتورة فواتير إيصال دفع',
  '/profile':'account settings personal medical history referral الحساب إعدادات إحالة',
  '/shop':'products refill shampoo serum منتجات شامبو', '/updates':'notifications alerts إشعارات تنبيهات',
  '/academy':'learn education courses guide تعلم دليل دورة', '/orders':'delivery shipping طلب توصيل'
};
export function searchNavigation(groups,query,bilingual=[]){
 const term=query.trim().toLowerCase();if(term.length<2)return [];
 return groups.flatMap(group=>group.items.filter(item=>{
 const words=[item.title,bilingual.find(a=>navigationPath(a.url)===navigationPath(item.url))?.title,...(item.keywords||[]),aliases[navigationPath(item.url)]||''].join(' ').toLowerCase();
 return term.split(/\s+/).every(word=>words.includes(word));
 }).map(item=>({...item,group:group.title})));
}
export function notificationDestination(value){
 if(typeof value!=='string'||!value.startsWith('/')||value.startsWith('//')||/[\\\r\n]/.test(value))return null;
 const allowed=['dashboard','hairjourney','skinjourney','healthjourney','laserjourney','aestheticcare','clinicappointments','cliniclocation','clinicservices','clinicteam','messages','updates','profile','mybilling','academy','rewards','shop','orders','treatmentplan','appointments','progress','mycase','mytreatment','community','batocircles','onboarding','hairassessment'];
 const path=value.split(/[?#]/)[0].slice(1).toLowerCase();return allowed.includes(path)?value:null;
}
export function visibleNotifications(rows,now=new Date()){
 return rows.filter(n=>!n.expires_at||new Date(n.expires_at).getTime()>now.getTime());
}
