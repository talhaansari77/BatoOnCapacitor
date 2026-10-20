import React,{useEffect,useRef,useState} from "react";
import {useTheme} from "next-themes";
import {useLocation} from "@/components/LocationContext";
import {useVisualStyle} from "./VisualStyleProvider";
import StylePreview from "./StylePreview";
import StyleChooser from "./StyleChooser";
import AppearanceSettings from "@/components/AppearanceSettings";
export default function MakeItYours({onComplete,onBack,journey="hair"}) {
 const {t}=useLocation(); const {style,flushPreferences}=useVisualStyle();
 const {resolvedTheme}=useTheme(); const [saving,setSaving]=useState(false);
 const [error,setError]=useState(""); const busy=useRef(false);
 const titleRef=useRef(null);
 useEffect(()=>{titleRef.current?.focus({preventScroll:true});document.getElementById("bato-main-content")?.scrollTo(0,0);},[]);
 const finish=async()=>{if(busy.current)return;busy.current=true;setSaving(true);setError("");
  try {await flushPreferences(); await onComplete();}
  catch {setError(t("We couldn’t finish saving. Your choices are still here. Please try again.","تعذر إكمال الحفظ. اختياراتك ما زالت هنا. حاول مرة أخرى."));}
  finally {busy.current=false;setSaving(false);}
 };
 return <section className="bato-customize" aria-labelledby="make-it-yours-title">
  <div className="bato-customize-topbar">
   <button type="button" onClick={async()=>{if(busy.current)return;busy.current=true;setSaving(true);setError("");try{await onBack();}catch{setError(t("We couldn’t save. Please try again.","تعذر الحفظ. حاول مرة أخرى."));}finally{busy.current=false;setSaving(false);}}} disabled={saving} className="bato-customize-back">{t("← Back","→ رجوع")}</button>
   <button type="button" className="bato-enter-app" onClick={finish} disabled={saving}>{saving?t("Saving…","جارٍ الحفظ…"):t("Enter my app","ادخل إلى تطبيقي")}</button>
  </div>
  <p className="bato-customize-eyebrow">{t("One final touch","لمستك الأخيرة")}</p>
  <h1 ref={titleRef} tabIndex={-1} id="make-it-yours-title">{t("Make it yours","على ذوقك")}</h1>
  <p>{t("Choose how your BATO app feels. You can change it anytime.","اختر الطابع الذي يناسبك لتطبيق باتو. يمكنك تغييره في أي وقت.")}</p>
  <StylePreview style={style} dark={resolvedTheme==="dark"} journey={journey}/>
  <fieldset disabled={saving} className="min-w-0 space-y-6">
    <StyleChooser compact journey={journey}/>
    <AppearanceSettings showStyles={false}/>
  </fieldset>
  <div className="bato-customize-footer">
   {error&&<p role="alert">{error}</p>}
   <p>{t("Change your choice anytime in Profile → Appearance.","يمكنك تغيير اختيارك لاحقاً من حسابي ← المظهر.")}</p>
  </div>
 </section>;
}
