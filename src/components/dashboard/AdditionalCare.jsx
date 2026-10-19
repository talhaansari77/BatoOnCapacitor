import React from "react";
import { motion } from "@/components/motion/BatoMotion";
import { Sparkles, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";

const ADDITIONAL_TYPES = [
  "hydrafacial", "hydrafacial_dermapen", "dermapen", "rf_microneedling", "rf_skin_treatment",
  "green_peel_face", "green_peel_back", "cosmelan_program", "salicylic_peel",
  "botox_forehead_eyes", "botox_underarms", "botox_neck", "botox_jawline",
  "skin_booster", "profhilo", "salmon_dna", "mesotherapy",
  "laser_full_body", "laser_full_body_student_rate", "laser_full_body_custom",
  "laser_targeted_area", "laser_half_back", "tattoo_removal_session",
  "lip_tawreed", "lip_tawreed_retouch", "microblading_brows", "microblading_retouch",
  "eyeliner_pigment", "eyeliner_retouch",
  "skin_consultation", "skin_assessment", "rf_double_chin", "meso_double_chin",
  "filler_dissolve", "teosyal_kiss_lips", "juvederm_ultra_lips",
];

const friendlyName = (type) => type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());

export default function AdditionalCare({ packages, isRTL, t }) {
  const additionalPackages = packages?.filter(p =>
    ADDITIONAL_TYPES.includes(p.package_type) && p.status === "active"
  ) || [];

  if (additionalPackages.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-[#eeebe6]"
    >
      <div className={`flex items-center gap-2 mb-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <Sparkles className="w-4 h-4" style={{ color: "#c4aa8b" }} />
        <h2 className="text-sm font-semibold text-[#333435]">{t("Additional Care", "عناية إضافية")}</h2>
      </div>
      <p className={`text-xs text-[#7c8689] mb-4 ${isRTL ? 'text-right' : 'text-left'}`}>{t("Part of your recommended plan", "جزء من خطتك الموصى بها")}</p>

      <div className="space-y-2">
        {additionalPackages.map((pkg) => (
          <div key={pkg.id} className={`bato-style-surface flex items-center justify-between p-3 rounded-xl ${isRTL ? 'flex-row-reverse' : ''}`} style={{ background: "#f9f8f6" }}>
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <p className="text-sm font-medium text-[#333435]">{pkg.package_name}</p>
              <p className="text-xs text-[#7c8689]" dir="ltr"><span dir={isRTL ? "rtl" : "ltr"}>{t("Session", "جلسة")}</span> {pkg.sessions_used}/{pkg.total_sessions}</p>
            </div>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
              style={{ color: "#3a2e1e", background: "rgba(196,170,139,0.15)", border: "1px solid rgba(196,170,139,0.3)" }}>
              {t("Active", "نشط")}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}