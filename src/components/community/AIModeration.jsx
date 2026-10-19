import React from "react";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, Shield, TrendingUp, TrendingDown } from "lucide-react";
import { base44 } from "@/api/base44Client";

export const analyzeContentWithAI = async (content, title) => {
  // This function calls the AI to moderate content
  try {
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze the following community post for moderation purposes:

Title: ${title}
Content: ${content}

Please analyze and return JSON with:
1. moderation_status: "safe", "review_needed", "flagged", or "blocked"
2. moderation_reasons: array of reasons (e.g., ["inappropriate_language", "medical_misinformation"])
3. sentiment_score: number from -100 (very negative) to 100 (very positive)
4. sentiment_label: "very_negative", "negative", "neutral", "positive", or "very_positive"
5. topics: array of detected topics (e.g., ["hair_transplant", "recovery", "side_effects"])
6. toxicity_score: number from 0 (not toxic) to 100 (very toxic)
7. quality_score: number from 0 to 100 indicating post quality and helpfulness

Guidelines:
- Flag posts with medical misinformation, spam, harassment, or inappropriate content
- Sentiment should reflect the emotional tone
- Topics should be relevant to hair restoration
- Quality considers coherence, helpfulness, and constructiveness`,
      response_json_schema: {
        type: "object",
        properties: {
          moderation_status: { type: "string" },
          moderation_reasons: { type: "array", items: { type: "string" } },
          sentiment_score: { type: "number" },
          sentiment_label: { type: "string" },
          topics: { type: "array", items: { type: "string" } },
          toxicity_score: { type: "number" },
          quality_score: { type: "number" }
        }
      }
    });

    return response;
  } catch (error) {
    console.error("Error in AI moderation:", error);
    return {
      moderation_status: "review_needed",
      moderation_reasons: ["ai_analysis_failed"],
      sentiment_score: 0,
      sentiment_label: "neutral",
      topics: [],
      toxicity_score: 0,
      quality_score: 50
    };
  }
};

export function ModerationBadge({ post }) {
  const getStatusConfig = () => {
    if (post.ai_moderation_status === "blocked") {
      return {
        icon: AlertTriangle,
        color: "bg-red-100 text-red-800 border-red-200",
        text: "Blocked by AI"
      };
    }
    if (post.ai_moderation_status === "flagged") {
      return {
        icon: AlertTriangle,
        color: "bg-orange-100 text-orange-800 border-orange-200",
        text: "Needs Review"
      };
    }
    if (post.ai_moderation_status === "safe" || post.status === "auto_approved") {
      return {
        icon: CheckCircle2,
        color: "bg-green-100 text-green-800 border-green-200",
        text: "AI Verified"
      };
    }
    return {
      icon: Shield,
      color: "bg-gray-100 text-gray-800 border-gray-200",
      text: "Pending"
    };
  };

  const config = getStatusConfig();
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.color} text-xs`}>
      <Icon className="w-3 h-3 mr-1" />
      {config.text}
    </Badge>
  );
}

export function SentimentIndicator({ score, label }) {
  const getSentimentConfig = () => {
    if (score > 50) {
      return {
        icon: TrendingUp,
        color: "text-green-600",
        bgColor: "bg-green-50",
        text: "Positive"
      };
    }
    if (score < -50) {
      return {
        icon: TrendingDown,
        color: "text-red-600",
        bgColor: "bg-red-50",
        text: "Negative"
      };
    }
    return {
      icon: TrendingUp,
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      text: "Neutral"
    };
  };

  const config = getSentimentConfig();
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg ${config.bgColor}`}>
      <Icon className={`w-3 h-3 ${config.color}`} />
      <span className={`text-xs font-medium ${config.color}`}>{config.text}</span>
    </div>
  );
}

export function QualityScore({ score }) {
  const getQualityColor = () => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-gray-600";
  };

  return (
    <div className="flex items-center gap-2">
      <div className="w-full max-w-[100px] bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${
            score >= 80 ? "bg-green-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-yellow-500" : "bg-gray-500"
          }`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className={`text-xs font-semibold ${getQualityColor()}`}>
        {score}/100
      </span>
    </div>
  );
}

export default {
  analyzeContentWithAI,
  ModerationBadge,
  SentimentIndicator,
  QualityScore
};