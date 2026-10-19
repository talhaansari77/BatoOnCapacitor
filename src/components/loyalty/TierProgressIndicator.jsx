import React from "react";
import { useLocation } from "../LocationContext";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Star, Crown } from "lucide-react";
import { motion } from "@/components/motion/BatoMotion";

const TIER_REQUIREMENTS = {
  bronze:   { points: 0,     sessions: 0,  name: "Bronze",   color: "#c4aa8b" },
  silver:   { points: 1000,  sessions: 3,  name: "Silver",   color: "#7c8689" },
  gold:     { points: 3000,  sessions: 6,  name: "Gold",     color: "#e7cb50" },
  platinum: { points: 6000,  sessions: 10, name: "Platinum", color: "#c4aa8b" },
  diamond:  { points: 10000, sessions: 20, name: "Diamond",  color: "#e7cb50" },
};

export default function TierProgressIndicator({ currentTier, currentPoints, totalSessions }) {
  const { t } = useLocation();
  const tierName = tier => t(TIER_REQUIREMENTS[tier]?.name || tier, ({ bronze: "برونز", silver: "فضي", gold: "ذهبي", platinum: "بلاتيني", diamond: "ماسي" })[tier] || tier);
  const tiers = Object.keys(TIER_REQUIREMENTS);
  const currentIndex = Math.max(0,tiers.indexOf(currentTier));
  const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;

  if (!nextTier) {
    return (
      <Card className="rounded-2xl border border-[#c4aa8b]/25 bg-white">
        <CardContent className="p-6 text-center">
          <Crown className="w-14 h-14 mx-auto mb-3" style={{ color: "#e7cb50" }} />
          <h3 className="text-lg font-bold text-[#333435] mb-2">{t("Highest Tier Achieved", "وصلت إلى أعلى مستوى")}</h3>
          <p className="text-[#7c8689] text-sm">
            {t("You have reached Diamond — the highest BATO tier.", "وصلت إلى المستوى الماسي — أعلى مستويات باتو.")}
          </p>
        </CardContent>
      </Card>
    );
  }

  const nextTierReq = TIER_REQUIREMENTS[nextTier];
  const pointsNeeded = nextTierReq.points - currentPoints;
  const sessionsNeeded = nextTierReq.sessions - totalSessions;
  const pointsProgress = (currentPoints / nextTierReq.points) * 100;
  const sessionsProgress = (totalSessions / nextTierReq.sessions) * 100;

  return (
    <Card className="rounded-2xl border border-[#c4aa8b]/25 bg-white">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-[#7c8689] mb-1">{t("Recorded member tier", "مستوى العضوية المسجل")}</p>
            <div className="flex items-center gap-2">
              <h3 className="text-2xl font-bold" style={{ color: TIER_REQUIREMENTS[currentTier]?.color || "#c4aa8b" }}>
                {tierName(currentTier)}
              </h3>
              <TrendingUp className="w-5 h-5" style={{ color: "#c4aa8b" }} />
            </div>
          </div>
          <div className="bato-style-emblem w-14 h-14 rounded-full flex items-center justify-center shadow-md"
            style={{ background: "#3a2e1e" }}>
            <Star className="w-7 h-7" style={{ color: nextTierReq.color }} />
          </div>
        </div>

        {/* Benefit Points Progress */}
        <div className="mb-4">
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
            <span className="text-sm font-medium text-[#333435]">{t("Benefit Points", "نقاط المكافآت")}</span>
            <span className="text-sm font-bold" style={{ color: "#3a2e1e" }}>
              {currentPoints.toLocaleString()} / {nextTierReq.points.toLocaleString()}
            </span>
          </div>
          <div className="bato-progress-track h-2 rounded-full overflow-hidden" style={{ background: "#eeebe6" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pointsProgress, 100)}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: "linear-gradient(to right, #c4aa8b, #e7cb50)" }}
            />
          </div>
          {pointsNeeded > 0 && (
            <p className="text-xs text-[#7c8689] mt-1">
              {t(pointsNeeded.toLocaleString() + " more points needed", "تحتاج إلى " + pointsNeeded.toLocaleString() + " نقطة إضافية")}
            </p>
          )}
        </div>

        {/* Sessions Progress */}
        <div>
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 mb-2">
            <span className="text-sm font-medium text-[#333435]">{t("Completed Sessions", "الجلسات المكتملة")}</span>
            <span className="text-sm font-bold" style={{ color: "#3a2e1e" }}>
              {totalSessions}
            </span>
          </div>
          <div className="bato-progress-track h-2 rounded-full overflow-hidden" style={{ background: "#eeebe6" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(sessionsProgress, 100)}%` }}
              transition={{ duration: 1, delay: 0.4 }}
              className="h-full rounded-full"
              style={{ background: "#c4aa8b" }}
            />
          </div>
          <p className="text-xs text-[#7c8689] mt-1">{t("Guide for "+tierName(nextTier)+": "+nextTierReq.sessions+" sessions", "متطلب "+tierName(nextTier)+" بحسب الدليل: "+nextTierReq.sessions+" جلسات")}</p>
          {sessionsNeeded > 0 && (
            <p className="text-xs text-[#7c8689] mt-1">
              {t(sessionsNeeded + " more sessions needed", "تحتاج إلى " + sessionsNeeded + " جلسات إضافية")}
            </p>
          )}
        </div>

        {/* Encouragement */}
        {(pointsNeeded <= 500 || sessionsNeeded <= 2) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 rounded-lg border"
            style={{ background: "rgba(231,203,80,0.08)", borderColor: "rgba(231,203,80,0.3)" }}
          >
            <p className="text-sm font-semibold text-center" style={{ color: "#3a2e1e" }}>
              {t("Next tier: " + tierName(nextTier), "المستوى التالي: " + tierName(nextTier))}
            </p>
          </motion.div>
        )}
      <p className="text-xs text-[#7c8689] mt-3">{t("Progress follows the app’s tier guide. Customer service confirms qualification and current benefits.","يعتمد التقدم على دليل فئات العضوية في التطبيق. تؤكد خدمة العملاء الأهلية والمزايا الحالية.")}</p>
      </CardContent>
    </Card>
  );
}