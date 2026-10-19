import { validateUpload } from "@/lib/uploads";
import { format } from "@/lib/customerFormatting";
import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { Camera, ChevronDown, ChevronUp, MessageSquare, Upload, Info, ArrowLeftRight, CheckCircle2, Clock, Eye, EyeOff } from "lucide-react";

import { IlluCamera, IlluPhotoCompare, IlluNoPhotos } from "../illustrations/BatoIllustrations";
import { useLocation } from "@/components/LocationContext";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { ar } from "date-fns/locale";
import CareText from "@/components/CareText";
import CustomerLoadState from "@/components/CustomerLoadState";
import BatoEmptyState from "@/components/ui/BatoEmptyState";
import { selectCareLanguage } from "@/lib/careArabic";

// ─── Config ──────────────────────────────────────────────────────────────────
const CHECKPOINTS = ["Baseline", "Session 1", "Session 3", "Session 6", "Month 6 Review", "Maintenance"];

const ANGLES = {
  front_hairline: "Front Hairline",
  top_scalp: "Top Scalp",
  crown: "Crown",
  left_side: "Left Side",
  right_side: "Right Side",
  close_up: "Close-up",
};

const ANGLES_AR = {
  front_hairline: "خط الشعر الأمامي",
  top_scalp: "أعلى فروة الرأس",
  crown: "التاج",
  left_side: "الجانب الأيسر",
  right_side: "الجانب الأيمن",
  close_up: "لقطة مقرّبة",
};
const angleLabel=(angle,isRTL)=>{const key=angle||"";return (isRTL?ANGLES_AR[key]:ANGLES[key]) || selectCareLanguage(key,isRTL?"ar":"en");};
const CHECKPOINTS_AR={"Baseline":"صور البداية","Session 1":"الجلسة الأولى","Session 3":"الجلسة الثالثة","Session 6":"الجلسة السادسة","Month 6 Review":"مراجعة الشهر السادس","Maintenance":"الحفاظ على النتائج"};
const checkpointLabel=(cp,isRTL)=>isRTL?(CHECKPOINTS_AR[cp] || selectCareLanguage(cp,"ar")):selectCareLanguage(cp,"en");

const WHAT_BATO_WATCHES_AR = [
  "نمط التساقط عبر الجلسات",
  "التغيرات المرئية في الكثافة مع الوقت",
  "تغطية فروة الرأس وملمسها",
  "استجابة خط الشعر والتاج",
  "حالة فروة الرأس بين الزيارات",
  "الاستجابة العامة عبر البرنامج",
];

const WHAT_BATO_WATCHES = [
  "Shedding pattern across sessions",
  "Visible density changes over time",
  "Scalp coverage and texture",
  "Hairline and crown response",
  "Scalp condition between visits",
  "Overall response across the programme",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function groupByCheckpoint(photos) {
  const groups = {};
  CHECKPOINTS.forEach(cp => { groups[cp] = []; });
  photos.forEach(p => {
    const cp = p.checkpoint_name;
    if (cp && groups[cp]) groups[cp].push(p);
    else if (cp) {
      groups[cp] = groups[cp] || [];
      groups[cp].push(p);
    }
  });
  return groups;
}

function AngleBadge({ angle }) {
  const {isRTL}=useLocation();
  return (
    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: "rgba(196,170,139,0.12)", color: "#7c8689" }}>
      {angleLabel(angle,isRTL)}
    </span>
  );
}

