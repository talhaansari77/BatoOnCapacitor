import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  HeartPulse,
  Sparkles,
  FlaskConical,
  Droplets,
  Stethoscope,
  Search,
  Wand2,
  Syringe,
  Zap,
  Brush,
  Scan,
  X,
} from "lucide-react";
import { useLocation } from "../LocationContext";
import { BATO_SERVICE_DEPARTMENTS } from "@/lib/batoServices";

// ─── DATA ────────────────────────────────────────────────────────────────────

const DEPARTMENTS = BATO_SERVICE_DEPARTMENTS;

// ─── SERVICE DETAIL MODAL ────────────────────────────────────────────────────

function ServiceModal({ service, isRTL, onClose }) {
  if (!service) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.22 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10"
        dir={isRTL ? "rtl" : "ltr"}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>
        <p className="font-bold text-gray-900 text-lg pr-8 mb-3 leading-snug">
          {isRTL ? service.nameAr : service.nameEn}
        </p>
        <p className="text-sm text-gray-700 leading-relaxed">
          {isRTL ? service.fullAr || service.fullEn : service.fullEn}
        </p>
      </motion.div>
    </div>
  );
}

// ─── SECTION CARD ────────────────────────────────────────────────────────────

function SectionCard({ section, isRTL, onSelectService }) {
  const [open, setOpen] = useState(false);
  const Icon = section.icon;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
      >
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`w-8 h-8 ${section.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-4 h-4 ${section.iconColor}`} />
          </div>
          <div className={isRTL ? "text-right" : "text-left"}>
            <p className="font-semibold text-gray-900 text-sm">
              {isRTL ? section.nameAr : section.nameEn}
            </p>
            <p className="text-[11px] text-gray-500">
              {isRTL ? section.descAr : section.descEn}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] text-gray-400">{section.services.length}</span>
          {open ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 border-t border-gray-100 pt-2 space-y-1.5">
              {section.services.map((svc, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectService(svc)}
                  className={`w-full flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left ${isRTL ? "flex-row-reverse text-right" : ""}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 leading-snug">
                      {isRTL ? svc.nameAr : svc.nameEn}
                    </p>
                    <p className="text-[11px] text-gray-500 leading-relaxed mt-0.5 line-clamp-2">
                      {isRTL ? svc.previewAr : svc.previewEn}
                    </p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 mt-1 flex-shrink-0 -rotate-90`} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── DEPARTMENT CARD ─────────────────────────────────────────────────────────

function DepartmentCard({ dept, isRTL, onSelectService }) {
  const [open, setOpen] = useState(false);
  const Icon = dept.icon;

  return (
    <Card className={`border shadow-sm overflow-hidden ${dept.borderColor}`}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-full p-4 bg-gradient-to-r ${dept.gradient} flex items-center justify-between`}
      >
        <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className={`w-11 h-11 ${dept.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className={isRTL ? "text-right" : "text-left"}>
            <div className={`flex items-center gap-2 flex-wrap ${isRTL ? "flex-row-reverse" : ""}`}>
              <p className="font-bold text-gray-900 text-base">
                {isRTL ? dept.nameAr : dept.nameEn}
              </p>
              <span className="text-gray-500 text-xs">
                — {isRTL ? dept.taglineAr : dept.taglineEn}
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              {isRTL ? dept.subtitleAr : dept.subtitleEn}
            </p>
          </div>
        </div>
        {open ? (
          <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <CardContent className="p-3 space-y-2 bg-white">
              {dept.sections.map((section) => (
                <SectionCard
                  key={section.id}
                  section={section}
                  isRTL={isRTL}
                  onSelectService={onSelectService}
                />
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────

export default function BATOServicesSection() {
  const { isRTL, t } = useLocation();
  const [selectedService, setSelectedService] = useState(null);

  return (
    <div className="space-y-3">
      <div className={isRTL ? "text-right" : "text-left"}>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-0.5">
          {t("Our Services", "خدماتنا")}
        </p>
        <h2 className="text-base font-bold text-gray-900">
          {t("What we offer", "ما نقدمه")}
        </h2>
      </div>

      {DEPARTMENTS.map((dept, idx) => (
        <motion.div
          key={dept.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.08 }}
        >
          <DepartmentCard
            dept={dept}
            isRTL={isRTL}
            onSelectService={setSelectedService}
          />
        </motion.div>
      ))}

      <AnimatePresence>
        {selectedService && (
          <ServiceModal
            service={selectedService}
            isRTL={isRTL}
            onClose={() => setSelectedService(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}