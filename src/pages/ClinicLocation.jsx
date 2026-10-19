import React,{useState,useEffect} from "react";
import {Link,useSearchParams} from "react-router-dom";
import {useLocation} from "@/components/LocationContext";
import {CLINIC_BRANCHES} from "@/lib/clinicBranches";
export default function ClinicLocation() {
  const {t,isRTL,location}=useLocation();
  const [params]=useSearchParams();
  const supplied=params.get("branch");
  const [selected,setSelected]=useState(CLINIC_BRANCHES[supplied]?supplied:location==="dubai"?"dubai":"kuwait");
  useEffect(()=>{setSelected(CLINIC_BRANCHES[supplied]?supplied:location==="dubai"?"dubai":"kuwait");},[supplied,location]);
  const branch=CLINIC_BRANCHES[selected];
  return <div className="min-h-screen bg-[#eeebe6] pb-16 text-[#3a2e1e]" dir={isRTL?"rtl":"ltr"}>
    <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
      <h1 className="text-xl font-bold">{t("BATO locations","مواقع باتو")}</h1>
      <p className="text-sm">{t("Choose your branch and open its location in Google Maps.","اختر فرعك وافتح موقعه في خرائط جوجل.")}</p>
      <div className="flex gap-2 bg-white rounded-2xl p-2">{Object.values(CLINIC_BRANCHES).map(b=><button key={b.id} aria-pressed={selected===b.id} onClick={()=>setSelected(b.id)} className={"bato-filter-option flex-1 rounded-xl p-3 text-sm "+(selected===b.id?"bg-[#3a2e1e] text-white":"text-[#3a2e1e]")}>{isRTL?b.ar:b.en}</button>)}</div>
      <section className="bato-style-hero rounded-3xl bg-[#3a2e1e] text-white p-6 space-y-4">
        <h2 className="text-xl font-semibold">{t("BATO · ","باتو · ")}{isRTL?branch.ar:branch.en}</h2>
        <a href={branch.mapsUrl} target="_blank" rel="noopener noreferrer" className="block text-center rounded-xl bg-[#c4aa8b] text-[#3a2e1e] p-3 font-semibold">{t("Open location in Google Maps","افتح الموقع في خرائط جوجل")}</a>
      </section>
      <section className="rounded-2xl bg-white p-5 space-y-3 text-sm">
        <h2 className="font-semibold">{t("Before you travel","قبل التوجه إلى العيادة")}</h2>
        <p>{t("Check that your appointment is confirmed and that its branch matches the location you open.","تأكد من أن موعدك مؤكد وأن فرعه يطابق الموقع الذي تفتحه.")}</p>
        <p>{t("For opening hours, parking or arrival details, ask Customer service.","اسأل خدمة العملاء عن ساعات العمل والمواقف وتفاصيل الوصول.")}</p>
        <Link className="inline-block underline py-2" to="/ClinicAppointments">{t("View your appointments","عرض مواعيدك")}</Link>
        <Link className="block underline py-2" to="/Messages?channel=client_care">{t("Ask Customer service","اسأل خدمة العملاء")}</Link>
      </section>
    </div>
  </div>;
}
