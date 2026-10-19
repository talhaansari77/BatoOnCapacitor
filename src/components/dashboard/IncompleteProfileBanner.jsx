import { useLocation } from "../LocationContext";
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "@/components/motion/BatoMotion";
import { ArrowRight, ClipboardList } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { isToday } from "date-fns";

export default function IncompleteProfileBanner({ userEmail }) {
  const { t } = useLocation();
  const [show, setShow] = useState(false);
  const [isToday_, setIsToday_] = useState(false);

  useEffect(() => {
    if (!userEmail) return;
    checkProfile();
  }, [userEmail]);

  const checkProfile = async () => {
    try {
      const profiles = await base44.entities.BATOProfile.filter({ client_email: userEmail });
      if (!profiles.length || profiles[0].completed) return;

      setShow(true);

      // Check if they have an appointment today
      const appointments = await base44.entities.Appointment.filter({ client_email: userEmail });
      const hasToday = appointments.some(a => {
        try { return isToday(new Date(a.appointment_date)); } catch { return false; }
      });
      setIsToday_(hasToday);
    } catch (e) {
      console.error("IncompleteProfileBanner checkProfile error:", e);
    }
  };

  if (!show) return null;

  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <Link to={createPageUrl("Onboarding")}>
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border"
          style={{
            background: isToday_ ? "rgba(58,46,30,0.05)" : "rgba(196,170,139,0.08)",
            borderColor: isToday_ ? "#c4aa8b" : "rgba(196,170,139,0.3)",
          }}
        >
          <div
            className="bato-style-emblem w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "#3a2e1e" }}
          >
            <ClipboardList className="w-4 h-4" style={{ color: "#c4aa8b" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#333435]">
              {isToday_ ? t("Complete before you arrive", "أكمل ملفك قبل وصولك") : t("Complete your BATO Profile", "أكمل ملفك لدى باتو")}
            </p>
            <p className="text-xs text-[#7c8689] mt-0.5">
              {isToday_
                ? t("Your team can prepare better if your BATO Profile is completed before your visit.", "إكمال ملفك قبل الزيارة يساعد فريقك على الاستعداد بشكل أفضل.")
                : t("Help your team prepare properly before your visit.", "ساعد فريقك على الاستعداد لزيارتك.")}
            </p>
          </div>
          <div
            className="bato-style-hero flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold"
            style={{ background: "#3a2e1e", color: "#c4aa8b" }}
          >
            {isToday_ ? t("Finish Now", "أكمل الآن") : t("Continue Profile", "تابع إكمال الملف")}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}