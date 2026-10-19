import {useBatoText} from "@/lib/batoText";
import {useNavigate} from "react-router-dom";
import {useLocation} from "@/components/LocationContext";
import {validateUpload} from "@/lib/uploads";
import {format} from "@/lib/customerFormatting";
import {ar} from "date-fns/locale";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, Circle, Upload, X, ChevronLeft,
  MessageSquare, Plus, Loader2, BookOpen, AlertTriangle
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { toast } from "sonner";
import { computeReadinessItems, computeReadinessStatus, READINESS_CONFIG } from "./readinessUtils";
import { getVisitPrepInstructions } from "./VisitPrepInstructions";


const QUESTION_EXAMPLES = [
  "Is my shedding normal?",
  "What could be causing my hair loss?",
  "How long until I see progress?",
  "Do I need blood tests?",
  "What treatment options fit my case?",
];

function SectionHeader({ title, subtitle }) {
  const tr=useBatoText();
  return (
    <div className="mb-3">
      <p className="text-sm font-semibold text-[#333435]">{title}</p>
      {subtitle && <p className="text-xs text-[#7c8689] mt-0.5">{subtitle}</p>}
    </div>
  );
}

function StatusPill({ complete, label, optional }) {
  const tr=useBatoText();
  if (optional && !complete) {
    return (
      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
        style={{ background: "rgba(196,170,139,0.1)", color: "#7c8689" }}>{tr("Optional")}</span>
    );
  }
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
      style={{
        background: complete ? "rgba(74,222,128,0.1)" : "rgba(251,146,60,0.1)",
        color: complete ? "#16a34a" : "#ea580c"
      }}>
      {label}
    </span>
  );
}

