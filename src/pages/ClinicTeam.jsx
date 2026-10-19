import CareText from "@/components/CareText";
import React from "react";
import {Link} from "react-router-dom";
import {useQuery} from "@tanstack/react-query";
import {base44} from "@/api/base44Client";
import {useCustomerAccount} from "@/hooks/useCustomerAccount";
import {useLocation} from "@/components/LocationContext";
import CustomerLoadState from "@/components/CustomerLoadState";
import {CHANNELS} from "@/components/messages/channelsConfig";
import {careMessageUrl, careDepartment} from "@/lib/customerCare";
export default function ClinicTeam(){
 const {t,isRTL}=useLocation(),account=useCustomerAccount(),user=account.data;
 const query=useQuery({queryKey:["customerTeamCases",user?.email],enabled:!!user,queryFn:async()=>{const rows=[];for(let skip=0;;skip+=100){const page=await base44.entities.CaseFile.filter({client_email:user.email},"-created_date",100,skip);rows.push(...page);if(page.length<100)return rows;}}});
 if(account.isError||query.isError)return <CustomerLoadState error onRetry={()=>{account.refetch();query.refetch();}}/>;
 if(!user||query.isPending)return <CustomerLoadState/>;
 const assignments=query.data.filter(c=>c.assigned_specialist);
 return <div className="max-w-lg mx-auto p-4 space-y-5" dir={isRTL?"rtl":"ltr"}><h1 className="text-2xl font-bold text-[#333435]">{t("Your Team","فريقك")}</h1><p className="text-sm text-[#7c8689]">{t("Your recorded specialists and the BATO teams you can contact.","الأخصائيون المسجلون في ملفك وفرق باتو التي يمكنك التواصل معها.")}</p>
 <section className="space-y-3"><h2 className="bato-section-title">{t("Assigned specialists","الأخصائيون المسؤولون عنك")}</h2>{assignments.length?assignments.map(c=><div key={c.id} className="bg-white rounded-2xl border border-[#c4aa8b]/25 p-5 space-y-2"><div className="flex items-center gap-3"><div className="bato-style-emblem w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 font-semibold text-lg" style={{ background: "#3a2e1e", color: "#c4aa8b" }} aria-hidden="true">{(c.assigned_specialist||"?").charAt(0)}</div><div><p className="font-semibold"><CareText value={c.assigned_specialist}/></p><p className="text-xs text-[#7c8689]">{t("Assigned to your care","مسؤول عن رعايتك")}</p><p className="text-sm text-[#7c8689] mt-1">{isRTL?careDepartment(c.primary_department).ar:careDepartment(c.primary_department).en}</p></div></div><Link className="bato-action-link w-full underline py-3" to={careMessageUrl(c.primary_department)}>{t("Contact your specialist", "تواصل مع أخصائيك")}</Link></div>):<div className="bg-white rounded-2xl border border-[#c4aa8b]/25 p-5"><p className="text-sm">{t("An assigned specialist will appear when the clinic records the assignment. You can contact a team below now.","سيظهر الأخصائي المسؤول عندما تسجل العيادة تعيينه. يمكنك التواصل مع أحد الفرق أدناه الآن.")}</p></div>}</section>
 <section className="space-y-3"><h2 className="bato-section-title">{t("Advisors, specialists and customer service","المرشدون والأخصائيون وخدمة العملاء")}</h2>{CHANNELS.map(c=><Link key={c.key} to={"/Messages?channel="+c.key} className="block bg-white rounded-2xl border border-[#c4aa8b]/25 p-5 space-y-2"><h3 className="font-semibold">{isRTL?c.nameAr:c.name}</h3><p className="text-sm text-[#7c8689]">{isRTL?c.descriptionAr:c.description}</p><span className="block underline text-sm py-2">{t("Send a message","أرسل رسالة")}</span></Link>)}</section></div>;
}