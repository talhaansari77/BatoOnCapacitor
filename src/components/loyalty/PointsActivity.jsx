import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  ShoppingCart, 
  Calendar,
  Star,
  Users,
  MessageSquare,
  Share2,
  Award,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { motion } from "@/components/motion/BatoMotion";

// Points earning activities
const POINT_ACTIVITIES = [
  {
    id: "treatment_session",
    name: "Complete Treatment Session",
    points: 100,
    icon: Calendar,
    color: "text-cyan-600",
    bg: "bg-cyan-50"
  },
  {
    id: "product_purchase",
    name: "Product Purchase",
    points: "10 per $",
    icon: ShoppingCart,
    color: "text-purple-600",
    bg: "bg-purple-50"
  },
  {
    id: "referral",
    name: "Successful Referral",
    points: 500,
    icon: Users,
    color: "text-green-600",
    bg: "bg-green-50"
  },
  {
    id: "review",
    name: "Submit Review",
    points: 50,
    icon: Star,
    color: "text-yellow-600",
    bg: "bg-yellow-50"
  },
  {
    id: "feedback",
    name: "Complete Feedback",
    points: 30,
    icon: MessageSquare,
    color: "text-blue-600",
    bg: "bg-blue-50"
  },
  {
    id: "social_share",
    name: "Social Media Share",
    points: 20,
    icon: Share2,
    color: "text-pink-600",
    bg: "bg-pink-50"
  },
  {
    id: "package_renewal",
    name: "Package Renewal",
    points: 200,
    icon: Award,
    color: "text-orange-600",
    bg: "bg-orange-50"
  },
  {
    id: "appointment_kept",
    name: "Appointment Kept",
    points: 25,
    icon: Calendar,
    color: "text-teal-600",
    bg: "bg-teal-50"
  }
];

export default function PointsActivity({ recentActivity = [] }) {
  return (
    <Card className="border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          Earn Points
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Ways to Earn */}
        <div className="space-y-6">
          <div>
            <h4 className="font-semibold text-gray-900 mb-3">Ways to Earn Points</h4>
            <div className="grid md:grid-cols-2 gap-3">
              {POINT_ACTIVITIES.map((activity, idx) => {
                const Icon = activity.icon;
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-10 h-10 ${activity.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${activity.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{activity.name}</p>
                      <p className="text-xs text-gray-500">+{activity.points} points</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          {recentActivity.length > 0 && (
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Recent Point Activity</h4>
              <div className="space-y-2">
                {recentActivity.slice(0, 5).map((activity, idx) => {
                  const activityConfig = POINT_ACTIVITIES.find(a => a.id === activity.type);
                  const Icon = activityConfig?.icon || Plus;
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 ${activityConfig?.bg || 'bg-gray-50'} rounded-lg flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${activityConfig?.color || 'text-gray-600'}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-500">
                            {format(new Date(activity.date), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <Badge className="bg-green-500 text-white">
                        +{activity.points}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bonus Points Info */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Award className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-purple-900 mb-1">Bonus Points Multipliers</p>
                <ul className="space-y-1 text-sm text-purple-800">
                  <li>• Platinum members earn 1.5x on referrals</li>
                  <li>• Diamond members earn 2x on referrals</li>
                  <li>• Double points during special events</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export { POINT_ACTIVITIES };