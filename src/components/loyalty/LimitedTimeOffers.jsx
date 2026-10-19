import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  Zap, 
  Gift,
  Sparkles,
  Target,
  Trophy
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { format, differenceInHours, differenceInMinutes } from "date-fns";

export default function LimitedTimeOffers({ loyaltyTier, onClaimOffer }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  // Generate tier-specific offers
  const getOffers = () => {
    const baseOffers = [
      {
        id: "weekend_double_points",
        title: "Weekend Double Points",
        description: "Earn 2x points on all purchases this weekend",
        icon: Zap,
        color: "from-purple-500 to-pink-500",
        expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
        minTier: "bronze",
        exclusive: false
      },
      {
        id: "early_booking_bonus",
        title: "Early Bird Bonus",
        description: "Book next month's appointment now, get 100 bonus points",
        icon: Target,
        color: "from-blue-500 to-cyan-500",
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        minTier: "silver",
        exclusive: true
      },
      {
        id: "product_bundle_deal",
        title: "Product Bundle Deal",
        description: "Buy 3 products, get the 4th free",
        icon: Gift,
        color: "from-green-500 to-emerald-500",
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
        minTier: "bronze",
        exclusive: false
      },
      {
        id: "referral_bonus",
        title: "Mega Referral Bonus",
        description: "Extra $50 per referral this week only",
        icon: Trophy,
        color: "from-orange-500 to-red-500",
        expires: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
        minTier: "gold",
        exclusive: true
      },
      {
        id: "flash_discount",
        title: "Flash Sale",
        description: "30% off all laser therapy sessions",
        icon: Sparkles,
        color: "from-pink-500 to-rose-500",
        expires: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day
        minTier: "platinum",
        exclusive: true
      }
    ];

    // Filter offers based on tier
    const tierOrder = ["bronze", "silver", "gold", "platinum", "diamond"];
    const currentTierIndex = tierOrder.indexOf(loyaltyTier);
    
    return baseOffers.filter(offer => {
      const offerTierIndex = tierOrder.indexOf(offer.minTier);
      return currentTierIndex >= offerTierIndex;
    });
  };

  const offers = getOffers();

  const getTimeRemaining = (expiryDate) => {
    const hours = differenceInHours(expiryDate, currentTime);
    const minutes = differenceInMinutes(expiryDate, currentTime) % 60;
    
    if (hours < 1) {
      return `${minutes}m`;
    } else if (hours < 24) {
      return `${hours}h ${minutes}m`;
    } else {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Limited Time Offers
          </CardTitle>
          <Badge className="bg-white/20 text-white border-white/40">
            {offers.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <AnimatePresence>
          {offers.length > 0 ? (
            <div className="space-y-4">
              {offers.map((offer, idx) => {
                const Icon = offer.icon;
                const timeRemaining = getTimeRemaining(offer.expires);
                const isUrgent = differenceInHours(offer.expires, currentTime) < 24;

                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`relative p-4 rounded-xl border-2 ${
                      isUrgent ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"
                    }`}
                  >
                    {offer.exclusive && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                          EXCLUSIVE
                        </Badge>
                      </div>
                    )}

                    <div className="flex items-start gap-4">
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${offer.color} flex items-center justify-center flex-shrink-0`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{offer.title}</h4>
                        <p className="text-sm text-gray-600 mb-3">{offer.description}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Clock className={`w-4 h-4 ${isUrgent ? "text-red-600" : "text-gray-400"}`} />
                            <span className={`text-sm font-semibold ${isUrgent ? "text-red-600" : "text-gray-600"}`}>
                              {timeRemaining} left
                            </span>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => onClaimOffer(offer)}
                            className={isUrgent 
                              ? "bg-red-600 hover:bg-red-700 animate-pulse" 
                              : "bg-cyan-600 hover:bg-cyan-700"
                            }
                          >
                            Claim Now
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No active offers right now</p>
              <p className="text-sm text-gray-500 mt-1">Check back soon for exclusive deals!</p>
            </div>
          )}
        </AnimatePresence>

        {/* Upcoming Tier Benefits */}
        {loyaltyTier !== "diamond" && (
          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
            <p className="font-semibold text-purple-900 mb-2">
              Unlock More Offers!
            </p>
            <p className="text-sm text-purple-800">
              Upgrade to the next loyalty tier to access even more exclusive time-limited deals
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}