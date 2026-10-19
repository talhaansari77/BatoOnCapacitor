import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, ArrowRight, Gift } from "lucide-react";
import { motion } from "@/components/motion/BatoMotion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { isFuture } from "date-fns";

export default function VIPPromotionBanner({ clientEmail, tierLevel, isVIP }) {
  const navigate = useNavigate();

  const { data: highlightedOffers } = useQuery({
    queryKey: ['highlightedVIPOffers', tierLevel],
    queryFn: async () => {
      const allOffers = await base44.entities.VIPOffer.filter({ 
        is_active: true,
        highlight_on_dashboard: true 
      }, '-priority', 3);
      
      return allOffers.filter(offer => {
        if (offer.tier_requirement === 'any_vip') return isVIP;
        if (offer.tier_requirement === 'platinum') return tierLevel === 'platinum' || tierLevel === 'diamond';
        if (offer.tier_requirement === 'diamond') return tierLevel === 'diamond';
        return false;
      }).filter(offer => {
        if (offer.end_date && !isFuture(new Date(offer.end_date))) return false;
        if (offer.is_limited && offer.slots_used >= offer.slots_total) return false;
        return true;
      });
    },
    enabled: !!clientEmail && isVIP,
    initialData: [],
  });

  const { data: redemptions } = useQuery({
    queryKey: ['vipRedemptionsCheck', clientEmail],
    queryFn: async () => {
      return await base44.entities.VIPOfferRedemption.filter({ client_email: clientEmail });
    },
    enabled: !!clientEmail,
    initialData: [],
  });

  const tierGradients = {
    platinum: "from-purple-500 via-pink-500 to-rose-500",
    diamond: "from-cyan-400 via-blue-500 to-purple-500"
  };

  // Filter out already claimed offers
  const availableOffers = highlightedOffers.filter(offer => 
    !redemptions.some(r => r.offer_id === offer.id)
  );

  if (!isVIP || availableOffers.length === 0) {
    return null;
  }

  const topOffer = availableOffers[0];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Card className={`border-0 shadow-2xl overflow-hidden bg-gradient-to-br ${tierGradients[tierLevel]} relative`}>
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
        </div>

        <CardContent className="p-6 md:p-8 relative">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Icon & Badge */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-3">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <Badge className="bg-white/30 text-white border-0 backdrop-blur-sm">
                {tierLevel?.toUpperCase()} EXCLUSIVE
              </Badge>
            </div>

            {/* Content */}
            <div className="flex-1 text-white">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-medium text-white/80">VIP Special Offer</span>
              </div>
              <h3 className="text-2xl md:text-3xl font-bold mb-2">{topOffer.title}</h3>
              <p className="text-white/90 mb-4 max-w-2xl">
                {topOffer.description}
              </p>

              {/* Offer Highlights */}
              <div className="flex flex-wrap gap-3 mb-4">
                {topOffer.discount_percentage && (
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    {topOffer.discount_percentage}% OFF
                  </Badge>
                )}
                {topOffer.discount_amount && (
                  <Badge className="bg-white/20 text-white border-0 backdrop-blur-sm">
                    ${topOffer.discount_amount} OFF
                  </Badge>
                )}
                {topOffer.is_limited && (
                  <Badge className="bg-yellow-400/30 text-white border-0 backdrop-blur-sm animate-pulse">
                    Limited Availability
                  </Badge>
                )}
              </div>
            </div>

            {/* CTA */}
            <div className="flex-shrink-0 w-full md:w-auto">
              <Button
                onClick={() => navigate(createPageUrl("Rewards"))}
                size="lg"
                className="w-full md:w-auto bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-2xl"
              >
                <Gift className="w-5 h-5 mr-2" />
                Claim Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              {availableOffers.length > 1 && (
                <p className="text-xs text-white/80 text-center mt-2">
                  +{availableOffers.length - 1} more exclusive {availableOffers.length === 2 ? 'offer' : 'offers'} available
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}