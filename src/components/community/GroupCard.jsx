import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, TrendingUp, Lock, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function GroupCard({ group, isMember, onJoin }) {
  const navigate = useNavigate();

  const typeConfig = {
    treatment_specific: { color: "bg-cyan-100 text-cyan-800", icon: "💊" },
    concern_based: { color: "bg-purple-100 text-purple-800", icon: "💭" },
    support: { color: "bg-pink-100 text-pink-800", icon: "❤️" },
    general: { color: "bg-blue-100 text-blue-800", icon: "💬" },
    milestone: { color: "bg-green-100 text-green-800", icon: "🎯" },
    location: { color: "bg-orange-100 text-orange-800", icon: "📍" }
  };

  const config = typeConfig[group.group_type] || typeConfig.general;

  return (
    <Card className="hover:shadow-lg transition-all cursor-pointer border-gray-200">
      <CardContent className="p-0">
        {/* Cover Image */}
        <div 
          className="h-32 bg-gradient-to-br from-cyan-500 to-teal-500 relative overflow-hidden"
          style={group.cover_image ? { backgroundImage: `url(${group.cover_image})`, backgroundSize: 'cover' } : {}}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute top-3 right-3 flex gap-2">
            {group.is_private && (
              <Badge className="bg-white/90 text-gray-900">
                <Lock className="w-3 h-3 mr-1" />
                Private
              </Badge>
            )}
            {group.ai_topic_clusters && group.ai_topic_clusters.length > 0 && (
              <Badge className="bg-purple-500/90 text-white">
                <Sparkles className="w-3 h-3 mr-1" />
                AI Enhanced
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{config.icon}</span>
                <h3 className="font-bold text-gray-900">{group.name}</h3>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {group.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{group.member_count || 0} members</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{group.post_count || 0} posts</span>
            </div>
          </div>

          {/* Tags */}
          {group.tags && group.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {group.tags.slice(0, 3).map((tag, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Sentiment Indicator */}
          {group.avg_sentiment_score !== undefined && (
            <div className="mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                <TrendingUp className="w-3 h-3" />
                <span>Group Mood</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    group.avg_sentiment_score > 60 ? "bg-green-500" :
                    group.avg_sentiment_score > 30 ? "bg-blue-500" : "bg-gray-400"
                  }`}
                  style={{ width: `${Math.max(group.avg_sentiment_score, 10)}%` }}
                />
              </div>
            </div>
          )}

          {/* Action */}
          {isMember ? (
            <Button
              onClick={() => navigate(createPageUrl(`Community?group=${group.id}`))}
              className="w-full bg-cyan-600 hover:bg-cyan-700"
            >
              View Group
            </Button>
          ) : (
            <Button
              onClick={() => onJoin(group)}
              variant="outline"
              className="w-full border-cyan-600 text-cyan-600 hover:bg-cyan-50"
            >
              {group.is_private ? "Request to Join" : "Join Group"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}