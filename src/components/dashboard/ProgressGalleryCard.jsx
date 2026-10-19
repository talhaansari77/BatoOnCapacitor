import React from "react";
import { motion } from "@/components/motion/BatoMotion";
import { Camera, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";

export default function ProgressGalleryCard({ caseFile, sessions, isRTL, t, userEmail }) {
  const { data: recentOfficial = [] } = useQuery({
    queryKey: ["dashboardProgressPhotos", userEmail],
    queryFn: () =>
      base44.entities.ProgressPhoto.filter(
        { client_email: userEmail, photo_source: "official_bato", client_visible: true },
        "-captured_date",
        1
      ),
    enabled: !!userEmail,
  });

  // Only show this card if there are official BATO photos shared with the client
  if (!recentOfficial.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Link to="/HairJourney">
        <div className={`flex items-center gap-3 bg-white border rounded-2xl px-4 py-3.5 shadow-sm ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{ borderColor: "rgba(196,170,139,0.3)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(196,170,139,0.12)" }}>
            <Camera className="w-4 h-4" style={{ color: "#c4aa8b" }} />
          </div>
          <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-sm font-semibold text-[#333435]">
              {t("Progress Photos Updated", "تم تحديث صور المتابعة")}
            </p>
            <p className="text-xs text-[#7c8689] truncate">
              {t("Your latest hair progress check-in is ready to review.", "أصبح آخر تقييم لتقدم شعرك جاهزاً للاطلاع.")}
            </p>
          </div>
          <ArrowRight className={`w-4 h-4 flex-shrink-0 ${isRTL ? "rotate-180" : ""}`}
            style={{ color: "#c4aa8b" }} />
        </div>
      </Link>
    </motion.div>
  );
}