import React from "react";
import {Home, CalendarDays, MessageCircle, UserRound, ArrowUpRight, Check, Sparkles} from "lucide-react";
import {useLocation} from "@/components/LocationContext";
export default function StylePreview({style, dark=false, compact=false, journey="hair"}) {
 const {t,isRTL}=useLocation();
 const titles={hair:t("Your Hair Journey","رحلة علاج شعرك"),skin:t("Your Skin Journey","رحلة العناية ببشرتك"),laser:t("Your Laser Journey","رحلة الليزر"),health:t("Your Health Journey","رحلة العناية بصحتك"),aesthetic:t("Your Care Journey","رحلة العناية بك")};
 return <div className={"bato-style-preview"+(compact?" is-compact":"")} data-preview-style={style} data-preview-mode={dark?"dark":"light"} dir={isRTL?"rtl":"ltr"} aria-hidden="true">
   <div className="preview-top"><span>{t("Designed around you","مصمم على ذوقك")}</span><span className="preview-dot"/></div>
   <div className="preview-heading">{titles[journey]||titles.hair}</div>
   <div className="preview-hero">
    <div className="preview-eyebrow">{t("Your next chapter","خطوتك القادمة")}</div>
    <div className="preview-hero-title">{t("Care, made personal.","عناية تناسبك.")}</div>
    <div className="preview-progress"><div className="preview-dial"><Sparkles size={compact?18:26}/></div><div><strong>{t("A plan for you","خطة خاصة بك")}</strong><span>{t("Every step, together","معك في كل خطوة")}</span></div></div>
    <div className="preview-cta"><span>{t("Explore your journey","استكشف رحلتك")}</span><ArrowUpRight size={18}/></div>
   </div>
   <div className="preview-tiles"><div><CalendarDays size={17}/><span>{t("Your visits","مواعيدك")}</span></div><div><Check size={17}/><span>{t("Your care plan","خطة العناية")}</span></div></div>
   {!compact&&<div className="preview-nav">{[Home,Sparkles,CalendarDays,MessageCircle,UserRound].map((Icon,i)=><span key={i} className={i===1?"is-active":""}><Icon size={19}/></span>)}</div>}
 </div>;
}
