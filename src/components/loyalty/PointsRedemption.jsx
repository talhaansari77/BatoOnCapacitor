import React,{useRef} from "react";
import {useQuery,useMutation,useQueryClient} from "@tanstack/react-query";
import {base44} from "@/api/base44Client";
import {useLocation} from "@/components/LocationContext";
import {Button} from "@/components/ui/button";
import {Link} from "react-router-dom";
import {toast} from "sonner";
import {customerDate} from "@/lib/customerDate";
const options=[
 {id:"discount_10",type:"service_discount",en:"USD 10 service discount",ar:"خصم 10 دولارات على الخدمات",points:1000,value:10},
 {id:"discount_25",type:"service_discount",en:"USD 25 service discount",ar:"خصم 25 دولاراً على الخدمات",points:2500,value:25},
 {id:"discount_50",type:"service_discount",en:"USD 50 service discount",ar:"خصم 50 دولاراً على الخدمات",points:5000,value:50},
 {id:"discount_100",type:"service_discount",en:"USD 100 service discount",ar:"خصم 100 دولار على الخدمات",points:10000,value:100},
 {id:"product_discount",type:"product_discount",en:"USD 20 product voucher",ar:"قسيمة منتجات بقيمة 20 دولاراً",points:2000,value:20},
 {id:"free_session",type:"free_session",en:"PRP session request",ar:"طلب جلسة بلازما",points:15000,value:300}
];
export default function PointsRedemption({clientEmail,availablePoints,onRedemptionSuccess}){
 const {t,isRTL}=useLocation(),qc=useQueryClient(),busy=useRef(false);
 const query=useQuery({queryKey:["pointRedemptions",clientEmail],enabled:!!clientEmail,queryFn:()=>base44.entities.PointRedemption.filter({client_email:clientEmail},"-created_date"),refetchOnMount:"always"});
 const pending=(query.data||[]).filter(r=>r.status==="pending");
 const reserved=pending.reduce((n,r)=>n+Math.max(0,Number(r.points_used)||0),0);
 const available=Math.max(0,(Number(availablePoints)||0)-reserved);
 const mutation=useMutation({mutationFn:async option=>{
  const latest=await base44.entities.PointRedemption.filter({client_email:clientEmail});
  const pendingPoints=latest.filter(r=>r.status==="pending").reduce((n,r)=>n+Math.max(0,Number(r.points_used)||0),0);
  if(latest.some(r=>r.status==="pending"&&r.description===option.en))throw new Error("Request already pending");
  if(Math.max(0,(Number(availablePoints)||0)-pendingPoints)<option.points)throw new Error("Insufficient uncommitted points");
  return base44.entities.PointRedemption.create({client_email:clientEmail,redemption_type:option.type,points_used:option.points,redemption_value:option.value,description:option.en,status:"pending"});
 },onSuccess:()=>{qc.invalidateQueries({queryKey:["pointRedemptions",clientEmail]});toast.success(t("Request submitted for clinic approval.","تم إرسال الطلب لموافقة العيادة."));onRedemptionSuccess?.();},onError:()=>{qc.invalidateQueries({queryKey:["pointRedemptions",clientEmail]});toast.error(t("The request was not confirmed. Check your pending requests before trying again.","لم يتم تأكيد الطلب. تحقق من طلباتك المعلقة قبل المحاولة مجدداً."));},onSettled:()=>{busy.current=false;}});
 const request=option=>{if(busy.current)return;busy.current=true;mutation.mutate(option);};
 const statuses={pending:t("Pending approval","بانتظار الموافقة"),approved:t("Approved","موافق عليه"),redeemed:t("Redeemed","مستبدل"),cancelled:t("Cancelled","ملغى")};
 return <section className="space-y-4"><h3 className="font-semibold">{t("Request a points benefit","اطلب ميزة بالنقاط")}</h3><p className="text-sm">{t("Requests require clinic approval. A request is not a confirmed discount or a treatment booking.","تتطلب الطلبات موافقة العيادة. الطلب لا يؤكد الخصم أو حجز العلاج.")}</p>
 <p className="text-sm">{t("Points available for a new request: ","النقاط المتاحة لطلب جديد: ")}{available.toLocaleString(isRTL?"ar":"en")}</p>
 {query.isPending?<p role="status">{t("Loading requests…","جارٍ تحميل الطلبات…")}</p>:query.isError?<div role="alert"><p>{t("Could not load your requests.","تعذر تحميل طلباتك.")}</p><button className="underline p-2" onClick={()=>query.refetch()}>{t("Try again","حاول مرة أخرى")}</button></div>:<div className="space-y-3">{options.map(o=><div key={o.id} className="rounded-xl bg-[#f9f8f6] p-3 space-y-2"><p className="font-medium">{isRTL?o.ar:o.en}</p><p className="text-xs">{o.points.toLocaleString(isRTL?"ar":"en")} {t("points","نقطة")}</p><Button size="sm" disabled={mutation.isPending||query.isFetching||available<o.points||pending.some(r=>r.description===o.en)} onClick={()=>request(o)}>{pending.some(r=>r.description===o.en)?t("Request pending","طلب معلق"):t("Request benefit","اطلب الميزة")}</Button></div>)}</div>}
 {(query.data||[]).length>0&&<div className="space-y-2"><h4 className="font-semibold">{t("Your requests","طلباتك")}</h4>{query.data.map(r=><p key={r.id} className="text-xs break-words">{r.description} · {statuses[r.status]||t("Ask Customer service","اسأل خدمة العملاء")} · {customerDate(r.created_date,isRTL)}</p>)}</div>}
 <Link className="block underline p-2" to="/Messages?channel=client_care">{t("Ask about benefit terms","اسأل عن شروط المزايا")}</Link></section>;
}
