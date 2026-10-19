import React from "react";
import {useLocation} from "@/components/LocationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Users, 
  ShoppingBag, 
  Heart,
  Star,
  Crown,
  Award,
  Zap,
  Target,
  Lock
} from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";

const LOYALTY_BADGES = [
  // Treatment Badges
  { id: "first_session", name: "First Step", description: "Complete first treatment session", icon: Target, color: "from-blue-500 to-cyan-500", category: "Treatment" },
  { id: "five_sessions", name: "Dedicated", description: "Complete 5 treatment sessions", icon: Zap, color: "from-purple-500 to-pink-500", category: "Treatment" },
  { id: "ten_sessions", name: "Committed", description: "Complete 10 treatment sessions", icon: Award, color: "from-orange-500 to-red-500", category: "Treatment" },
  { id: "treatment_complete", name: "Journey Complete", description: "Complete entire treatment plan", icon: Crown, color: "from-yellow-400 to-yellow-600", category: "Treatment" },
  
  // Referral Badges
  { id: "first_referral", name: "Introducer", description: "Make 1st successful referral", icon: Users, color: "from-green-500 to-emerald-500", category: "Referral" },
  { id: "super_referrer", name: "Super Referrer", description: "Make 3 successful referrals", icon: Users, color: "from-teal-500 to-cyan-500", category: "Referral" },
  { id: "referral_champion", name: "Referral Champion", description: "Make 5 successful referrals", icon: Users, color: "from-indigo-500 to-purple-500", category: "Referral" },
  { id: "referral_legend", name: "Referral Legend", description: "Make 10 successful referrals", icon: Trophy, color: "from-yellow-500 to-amber-500", category: "Referral" },
  
  // Purchase Badges
  { id: "first_purchase", name: "First Buy", description: "Make first product purchase", icon: ShoppingBag, color: "from-pink-500 to-rose-500", category: "Purchase" },
  { id: "frequent_buyer", name: "Frequent Buyer", description: "Make 5 product purchases", icon: ShoppingBag, color: "from-purple-500 to-pink-500", category: "Purchase" },
  { id: "premium_buyer", name: "Premium Buyer", description: "Recorded premium purchase milestone", icon: Crown, color: "from-amber-500 to-orange-500", category: "Purchase" },
  
  // Loyalty Badges
  { id: "loyal_client", name: "Loyal Client", description: "Active for 6 months", icon: Heart, color: "from-red-500 to-pink-500", category: "Loyalty" },
  { id: "dedicated_client", name: "Dedicated Client", description: "Active for 1 year", icon: Heart, color: "from-purple-500 to-pink-500", category: "Loyalty" },
  { id: "vip_member", name: "VIP Member", description: "Achieve VIP status", icon: Crown, color: "from-yellow-500 to-orange-500", category: "Loyalty" },
  
  // Satisfaction Badges
  { id: "satisfied_client", name: "Satisfied Client", description: "Average satisfaction 8+", icon: Star, color: "from-yellow-500 to-amber-500", category: "Satisfaction" },
  { id: "extremely_satisfied", name: "Extremely Satisfied", description: "Average satisfaction 9+", icon: Star, color: "from-orange-500 to-red-500", category: "Satisfaction" },
  { id: "perfect_rating", name: "Perfect Rating", description: "Give three 10/10 ratings", icon: Trophy, color: "from-yellow-400 to-yellow-600", category: "Satisfaction" }
];

