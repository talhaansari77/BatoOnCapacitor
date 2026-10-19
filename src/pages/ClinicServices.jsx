import React, { useId, useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { ChevronDown, ChevronUp, MessageSquare, Sparkles, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "../components/LocationContext";
import { useNavigate } from "react-router-dom";
import { BATO_SERVICE_DEPARTMENTS, serviceInquiryUrl, serviceAppointmentUrl } from "@/lib/batoServices";

const DEPARTMENTS = BATO_SERVICE_DEPARTMENTS.map(dept => ({
  ...dept, name: dept.nameEn, tagline: dept.taglineEn, subtitle: dept.subtitleEn,
  sections: dept.sections.map(section => ({
    ...section, name: section.nameEn,
    services: section.services.map(service => ({
      ...service, name: service.nameEn, desc: service.previewEn, detail: service.fullEn,
    })),
  })),
}));

function ServiceCard({ service }) {
  const [open, setOpen] = useState(false);
  const id=useId();
  const { t, isRTL } = useLocation();
  const navigate = useNavigate();
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(196,170,139,0.15)" }}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)} className="w-full flex items-start justify-between gap-3 p-4 text-start hover:bg-[#faf9f7] transition-colors" style={{ background: "#f9f8f6" }}>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#333435]">{isRTL ? service.nameAr : service.name}</p>
          <p className="text-xs text-[#7c8689] leading-relaxed mt-0.5">{isRTL ? service.previewAr : service.desc}</p>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-[#7c8689] flex-shrink-0 mt-0.5" /> : <ChevronDown className="w-4 h-4 text-[#7c8689] flex-shrink-0 mt-0.5" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={id} key="detail" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-3 bg-white" style={{ borderTop: "1px solid rgba(196,170,139,0.12)" }}>
              <p className="text-sm text-[#7c8689] leading-relaxed mb-3">{isRTL ? service.fullAr : service.detail}</p>
              <Button onClick={() => navigate(serviceInquiryUrl(service))} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold border-0" style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />{t("Connect with an advisor", "تواصل مع مرشد")}
              </Button>
              <Button variant="outline" onClick={() => navigate(serviceAppointmentUrl(service))} className="w-full mt-2 rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold border-[#c4aa8b] text-[#3a2e1e]">
                {t("Request an Appointment", "اطلب موعداً")}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SectionGroup({ section }) {
  const [open, setOpen] = useState(false);
  const id=useId();
  const { t, isRTL } = useLocation();
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(196,170,139,0.2)" }}>
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#f9f8f6] transition-colors bg-white text-start">
        <p className="text-sm font-semibold text-[#3a2e1e] min-w-0">{isRTL ? section.nameAr : section.name}</p>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-[#7c8689]">{isRTL ? "الخدمات: " + section.services.length : section.services.length + " services"}</span>
          {open ? <ChevronUp className="w-4 h-4 text-[#7c8689]" /> : <ChevronDown className="w-4 h-4 text-[#7c8689]" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={id} key="sec" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="p-3 space-y-2" style={{ background: "#f9f8f6", borderTop: "1px solid rgba(196,170,139,0.12)" }}>
              {section.services.map(s => <ServiceCard key={s.name} service={s} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DepartmentCard({ dept }) {
  const [open, setOpen] = useState(false);
  const id=useId();
  const Icon = dept.icon;
  const { isRTL } = useLocation();
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#eeebe6] overflow-hidden">
      <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)} className="w-full p-5 text-start hover:bg-[#faf9f7] transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(196,170,139,0.12)" }}>
              <Icon className="w-5 h-5" style={{ color: "#c4aa8b" }} />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-[#333435]">{isRTL ? dept.nameAr : dept.name}</p>
              <p className="text-xs font-medium" style={{ color: "#8f7252" }}>{isRTL ? dept.taglineAr : dept.tagline}</p>
              <p className="text-xs text-[#7c8689]">{isRTL ? dept.subtitleAr : dept.subtitle}</p>
            </div>
          </div>
          {open ? <ChevronUp className="w-5 h-5 text-[#7c8689] flex-shrink-0 mt-1" /> : <ChevronDown className="w-5 h-5 text-[#7c8689] flex-shrink-0 mt-1" />}
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={id} key="dept" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="px-4 pb-5 space-y-2.5" style={{ borderTop: "1px solid rgba(196,170,139,0.15)" }}>
              <div className="pt-3" />
              {dept.sections.map(sec => <SectionGroup key={sec.name} section={sec} />)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ClinicServices() {
  const { isRTL, t } = useLocation();
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-start"}`} style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[#3a2e1e]">{t("Services", "الخدمات")}</h1>
          <p className="text-xs text-[#7c8689]">{t("The complete BATO service offering", "جميع خدمات باتو")}</p>
        </div>

        {/* Intro card */}
        <div className="bato-style-hero relative overflow-hidden rounded-3xl p-6 shadow-xl" style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 55%, #2e2418 100%)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 80% 10%, rgba(231,203,80,0.09) 0%, transparent 50%)" }} />
          <div className="relative z-10">
            <p className="text-[10px] font-semibold tracking-widest uppercase mb-1" style={{ color: "rgba(196,170,139,0.7)" }}>{t("BATO Clinic","عيادة باتو")}</p>
            <h2 className="text-white font-bold text-lg mb-2">{t("Two Departments. One Standard.", "قسمان. معيار واحد.")}</h2>
            <p className="text-sm leading-relaxed" style={{ color: "rgba(238,235,230,0.65)" }}>
              {t("Every BATO service is delivered by qualified professionals with a clinical-first approach. Explore our full offering below.", "يقدم مختصون مؤهلون خدمات باتو، ونبدأ بتقييم الحالة قبل العلاج. تعرّف على خدماتنا أدناه.")}
            </p>
          </div>
        </div>

        {DEPARTMENTS.map(dept => <DepartmentCard key={dept.id} dept={dept} />)}

        {/* CTA */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#eeebe6] text-center">
          <p className="text-sm font-semibold text-[#333435] mb-1">{t("Not sure where to start?", "لست متأكداً من أين تبدأ؟")}</p>
          <p className="text-xs text-[#7c8689] mb-4">{t("The BATO team can help you identify the right treatment path.", "يمكن لفريق باتو مساعدتك في تحديد مسار العلاج المناسب.")}</p>
          <Button onClick={() => navigate("/Messages?channel=advisors&context=service_inquiry")} className="w-full rounded-xl h-10 font-semibold border-0" style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
            <MessageSquare className="w-4 h-4 mr-2" />{t("Connect with an advisor", "تواصل مع مرشد")}
          </Button>
        </div>

      </div>
    </div>
  );
}