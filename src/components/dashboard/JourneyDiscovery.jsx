import React from "react";
import {Link} from "react-router-dom";
import {useLocation} from "@/components/LocationContext";
import {EXPLORER_STARTS} from "@/lib/explorerStart";
import {careDepartment} from "@/lib/customerCare";
const labels={Hair:["Hair","الشعر"],Skin:["Skin","البشرة"],Laser:["Laser","الليزر"],Injectables:["Aesthetic care","العناية التجميلية"],"Health / Panels":["Health","الصحة"]};
export default function JourneyDiscovery({ hairOnly = false, excludeHair = false }){
 const {t,isRTL}=useLocation();
 const starts=EXPLORER_STARTS.filter(start=>hairOnly ? start.interest==="Hair" : !excludeHair || start.interest!=="Hair");
 const sectionId=hairOnly?"hair-discovery":"journey-cards";
 return <section id={sectionId} className="space-y-3" aria-labelledby={sectionId+"-title"}>
  <h2 id={sectionId+"-title"} className="text-lg font-semibold text-[#3a2e1e]">{hairOnly?t("Your hair, your next step","شعرك وخطوتك التالية"):t("Explore BATO services","استكشف خدمات باتو")}</h2>
  {!hairOnly && <p className="text-sm text-[#7c8689]">{t("Explore a new concern or return to your care history. Each journey connects you with its own team.","استكشف ما يشغلك أو ارجع إلى سجل رعايتك. لكل رحلة فريقها المختص.")}</p>}
  <div className="space-y-3">{starts.map(start=><Link key={start.department} to={"/"+careDepartment(start.department).journey} className="block rounded-2xl bg-white border border-[#c4aa8b]/25 p-5 hover:border-[#c4aa8b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#3a2e1e]">
   <div className="flex justify-between items-center gap-3"><h3 className="font-semibold text-[#3a2e1e]">{labels[start.interest][isRTL?1:0]}</h3><span aria-hidden="true">{isRTL?"←":"→"}</span></div>
   <p className="text-sm text-[#7c8689] mt-2 leading-relaxed">{isRTL?start.descriptionAr:start.en}</p>
   <p className="text-xs text-[#3a2e1e] mt-3">{t("Starting point: ","نقطة البداية: ")}{isRTL?start.ar:start.title}</p>
  </Link>)}</div>
 </section>;
}