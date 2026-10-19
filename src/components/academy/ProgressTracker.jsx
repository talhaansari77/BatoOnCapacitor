import {useLocation} from "@/components/LocationContext";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, TrendingUp } from "lucide-react";
import { motion } from "@/components/motion/BatoMotion";

export default function ProgressTracker({ userProgress, academyContent, totalPoints }) {
  const {t,isRTL}=useLocation();
  const totalContent = academyContent.length;
  const completedCount = new Set(userProgress.filter(p => p.status === 'completed' && academyContent.some(c=>c.id===p.content_id)).map(p=>p.content_id)).size;
  const progressPercentage = totalContent > 0 ? Math.round((completedCount / totalContent) * 100) : 0;

  // Determine learning level based on completion
  const getLearningLevel = () => {
    if (completedCount >= 20) return { name: t("Expert","خبير"), color: 'from-purple-500 to-pink-500', icon: '🏆' };
    if (completedCount >= 10) return { name: t("Advanced","متقدم"), color: 'from-blue-500 to-cyan-500', icon: '⭐' };
    if (completedCount >= 5) return { name: t("Intermediate","متوسط"), color: 'from-yellow-500 to-orange-500', icon: '📚' };
    return { name: t("Beginner","مبتدئ"), color: 'from-green-500 to-emerald-500', icon: '🌱' };
  };

  const learningLevel = getLearningLevel();

  // Next milestone
  const getNextMilestone = () => {
    if (completedCount < 5) return { target: 5, name: t("Intermediate","متوسط") };
    if (completedCount < 10) return { target: 10, name: t("Advanced","متقدم") };
    if (completedCount < 20) return { target: 20, name: t("Expert","خبير") };
    return { target: completedCount + 10, name: t("Master","متمرس") };
  };

  const nextMilestone = getNextMilestone();
  const progressToMilestone = nextMilestone ? Math.round((completedCount / nextMilestone.target) * 100) : 100;

  return (
    <Card className="border-gray-200">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-indigo-600" />{t("Your Learning Progress","تقدمك في التعلّم")}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t("Overall Completion","نسبة الإنجاز")}</span>
              <span className="text-sm font-semibold text-indigo-600">{progressPercentage}%</span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500">
              {completedCount}{" "}{t("of","من")}{" "}{totalContent}{" "}{t("completed","مكتمل")}</p>
          </div>

          {/* Learning Level */}
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${learningLevel.color} flex items-center justify-center text-3xl`}>
              {learningLevel.icon}
            </div>
            <div>
              <p className="text-sm text-gray-600">{t("Current Level","المستوى الحالي")}</p>
              <p className="text-xl font-bold text-gray-900">{learningLevel.name}</p>
              <p className="text-xs text-gray-500">{totalPoints}{" "}{t("points earned","نقطة مكتسبة")}</p>
            </div>
          </div>

          {/* Next Milestone */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">{t("Next: ","التالي:")}{nextMilestone.name}</span>
              <span className="text-sm font-semibold text-green-600">
                {completedCount}/{nextMilestone.target}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressToMilestone}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
              />
            </div>
            <p className="text-xs text-gray-500">
              {nextMilestone.target - completedCount}{" "}{t("more to unlock","متبقية للوصول إلى المستوى التالي")}</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-purple-600" />
            <h4 className="font-semibold text-gray-900">{t("Learning Achievements","إنجازات التعلّم")}</h4>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { count: 1, label: t("First Step","الخطوة الأولى"), unlocked: completedCount >= 1 },
              { count: 5, label: t("Fast Learner","متعلم سريع"), unlocked: completedCount >= 5 },
              { count: 10, label: t("Knowledge Seeker","باحث عن المعرفة"), unlocked: completedCount >= 10 },
              { count: 20, label: t("Academy Master","متميز في الأكاديمية"), unlocked: completedCount >= 20 },
              { count: 50, label: t("Hair Expert","مهتم بصحة الشعر"), unlocked: completedCount >= 50 }
            ].map((achievement, idx) => (
              <Badge
                key={idx}
                className={achievement.unlocked 
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
              >
                {achievement.unlocked ? '🏆' : '🔒'} {achievement.label}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}