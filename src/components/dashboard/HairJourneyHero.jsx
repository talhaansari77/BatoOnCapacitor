import HairProgressRing from "@/components/hairjourney/HairProgressRing";
import {useNavigate, Link} from "react-router-dom";
import { createPageUrl } from "@/utils";
import {formatAppointment} from "@/lib/appointments";
import { format } from "@/lib/customerFormatting";
import CareText from "@/components/CareText";
import {programCounts} from "@/lib/carePrograms";
import {ar} from "date-fns/locale";
import React, { useState, useId } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight, CircleHelp, ClipboardList, Users, History } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";


const STAGE_LABELS = {
  initial_consultation: { en: "Assessment", ar: "التقييم" },
  treatment_planned: { en: "Planning", ar: "التخطيط" },
  in_treatment: { en: "Activation Phase", ar: "مرحلة بدء العلاج" },
  post_treatment: { en: "Recovery Phase", ar: "مرحلة التعافي" },
  completed: { en: "Maintenance Phase", ar: "مرحلة الحفاظ على النتائج" },
};

const STAGE_EXPLANATIONS = {
  initial_consultation: { en: "Your initial assessment is being completed.", ar: "يجري إتمام تقييمك الأولي." },
  treatment_planned:   { en: "Your personalised treatment plan is being prepared.", ar: "يجري إعداد خطة علاجك الشخصية." },
  in_treatment:        { en: "Your recorded care stage is active treatment. Follow the instructions in your care plan.", ar: "مرحلة الرعاية المسجلة هي العلاج النشط. اتبع تعليمات خطة العناية." },
  post_treatment:      { en: "Your recorded care stage is post-treatment review.", ar: "مرحلة الرعاية المسجلة هي مراجعة ما بعد العلاج." },
  completed:           { en: "You've completed your programme. We'll support you long-term.", ar: "أتممت برنامجك. سندعمك على المدى البعيد." },
};

