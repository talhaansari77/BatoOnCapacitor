import {useLocation} from "@/components/LocationContext";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Phone, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChurnPreventionOffer({ 
  clientLifecycle, 
  onDismiss,
  onContactUs 
}) {
  const {t}=useLocation();
  if (!clientLifecycle) return null;

  const churnRisk = clientLifecycle.churn_risk_score || 0;
  const isAtRisk = churnRisk >= 60;
  const isCritical = churnRisk >= 80;

  if (!isAtRisk) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border shadow-sm overflow-hidden relative" style={{ borderColor: "rgba(196,170,139,0.3)", background: "#fff" }}>
          <CardContent className="p-5">
            <button
              aria-label={t("Dismiss reminder","إغلاق التذكير")} onClick={onDismiss}
              className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4 text-[#7c8689]" />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(196,170,139,0.1)" }}>
                <AlertCircle className="w-5 h-5" style={{ color: "#c4aa8b" }} />
              </div>

              <div className="flex-1">
                <p className="font-semibold text-[#333435] text-sm mb-1">
                  {t("Need help with your next step?","هل تحتاج مساعدة في خطوتك التالية؟")}
                </p>
                <p className="text-xs text-[#7c8689] mb-4">
                  {t("Your care team can help you review your next step.","يمكن لفريق رعايتك مساعدتك في مراجعة الخطوة التالية.")}
                </p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    size="sm"
                    className="border-0 font-semibold"
                    style={{ background: "#3a2e1e", color: "#c4aa8b" }}
                    onClick={() => onContactUs({ type: 'churn_prevention' })}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    {t("Message Customer service","راسل خدمة العملاء")}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-semibold"
                    style={{ borderColor: "rgba(196,170,139,0.3)", color: "#3a2e1e" }}
                    onClick={() => onContactUs({ type: 'churn_prevention_calendar' })}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    {t("Ask about an appointment","اسأل عن موعد")}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}