export default function LoyaltyBadges({ clientLifecycle }) {
  const {t,isRTL}=useLocation();
  const labels={"First Step": "الخطوة الأولى", "Dedicated": "ملتزم", "Committed": "مستمر", "Journey Complete": "رحلة مكتملة", "Introducer": "دعوتك الأولى", "Super Referrer": "داعٍ متميز", "Referral Champion": "بطل الإحالات", "Referral Legend": "رائد الإحالات", "First Buy": "الشراء الأول", "Frequent Buyer": "عميل منتظم", "Premium Buyer": "عميل مميز", "Loyal Client": "عميل وفي", "Dedicated Client": "عميل ملتزم", "VIP Member": "عضو مميز", "Satisfied Client": "عميل راضٍ", "Extremely Satisfied": "رضا متميز", "Perfect Rating": "تقييم كامل", "Complete first treatment session": "إكمال أول جلسة علاج", "Complete 5 treatment sessions": "إكمال ٥ جلسات علاج", "Complete 10 treatment sessions": "إكمال ١٠ جلسات علاج", "Complete entire treatment plan": "إكمال خطة العلاج", "Make 1st successful referral": "أول إحالة ناجحة", "Make 3 successful referrals": "٣ إحالات ناجحة", "Make 5 successful referrals": "٥ إحالات ناجحة", "Make 10 successful referrals": "١٠ إحالات ناجحة", "Make first product purchase": "أول شراء للمنتجات", "Make 5 product purchases": "٥ عمليات شراء للمنتجات", "Recorded premium purchase milestone": "إنجاز شراء مميز وفق سجل العيادة", "Active for 6 months": "٦ أشهر من العضوية", "Active for 1 year": "سنة من العضوية", "Achieve VIP status": "الوصول إلى العضوية المميزة", "Average satisfaction 8+": "متوسط رضا ٨ أو أكثر", "Average satisfaction 9+": "متوسط رضا ٩ أو أكثر", "Give three 10/10 ratings": "٣ تقييمات كاملة", "Treatment": "العلاج", "Referral": "الإحالات", "Purchase": "الشراء", "Loyalty": "الولاء", "Satisfaction": "الرضا"};
  const label = text => isRTL ? (labels[text] || text) : text;
  const reduceMotion = useReducedMotion();
  const earnedBadges = clientLifecycle?.loyalty_badges || [];
  const unlockedCount = LOYALTY_BADGES.filter(b=>earnedBadges.includes(b.id)).length;
  const nextBadgeId = LOYALTY_BADGES.find(b => !earnedBadges.includes(b.id))?.id;

  const badgesByCategory = LOYALTY_BADGES.reduce((acc, badge) => {
    if (!acc[badge.category]) acc[badge.category] = [];
    acc[badge.category].push({
      ...badge,
      unlocked: earnedBadges.includes(badge.id)
    });
    return acc;
  }, {});

  return (
    <Card className="border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            {t("Loyalty badges","أوسمة الولاء")}
          </CardTitle>
          <Badge className="bg-yellow-500 text-white px-3 py-1">
            {unlockedCount} / {LOYALTY_BADGES.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Progress Bar */}
        <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t("Badge collection","مجموعة الأوسمة")}</span>
            <span className="text-sm font-semibold text-purple-600">
              {Math.round((unlockedCount / LOYALTY_BADGES.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / LOYALTY_BADGES.length) * 100}%` }}
              transition={reduceMotion ? { duration: 0 } : { duration: 1, ease: "easeOut" }}
              className="h-full bg-purple-600 rounded-full"
            />
          </div>
        </div>

        {/* Badges by Category */}
        <div className="space-y-6">
          {Object.entries(badgesByCategory).map(([category, badges]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                {label(category)} · {t("Badges","أوسمة")}
                <Badge variant="outline" className="text-xs">
                  {badges.filter(b => b.unlocked).length}/{badges.length}
                </Badge>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {badges.map((badge, idx) => {
                  const Icon = badge.icon;
                  return (
                    <motion.div
                      key={badge.id}
                      initial={reduceMotion ? false : { opacity: 0, scale: 0.9 }}
                      animate={reduceMotion ? undefined : { opacity: 1, scale: 1 }}
                      transition={reduceMotion ? { duration: 0 } : { delay: idx * 0.05 }}
                      className={`p-3 rounded-xl border-2 text-center ${
                        badge.unlocked
                          ? "bg-white border-gray-200"
                          : badge.id === nextBadgeId
                            ? "bg-amber-50 border-amber-200"
                            : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <span className={`block w-fit mx-auto mb-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        badge.unlocked
                          ? "bg-green-100 text-green-700"
                          : badge.id === nextBadgeId
                            ? "bg-amber-100 text-amber-800"
                            : "bg-gray-100 text-gray-500"
                      }`}>
                        {badge.unlocked ? t("Earned", "مُكتسب") : badge.id === nextBadgeId ? t("Next", "التالي") : t("Locked", "مغلق")}
                      </span>
                      <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center mb-2 ${
                        badge.unlocked
                          ? `bg-gradient-to-br ${badge.color}`
                          : "bg-gray-300"
                      }`}>
                        {badge.unlocked ? (
                          <Icon className="w-6 h-6 text-white" />
                        ) : (
                          <Lock className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <p className={`text-xs font-semibold mb-1 ${
                        badge.unlocked ? "text-gray-900" : "text-gray-500"
                      }`}>
                        {label(badge.name)}
                      </p>
                      <p className={`text-xs ${
                        badge.unlocked ? "text-gray-600" : "text-[#7c8689]"
                      }`}>
                        {label(badge.description)}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Next Badge */}
        {unlockedCount < LOYALTY_BADGES.length && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1 text-sm">{t("Next badge","الوسام التالي")}</p>
                <p className="text-sm text-blue-700">
                  {label(LOYALTY_BADGES.find(b => !earnedBadges.includes(b.id))?.description)}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}