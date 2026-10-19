
import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trophy, Medal, Award, Crown, TrendingUp, Lock, Unlock } from "lucide-react";
import { toast } from "sonner"; // Removed motion import as it's no longer used in the JSX

export default function Leaderboard({ userEmail, currentUserProgress }) {
  const [showPublic, setShowPublic] = useState(currentUserProgress?.is_public || false);

  const { data: leaderboard } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const allProgress = await base44.entities.GameProgress.filter({ is_public: true }, '-total_points', 10);
      return allProgress;
    },
    initialData: [],
  });

  const handleTogglePublic = async () => {
    try {
      if (!currentUserProgress) {
        // Create game progress if doesn't exist
        await base44.entities.GameProgress.create({
          client_email: userEmail,
          is_public: !showPublic,
          display_name: "Anonymous User"
        });
      } else {
        await base44.entities.GameProgress.update(currentUserProgress.id, {
          is_public: !showPublic
        });
      }
      setShowPublic(!showPublic);
      toast.success(showPublic ? "Removed from leaderboard" : "Added to leaderboard!");
    } catch (error) {
      console.error("Error updating leaderboard status:", error);
      toast.error("Failed to update leaderboard status");
    }
  };

  const getRankIcon = (rank) => {
    switch(rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Medal className="w-6 h-6 text-orange-600" />;
      default: return <Award className="w-5 h-5 text-gray-400" />;
    }
  };

  const getRankColor = (rank) => {
    switch(rank) {
      case 1: return "from-yellow-400 to-orange-500";
      case 2: return "from-gray-300 to-gray-500";
      case 3: return "from-orange-400 to-orange-600";
      default: return "from-gray-100 to-gray-200";
    }
  };

  const currentUserRank = leaderboard.findIndex(p => p.client_email === userEmail) + 1;

  return (
    <Card className="border-gray-200">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-b-0 pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Leaderboard
          </CardTitle>
          {currentUserRank > 0 && (
            <Badge className="bg-white/20 text-white border-white/40 px-3 py-1">
              #{currentUserRank}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Public Toggle */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              {showPublic ? (
                <Unlock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <Label htmlFor="public-toggle" className="text-sm font-semibold text-gray-900 cursor-pointer block mb-1">
                  Share Progress Publicly
                </Label>
                <p className="text-xs text-gray-600">
                  Join the leaderboard and compete with others
                </p>
              </div>
            </div>
            <Switch
              id="public-toggle"
              checked={showPublic}
              onCheckedChange={handleTogglePublic}
            />
          </div>
        </div>

        {/* Leaderboard List */}
        {leaderboard.length > 0 ? (
          <div className="space-y-3">
            {leaderboard.map((progress, idx) => {
              const rank = idx + 1;
              const isCurrentUser = progress.client_email === userEmail;
              
              return (
                <div
                  key={progress.id}
                  className={`p-4 rounded-xl border-2 ${
                    isCurrentUser 
                      ? "bg-purple-50 border-purple-200" 
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRankColor(rank)} flex items-center justify-center flex-shrink-0`}>
                      {rank <= 3 ? (
                        getRankIcon(rank)
                      ) : (
                        <span className="font-bold text-gray-700 text-sm">#{rank}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {progress.display_name || "Anonymous User"}
                        {isCurrentUser && (
                          <Badge className="ml-2 bg-purple-600 text-white text-xs">You</Badge>
                        )}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          Level {progress.level || 1}
                        </span>
                        <span className="text-xs text-gray-600 flex items-center gap-1">
                          <Trophy className="w-3 h-3 text-yellow-600" />
                          {progress.badges_earned?.length || 0} badges
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-purple-600">
                        {progress.total_points || 0}
                      </p>
                      <p className="text-xs text-gray-500">points</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-base font-semibold text-gray-900 mb-2">No Competitors Yet</h3>
            <p className="text-gray-600 text-sm mb-4">
              Be the first to join!
            </p>
            {!showPublic && (
              <Button
                onClick={handleTogglePublic}
                className="bg-purple-600 hover:bg-purple-700"
              >
                Join Leaderboard
              </Button>
            )}
          </div>
        )}

        {/* Motivation */}
        {showPublic && leaderboard.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-gray-700 text-center">
              <strong className="text-green-700">Keep going!</strong> Complete sessions and upload photos to earn more points
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
