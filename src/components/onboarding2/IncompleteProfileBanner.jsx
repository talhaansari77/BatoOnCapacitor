import React from "react";
import { Link } from "react-router-dom";
import { motion } from "@/components/motion/BatoMotion";
import { ChevronRight, Clock } from "lucide-react";
import { createPageUrl } from "@/utils";
import { isToday } from "date-fns";

/**
 * Shows a banner on the Dashboard if the user's BATO Profile is incomplete.
 * appointmentDate — optional ISO string of their next appointment.
 */
export default function IncompleteProfileBanner({ appointmentDate }) {
  const isAppointmentToday = appointmentDate && isToday(new Date(appointmentDate));

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Link to={createPageUrl("Onboarding")}>
        <div
          className="flex items-center gap-3 rounded-2xl px-4 py-3.5 border"
          style={{
            background: isAppointmentToday
              ? "linear-gradient(135deg, #3a2e1e 0%, #4a3a28 100%)"
              : "#fff",
            borderColor: isAppointmentToday ? "transparent" : "rgba(196,170,139,0.3)",
          }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: isAppointmentToday ? "rgba(196,170,139,0.15)" : "rgba(196,170,139,0.1)" }}
          >
            <Clock className="w-4 h-4" style={{ color: "#c4aa8b" }} />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="text-sm font-semibold"
              style={{ color: isAppointmentToday ? "#fff" : "#333435" }}
            >
              {isAppointmentToday ? "Complete before you arrive" : "Complete your BATO Profile"}
            </p>
            <p
              className="text-xs leading-relaxed mt-0.5"
              style={{ color: isAppointmentToday ? "rgba(238,235,230,0.7)" : "#7c8689" }}
            >
              {isAppointmentToday
                ? "Your team can prepare better if your BATO Profile is completed before your visit."
                : "Help your team prepare properly before your visit."}
            </p>
          </div>
          <ChevronRight
            className="w-4 h-4 flex-shrink-0"
            style={{ color: isAppointmentToday ? "rgba(196,170,139,0.7)" : "#7c8689" }}
          />
        </div>
      </Link>
    </motion.div>
  );
}