// ─── Comparison Mode ─────────────────────────────────────────────────────────
function ComparisonView({ officialPhotos }) {
  const {t,isRTL}=useLocation();
  const checkpointsWithPhotos = [...new Set(officialPhotos.map(p=>p.checkpoint_name).filter(Boolean))].sort((a,b)=>{const rank=cp=>CHECKPOINTS.indexOf(cp)<0?CHECKPOINTS.length:CHECKPOINTS.indexOf(cp);return rank(a)-rank(b);});
  const [leftCp, setLeftCp] = useState(checkpointsWithPhotos[0] || "");
  const [rightCp, setRightCp] = useState(checkpointsWithPhotos[checkpointsWithPhotos.length - 1] || "");
  const [angle, setAngle] = useState(() => officialPhotos.some(p=>p.angle==="front_hairline")?"front_hairline":officialPhotos.find(p=>p.angle)?.angle || "front_hairline");
  const [viewer,setViewer]=useState(null);
  useEffect(()=>{if(!officialPhotos.some(p=>p.angle===angle))setAngle(officialPhotos.find(p=>p.angle)?.angle || "front_hairline");},[officialPhotos,angle]);

  const leftPhoto = officialPhotos.find(p => p.checkpoint_name === leftCp && p.angle === angle);
  const rightPhoto = officialPhotos.find(p => p.checkpoint_name === rightCp && p.angle === angle);

  const availableAngles = [...new Set(officialPhotos.map(p => p.angle).filter(Boolean))];

  if (checkpointsWithPhotos.length < 2) {
  return (
    <div className="text-center py-6">
      <div className="flex justify-center mb-2">
        <IlluPhotoCompare size={60} color="#c4aa8b" />
      </div>
      <p className="text-xs text-[#7c8689]">{t("Comparison requires at least two checkpoints with official photos.","تحتاج المقارنة إلى نقطتَي التقاط على الأقل بصور رسمية.")}</p>
      <p className="text-xs text-[#7c8689] mt-1">{t("Your team will capture photos across sessions for comparison.","سيلتقط فريقك صوراً عبر الجلسات للمقارنة.")}</p>
    </div>
  );
  }

  return (
    <div className="space-y-4">
      {/* Angle selector */}
      {availableAngles.length > 1 && (
        <div className="flex gap-1.5 flex-wrap">
          {availableAngles.map(a => (
            <button key={a} onClick={() => setAngle(a)}
              className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all"
              style={angle === a
                ? { background: "#3a2e1e", color: "#c4aa8b" }
                : { background: "#f9f8f6", color: "#7c8689", border: "1px solid rgba(196,170,139,0.2)" }}>
              {angleLabel(a,isRTL)}
            </button>
          ))}
        </div>
      )}

      {/* Checkpoint selectors */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[11px] text-[#7c8689] mb-1 font-medium">{t("Earlier","أقدم")}</p>
          <select aria-label={t("Earlier checkpoint","نقطة التصوير الأقدم")} value={leftCp} onChange={e => setLeftCp(e.target.value)}
            className="w-full min-h-11 text-sm px-2 py-1.5 rounded-lg border appearance-none"
            style={{ borderColor: "rgba(196,170,139,0.25)", background: "#fff", color: "#333435" }}>
            {checkpointsWithPhotos.map(cp => <option key={cp} value={cp}>{checkpointLabel(cp,isRTL)}</option>)}
          </select>
        </div>
        <div>
          <p className="text-[11px] text-[#7c8689] mb-1 font-medium">{t("Latest","الأحدث")}</p>
          <select aria-label={t("Latest checkpoint","نقطة التصوير الأحدث")} value={rightCp} onChange={e => setRightCp(e.target.value)}
            className="w-full min-h-11 text-sm px-2 py-1.5 rounded-lg border appearance-none"
            style={{ borderColor: "rgba(196,170,139,0.25)", background: "#fff", color: "#333435" }}>
            {checkpointsWithPhotos.map(cp => <option key={cp} value={cp}>{checkpointLabel(cp,isRTL)}</option>)}
          </select>
        </div>
      </div>

      {/* Side-by-side photos */}
      <div className="grid grid-cols-2 gap-2">
        {[{ cp: leftCp, photo: leftPhoto }, { cp: rightCp, photo: rightPhoto }].map(({ cp, photo },index) => (
          <div key={index}>
            <p className="text-[10px] font-semibold text-center mb-1.5" style={{ color: "#7c8689" }}>{checkpointLabel(cp,isRTL)}</p>
            <div className="bato-style-surface aspect-square rounded-xl overflow-hidden"
              style={{ background: "#f9f8f6", border: "1px solid rgba(196,170,139,0.15)" }}>
              {photo ? (
                <button className="w-full h-full" onClick={()=>setViewer(photo)} aria-label={t("Enlarge photo","تكبير الصورة")}><img src={photo.photo_url} alt={`${checkpointLabel(cp,isRTL)} ${angleLabel(angle,isRTL)}`} className="w-full h-full object-contain" /></button>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <Camera className="w-6 h-6" style={{ color: "rgba(196,170,139,0.3)" }} />
                  <p className="text-[11px] text-center px-2" style={{ color: "rgba(124,134,137,0.6)" }}>
                    {isRTL?`لا توجد صورة بزاوية ${angleLabel(angle,true)} عند ${checkpointLabel(cp,true)}`:`No ${angleLabel(angle,false)} photo for ${checkpointLabel(cp,false)}`}
                  </p>
                </div>
              )}
            </div>
            {photo && (
              <div className="mt-1 text-center">
                <AngleBadge angle={photo.angle} />
                {photo.captured_date && (
                  <p className="text-[11px] text-[#7c8689] mt-0.5">{format(photo.captured_date, "MMM d, yyyy",{locale:isRTL?ar:undefined})}</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      <Dialog open={!!viewer} onOpenChange={open=>{if(!open)setViewer(null);}}><DialogContent className="max-w-lg"><DialogTitle>{checkpointLabel(viewer?.checkpoint_name,isRTL)}</DialogTitle>{viewer&&<img src={viewer.photo_url} alt={angleLabel(viewer.angle,isRTL)} className="w-full max-h-[65dvh] object-contain rounded-xl" />}{viewer?.captured_date&&<p className="text-xs text-[#7c8689]">{format(viewer.captured_date,"d MMM yyyy",{locale:isRTL?ar:undefined})}</p>}</DialogContent></Dialog>
      <div className="p-2.5 rounded-lg" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.12)" }}>
        <p className="text-[11px] text-[#7c8689] leading-relaxed">
          {t("Comparison uses official BATO photos only. Choose the same angle; lighting and position may vary.","تستخدم المقارنة صور باتو الرسمية فقط. اختر الزاوية نفسها؛ قد تختلف الإضاءة ووضعية التصوير.")}
        </p>
      </div>
    </div>
  );
}

// ─── Checkpoint Card ──────────────────────────────────────────────────────────
function CheckpointCard({ checkpoint, photos, index, total }) {
  const reduceMotion=useReducedMotion();
  const {t,isRTL}=useLocation();
  const [open, setOpen] = useState(index === 0);
  const [viewer, setViewer] = useState(null);
  const officialPhotos = photos.filter(p => p.photo_source === "official_bato" && p.client_visible);
  const isEmpty = officialPhotos.length === 0;
  const latestNote = officialPhotos.find(p => p.client_facing_note)?.client_facing_note;
  const capturedDate = officialPhotos[0]?.captured_date;

  const statusDot = isEmpty
    ? { color: "rgba(124,134,137,0.3)", label: t("Pending","قيد الالتقاط") }
    : { color: "#c4aa8b", label: `${officialPhotos.length} ${t("photos","صوراً")}` };

  return (
    <div className="bato-style-surface rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.15)", background: "#fff" }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full p-4 flex items-center gap-3 hover:bg-[#fafaf9] transition-colors text-left">
        {/* Step indicator */}
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: isEmpty ? "#f9f8f6" : "rgba(196,170,139,0.15)", border: isEmpty ? "1px solid rgba(196,170,139,0.15)" : "none" }}>
          {isEmpty
            ? <span className="text-[10px] font-bold" style={{ color: "rgba(196,170,139,0.4)" }}>{index + 1}</span>
            : <CheckCircle2 className="w-4 h-4" style={{ color: "#c4aa8b" }} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[#333435]">{checkpointLabel(checkpoint,isRTL)}</p>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
              style={isEmpty
                ? { background: "#f9f8f6", color: "rgba(124,134,137,0.6)" }
                : { background: "rgba(196,170,139,0.12)", color: "#c4aa8b" }}>
              {statusDot.label}
            </span>
          </div>
          {capturedDate && (
            <p className="text-[11px] text-[#7c8689] mt-0.5">{format(capturedDate, "MMM d, yyyy",{locale:isRTL?ar:undefined})}</p>
          )}
          {isEmpty && (
            <p className="text-[11px] text-[#7c8689] mt-0.5">{t("Photo check-in pending — may be captured during your next visit","التقاط الصور قيد الانتظار، وقد يتم خلال زيارتك القادمة")}</p>
          )}
        </div>

        {open ? <ChevronUp className="w-4 h-4 text-[#7c8689] flex-shrink-0" />
               : <ChevronDown className="w-4 h-4 text-[#7c8689] flex-shrink-0" />}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid rgba(196,170,139,0.1)" }}>
              {isEmpty ? (
                <div className="py-4 text-center">
                        <div className="flex justify-center mb-2">
                          <IlluNoPhotos size={52} color="#c4aa8b" />
                        </div>
                        <p className="text-xs text-[#7c8689]">{t("No official photos captured yet for this checkpoint.","لم تُلتقط صور رسمية بعد لهذه النقطة.")}</p>
                        <p className="text-xs text-[#7c8689] mt-0.5">{t("Your team may capture these during your next clinic visit.","قد يلتقطها فريقك خلال زيارتك القادمة للعيادة.")}</p>
                      </div>
              ) : (
                <div className="space-y-3 pt-2">
                  {/* Photo grid by angle */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {officialPhotos.map((photo, i) => (
                      <div key={photo.id || i} className="space-y-1">
                        <div className="aspect-square rounded-xl overflow-hidden"
                          style={{ border: "1px solid rgba(196,170,139,0.12)" }}>
                          <button type="button" onClick={()=>setViewer(photo)} className="w-full h-full block" aria-label={t("Enlarge photo","تكبير الصورة")}>
                            <img src={photo.photo_url} alt={`${checkpointLabel(checkpoint,isRTL)} ${angleLabel(photo.angle,isRTL)}`}
                              className="w-full h-full object-contain" />
                          </button>
                        </div>
                        {photo.angle && <div className="flex justify-center"><AngleBadge angle={photo.angle} /></div>}
                      </div>
                    ))}
                  </div>

                  <Dialog open={!!viewer} onOpenChange={o=>{if(!o)setViewer(null);}}>
                    <DialogContent className="max-w-lg">
                      <DialogTitle className="text-sm">{checkpointLabel(viewer?.checkpoint_name,isRTL)}{viewer?.angle?` · ${angleLabel(viewer.angle,isRTL)}`:""}</DialogTitle>
                      {viewer && <img src={viewer.photo_url} alt={`${checkpointLabel(viewer.checkpoint_name,isRTL)} ${angleLabel(viewer.angle,isRTL)}`} className="w-full rounded-xl" />}
                      {viewer?.captured_date && <p className="text-xs text-[#7c8689]">{format(viewer.captured_date,"MMM d, yyyy",{locale:isRTL?ar:undefined})}</p>}
                    </DialogContent>
                  </Dialog>

                  {/* Angle coverage */}
                  <div className="flex flex-wrap gap-1">
                    {Object.entries(ANGLES).map(([key, label]) => {
                      const has = officialPhotos.some(p => p.angle === key);
                      if (!has) return null;
                      return (
                        <span key={key} className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                          style={{ background: "rgba(196,170,139,0.1)", color: "#7c8689" }}>
                          ✓ {angleLabel(key,isRTL)}
                        </span>
                      );
                    })}
                  </div>

                  {/* Client-facing note */}
                  {latestNote && (
                    <div className="p-2.5 rounded-lg" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
                      <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: "#c4aa8b" }}>{t("Team Note","ملاحظة الفريق")}</p>
                      <p className="text-xs text-[#333435] leading-relaxed italic"><CareText value={latestNote} prose /></p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Client Upload Section ────────────────────────────────────────────────────
function ClientUploadsSection({ clientPhotos, userEmail, onUploaded }) {
  const {t,isRTL}=useLocation();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef();

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadError("");
    if(validateUpload(file,{photoOnly:true,count:clientPhotos.length,limit:1000})){setUploadError(t("Choose a supported photo smaller than 10 MB.","اختر صورة بصيغة مدعومة وحجم أقل من 10 ميغابايت.")); e.target.value=""; return;}
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.entities.ProgressPhoto.create({
        client_email: userEmail,
        journey_type: "hair",
        photo_url: file_url,
        photo_source: "client_upload",
        status: "awaiting_review",
        client_upload_status: "uploaded_by_client",
        client_visible: true,
        captured_date: new Date().toISOString().split("T")[0],
      });
      onUploaded();
    } catch {
      setUploadError(t("Your photo could not be saved. Please try again.","تعذر حفظ صورتك. يرجى المحاولة مجدداً."));
    } finally {
      e.target.value="";
      setUploading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Explanation */}
      <div className="p-3 rounded-xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.12)" }}>
        <p className="text-xs font-semibold text-[#333435] mb-1">{t("Client Uploads","صور العميل")}</p>
        <p className="text-[11px] text-[#7c8689] leading-relaxed">
          {t("You can upload photos between visits to help your team understand concerns. Official progress comparisons are based on BATO-reviewed photos only.","يمكنك رفع صور بين الزيارات لمساعدة فريقك على فهم ما يشغلك. مقارنات التقدم الرسمية تعتمد على صور مراجَعة من باتو فقط.")}
        </p>
      </div>

      {/* Upload button */}
      <button onClick={() => fileRef.current?.click()}
        disabled={uploading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-sm font-medium transition-all"
        style={{ borderColor: "rgba(196,170,139,0.3)", color: "#7c8689", background: uploading ? "#f9f8f6" : "transparent" }}>
        <Upload className="w-4 h-4" />
        {uploading ? t("Uploading…","جارٍ الرفع…") : t("Upload a reference photo","ارفع صورة مرجعية")}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />

      {uploadError && <p role="alert" className="text-sm text-red-700">{uploadError}</p>}
      {/* Client photos grid */}
      {clientPhotos.length > 0 ? (
        <div className="space-y-2">
          {clientPhotos.map((photo, i) => (
            <div key={photo.id || i} className="bato-style-surface flex gap-3 p-2.5 rounded-xl"
              style={{ background: "#f9f8f6", border: "1px solid rgba(196,170,139,0.1)" }}>
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img src={photo.photo_url} alt="Reference" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                    style={photo.client_upload_status === "approved_comparison"
                      ? { background: "rgba(196,170,139,0.15)", color: "#3a2e1e" }
                      : photo.client_upload_status === "not_suitable"
                      ? { background: "rgba(124,134,137,0.1)", color: "#7c8689" }
                      : { background: "rgba(231,203,80,0.08)", color: "#7c8689" }}>
                    {photo.client_upload_status === "uploaded_by_client" ? t("Awaiting BATO Review","بانتظار مراجعة باتو")
                      : photo.client_upload_status === "awaiting_bato_review" ? t("Awaiting BATO Review","بانتظار مراجعة باتو")
                      : photo.client_upload_status === "approved_reference" ? t("Approved as Reference","معتمدة كمرجع")
                      : photo.client_upload_status === "approved_comparison" ? t("Approved for Comparison","معتمدة للمقارنة")
                      : photo.client_upload_status === "not_suitable" ? t("Saved as Reference","محفوظة كمرجع")
                      : t("Uploaded","تم الرفع")}
                  </span>
                </div>
                {photo.client_upload_status === "not_suitable" && (
                  <p className="text-[11px] text-[#7c8689] mt-1 leading-relaxed">
                    {t("This photo is saved as a reference, but it will not be used for official progress comparison.","هذه الصورة محفوظة كمرجع، لكنها لن تُستخدم في مقارنة التقدم الرسمية.")}
                  </p>
                )}
                {photo.captured_date && (
                  <p className="text-[10px] text-[#7c8689] mt-1">{format(photo.captured_date, "d MMM yyyy", {locale:isRTL?ar:undefined})}</p>
                )}
                {photo.angle && <AngleBadge angle={photo.angle} />}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-center text-[#7c8689] py-2">{t("No uploads yet.","لم ترفع صوراً بعد.")}</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ProgressPhotoTimeline({ userEmail, sessions = [], onAskTeam }) {
  const {t,isRTL}=useLocation();
  const reduceMotion=useReducedMotion();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("official");
  const [showComparison, setShowComparison] = useState(false);
  const [showHowToRead, setShowHowToRead] = useState(false);

  const { data: allPhotos = [], isPending, isError } = useQuery({
    queryKey: ["progressPhotos", userEmail],
    queryFn: () => base44.entities.ProgressPhoto.filter({ client_email: userEmail, journey_type: "hair" }, "-captured_date"),
    enabled: !!userEmail,
  });

  const officialPhotos = allPhotos.filter(p => p.photo_source === "official_bato" && p.client_visible);
  const clientPhotos = allPhotos.filter(p => p.photo_source === "client_upload");
  const grouped = groupByCheckpoint(officialPhotos);
  const hasOfficial = officialPhotos.length > 0;
  const hasBaseline = (grouped["Baseline"] || []).length > 0;
  const hasProgress = officialPhotos.some(p => p.checkpoint_name !== "Baseline");

  const checkpointOrder=[...CHECKPOINTS,...Object.keys(grouped).filter(cp=>!CHECKPOINTS.includes(cp))];
  if(isError)return <CustomerLoadState error />;
  if(isPending && userEmail)return <CustomerLoadState />;

  // Determine state message
  const stateMsg = !hasOfficial
    ? { title: t("No official progress photos shared yet","لم تُشارك صور تقدم رسمية بعد"), body: t("Your progress photos will appear here once your BATO team captures and shares them during or after a clinic visit.","ستظهر صور تقدمك هنا بعد أن يلتقطها فريق باتو ويشاركها خلال زيارة للعيادة أو بعدها.") }
    : hasBaseline && !hasProgress
    ? { title: t("Baseline captured","تم التقاط خط الأساس"), body: t("Your first progress comparison will appear after your next photo check-in with the team.","ستظهر أول مقارنة تقدم بعد التقاط الصور القادم مع الفريق.") }
    : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <IlluPhotoCompare size={44} color="#c4aa8b" />
            </div>
            <div>
              <h3 className="font-semibold text-[#333435] text-sm">{t("Progress Photo Timeline","مسار صور التقدم")}</h3>
              <p className="text-[11px] text-[#7c8689]">{t("Track your visual progress across BATO photo check-ins.","تابع تقدمك المرئي عبر صور المتابعة في باتو.")}</p>
            </div>
          </div>
          {hasOfficial && (
            <button onClick={() => setShowComparison(s => !s)}
              className="flex-shrink-0 flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1.5 rounded-full transition-all"
              style={showComparison
                ? { background: "#3a2e1e", color: "#c4aa8b" }
                : { background: "rgba(196,170,139,0.12)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.2)" }}>
              <ArrowLeftRight className="w-3 h-3" />
              {t("Compare","قارن")}
            </button>
          )}
        </div>
      </div>

      {/* Official BATO Photos explanation */}
      <div className="p-3 rounded-xl" style={{ background: "linear-gradient(135deg, rgba(58,46,30,0.04) 0%, rgba(196,170,139,0.06) 100%)", border: "1px solid rgba(196,170,139,0.15)" }}>
        <p className="text-[11px] font-semibold text-[#3a2e1e] mb-0.5">{t("Official BATO Progress Photos","صور باتو الرسمية للتقدم")}</p>
        <p className="text-[11px] text-[#7c8689] leading-relaxed">
          {t("Your timeline uses photos captured or approved by the BATO team. Compare the same angle and check each capture date; lighting and position may vary.","يستخدم مسار تقدمك صوراً التقطها فريق باتو أو اعتمدها. قارن الزاوية نفسها وراجع تاريخ كل صورة؛ قد تختلف الإضاءة ووضعية التصوير.")}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
        {[
          { key: "official", label: `${t("Official BATO Photos","صور باتو الرسمية")}${hasOfficial ? ` (${officialPhotos.length})` : ""}` },
          { key: "client", label: `${t("Client Uploads","صور العميل")}${clientPhotos.length > 0 ? ` (${clientPhotos.length})` : ""}` },
        ].map(tab => (
          <button key={tab.key} onClick={() => { setActiveTab(tab.key); setShowComparison(false); }}
            className="flex-1 min-h-11 text-xs font-semibold py-2 transition-all"
            style={activeTab === tab.key
              ? { background: "#3a2e1e", color: "#c4aa8b" }
              : { background: "#f9f8f6", color: "#7c8689" }}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Comparison mode */}
      <AnimatePresence>
        {showComparison && activeTab === "official" && (
          <motion.div key="cmp" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{duration:reduceMotion?0:0.22}} className="overflow-hidden">
            <div className="bg-white rounded-2xl border p-4" style={{ borderColor: "rgba(196,170,139,0.15)" }}>
              <p className="text-xs font-semibold text-[#333435] mb-3 flex items-center gap-2">
                <ArrowLeftRight className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                {t("Side-by-Side Comparison","مقارنة جنباً إلى جنب")}
              </p>
              <ComparisonView officialPhotos={officialPhotos} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Official tab content */}
      {activeTab === "official" && (
        <div className="space-y-3">
          {!hasOfficial ? (
            <div className="bg-white rounded-2xl border p-6 text-center" style={{ borderColor: "rgba(196,170,139,0.15)" }}>
              <div className="flex justify-center mb-3">
                <IlluNoPhotos size={72} color="#c4aa8b" />
              </div>
              <BatoEmptyState tone="plain" title={stateMsg.title} description={stateMsg.body} />
            </div>
          ) : (
            checkpointOrder.map((cp, i) => (
              <CheckpointCard key={cp} checkpoint={cp} photos={grouped[cp] || []} index={i} total={checkpointOrder.length} />
            ))
          )}
        </div>
      )}

      {/* Client uploads tab */}
      {activeTab === "client" && (
        <ClientUploadsSection
          clientPhotos={clientPhotos}
          userEmail={userEmail}
          onUploaded={() => queryClient.invalidateQueries({ queryKey: ["progressPhotos", userEmail] })}
        />
      )}

      {/* How to read progress */}
      <div className="bg-white rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.15)" }}>
        <button onClick={() => setShowHowToRead(s => !s)}
          className="w-full flex items-center justify-between p-4 hover:bg-[#fafaf9] transition-colors">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 flex-shrink-0" style={{ color: "#c4aa8b" }} />
            <p className="text-sm font-semibold text-[#333435]">{t("How to read progress","كيف تقرأ التقدم")}</p>
          </div>
          {showHowToRead ? <ChevronUp className="w-4 h-4 text-[#7c8689]" /> : <ChevronDown className="w-4 h-4 text-[#7c8689]" />}
        </button>
        <AnimatePresence initial={false}>
          {showHowToRead && (
            <motion.div key="htr" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} className="overflow-hidden">
              <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(196,170,139,0.1)" }}>
                <p className="text-xs text-[#7c8689] leading-relaxed mt-3 mb-3">
                  {t("Hair progress is reviewed across months, not days. Your BATO team compares consistent photos over time to monitor density, coverage, scalp response, and visible changes.","يُراجع تقدم الشعر عبر شهور لا أيام. يقارن فريق باتو صوراً ثابتة مع الوقت لمراقبة الكثافة والتغطية واستجابة فروة الرأس والتغيرات المرئية.")}
                </p>
                <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: "#c4aa8b" }}>{t("What BATO watches","ما يراقبه باتو")}</p>
                <ul className="space-y-1.5">
                  {WHAT_BATO_WATCHES.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ background: "#c4aa8b" }} />
                      <p className="text-xs text-[#333435]">{isRTL?WHAT_BATO_WATCHES_AR[i]:item}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ask Hair Team */}
      <button onClick={onAskTeam}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
        style={{ background: "rgba(196,170,139,0.1)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.25)" }}>
        <MessageSquare className="w-4 h-4" />
        {t("Ask my specialist about my photos","اسأل أخصائيك عن صورك")}
      </button>
    </div>
  );
}