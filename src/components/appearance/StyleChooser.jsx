import React,{useId} from "react";
import {Check} from "lucide-react";
import {useTheme} from "next-themes";
import {useLocation} from "@/components/LocationContext";
import {useVisualStyle} from "./VisualStyleProvider";
import StylePreview from "./StylePreview";
export const STYLE_LABELS = {
 atelier:["Atelier","أتيليه","Quiet boutique luxury","فخامة هادئة"],
 prism:["Prism","بريزم","Light, layered glass","زجاج مضيء بطبقات"],
 contour:["Contour","كونتور","Sculpted precision","تفاصيل منحوتة بإتقان"]
};
export default function StyleChooser({compact=false,journey="hair"}) {
 const {t}=useLocation(); const id=useId();
 const {style,setStyle}=useVisualStyle(); const {resolvedTheme}=useTheme();
 return <fieldset className={"bato-style-chooser"+(compact?" is-compact":"")}>
 <legend>{t("Your style","طابعك الخاص")}</legend>
 <div className="bato-style-choices">
 {Object.entries(STYLE_LABELS).map(([value,[en,ar,desc,descAr]])=><label key={value} className="bato-style-choice">
  <input type="radio" name={id} value={value} checked={style===value} onChange={()=>setStyle(value)}/>
  <span className="bato-style-choice-body">
   <span className="bato-style-choice-label"><span><strong>{t(en,ar)}</strong><small>{t(desc,descAr)}</small></span><span className="bato-style-selection">{style===value&&<Check size={16}/>}</span></span>
   {!compact&&<StylePreview style={value} dark={resolvedTheme==="dark"} compact journey={journey}/>}
   {compact&&<span className="bato-style-material" data-material={value}><i/><i/><i/></span>}
  </span>
 </label>)}
 </div></fieldset>;
}
