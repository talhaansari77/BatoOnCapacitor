import {Link} from "react-router-dom";
import CustomerLoadState from "@/components/CustomerLoadState";
import { loadCompletedTreatmentSessions } from "@/lib/treatmentSessions";
import React, { useState, useEffect } from "react";
import { useLocation } from "../components/LocationContext";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import {
  Crown, Star, Gift, CheckCircle2, Lock, ChevronDown, ChevronUp,
  TrendingUp, Award, Users, ShoppingBag, Calendar, MessageSquare,
  ClipboardList, Heart, RefreshCw, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import AchievementBadges from "../components/loyalty/AchievementBadges";
import { IlluMilestone } from "../components/illustrations/BatoIllustrations";
import LoyaltyLeaderboard from "../components/lifecycle/LoyaltyLeaderboard";
import PointsRedemption from "../components/loyalty/PointsRedemption";
import VIPExclusiveOffers from "../components/loyalty/VIPExclusiveOffers";

// ─── Constants ────────────────────────────────────────────────────────────────

const TIER_CONFIG = {
  bronze:  { nameEn: "Bronze",   nameAr: "برونز",    points: 0,     sessions: 0,  color: "#c4aa8b", descEn: "Your starting member access",   descAr: "مزايا العضوية الأساسية" },
  silver:  { nameEn: "Silver",   nameAr: "فضي",      points: 1000,  sessions: 3,  color: "#9aabb0", descEn: "Enhanced care privileges",       descAr: "مزايا إضافية للعناية" },
  gold:    { nameEn: "Gold",     nameAr: "ذهبي",     points: 3000,  sessions: 6,  color: "#e7cb50", descEn: "Priority care benefits",         descAr: "أولوية في خدمات العناية" },
  platinum:{ nameEn: "Platinum", nameAr: "بلاتيني",  points: 6000,  sessions: 10, color: "#c4aa8b", descEn: "Elevated member benefits",       descAr: "مزايا عضوية متقدمة" },
  diamond: { nameEn: "Diamond",  nameAr: "ماسي",     points: 10000, sessions: 20, color: "#e7cb50", descEn: "Private member privileges",      descAr: "امتيازات عضوية خاصة" },
};

const TIERS_ORDER = ["bronze", "silver", "gold", "platinum", "diamond"];

// ─── Section Components ────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-3">
      <h2 className="font-semibold text-[#333435] text-sm">{title}</h2>
      {subtitle && <p className="text-sm text-[#7c8689] mt-0.5">{subtitle}</p>}
    </div>
  );
}

