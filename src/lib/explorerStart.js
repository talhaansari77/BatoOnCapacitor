export const EXPLORER_GOALS_AR = {
"I want more confidence":"أريد المزيد من الثقة بالنفس",
"I want to understand my options":"أريد فهم خياراتي",
"I want to improve something specific":"أريد تحسين شيء محدد",
"I tried something before and want a better answer":"جربت علاجاً سابقاً وأريد فهماً أوضح",
"I'm preparing for an event":"أستعد لمناسبة",
"Other":"أخرى"
};
export const EXPLORER_STARTS = [
{interest:"Hair",title:"Hair Assessment",ar:"تقييم الشعر",department:"hair_restoration",channel:"hair_team",en:"Discuss your hair concerns and history, learn what the Hair Assessment involves, and ask whether Bato’s Treatment fits your case.",descriptionAr:"ناقش ما يشغلك بشأن شعرك وتاريخ حالتك، وتعرّف على تقييم الشعر واسأل عن مدى ملاءمة علاج باتو لحالتك."},
{interest:"Skin",title:"Skin Consultation",ar:"استشارة البشرة",department:"skin_care",channel:"skin_team",en:"Discuss your skin concerns, current routine and previous treatments, then understand your next steps.",descriptionAr:"ناقش مشكلات بشرتك وروتينك الحالي والعلاجات السابقة، وتعرّف على الخطوة التالية."},
{interest:"Laser",title:"Laser Consultation",ar:"استشارة الليزر",department:"laser_hair_removal",channel:"laser_team",en:"Discuss the areas you want to treat, previous laser experience and questions about preparation.",descriptionAr:"ناقش المناطق التي ترغب في علاجها وتجارب الليزر السابقة وأسئلتك عن الاستعداد للجلسات."},
{interest:"Injectables",title:"Aesthetic Consultation",ar:"استشارة تجميلية",department:"injections",channel:"aesthetic_team",en:"Discuss the result you want, previous treatments and suitable options with the aesthetic team.",descriptionAr:"ناقش النتيجة التي تريدها والعلاجات السابقة والخيارات المناسبة مع فريق التجميل."},
{interest:"Health / Panels",title:"Health Review",ar:"مراجعة صحية",department:"general_health",channel:"medical_team",en:"Discuss your health concerns and any existing test results, and ask which next steps are relevant.",descriptionAr:"ناقش ما يشغلك بشأن صحتك وأي نتائج تحاليل متوفرة، واسأل عن الخطوات المناسبة لك."}
];
export const GENERAL_START = {interest:"Not sure yet",title:"Initial Consultation",ar:"استشارة أولية",department:"general_consultation",channel:"client_care",en:"Tell an advisor what you are looking for so they can explain your options and arrange a consultation.",descriptionAr:"أخبر المرشد بما تبحث عنه ليشرح خياراتك ويساعدك في ترتيب الاستشارة."};
export function explorerStart(profile) {
 const interests=profile?.explorer_interests||[];
 const saved=EXPLORER_STARTS.find(s=>s.title===profile?.explorer_recommended_start && interests.includes(s.interest));
 if(saved)return saved;
 const relevant=EXPLORER_STARTS.filter(s=>interests.includes(s.interest));
 return relevant.length===1?relevant[0]:relevant.length===0?GENERAL_START:null;
}
export function explorerBookingUrl(start,branch) {
 const p=new URLSearchParams({book:"1",type:"consultation",department:start.department});
 if(["Dubai","Kuwait"].includes(branch))p.set("branch",branch.toLowerCase());
 return "/ClinicAppointments?"+p;
}
export function explorerMessageUrl(start) {
 return "/Messages?"+new URLSearchParams({channel:"advisors",context:"explorer_start",start:start.title,department:start.department});
}
export function explorerAppointment(records,email,start,now=Date.now()) {
 const relevant=records.filter(a=>a.client_email===email&&a.department===start.department);
 const open=relevant.filter(a=>["requested","scheduled","confirmed"].includes(a.status)&&new Date(a.appointment_date).getTime()>now)
 .sort((a,b)=>new Date(a.appointment_date)-new Date(b.appointment_date));
 return open[0]||relevant.filter(a=>["cancelled","expired"].includes(a.status)).sort((a,b)=>new Date(b.appointment_date)-new Date(a.appointment_date))[0]||null;
}