export default function HairJourneyHero({ user, activePackage, caseFile, onBookSession, upcomingAppointments = [], isRTL, t }) {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const explanationId = useId();
  const [showPhaseExplain, setShowPhaseExplain] = useState(false);
  const {progress, remaining, used, total} = programCounts(activePackage);
  const stageLabel = (isRTL ? STAGE_LABELS[caseFile?.case_status]?.ar : STAGE_LABELS[caseFile?.case_status]?.en)
    || t("Treatment details pending", "بانتظار تحديث تفاصيل العلاج");
  const nextApt = upcomingAppointments?.[0];
  const recDate = activePackage?.next_recommended_date;
  const dateValue = nextApt?.appointment_date
    ? formatAppointment(nextApt, "d MMM yyyy · h:mm a", {locale:isRTL?ar:undefined})
    : recDate ? format(recDate, "d MMM yyyy", {locale:isRTL?ar:undefined}) : null;
  const links = [
    {to:"/HairJourney#care-program", icon:ClipboardList, label:t("Care plan & instructions", "خطة العناية والتعليمات"), short:t("Care plan", "خطة العناية")},
    {to:"/ClinicTeam", icon:Users, label:t("Your care team", "فريق رعايتك"), short:t("Care team", "فريق الرعاية")},
    {to:"/HairJourney#progress-history", icon:History, label:t("Progress history", "سجل التقدم"), short:t("Progress", "التقدم")}
  ];
  return (
    <motion.section
      aria-label={t("Your Hair Journey", "رحلة علاج شعرك")}
      dir={isRTL ? "rtl" : "ltr"}
      initial={reduceMotion ? false : {opacity:0,y:-12}}
      animate={reduceMotion ? undefined : {opacity:1,y:0}}
      className="bato-style-hero bato-hair-hero relative overflow-hidden rounded-3xl p-5 min-[360px]:p-6 shadow-xl text-start"
      style={{background:"linear-gradient(135deg, #3a2e1e 0%, #3e352c 60%, #2e2418 100%)"}}
    >
      <header className="grid grid-cols-[minmax(0,1fr)_40px] items-center gap-4">
        <div className="min-w-0">
          <p className="text-[#c4aa8b]/80 text-xs font-medium uppercase leading-5 mb-1" style={{letterSpacing:isRTL?undefined:"0.1em"}}>
            {t("Your Hair Journey", "رحلة علاج شعرك")}
          </p>
          <h2 className="text-white text-2xl leading-8 font-bold break-words">{user?.full_name?.split(" ")[0] || t("Welcome", "مرحباً")}</h2>
        </div>
        <Avatar className="w-10 h-10 ring-1 ring-[#c4aa8b]/30">
          <AvatarImage src={user?.profile_photo} alt="" />
          <AvatarFallback className="bato-hero-avatar font-semibold text-base bg-[#c4aa8b] text-[#3a2e1e]">{user?.full_name?.charAt(0) || user?.email?.charAt(0)}</AvatarFallback>
        </Avatar>
      </header>

      <div className="grid grid-cols-[80px_minmax(0,1fr)] min-[360px]:grid-cols-[88px_minmax(0,1fr)] gap-4 items-center mt-6">
        <HairProgressRing progress={progress} total={total} t={t} />
        <div className="min-w-0">
          <p className="text-white text-lg leading-7 font-semibold break-words"><CareText value={activePackage?.package_name || t("Your hair care","عناية شعرك")} /></p>
          <p className="text-sm leading-6 mt-1 text-[#c4aa8b]/85">{activePackage?<>{t("Session","الجلسة")} {used} {t("of","من")} {total}</>:t("No active program yet","لا يوجد برنامج نشط")}</p>
        </div>
      </div>

      {activePackage ? <>
        <button type="button" onClick={()=>setShowPhaseExplain(v=>!v)} aria-expanded={showPhaseExplain} aria-controls={explanationId}
          className="grid grid-cols-[6px_minmax(0,1fr)_16px] gap-3 items-center w-full min-h-11 mt-4 py-2 text-start rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4aa8b]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c4aa8b]" aria-hidden="true" />
          <span className="text-sm leading-6 text-white/60"><CareText value={stageLabel} /></span>
          <CircleHelp className="w-4 h-4 text-[#c4aa8b]/70" aria-hidden="true" />
        </button>
        <AnimatePresence>{showPhaseExplain&&<motion.p id={explanationId} initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} exit={{opacity:0,height:0}}
          className="text-sm leading-6 text-[#c4aa8b]/80 overflow-hidden">
          {isRTL?STAGE_EXPLANATIONS[caseFile?.case_status]?.ar || "سيضيف الفريق تفاصيل المرحلة العلاجية إلى ملفك.":STAGE_EXPLANATIONS[caseFile?.case_status]?.en || "Your team will add the treatment stage details to your file."}
        </motion.p>}</AnimatePresence>
        <Button onClick={nextApt?()=>navigate("/ClinicAppointments?appointment="+encodeURIComponent(nextApt.id)):remaining>0?onBookSession:()=>navigate("/Messages?channel=hair_team")}
          aria-label={nextApt?t("View your appointment","عرض موعدك"):undefined}
          className="bato-press w-full rounded-xl min-h-12 h-auto whitespace-normal text-sm leading-6 px-4 py-3 gap-2 font-semibold border-0 mt-4 bg-[#c4aa8b] text-[#3a2e1e] hover:bg-[#d0b797]">
          <Calendar className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>{nextApt?(nextApt.status==="requested"?t("Request awaiting confirmation","طلب بانتظار التأكيد"):t("View appointment","عرض الموعد")):remaining>0?t(`Request Session ${used+1}`,`اطلب الجلسة ${used+1}`):t("Discuss your next step","ناقش خطوتك التالية")}</span>
        </Button>
        {dateValue?<div className="bato-hair-next-date flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mt-3">
          <p className="text-xs leading-5 text-[#c4aa8b]/80">{nextApt?t("Next session","الجلسة التالية"):t("Next recommended","الخطوة التالية المقترحة")}</p>
          <p className="text-sm leading-6 text-[#c4aa8b] tabular-nums"><bdi>{dateValue}</bdi></p>
        </div>:remaining>0?<p className="mt-3 text-sm leading-6 text-[#c4aa8b]/80">{t("Next session not scheduled yet","لم تُحدد الجلسة التالية بعد")}</p>:null}
        <nav aria-label={t("Hair care links","روابط عناية الشعر")} className="bato-hair-shortcuts mt-5 border-t border-white/10 pt-3">
          {links.map(({to,icon:Icon,label,short})=><Link key={to} to={to} aria-label={label} className="bato-hair-shortcut text-[#c4aa8b]/90">
            <Icon className="w-5 h-5" aria-hidden="true" /><span>{short}</span>
          </Link>)}
        </nav>
      </>:<Link to={createPageUrl("HairJourney")} className="flex items-center justify-between gap-3 min-h-11 mt-5 text-sm text-[#c4aa8b]">
        {t("Explore hair care","استكشف عناية الشعر")}<ChevronRight className="w-4 h-4 shrink-0 rtl:rotate-180" />
      </Link>}
    </motion.section>
  );
}