function TierLadder({ currentTier }) {
  const { t, isRTL } = useLocation();
  const [openTier, setOpenTier] = useState(null);
  const currentIndex = TIERS_ORDER.indexOf(currentTier);
  const TIER_BENEFITS = Object.fromEntries(TIERS_ORDER.map(tier => [tier,[t("Customer service confirms the current benefits for this tier.","تؤكد خدمة العملاء المزايا الحالية لهذه الفئة.")]]));

  return (
    <div className="space-y-2">
      {TIERS_ORDER.map((tier, idx) => {
        const cfg = TIER_CONFIG[tier];
        const isUnlocked = idx <= currentIndex;
        const isCurrent = tier === currentTier;
        const isOpen = openTier === tier;

        return (
          <div key={tier}
            className="bg-white rounded-2xl border overflow-hidden"
            style={{ borderColor: isCurrent ? "rgba(196,170,139,0.5)" : "rgba(196,170,139,0.15)" }}>
            <button
              onClick={() => setOpenTier(isOpen ? null : tier)}
              aria-expanded={isOpen} className="w-full flex items-center gap-3 px-4 py-3.5 text-start hover:bg-[#f9f8f6] transition-colors"
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: isUnlocked ? "rgba(196,170,139,0.12)" : "#f0ede9" }}>
                {isUnlocked
                  ? <Crown className="w-4 h-4" style={{ color: cfg.color }} />
                  : <Lock className="w-4 h-4" style={{ color: "rgba(124,134,137,0.4)" }} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold" style={{ color: isUnlocked ? "#333435" : "#7c8689" }}>
                    {isRTL ? cfg.nameAr : cfg.nameEn}
                  </p>
                  {isCurrent && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                      style={{ background: "rgba(196,170,139,0.15)", color: "#c4aa8b", border: "1px solid rgba(196,170,139,0.3)" }}>
                      {t("CURRENT", "الحالي")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[#7c8689]">{isRTL ? cfg.descAr : cfg.descEn}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[10px] text-[#7c8689]">{t("Guide","دليل")}</p>
                {isOpen
                  ? <ChevronUp className="w-3.5 h-3.5 text-[#7c8689] ml-auto mt-0.5" />
                  : <ChevronDown className="w-3.5 h-3.5 text-[#7c8689] ml-auto mt-0.5" />}
              </div>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 pt-1" style={{ borderTop: "1px solid rgba(196,170,139,0.1)" }}>
                    <div className="space-y-1.5 mt-2">
                      {TIER_BENEFITS[tier].map((b, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                            style={{ background: isUnlocked ? cfg.color : "rgba(124,134,137,0.3)" }} />
                          <p className="text-xs text-[#7c8689]">{b}</p>
                        </div>
                      ))}
                    </div>
                    {idx > 0 && (
                      <p className="text-[10px] text-[#7c8689] mt-3">
                        {t(`App guide: ${cfg.points.toLocaleString()} benefit points${cfg.sessions > 0 ? ` · ${cfg.sessions} sessions` : ""}`,
                          `دليل التطبيق: ${cfg.points.toLocaleString('ar-AE')} نقطة${cfg.sessions > 0 ? ` · عدد الجلسات: ${cfg.sessions.toLocaleString('ar-AE')}` : ""}`)}
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function NextTierCard({ currentTier, points, sessions }) {
  const { t, isRTL } = useLocation();
  const TIER_BENEFITS = Object.fromEntries(TIERS_ORDER.map(tier => [tier,[t("Customer service confirms the current benefits for this tier.","تؤكد خدمة العملاء المزايا الحالية لهذه الفئة.")]]));
  const currentIndex = TIERS_ORDER.indexOf(currentTier);
  const nextTierKey = TIERS_ORDER[currentIndex + 1];
  if (!nextTierKey) {
    return (
      <div className="bg-white rounded-2xl border border-[#eeebe6] p-5 text-center">
        <Crown className="w-10 h-10 mx-auto mb-2" style={{ color: "#e7cb50" }} />
        <p className="font-semibold text-[#333435] text-sm">{t("Highest tier achieved", "تم الوصول إلى أعلى مستوى")}</p>
        <p className="text-xs text-[#7c8689] mt-1">{t("You've reached Diamond — the pinnacle of BATO membership.", "وصلت إلى المستوى الماسي، أعلى مستويات عضوية باتو.")}</p>
      </div>
    );
  }
  const next = TIER_CONFIG[nextTierKey];
  const pointsProgress = Math.min((points / next.points) * 100, 100);
  const sessionsProgress = Math.min((sessions / next.sessions) * 100, 100);
  const pointsLeft = Math.max(next.points - points, 0);
  const sessionsLeft = Math.max(next.sessions - sessions, 0);
  const benefits = TIER_BENEFITS[nextTierKey];

  return (
    <div className="bg-white rounded-2xl border border-[#eeebe6] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-1">{t("Next tier guide", "دليل المستوى التالي")}</p>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-[#333435]">{isRTL ? next.nameAr : next.nameEn}</h3>
            <TrendingUp className="w-4 h-4" style={{ color: "#c4aa8b" }} />
          </div>
          <p className="text-xs text-[#7c8689]">{isRTL ? next.descAr : next.descEn}</p>
        </div>
        <div className="bato-style-emblem w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ background: "#3a2e1e" }}>
          <Crown className="w-5 h-5" style={{ color: next.color }} />
        </div>
      </div>

      {/* Points progress */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
          <span className="text-xs text-[#333435]">{t("Benefit Points", "نقاط المكافآت")}</span>
          <span className="text-xs font-semibold text-[#333435]">{points.toLocaleString()} / {next.points.toLocaleString()}</span>
        </div>
        <div className="bato-progress-track h-1.5 rounded-full overflow-hidden" style={{ background: "#eeebe6" }}>
          <motion.div initial={{ width: 0 }} animate={{ width: `${pointsProgress}%` }}
            transition={{ duration: 1 }} className="h-full rounded-full"
            style={{ background: "linear-gradient(to right, #c4aa8b, #e7cb50)" }} />
        </div>
        {pointsLeft > 0 && <p className="text-[10px] text-[#7c8689] mt-1">{t(`${pointsLeft.toLocaleString()} more points needed`, `النقاط المتبقية: ${pointsLeft.toLocaleString('ar-AE')} نقطة`)}</p>}
      </div>

      {/* Sessions progress */}
      {next.sessions > 0 && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <span className="text-xs text-[#333435]">{t("Sessions Completed", "الجلسات المكتملة")}</span>
            <span className="text-xs font-semibold text-[#333435]">{sessions} / {next.sessions}</span>
          </div>
          <div className="bato-progress-track h-1.5 rounded-full overflow-hidden" style={{ background: "#eeebe6" }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${sessionsProgress}%` }}
              transition={{ duration: 1, delay: 0.2 }} className="h-full rounded-full"
              style={{ background: "#c4aa8b" }} />
          </div>
          {sessionsLeft > 0 && <p className="text-[10px] text-[#7c8689] mt-1">{t(`${sessionsLeft} more session${sessionsLeft === 1 ? "" : "s"} needed`, `الجلسات المتبقية: ${sessionsLeft.toLocaleString('ar-AE')}`)}</p>}
        </div>
      )}

      {/* Unlocks */}
      <div className="pt-3 border-t" style={{ borderColor: "rgba(196,170,139,0.12)" }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-2">{t("Clinic confirmation","تأكيد العيادة")}</p>
        <div className="space-y-1.5">
          {benefits.map((b, i) => (
            <div key={i} className="flex items-start gap-2">
              <Lock className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: "rgba(196,170,139,0.5)" }} />
              <p className="text-xs text-[#7c8689]">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CurrentBenefits({tier}) {
  const {t,isRTL}=useLocation();
  const cfg=TIER_CONFIG[tier];
  return <div className="bg-white rounded-2xl border border-[#eeebe6] p-5 space-y-3">
    <SectionHeader title={t("Your membership","عضويتك")} subtitle={t("Your recorded tier","فئة عضويتك المسجلة")}/>
    <p className="font-semibold">{isRTL?cfg.nameAr:cfg.nameEn}</p>
    <p className="text-sm text-[#7c8689]">{t("Customer service confirms the benefits and current terms for your membership. Recorded member offers appear above when available.","تؤكد خدمة العملاء المزايا والشروط الحالية لعضويتك. تظهر عروض الأعضاء المسجلة أعلاه عند توفرها.")}</p>
    <Link className="inline-flex items-center min-h-11 py-3 text-sm font-medium underline" to="/Messages?channel=client_care">{t("Ask about my benefits","استفسر عن مزايا عضويتي")}</Link>
    <div className="grid grid-cols-1 gap-2 text-sm bato-care-actions">
      <Link className="underline" to="/Academy">{t("Explore learning","استكشف المحتوى التعليمي")}</Link>
      <Link className="underline" to="/BATOCircles">{t("Explore BATO Circles","استكشف مجموعات باتو")}</Link>
      <Link className="underline" to="/Profile?tab=referrals">{t("Referral information","معلومات الإحالات")}</Link>
    </div>
  </div>;
}

function WaysToEarn() {
  const {t}=useLocation();
  return <div className="bg-white rounded-2xl border border-[#eeebe6] p-5 space-y-3">
    <SectionHeader title={t("Understanding your points","معلومات عن نقاطك")}/>
    <p className="text-sm text-[#7c8689]">{t("The balance above shows recorded points. Learning items display their own point value. Customer service can explain which other activities qualify, the award amounts and when points are credited.","يعرض الرصيد أعلاه النقاط المسجلة. يوضح كل محتوى تعليمي قيمة نقاطه. تشرح خدمة العملاء الأنشطة الأخرى المؤهلة وقيمة النقاط وموعد إضافتها.")}</p>
    <Link className="inline-flex items-center min-h-11 py-3 text-sm font-medium underline" to="/Messages?channel=client_care">{t("Ask about earning points","استفسر عن اكتساب النقاط")}</Link>
  </div>;
}

function RedeemSection({ clientEmail, availablePoints, onSuccess }) {
  const { t } = useLocation();
  return (
    <div className="bg-white rounded-2xl border border-[#eeebe6] p-5 space-y-3">
      <SectionHeader title={t("Redeem", "استبدال النقاط")} subtitle={t("Submit a request for clinic review. Customer service confirms the current options and terms.", "قدّم طلباً لمراجعة العيادة. تؤكد خدمة العملاء الخيارات والشروط الحالية.")} />
      <div className="pt-2">
        <PointsRedemption
          clientEmail={clientEmail}
          availablePoints={availablePoints}
          onRedemptionSuccess={onSuccess}
        />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const SECTIONS = ["benefits", "progress", "milestones", "redeem", "recognition"];
const getSectionLabels = (t) => ({
  benefits: t("Benefits", "المزايا"),
  progress: t("Progress", "التقدم"),
  milestones: t("Milestones", "مراحل البرنامج"),
  redeem: t("Redeem", "استبدال النقاط"),
  recognition: t("Recognition", "تكريم الأعضاء"),
});

export default function Rewards() {
  const [user, setUser] = useState(null);
  const [accountError,setAccountError]=useState(false);
  const [activeSection, setActiveSection] = useState("benefits");
  const queryClient = useQueryClient();
  const { isRTL, t } = useLocation();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => setAccountError(true));
  }, []);

  const { data: clientLifecycle = null, isPending: clientLifecyclePending, isError: clientLifecycleError } = useQuery({
    queryKey: ["clientLifecycle", user?.email],
    queryFn: async () => {
      const lc = await base44.entities.ClientLifecycle.filter({ client_email: user.email });
      return lc[0] || null;
    },
    enabled: !!user,
  });

  const { data: sessions = [], isPending: sessionsPending, isError: sessionsError } = useQuery({
    queryKey: ["completedTreatmentSessions", user?.email],
    queryFn: () => loadCompletedTreatmentSessions(user.email),
    enabled: !!user,
  });

  const { data: referrals = [], isPending: referralsPending, isError: referralsError } = useQuery({
    queryKey: ["referrals", user?.email],
    queryFn: () => base44.entities.Referral.filter({ referrer_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  const { data: orders = [], isPending: ordersPending, isError: ordersError } = useQuery({
    queryKey: ["orders", user?.email],
    queryFn: () => base44.entities.Order.filter({ client_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  if(accountError||clientLifecycleError||sessionsError||referralsError||ordersError)return <CustomerLoadState error/>;
  if(!user||clientLifecyclePending||sessionsPending||referralsPending||ordersPending)return <CustomerLoadState/>;
  if (!user || !clientLifecycle) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#eeebe6" }}>
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <IlluMilestone size={64} color="rgba(196,170,139,0.5)" />
          </div>
          <p className="text-sm text-[#7c8689]">{t("No membership record is available yet. Ask Customer service to help you get started.", "لا يوجد سجل عضوية متاح بعد. اسأل خدمة العملاء لمساعدتك على البدء.")}</p><Link className="inline-block underline p-3" to="/Messages?channel=client_care">{t("Ask Customer service","اسأل خدمة العملاء")}</Link>
        </div>
      </div>
    );
  }

  const tier = TIER_CONFIG[clientLifecycle.loyalty_level]?clientLifecycle.loyalty_level:"bronze";
  const tierCfg = TIER_CONFIG[tier] || TIER_CONFIG.bronze;
  const points = clientLifecycle.loyalty_points || 0;
  const totalSessions = sessions.length;
  const referralsCount = clientLifecycle.referrals_made || 0;
  const badgesCount = clientLifecycle.loyalty_badges?.length || 0;

  const SECTION_LABELS = getSectionLabels(t);
  const TIER_BENEFITS = Object.fromEntries(TIERS_ORDER.map(tier => [tier,[t("Customer service confirms the current benefits for this tier.","تؤكد خدمة العملاء المزايا الحالية لهذه الفئة.")]]));

  return (
    <div className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`} style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold text-[#333435]">{t("Privileges", "الامتيازات")}</h1>
          <p className="text-xs text-[#7c8689] mt-0.5">{t("Your member tier, benefits, and care rewards", "مستوى عضويتك ومزاياك ومكافآتك")}</p>
        </div>

        {/* ─── Hero ─────────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bato-style-hero relative overflow-hidden rounded-3xl p-6"
          style={{ background: "linear-gradient(135deg, #3a2e1e 0%, #3e352c 60%, #2e2418 100%)" }}
        >
          {/* Subtle gold glow */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 85% 10%, rgba(231,203,80,0.12) 0%, transparent 45%)" }} />
          {/* Background illustration */}
          <div className="absolute right-3 bottom-3 opacity-10 pointer-events-none">
            <IlluMilestone size={100} color="#c4aa8b" />
          </div>

          <div className="relative z-10 grid grid-cols-[minmax(0,1fr)_64px] gap-3 items-start mb-5">
            <div>
              <p className="text-[10px] font-semibold tracking-widest uppercase mb-1"
                style={{ color: "rgba(196,170,139,0.7)" }}>{t("Member Tier", "مستوى العضوية")}</p>
              <h2 className="text-2xl font-bold text-white capitalize mb-0.5">{isRTL ? tierCfg.nameAr : tierCfg.nameEn}</h2>
              <p className="text-xs" style={{ color: "rgba(238,235,230,0.8)" }}>{isRTL ? tierCfg.descAr : tierCfg.descEn}</p>
              {clientLifecycle.vip_status && (
                <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: "rgba(231,203,80,0.15)", color: "#e7cb50", border: "1px solid rgba(231,203,80,0.3)" }}>
                  {t("VIP Active", "العضوية المميزة سارية")}
                </span>
              )}
            </div>
            <div className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center"
              style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.2)" }}>
              <Crown className="w-6 h-6 mb-0.5" style={{ color: tierCfg.color }} />
              <p className="text-[9px] font-medium" style={{ color: "rgba(196,170,139,0.7)" }}>BATO</p>
            </div>
          </div>

          {/* Points highlight */}
          <div className="relative z-10 mb-4 p-3 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(196,170,139,0.12)" }}>
            <p className="text-3xl font-bold text-white">{points.toLocaleString()}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(196,170,139,0.7)" }}>{t("Benefit Points", "نقاط المكافآت")}</p>
          </div>

          {/* Stats row */}
          <div className="relative z-10 grid grid-cols-3 gap-2">
            {[
              { label: t("Sessions", "الجلسات"), value: totalSessions },
              { label: t("Referrals", "الإحالات"), value: referralsCount },
              { label: t("Badges", "الأوسمة"), value: badgesCount },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-2.5 text-center min-h-[80px] flex flex-col items-center justify-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(196,170,139,0.1)" }}>
                <p className="text-base font-bold text-white">{s.value}</p>
                <p className="text-[10px]" style={{ color: "rgba(196,170,139,0.65)" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* VIP Offers */}
        {clientLifecycle.vip_status && (
          <VIPExclusiveOffers clientEmail={user.email} tierLevel={tier} isVIP={true} />
        )}

        {/* ─── Nav tabs ──────────────────────────────────────────────────────── */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: "none" }}>
          {SECTIONS.map(s => (
            <button
              key={s}
              onClick={() => setActiveSection(s)}
              className="flex-shrink-0 min-h-11 text-sm font-medium px-3 py-2 rounded-full transition-all"
              style={activeSection === s
                ? { background: "#3a2e1e", color: "#c4aa8b" }
                : { background: "#ffffff", color: "#7c8689", border: "1px solid rgba(196,170,139,0.2)" }}
            >
              {SECTION_LABELS[s]}
            </button>
          ))}
        </div>

        {/* ─── Section content ──────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="space-y-4"
          >
            {activeSection === "benefits" && (
              <>
                <CurrentBenefits tier={tier} />
                <WaysToEarn />
              </>
            )}

            {activeSection === "progress" && (
              <>
                <NextTierCard
                  currentTier={tier}
                  points={points}
                  sessions={totalSessions}
                />
                <div className="bg-white rounded-2xl border border-[#eeebe6] p-5">
                  <SectionHeader title={t("Tier Ladder", "مستويات العضوية")} subtitle={t("The app’s tier guide. Customer service confirms qualification and current terms.", "دليل فئات العضوية في التطبيق. تؤكد خدمة العملاء الأهلية والشروط الحالية.")} />
                  <TierLadder currentTier={tier} />
                </div>
              </>
            )}

            {activeSection === "milestones" && (
              <div className="bg-white rounded-2xl border border-[#eeebe6] p-5">
                <SectionHeader title={t("Milestones", "مراحل البرنامج")} subtitle={t("Badges recorded for your membership", "الأوسمة المسجلة لعضويتك")} />
                <AchievementBadges
                  clientLifecycle={clientLifecycle}
                  sessions={sessions}
                  referrals={referrals}
                  orders={orders}
                  userCreatedDate={user.created_date}
                />
              </div>
            )}

            {activeSection === "redeem" && (
              <RedeemSection
                clientEmail={user.email}
                availablePoints={points}
                onSuccess={() => queryClient.invalidateQueries({ queryKey: ["clientLifecycle"] })}
              />
            )}

            {activeSection === "recognition" && (
              <div className="space-y-3">
                <div className="bg-white rounded-2xl border border-[#eeebe6] p-4">
                  <p className="text-xs text-[#7c8689] leading-relaxed">
                    <span className="font-medium text-[#333435]">{t("Recognition is optional.", "ظهور اسمك في قائمة الأعضاء المكرّمين اختياري.")}</span>{" "}
                    {t("You can choose whether your name appears publicly. BATO clients may prefer privacy — your participation is entirely your choice.", "يمكنك اختيار إظهار اسمك أو الحفاظ على خصوصيتك. القرار لك.")}
                  </p>
                </div>
                <LoyaltyLeaderboard userEmail={user.email} currentLifecycle={clientLifecycle} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

      </div>
    </div>
  );
}