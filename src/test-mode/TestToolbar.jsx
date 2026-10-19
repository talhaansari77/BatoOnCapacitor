import React, {useState,useEffect} from "react";
import {TEST_PERSONAS} from "./personas";
import {activePersona, selectPersona, resetPersona, testSnapshot, setTestFault, setCareScenario,setAuditScenario,setPhotoAuditScenario} from "./previewClient";

export default function TestToolbar() {
  const [open,setOpen]=useState(false);
  const [snapshot,setSnapshot]=useState(null);
  const persona=activePersona();
  const [ar,setAr]=useState(()=>localStorage.getItem("bato_language")==="ar");
  useEffect(()=>{
    const sync=()=>setAr(document.documentElement.lang==="ar");
    const observer=new MutationObserver(sync);
    observer.observe(document.documentElement,{attributes:true,attributeFilter:["lang"]});
    sync();return ()=>observer.disconnect();
  },[]);
  const t=(en,arabic)=>ar?arabic:en;
  return <div dir={ar?"rtl":"ltr"} className="bato-test-toolbar fixed bottom-3 left-3 z-[100] max-w-[calc(100vw-24px)] text-sm">
    <button onClick={()=>{setOpen(!open);if(persona)setSnapshot(testSnapshot());}} className="rounded-full border border-[#c4aa8b] bg-[#3a2e1e] text-white px-4 py-2 shadow-lg">
      {persona?t("Test mode: ","وضع الاختبار: ")+(ar?persona.nameAr:persona.name):t("Customer test lab","اختبار تجربة العميل")}
    </button>
    {open&&<section aria-label={t("Customer test lab","اختبار تجربة العميل")} className="mt-2 w-80 max-w-full rounded-xl border border-[#c4aa8b] bg-[#f9f8f6] p-4 shadow-xl max-h-[70vh] overflow-auto space-y-3">
      <div className="flex justify-between gap-3"><strong>{t("5 fictional customers","٥ عملاء افتراضيين")}</strong><button aria-label={t("Close test panel","إغلاق لوحة الاختبار")} onClick={()=>setOpen(false)}>×</button></div>
      <p className="text-xs text-gray-600">{t("Preview only. Data stays in this browser tab. Bookings, messages, files and orders are simulated.","في المعاينة فقط. البيانات محفوظة في علامة التبويب هذه. المواعيد والرسائل والملفات والطلبات افتراضية.")}</p>
      <label className="block" htmlFor="test-persona">{t("Choose a customer","اختر عميلاً")}</label>
      <select id="test-persona" value={persona?.id||""} onChange={e=>selectPersona(e.target.value||null)} className="w-full rounded-lg border bg-white p-2">
        <option value="">{t("Your real account","حسابك الحقيقي")}</option>
        {TEST_PERSONAS.map(p=><option key={p.id} value={p.id}>{ar?p.nameAr:p.name}</option>)}
      </select>
      {persona&&<>
        <p>{ar?persona.scenarioAr:persona.scenario}</p>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg border bg-white px-3 py-2" onClick={resetPersona}>{t("Reset this customer","إعادة ضبط هذا العميل")}</button>
          <button className="rounded-lg border bg-white px-3 py-2" onClick={()=>selectPersona(null)}>{t("Exit test mode","إنهاء الاختبار")}</button>
        </div>
        <button className="rounded-lg border bg-white px-3 py-2" onClick={setAuditScenario}>{t("Load billing, learning and community test records","تحميل سجلات اختبار الفواتير والتعلّم والمجتمع")}</button>
        <button className="rounded-lg border bg-white px-3 py-2" onClick={setPhotoAuditScenario}>{t("Load non-clinical photo layout fixtures","تحميل صور اختبار غير طبية لفحص التصميم")}</button>
        <label className="block" htmlFor="test-care-stage">{t("Preview a care stage","معاينة مرحلة الرعاية")}</label>
        <select id="test-care-stage" value={snapshot?.careScenario||""} onChange={e=>e.target.value?setCareScenario(e.target.value):resetPersona()} className="w-full rounded-lg border bg-white p-2">
          <option value="">{t("Original customer scenario","سيناريو العميل الأصلي")}</option>
          <option value="requested">{t("Request submitted","تم إرسال الطلب")}</option>
          <option value="scheduled">{t("Scheduled, not confirmed","مجدول دون تأكيد")}</option>
          <option value="confirmed">{t("Confirmed visit","زيارة مؤكدة")}</option>
          <option value="visited">{t("Visit completed, recommendation","زيارة مكتملة مع توصية")}</option>
          <option value="active">{t("Treatment and instructions","علاج وتعليمات")}</option>
          <option value="completed">{t("Completed with maintenance plan","مكتمل مع خطة للحفاظ على النتائج")}</option>
          <option value="missing">{t("Missing plan and instructions","خطة وتعليمات غير مسجلة")}</option>
          <option value="stale">{t("Past request needs clinic update","طلب سابق يحتاج تحديث العيادة")}</option>
        </select>
        <label className="block" htmlFor="test-fault">{t("Simulate a failure","محاكاة خطأ")}</label>
        <select id="test-fault" value={sessionStorage.getItem("bato-preview-fault")||"none"} onChange={e=>setTestFault(e.target.value)} className="w-full rounded-lg border bg-white p-2">
          <option value="none">{t("Normal operation","التشغيل الطبيعي")}</option>
          <option value="reads">{t("Data fails to load","تعذر تحميل البيانات")}</option>
          <option value="writes">{t("Changes fail to save","تعذر حفظ التغييرات")}</option>
        </select>
        <button className="underline" onClick={()=>setSnapshot(testSnapshot())}>{t("Refresh activity","تحديث النشاط")}</button>
        <div className="text-xs text-gray-600">{t("Local records: ","السجلات المحلية: ")}{Object.values(snapshot?.records||{}).reduce((n,rows)=>n+rows.length,0)}</div>
        <ul className="text-xs space-y-1" dir="ltr">{snapshot?.log.slice(-5).reverse().map((entry,i)=><li key={i}>{entry.operation} · {entry.entity}</li>)}</ul>
      </>}
    </section>}
  </div>;
}
