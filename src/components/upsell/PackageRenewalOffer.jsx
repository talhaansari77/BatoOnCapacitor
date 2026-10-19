import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ArrowRight, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function PackageRenewalOffer({ activePackage, clientLifecycle, onContactUs }) {
  const sessionsLeft = activePackage.total_sessions - activePackage.sessions_used;
  const isNearingCompletion = sessionsLeft <= 2 && sessionsLeft > 0;
  const isCompleted = sessionsLeft === 0;

  if (!isNearingCompletion && !isCompleted) return null;

  // Calculate loyalty discount
  const loyaltyDiscounts = {
    bronze: 0,
    silver: 5,
    gold: 10,
    platinum: 15,
    diamond: 20
  };

  const loyaltyDiscount = clientLifecycle?.loyalty_level 
    ? loyaltyDiscounts[clientLifecycle.loyalty_level] 
    : 0;

  const upgradeSuggestions = [
    {
      id: 'prp_maintenance',
      name: 'PRP Maintenance Package',
      description: 'Enhance and maintain your results with 6 PRP sessions',
      originalPrice: 2400,
      sessions: 6,
      icon: '💉',
      highlight: 'Most Popular'
    },
    {
      id: 'comprehensive_care',
      name: 'Comprehensive Care Bundle',
      description: 'Full programme with PRP, scalp treatment, and laser support',
      originalPrice: 8500,
      sessions: 12,
      icon: '⭐',
      highlight: 'Best Value'
    },
    {
      id: 'laser_therapy',
      name: 'Laser Therapy Package',
      description: 'Boost density and stimulate growth with 8 sessions',
      originalPrice: 1600,
      sessions: 8,
      icon: '⚡',
      highlight: 'Quick Results'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card className="border shadow-sm overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.25)", background: "#fff" }}>
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <Badge className="mb-3" style={{ background: "rgba(196,170,139,0.15)", color: "#3a2e1e" }}>
                {isCompleted ? 'Package Completed' : 'Almost Done'}
              </Badge>
              <CardTitle className="text-2xl text-gray-900">
                {isCompleted 
                  ? "🎉 Continue Your Success Journey" 
                  : "Time to Plan Your Next Step"}
              </CardTitle>
              <p className="text-gray-700 mt-2">
                {isCompleted 
                  ? "You've achieved amazing results! Let's maintain and enhance them." 
                  : `Only ${sessionsLeft} session${sessionsLeft > 1 ? 's' : ''} left. Lock in your next package now for the best results.`}
              </p>
            </div>
            <TrendingUp className="w-8 h-8" style={{ color: "#c4aa8b" }} />
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Loyalty Discount Banner */}
          {loyaltyDiscount > 0 && (
            <div className="rounded-xl p-4" style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.25)" }}>
              <div className="flex items-center gap-3 mb-1">
                <Star className="w-4 h-4" style={{ color: "#c4aa8b" }} />
                <p className="font-semibold text-sm text-[#333435]">
                  {clientLifecycle.loyalty_level.charAt(0).toUpperCase() + clientLifecycle.loyalty_level.slice(1)} member benefit
                </p>
              </div>
              <p className="text-sm text-[#7c8689]">
                {loyaltyDiscount}% loyalty discount applies to your renewal.
              </p>
            </div>
          )}

          {/* Package Suggestions */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: "#c4aa8b" }} />
              Recommended Next Steps
            </h3>

            {upgradeSuggestions.map((pkg, idx) => {
              const discountedPrice = pkg.originalPrice * (1 - loyaltyDiscount / 100);
              const savings = pkg.originalPrice - discountedPrice;

              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-white rounded-xl border-2 transition-all cursor-pointer group" style={{ borderColor: "rgba(196,170,139,0.2)" }}
                  onClick={() => onContactUs(pkg)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: "rgba(196,170,139,0.12)" }}>
                        {pkg.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-gray-900">{pkg.name}</h4>
                          {pkg.highlight && (
                            <Badge className="text-xs" style={{ background: "rgba(196,170,139,0.15)", color: "#3a2e1e" }}>
                              {pkg.highlight}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{pkg.sessions} sessions included</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      {loyaltyDiscount > 0 ? (
                        <div>
                          <p className="text-sm text-gray-500 line-through">${pkg.originalPrice.toLocaleString()}</p>
                          <p className="text-2xl font-bold text-[#333435]">
                            ${Math.round(discountedPrice).toLocaleString()}
                          </p>
                          <p className="text-xs text-green-600 font-semibold">
                            Save ${Math.round(savings)}!
                          </p>
                        </div>
                      ) : (
                        <p className="text-2xl font-bold text-gray-900">
                          ${pkg.originalPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="border-0 font-semibold"
                      style={{ background: "#3a2e1e", color: "#c4aa8b" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onContactUs(pkg);
                      }}
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Banner */}
          <div className="bato-style-hero rounded-xl p-5 text-center" style={{ background: "#3a2e1e" }}>
            <h3 className="text-base font-bold mb-2" style={{ color: "#c4aa8b" }}>
              Ready to plan your next step?
            </h3>
            <p className="text-sm mb-4" style={{ color: "rgba(238,235,230,0.7)" }}>
              Message your care team to discuss continuing your journey.
            </p>
            <Button
              size="sm"
              className="font-semibold border-0"
              style={{ background: "#c4aa8b", color: "#3a2e1e" }}
              onClick={() => onContactUs({ type: 'renewal' })}
            >
              Message Customer service
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}