
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Camera, 
  Smile, 
  Target, 
  Award, 
  Star,
  Flame,
  Heart,
  Zap,
  Crown,
  Lock
} from "lucide-react";
import { motion } from "framer-motion";

const ACHIEVEMENTS = [
  {
    id: "first_session",
    name: "First Step",
    description: "Complete your first treatment session",
    icon: Target,
    color: "from-blue-500 to-cyan-500",
    points: 50,
    condition: (sessions) => sessions.length >= 1
  },
  {
    id: "photo_uploader",
    name: "Photographer",
    description: "Upload 5 progress photos",
    icon: Camera,
    color: "from-pink-500 to-rose-500",
    points: 100,
    condition: (sessions) => sessions.reduce((sum, s) => sum + (s.photos?.length || 0), 0) >= 5
  },
  {
    id: "satisfaction_star",
    name: "Satisfaction Star",
    description: "Rate 3 sessions with 8+ satisfaction",
    icon: Smile,
    color: "from-yellow-500 to-orange-500",
    points: 150,
    condition: (sessions) => sessions.filter(s => s.client_satisfaction >= 8).length >= 3
  },
  {
    id: "halfway_hero",
    name: "Halfway Hero",
    description: "Complete 50% of planned sessions",
    icon: Trophy,
    color: "from-purple-500 to-pink-500",
    points: 200,
    condition: (sessions, caseFile) => {
      const planned = caseFile?.total_sessions_planned || 5;
      return sessions.length >= Math.ceil(planned / 2);
    }
  },
  {
    id: "consistency_champion",
    name: "Consistency Champion",
    description: "Complete 5 sessions on schedule",
    icon: Flame,
    color: "from-orange-500 to-red-500",
    points: 250,
    condition: (sessions) => sessions.length >= 5
  },
  {
    id: "feedback_master",
    name: "Feedback Master",
    description: "Provide feedback for all sessions",
    icon: Heart,
    color: "from-red-500 to-pink-500",
    points: 300,
    condition: (sessions) => sessions.every(s => s.client_satisfaction)
  },
  {
    id: "journey_complete",
    name: "Journey Complete",
    description: "Complete all planned treatment sessions",
    icon: Crown,
    color: "from-yellow-400 to-yellow-600",
    points: 500,
    condition: (sessions, caseFile) => {
      const planned = caseFile?.total_sessions_planned || 5;
      return sessions.length >= planned;
    }
  },
  {
    id: "photo_pro",
    name: "Photo Pro",
    description: "Upload 20+ progress photos",
    icon: Camera,
    color: "from-indigo-500 to-purple-500",
    points: 200,
    condition: (sessions) => sessions.reduce((sum, s) => sum + (s.photos?.length || 0), 0) >= 20
  },
  {
    id: "perfect_score",
    name: "Perfect Score",
    description: "Give 10/10 satisfaction rating",
    icon: Star,
    color: "from-yellow-500 to-amber-500",
    points: 100,
    condition: (sessions) => sessions.some(s => s.client_satisfaction === 10)
  }
];

export default function AchievementShowcase({ sessions, caseFile, gameProgress }) {
  const achievementStatus = useMemo(() => {
    return ACHIEVEMENTS.map(achievement => {
      const isUnlocked = achievement.condition(sessions, caseFile);
      const isNewlyUnlocked = isUnlocked && !gameProgress?.badges_earned?.includes(achievement.id);
      
      return {
        ...achievement,
        unlocked: isUnlocked,
        newlyUnlocked: isNewlyUnlocked
      };
    });
  }, [sessions, caseFile, gameProgress]);

  const unlockedCount = achievementStatus.filter(a => a.unlocked).length;
  const totalPoints = achievementStatus.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);

  return (
    <Card className="border-gray-200">
      <CardHeader className="border-b border-gray-100 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-900">
            Achievements & Badges
          </CardTitle>
          <Badge className="bg-yellow-500 text-white px-3 py-1">
            {unlockedCount} / {ACHIEVEMENTS.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Progress Overview */}
        <div className="mb-6 p-4 bg-purple-50 rounded-xl border border-purple-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Achievement Progress</span>
            <span className="text-sm font-semibold text-purple-600">
              {Math.round((unlockedCount / ACHIEVEMENTS.length) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-purple-600 rounded-full"
            />
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {achievementStatus.map((achievement, idx) => {
            const Icon = achievement.icon;
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.03 }}
                className={`p-4 rounded-xl border-2 ${
                  achievement.unlocked
                    ? "bg-white border-gray-200"
                    : "bg-gray-50 border-gray-200 opacity-60"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    achievement.unlocked
                      ? `bg-gradient-to-br ${achievement.color}`
                      : "bg-gray-300"
                  }`}>
                    {achievement.unlocked ? (
                      <Icon className="w-6 h-6 text-white" />
                    ) : (
                      <Lock className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold mb-1 ${
                      achievement.unlocked ? "text-gray-900" : "text-gray-500"
                    }`}>
                      {achievement.name}
                    </h3>
                    <p className={`text-xs mb-2 ${
                      achievement.unlocked ? "text-gray-600" : "text-gray-400"
                    }`}>
                      {achievement.description}
                    </p>
                    <Badge variant={achievement.unlocked ? "default" : "outline"} className={`text-xs ${
                      achievement.unlocked 
                        ? "bg-yellow-500 text-white" 
                        : "text-gray-400 border-gray-300"
                    }`}>
                      <Star className="w-3 h-3 mr-1" />
                      +{achievement.points}
                    </Badge>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Next Achievement */}
        {unlockedCount < ACHIEVEMENTS.length && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-blue-900 mb-1 text-sm">Next Achievement</p>
                <p className="text-sm text-blue-700">
                  {achievementStatus.find(a => !a.unlocked)?.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
