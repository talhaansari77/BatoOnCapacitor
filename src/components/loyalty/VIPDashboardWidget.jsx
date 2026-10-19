import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Sparkles, Calendar, Gift, Star, MessageSquare, Phone } from "lucide-react";
import { motion } from "@/components/motion/BatoMotion";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function VIPDashboardWidget({ clientLifecycle, upcomingAppointments, onOpenConcierge }) {
  const navigate = useNavigate();

  if (!clientLifecycle?.vip_status) return null;

  const getTierGradient = (tier) => {
    switch(tier) {
      case "diamond": return "from-cyan-400 via-blue-500 to-purple-500";
      case "platinum": return "from-purple-400 via-pink-500 to-rose-500";
      default: return "from-yellow-400 via-amber-500 to-orange-500";
    }
  };

  const vipBenefits = [
    { icon: Calendar, label: "Priority Booking", description: "Book appointments before others" },
    { icon: Gift, label: "15% Discount", description: "On all services and products" },
    { icon: Star, label: "Exclusive Offers", description: "VIP-only promotions" },
    { icon: MessageSquare, label: "Personal Concierge", description: "Dedicated support team" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`border-0 shadow-2xl overflow-hidden bg-gradient-to-br ${getTierGradient(clientLifecycle.loyalty_level)}`}>
        <CardContent className="p-0">
          <div className="p-6 text-white">
            {/* VIP Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Crown className="w-8 h-8 text-white" />
                </div>
                <div>
                  <Badge className="bg-white/30 text-white border-0 mb-2 backdrop-blur-sm">
                    VIP MEMBER
                  </Badge>
                  <h3 className="text-2xl font-bold">
                    {clientLifecycle.loyalty_level?.toUpperCase()} ELITE
                  </h3>
                  <p className="text-white/80 text-sm">
                    Member since {clientLifecycle.vip_since ? new Date(clientLifecycle.vip_since).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
              <Sparkles className="w-12 h-12 text-white/40" />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-white/80 text-sm mb-1">Loyalty Points</p>
                <p className="text-3xl font-bold">{(clientLifecycle.loyalty_points || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-white/80 text-sm mb-1">Lifetime Value</p>
                <p className="text-3xl font-bold">${(clientLifecycle.lifetime_value || 0).toLocaleString()}</p>
              </div>
            </div>

            {/* VIP Benefits Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {vipBenefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="bg-white/10 backdrop-blur-sm rounded-lg p-3"
                  >
                    <Icon className="w-5 h-5 text-white mb-2" />
                    <p className="font-semibold text-sm mb-0.5">{benefit.label}</p>
                    <p className="text-xs text-white/70">{benefit.description}</p>
                  </motion.div>
                );
              })}
            </div>

            {/* VIP Actions */}
            <div className="space-y-2">
              <Button
                onClick={onOpenConcierge}
                className="w-full bg-white text-gray-900 hover:bg-white/90 font-semibold shadow-lg"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Contact Personal Concierge
              </Button>
              
              {upcomingAppointments?.length === 0 && (
                <Button
                  onClick={() => navigate(createPageUrl("Appointments"))}
                  variant="outline"
                  className="w-full border-2 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Priority Booking Available
                </Button>
              )}

              <Button
                onClick={() => navigate(createPageUrl("Shop"))}
                variant="outline"
                className="w-full border-2 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm"
              >
                <Gift className="w-4 h-4 mr-2" />
                Shop with 15% VIP Discount
              </Button>
            </div>

            {/* VIP Hotline */}
            <div className="mt-4 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4" />
                <span className="font-medium">VIP Hotline:</span>
                <a href="tel:+15551234567" className="font-bold">+1 (555) 123-4567</a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}