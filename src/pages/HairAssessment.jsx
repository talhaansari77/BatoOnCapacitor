import {useCustomerAccount} from "@/hooks/useCustomerAccount";
import CustomerLoadState from "@/components/CustomerLoadState";
import React from "react";
import { useLocation as useRouterLocation, useNavigate } from "react-router-dom";
import HairAssessmentFlow from "../components/assessments/HairAssessmentFlow";
import { useLocation } from "../components/LocationContext";
import { motion } from "framer-motion";

export default function HairAssessment() {
  const navigate = useNavigate();
  const account=useCustomerAccount();
  const routerLocation = useRouterLocation();
  const { t, isRTL } = useLocation();

  const handleAskTeam = () => {
    navigate("/Messages?channel=hair_team&context=hair_assessment");
  };

  if(account.isError)return <CustomerLoadState error onRetry={account.refetch}/>;
  if(!account.data)return <CustomerLoadState/>;
  return (
    <div
      className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="w-full max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-xl font-bold text-[#333435]">
            {t("Hair Assessment", "تقييم الشعر")}
          </h1>
          <p className="text-xs text-[#7c8689]">
            {t(
              "Understand your hair concern before starting treatment.",
              "افهم حالة شعرك قبل البدء بالعلاج."
            )}
          </p>
        </motion.div>

        {/* Assessment Flow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border"
          style={{ borderColor: "rgba(196,170,139,0.15)" }}
        >
          <HairAssessmentFlow
            onComplete={handleAskTeam}
            onCancel={() => navigate("/HairJourney")}
            userEmail={
              account.data.email
            }
          />
        </motion.div>

        {/* Footer info */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center text-xs text-[#7c8689]"
        >
          <p>
            {t(
              "Takes less than 2 minutes. Your answers help BATO create the right care plan for you.",
              "يستغرق أقل من دقيقتين. تساعد إجاباتك فريق باتو على إعداد خطة مناسبة لك."
            )}
          </p>
        </motion.div>
      </div>
    </div>
  );
}