function ChecklistRow({ item }) {
  const tr=useBatoText();
  return (
    <div className="flex items-start gap-3 py-3 border-b last:border-0"
      style={{ borderColor: "rgba(196,170,139,0.1)" }}>
      <div className="mt-0.5">
        {item.complete
          ? <CheckCircle2 className="w-4 h-4" style={{ color: "#4ade80" }} />
          : <Circle className="w-4 h-4" style={{ color: item.required ? "#fb923c" : "rgba(196,170,139,0.4)" }} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-[#333435]">{tr(item.label)}</p>
          <StatusPill complete={item.complete} label={tr(item.statusLabel)} optional={!item.required} />
        </div>
        <p className="text-xs text-[#7c8689] mt-0.5">{tr(item.description)}</p>
      </div>
    </div>
  );
}

export default function PreVisitReadinessDetail({ profile, appointment, onClose, onProfileUpdate }) {
  const tr=useBatoText();
  const {t,isRTL}=useLocation();
  const navigate=useNavigate();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [addingQuestion, setAddingQuestion] = useState(false);
  const [savingPrep, setSavingPrep] = useState(false);
  const [prepRead, setPrepRead] = useState(profile?.visit_prep_read || false);

  const items = computeReadinessItems(profile, appointment);
  const status = computeReadinessStatus(items, appointment);
  const config = READINESS_CONFIG[status];
  const requiredItems = items.filter(i => i.required);
  const requiredComplete = requiredItems.filter(i => i.complete).length;
  const instructions = getVisitPrepInstructions(profile?.booked_service_type);
  const questions = profile?.client_questions || [];

  const saveError=()=>toast.error(t("The change was not confirmed. Your current information is still available.","لم يتم تأكيد التغيير. معلوماتك الحالية ما زالت متاحة."));
  const upload=async(e,field,photoOnly,setBusy)=>{
    const file=e.target.files?.[0];if(!file)return;
    const existing=profile?.[field]||[];
    if(validateUpload(file,{photoOnly,count:existing.length,limit:10})){toast.error(t("Choose a supported file up to 10 MB. Maximum 10 files.","اختر ملفاً مدعوماً حتى 10 ميجابايت. الحد الأقصى 10 ملفات."));e.target.value="";return;}
    setBusy(true);
    try{const {file_url}=await base44.integrations.Core.UploadFile({file});await onProfileUpdate({[field]:[...existing,file_url]});toast.success(t("File saved to your profile.","حُفظ الملف في ملفك الشخصي."));}
    catch{saveError();}finally{setBusy(false);e.target.value="";}
  };
  const handlePhotoUpload=e=>{if(!uploadingPhoto)upload(e,"uploaded_photos",true,setUploadingPhoto);};
  const handleDocUpload=e=>{if(!uploadingDoc)upload(e,"uploaded_documents",false,setUploadingDoc);};
  const remove=async(field,index)=>{try{await onProfileUpdate({[field]:(profile?.[field]||[]).filter((_,i)=>i!==index)});}catch{saveError();}};
  const removePhoto=index=>remove("uploaded_photos",index);
  const removeDoc=index=>remove("uploaded_documents",index);
  const addQuestion=async()=>{if(!newQuestion.trim()||addingQuestion)return;setAddingQuestion(true);try{await onProfileUpdate({client_questions:[...questions,newQuestion.trim()]});setNewQuestion("");toast.success(t("Question saved.","حُفظ السؤال."));}catch{saveError();}finally{setAddingQuestion(false);}};
  const markPrepRead=async()=>{if(savingPrep)return;setSavingPrep(true);try{await onProfileUpdate({visit_prep_read:true});setPrepRead(true);}catch{saveError();}finally{setSavingPrep(false);}};
  const openRoute=route=>{onClose();navigate(route);};

  return (
    <div role="dialog" aria-modal="true" aria-label={t("Pre-Visit Readiness","الاستعداد للزيارة")} dir={isRTL?"rtl":"ltr"} className="min-h-screen" style={{ background: "#eeebe6" }}>
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center gap-3"
        style={{ borderColor: "rgba(196,170,139,0.2)" }}>
        <button aria-label={t("Close preparation","إغلاق الاستعداد للزيارة")} onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[#eeebe6] transition-colors">
          <ChevronLeft className="w-4 h-4 text-[#7c8689]" />
        </button>
        <div className="flex-1">
          <p className="text-sm font-semibold text-[#333435]">{tr("Pre-Visit Readiness")}</p>
          <p className="text-xs text-[#7c8689]">{tr("Everything your team needs before your visit.")}</p>
        </div>
        <div className="px-2.5 py-1 rounded-full text-[10px] font-semibold"
          style={{ background: config.bg, color: config.color, border: `1px solid ${config.border}` }}>
          {tr(config.label)}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">

        {/* Overall progress */}
        <div className="bg-white rounded-2xl p-4 border" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-[#7c8689] uppercase tracking-wider">{tr("Overall Readiness")}</p>
            <p className="text-xs text-[#7c8689]">{requiredComplete} of {requiredItems.length} complete</p>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(196,170,139,0.12)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(requiredItems.length?requiredComplete / requiredItems.length:0) * 100}%` }}
              transition={{ duration: 0.5 }}
              className="h-full rounded-full"
              style={{ background: status === "ready" ? "#4ade80" : config.color }}
            />
          </div>
          <p className="text-xs text-[#7c8689] mt-2 leading-relaxed">{tr(config.copy)}</p>
        </div>

        {/* 1. Appointment Details */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
          <div className="px-4 pt-4 pb-2 border-b" style={{ borderColor: "rgba(196,170,139,0.1)" }}>
            <SectionHeader title={tr("1. Appointment Details")} />
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {appointment ? (
              <>
                <div className="flex justify-between text-xs">
                  <span className="text-[#7c8689]">{tr("Date & Time")}</span>
                  <span className="font-medium text-[#333435]">
                    {format(appointment.appointment_date, "EEE, d MMM yyyy · HH:mm",{locale:isRTL?ar:undefined})}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#7c8689]">{tr("Branch")}</span>
                  <span className="font-medium text-[#333435]">{appointment.location || "To be confirmed by your team"}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#7c8689]">{tr("Service")}</span>
                  <span className="font-medium text-[#333435]">{profile?.booked_service_type || "To be confirmed"}</span>
                </div>
                {appointment.specialist_name && (
                  <div className="flex justify-between text-xs">
                    <span className="text-[#7c8689]">{tr("Specialist")}</span>
                    <span className="font-medium text-[#333435]">{appointment.specialist_name}</span>
                  </div>
                )}
                <div className="pt-2">
                  <button onClick={()=>openRoute("/Messages?channel=reschedule&appointment="+encodeURIComponent(appointment.id))} className="text-xs text-[#7c8689] underline">{t("Request Reschedule","طلب تغيير الموعد")}</button>
                </div>
              </>
            ) : (
              <div>
                <p className="text-sm text-[#7c8689] mb-3">{tr("We couldn't find your appointment details yet.")}</p>
                <button onClick={()=>openRoute("/Messages?channel=client_care")} className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium"
                  style={{ background: "rgba(196,170,139,0.1)", color: "#7c8689" }}>
                  <MessageSquare className="w-3.5 h-3.5" />{tr("Message Customer service")}</button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Readiness Checklist */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
          <div className="px-4 pt-4 pb-2 border-b" style={{ borderColor: "rgba(196,170,139,0.1)" }}>
            <SectionHeader title={tr("2. Readiness Checklist")} subtitle={tr("Your current preparation status.")} />
          </div>
          <div className="px-4">
            {items.map(item => <ChecklistRow key={item.key} item={item} />)}
          </div>
        </div>

        {/* 3. Photos & Documents */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
          <div className="px-4 pt-4 pb-2 border-b" style={{ borderColor: "rgba(196,170,139,0.1)" }}>
            <SectionHeader title={tr("3. Photos & Documents")} subtitle={tr("Optional — your team can request these during the visit if needed.")} />
          </div>
          <div className="px-4 py-3 space-y-4">
            {/* Photos */}
            <div>
              <p className="text-xs font-medium text-[#333435] mb-2">{tr("Photos")}</p>
              {(profile?.uploaded_photos || []).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {profile.uploaded_photos.map((url, i) => (
                    <div key={i} className="relative">
                      <img src={url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                      <button aria-label={t("Remove photo","إزالة الصورة")} disabled={uploadingPhoto} onClick={() => removePhoto(i)}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow">
                        <X className="w-2.5 h-2.5 text-gray-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer w-full"
                style={{ borderColor: "rgba(196,170,139,0.25)", background: "#f9f8f6" }}>
                {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#c4aa8b" }} />
                  : <Upload className="w-4 h-4" style={{ color: "rgba(196,170,139,0.6)" }} />}
                <span className="text-xs text-[#7c8689]">{tr("Upload photos")}</span>
                <input disabled={uploadingPhoto} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
            {/* Documents */}
            <div>
              <p className="text-xs font-medium text-[#333435] mb-2">{tr("Lab Results / Documents")}</p>
              {(profile?.uploaded_documents || []).length > 0 && (
                <div className="space-y-1.5 mb-2">
                  {profile.uploaded_documents.map((url, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border"
                      style={{ borderColor: "rgba(196,170,139,0.15)" }}>
                      <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                      <p className="flex-1 text-xs text-[#333435] truncate">{url.split("/").pop()}</p>
                      <button aria-label={t("Remove document","إزالة المستند")} disabled={uploadingDoc} onClick={() => removeDoc(i)}><X className="w-3.5 h-3.5 text-[#7c8689]" /></button>
                    </div>
                  ))}
                </div>
              )}
              <label className="flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer w-full"
                style={{ borderColor: "rgba(196,170,139,0.25)", background: "#f9f8f6" }}>
                {uploadingDoc ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: "#c4aa8b" }} />
                  : <Upload className="w-4 h-4" style={{ color: "rgba(196,170,139,0.6)" }} />}
                <span className="text-xs text-[#7c8689]">{tr("Upload documents")}</span>
                <input disabled={uploadingDoc} type="file" accept="image/*,application/pdf" className="hidden" onChange={handleDocUpload} />
              </label>
            </div>
            <p className="text-[11px] text-[#7c8689] italic">{tr("Your team can take photos or request documents during your visit.")}</p>
          </div>
        </div>

        {/* 4. Before Your Visit */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
          <div className="px-4 pt-4 pb-2 border-b" style={{ borderColor: "rgba(196,170,139,0.1)" }}>
            <div className="flex items-center justify-between">
              <SectionHeader title={tr("4. Before Your Visit")} />
              {prepRead && (
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: "rgba(74,222,128,0.1)", color: "#16a34a" }}>{tr("Read ✓")}</span>
              )}
            </div>
          </div>
          <div className="px-4 py-3 space-y-2.5">
            {instructions.map((inst, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#c4aa8b" }} />
                <p className="text-sm text-[#333435]">{inst}</p>
              </div>
            ))}
            {!prepRead && (
              <button
                onClick={markPrepRead}
                disabled={savingPrep}
                className="mt-3 w-full py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
                style={{ background: "rgba(196,170,139,0.12)", color: "#3a2e1e" }}>
                {savingPrep ? t("Saving…","جارٍ الحفظ…") : t("I've read this ✓","قرأت التعليمات ✓")}
              </button>
            )}
          </div>
        </div>

        {/* 5. Questions for the Team */}
        <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
          <div className="px-4 pt-4 pb-2 border-b" style={{ borderColor: "rgba(196,170,139,0.1)" }}>
            <SectionHeader
              title={tr("5. Questions for the Team")}
              subtitle={tr("Add anything you want to ask during your consultation.")}
            />
          </div>
          <div className="px-4 py-3">
            {questions.length > 0 && (
              <div className="space-y-2 mb-3">
                {questions.map((q, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 rounded-xl"
                    style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
                    <span className="text-xs font-semibold text-[#c4aa8b] flex-shrink-0 mt-0.5">Q{i + 1}</span>
                    <p className="text-xs text-[#333435]">{q}</p>
                  </div>
                ))}
              </div>
            )}
            {/* Example suggestions */}
            {questions.length === 0 && (
              <div className="mb-3">
                <p className="text-[10px] text-[#7c8689] mb-2">{tr("Examples:")}</p>
                <div className="flex flex-wrap gap-1.5">
                  {QUESTION_EXAMPLES.map(ex => (
                    <button key={ex} onClick={() => setNewQuestion(ex)}
                      className="text-[10px] px-2.5 py-1 rounded-full"
                      style={{ background: "rgba(196,170,139,0.08)", color: "#7c8689", border: "1px solid rgba(196,170,139,0.15)" }}>
                      {ex}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2">
              <input
                value={newQuestion}
                onChange={e => setNewQuestion(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addQuestion()}
                disabled={addingQuestion} aria-label={t("Your question","سؤالك")} placeholder={t("Type your question...","اكتب سؤالك…")}
                className="flex-1 rounded-xl border px-3 py-2 text-sm text-[#333435] outline-none"
                style={{ borderColor: "rgba(196,170,139,0.25)", background: "#fff" }}
              />
              <button aria-label={t("Add question","أضف سؤالاً")} onClick={addQuestion} disabled={addingQuestion || !newQuestion.trim()}
                className="w-9 h-9 rounded-xl flex items-center justify-center disabled:opacity-40"
                style={{ background: "#c4aa8b" }}>
                {addingQuestion ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Plus className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}