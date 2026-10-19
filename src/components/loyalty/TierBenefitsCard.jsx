import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  Star, 
  Gift, 
  Zap, 
  ShoppingBag,
  Calendar,
  Trophy,
  Sparkles,
  Lock,
  CheckCircle2
} from "lucide-react";
import { motion } from "@/components/motion/BatoMotion";

const TIER_BENEFITS = {
  bronze: {
    name: "Bronze",
    color: "from-orange-400 to-red-500",
    icon: Star,
    pointsRequired: 0,
    benefits: [
      { icon: Star, text: "Earn 1 point per dollar spent", unlocked: true },
      { icon: Gift, text: "Birthday month discount", unlocked: true },
      { icon: Sparkles, text: "Access to loyalty program", unlocked: true }
    ],
    discount: "0%",
    perks: []
  },
  silver: {
    name: "Silver",
    color: "from-gray-300 to-gray-400",
    icon: Star,
    pointsRequired: 500,
    benefits: [
      { icon: Star, text: "Earn 1.5 points per dollar", unlocked: true },
      { icon: ShoppingBag, text: "5% off all products", unlocked: true },
      { icon: Calendar, text: "Priority booking", unlocked: true },
      { icon: Gift, text: "Birthday month 10% off", unlocked: true }
    ],
    discount: "5%",
    perks: ["Early access to new products", "Quarterly bonus offers"]
  },
  gold: {
    name: "Gold",
    color: "from-yellow-400 to-amber-500",
    icon: Trophy,
    pointsRequired: 1000,
    benefits: [
      { icon: Star, text: "Earn 2 points per dollar", unlocked: true },
      { icon: ShoppingBag, text: "10% off all products & services", unlocked: true },
      { icon: Calendar, text: "Priority booking + flexible rescheduling", unlocked: true },
      { icon: Gift, text: "Free annual consultation", unlocked: true },
      { icon: Sparkles, text: "Exclusive Gold member events", unlocked: true }
    ],
    discount: "10%",
    perks: [
      "Free product samples",
      "Skip the waitlist",
      "Gold member exclusive offers",
      "Complimentary hair care kit annually"
    ]
  },
  platinum: {
    name: "Platinum",
    color: "from-purple-400 to-pink-500",
    icon: Crown,
    pointsRequired: 2500,
    benefits: [
      { icon: Star, text: "Earn 3 points per dollar", unlocked: true },
      { icon: ShoppingBag, text: "15% off everything", unlocked: true },
      { icon: Calendar, text: "VIP scheduling & personal coordinator", unlocked: true },
      { icon: Gift, text: "Free PRP session annually", unlocked: true },
      { icon: Sparkles, text: "Platinum lounge access", unlocked: true },
      { icon: Zap, text: "Referral bonus multiplier (1.5x)", unlocked: true }
    ],
    discount: "15%",
    perks: [
      "Complimentary premium products",
      "Dedicated care coordinator",
      "Invitation-only events",
      "Free upgrades when available",
      "Express service option"
    ]
  },
  diamond: {
    name: "Diamond",
    color: "from-cyan-400 to-blue-500",
    icon: Sparkles,
    pointsRequired: 5000,
    benefits: [
      { icon: Star, text: "Earn 5 points per dollar", unlocked: true },
      { icon: ShoppingBag, text: "20% off everything forever", unlocked: true },
      { icon: Calendar, text: "Ultimate VIP treatment", unlocked: true },
      { icon: Gift, text: "Free laser therapy annually", unlocked: true },
      { icon: Crown, text: "Lifetime Diamond status", unlocked: true },
      { icon: Sparkles, text: "Private suite access", unlocked: true },
      { icon: Zap, text: "Referral bonus multiplier (2x)", unlocked: true },
      { icon: Trophy, text: "Personal concierge service", unlocked: true }
    ],
    discount: "20%",
    perks: [
      "Concierge service",
      "Exclusive Diamond lounge",
      "Free annual maintenance package",
      "Priority for new treatments",
      "Lifetime benefits",
      "Annual VIP retreat invitation"
    ]
  }
};

export default function TierBenefitsCard({ currentTier, loyaltyPoints, compact = false }) {
  const tierData = TIER_BENEFITS[currentTier] || TIER_BENEFITS.bronze;
  const TierIcon = tierData.icon;

  // Get next tier
  const tiers = Object.keys(TIER_BENEFITS);
  const currentIndex = tiers.indexOf(currentTier);
  const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  const nextTierData = nextTier ? TIER_BENEFITS[nextTier] : null;
  const pointsToNext = nextTierData ? nextTierData.pointsRequired - loyaltyPoints : 0;

  if (compact) {
    return (
      <Card className={`border-none shadow-lg bg-gradient-to-r ${tierData.color} text-white overflow-hidden`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <TierIcon className="w-6 h-6" />
                <h3 className="text-2xl font-bold">{tierData.name} Member</h3>
              </div>
              <p className="text-sm opacity-90">{tierData.discount} member discount</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{loyaltyPoints}</div>
              <div className="text-xs opacity-90">Points</div>
            </div>
          </div>

          {nextTierData && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm">Progress to {nextTierData.name}</span>
                <span className="text-sm font-semibold">{pointsToNext} points to go</span>
              </div>
              <div className="bato-progress-track h-2 bg-white/30 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((loyaltyPoints / nextTierData.pointsRequired) * 100, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-white rounded-full"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className={`bg-gradient-to-r ${tierData.color} text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TierIcon className="w-8 h-8" />
              <CardTitle className="text-2xl">{tierData.name} Tier Benefits</CardTitle>
            </div>
            <p className="text-sm opacity-90">Your exclusive member benefits</p>
          </div>
          <Badge className="bg-white/20 text-white border-white/40 px-4 py-2 text-lg">
            {tierData.discount}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Benefits List */}
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              Core Benefits
            </h4>
            <div className="space-y-2">
              {tierData.benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-cyan-600" />
                    </div>
                    <span className="text-sm text-gray-700">{benefit.text}</span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {tierData.perks.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Gift className="w-5 h-5 text-purple-600" />
                Exclusive Perks
              </h4>
              <div className="grid md:grid-cols-2 gap-2">
                {tierData.perks.map((perk, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                    <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>{perk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next Tier Preview */}
          {nextTierData && (
            <div className="pt-6 border-t border-gray-200">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-1">Next Tier: {nextTierData.name}</h4>
                  <p className="text-sm text-gray-600">{pointsToNext} more points needed</p>
                </div>
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              
              <div className="mb-4">
                <div className="bato-progress-track h-2 bg-gray-200 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((loyaltyPoints / nextTierData.pointsRequired) * 100, 100)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${nextTierData.color} rounded-full`}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-gray-500">
                  <span>{loyaltyPoints} pts</span>
                  <span>{nextTierData.pointsRequired} pts</span>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-900 font-semibold mb-2">
                  Unlock with {nextTierData.name}:
                </p>
                <ul className="space-y-1">
                  {nextTierData.perks.slice(0, 3).map((perk, idx) => (
                    <li key={idx} className="text-xs text-purple-800 flex items-center gap-2">
                      <Sparkles className="w-3 h-3" />
                      {perk}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export { TIER_BENEFITS };