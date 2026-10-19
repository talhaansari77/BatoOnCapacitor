import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/components/LocationContext";
import { customerDate } from "@/lib/customerDate";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Crown } from "lucide-react";

function eligible(offer, tier, isVIP) {
  if (!isVIP || !offer.is_active) return false;
  if (offer.tier_requirement === "diamond" && tier !== "diamond") return false;
  if (offer.tier_requirement === "platinum" && !["platinum","diamond"].includes(tier)) return false;
  if (!["any_vip","platinum","diamond"].includes(offer.tier_requirement)) return false;
  const now = Date.now();
  for (const [field, end] of [["start_date",false],["end_date",true]]) {
    const value = offer[field];
    if (!value) continue;
    const date = new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? value + (end ? "T23:59:59.999" : "T00:00:00") : value);
    if (!Number.isFinite(date.getTime()) || (end ? date.getTime() < now : date.getTime() > now)) return false;
  }
  if (offer.is_limited && Number.isFinite(Number(offer.slots_total)) && Number(offer.slots_total) <= Number(offer.slots_used || 0)) return false;
  return true;
}

export default function VIPExclusiveOffers({clientEmail,tierLevel,isVIP}) {
  const {t,isRTL} = useLocation();
  const [selectedOffer,setSelectedOffer] = useState(null);
  const query = useQuery({
    queryKey:["vipOffers",tierLevel,clientEmail],
    queryFn:()=>base44.entities.VIPOffer.filter({is_active:true},"-priority"),
    enabled:!!clientEmail && isVIP,retry:1
  });
  const redemptionQuery = useQuery({
    queryKey:["vipRedemptions",clientEmail],
    queryFn:()=>base44.entities.VIPOfferRedemption.filter({client_email:clientEmail}),
    enabled:!!clientEmail && isVIP,retry:1
  });
  if (!isVIP) return null;
  if (query.isLoading || redemptionQuery.isLoading) return <p role="status">{t("Loading member offers…","جارٍ تحميل عروض الأعضاء…")}</p>;
  if (query.isError || redemptionQuery.isError) return <div role="alert"><p>{t("Could not load member offers.","تعذر تحميل عروض الأعضاء.")}</p><Button variant="outline" onClick={()=>{query.refetch();redemptionQuery.refetch();}}>{t("Try again","حاول مرة أخرى")}</Button></div>;
  const offers=(query.data||[]).filter(o=>eligible(o,tierLevel,isVIP));
  if (!offers.length) return <p className="text-sm text-gray-500">{t("No active offers are recorded for your tier.","لا توجد عروض سارية مسجلة لفئتك.")}</p>;
  const help = offer => "/Messages?channel=client_care&context=vip_offer&offer="+encodeURIComponent(offer.id);
  return <section className="space-y-4" dir={isRTL?"rtl":"ltr"}>
    <h3 className="text-xl font-semibold flex gap-2 items-center"><Crown className="w-5 h-5"/>{t("Member offers","عروض الأعضاء")}</h3>
    <p className="text-sm text-gray-600">{t("Ask Customer service to confirm eligibility, availability and the recorded terms before using an offer.","تواصل مع خدمة العملاء لتأكيد الأهلية والتوفر والشروط المسجلة قبل استخدام العرض.")}</p>
    <div className="grid md:grid-cols-2 gap-4">{offers.map(offer=>{
      const recorded=(redemptionQuery.data||[]).filter(r=>r.offer_id===offer.id && !["cancelled","expired"].includes(r.status));
      return <Card key={offer.id}><CardContent className="p-5 space-y-3">
        <h4 className="font-semibold">{offer.title}</h4><p className="text-sm whitespace-pre-line">{offer.description}</p>
        {offer.end_date && <p className="text-xs">{t("Valid through","ساري حتى")} {customerDate(offer.end_date,isRTL)}</p>}
        {recorded.length>0 && <p className="text-sm">{t("A redemption is recorded. Contact Customer service to check its status.","يوجد سجل استرداد. تواصل مع خدمة العملاء لمعرفة حالته.")}</p>}
        <Button variant="outline" onClick={()=>setSelectedOffer(offer)}>{t("View details","عرض التفاصيل")}</Button>
        <Button asChild className="w-full"><Link to={help(offer)}>{t("Ask about this offer","استفسر عن هذا العرض")}</Link></Button>
      </CardContent></Card>;
    })}</div>
    <Dialog open={!!selectedOffer} onOpenChange={open=>{if(!open)setSelectedOffer(null);}}>
      <DialogContent dir={isRTL?"rtl":"ltr"} className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{selectedOffer?.title}</DialogTitle><DialogDescription>{t("Recorded offer details. Customer service confirms availability and use.","تفاصيل العرض المسجلة. تؤكد خدمة العملاء التوفر وطريقة الاستخدام.")}</DialogDescription></DialogHeader>
        <p className="whitespace-pre-line">{selectedOffer?.description}</p>
        {selectedOffer?.redemption_instructions && <div><h4 className="font-semibold">{t("How to use","طريقة الاستخدام")}</h4><p className="whitespace-pre-line">{selectedOffer.redemption_instructions}</p></div>}
        {selectedOffer?.terms_conditions && <div><h4 className="font-semibold">{t("Terms","الشروط")}</h4><p className="whitespace-pre-line text-sm">{selectedOffer.terms_conditions}</p></div>}
        {selectedOffer && <Button asChild><Link to={help(selectedOffer)}>{t("Contact Customer service","تواصل مع خدمة العملاء")}</Link></Button>}
      </DialogContent>
    </Dialog>
  </section>;
}
