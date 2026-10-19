import { useLocation } from "../LocationContext";
import { translateCareText } from "@/lib/careArabic";
import React, {useState,useRef} from "react";
import { motion } from "@/components/motion/BatoMotion";
import { CalendarCheck, Compass } from "lucide-react";
import { ScreenTitle } from "./OnboardingUI";
import { WelcomeIllustration } from "./OnboardingIllustrations";

export default function PathSelector({ onSelect }) {
  const {isRTL,t} = useLocation();
  const busy=useRef(false);
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState("");
  const select=async path=>{
    if(busy.current)return;
    busy.current=true;setSaving(true);setError("");
    try {await onSelect(path);}
    catch {setError(t("We could not save your choice. Please try again.","تعذر حفظ اختيارك. حاول مرة أخرى."));}
    finally {busy.current=false;setSaving(false);}
  };
  const c = value => isRTL ? translateCareText(value) : value;
  const paths = [
    {
      key: "booked_client",
      icon: CalendarCheck,
      label: "I already have an appointment",
      description: "Help your team prepare before you arrive. Takes 5–8 minutes.",
      tag: "Booked",
    },
    {
      key: "explorer",
      icon: Compass,
      label: "I'm exploring BATO",
      description: "Answer a few quick questions and we'll guide you to the right first step.",
      tag: "Exploring",
    },
  ];

  return (
    <div>
      <div className="mb-4 -mx-1">
        <WelcomeIllustration />
      </div>

      <div className="mb-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3"
          style={{ background: "rgba(58,46,30,0.06)", border: "1px solid rgba(196,170,139,0.2)" }}>
          <div className="w-4 h-4 rounded flex items-center justify-center" style={{ background: "#3a2e1e" }}>
            <span className="text-[8px] font-bold" style={{ color: "#c4aa8b" }}>B</span>
          </div>
          <span className="text-[10px] font-semibold text-[#7c8689] tracking-wide uppercase">{isRTL ? "عيادة باتو" : "BATO Clinic"}</span>
        </div>
        <h1 className="text-2xl font-bold text-[#333435] mb-2">{c("Your care starts here.")}</h1>
        <p className="text-sm text-[#7c8689] leading-relaxed max-w-xs mx-auto">
          {c("Before your first visit, we'd like to understand you \u2014 so your time with us is focused, personal, and useful.")}
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wider text-[#7c8689] mb-3 text-center">{c("Which describes you?")}</p>

      <div className="space-y-3 mb-5">
        {paths.map((p, i) => {
          const Icon = p.icon;
          return (
            <motion.button
              key={p.key}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              disabled={saving} aria-busy={saving} onClick={() => select(p.key)}
              className="w-full flex items-start gap-4 p-5 rounded-2xl border bg-white text-start hover:shadow-md transition-all"
              style={{ borderColor: "rgba(196,170,139,0.25)" }}
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,170,139,0.1)" }}>
                <Icon className="w-5 h-5" style={{ color: "#c4aa8b" }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#333435] mb-0.5">{c(p.label)}</p>
                <p className="text-xs text-[#7c8689] leading-relaxed">{c(p.description)}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {error && <p role="alert" className="text-sm text-red-700 mb-3">{error}</p>}
      {saving && <p role="status" className="text-sm mb-3">{t("Saving your choice…","جارٍ حفظ اختيارك…")}</p>}
      <p className="text-center text-[11px] text-[#7c8689] leading-relaxed">
        {t("Your progress is saved when you continue.","يُحفظ تقدمك عند الضغط على متابعة.")}<br />{c("You can continue anytime before your visit.")}
      </p>
    </div>
  );
}