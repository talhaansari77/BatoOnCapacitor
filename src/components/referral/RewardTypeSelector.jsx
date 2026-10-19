import React,{useState} from "react";
import {useMutation,useQueryClient} from "@tanstack/react-query";
import {base44} from "@/api/base44Client";
import {useLocation} from "@/components/LocationContext";
import {toast} from "sonner";
import {Link} from "react-router-dom";
const options=[["cash_credit","Account credit","رصيد الحساب"],["service_discount","Service discount","خصم على الخدمات"],["product_voucher","Product voucher","قسيمة منتجات"],["free_session","Session benefit","ميزة جلسة"]];
export default function RewardTypeSelector({referral,onUpdate}){
 const {t,isRTL}=useLocation(),qc=useQueryClient();const [selected,setSelected]=useState(referral?.reward_type||"cash_credit");
 const mutation=useMutation({mutationFn:type=>base44.entities.Referral.update(referral.id,{reward_type:type}),onSuccess:(_,type)=>{setSelected(type);qc.invalidateQueries({queryKey:["referrals"]});toast.success(t("Reward preference saved.","حُفظ تفضيل المكافأة."));onUpdate?.();},onError:()=>toast.error(t("Could not save your preference. Your previous selection remains.","تعذر حفظ تفضيلك. يبقى اختيارك السابق."))});
 if(!referral)return null;
 return <section className="space-y-4 p-4" dir={isRTL?"rtl":"ltr"}><h3 className="font-semibold">{t("Reward preference","تفضيل المكافأة")}</h3><p className="text-sm">{t("Choose your preferred benefit. Eligibility, value and terms require confirmation from BATO.","اختر الميزة التي تفضلها. تتطلب الأهلية والقيمة والشروط تأكيداً من باتو.")}</p><div className="grid sm:grid-cols-2 gap-3">{options.map(([type,en,ar])=><button key={type} aria-pressed={selected===type} disabled={mutation.isPending||referral.reward_claimed} onClick={()=>mutation.mutate(type)} className={"rounded-xl border p-4 text-start "+(selected===type?"border-[#c4aa8b] bg-[#f9f8f6]":"bg-white")}>{t(en,ar)}</button>)}</div><Link className="block underline p-2" to="/Messages?channel=client_care">{t("Ask about reward terms","اسأل عن شروط المكافأة")}</Link></section>;
}
