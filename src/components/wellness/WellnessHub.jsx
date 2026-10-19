import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Droplets, Utensils, Dumbbell, Moon, Brain, CheckCircle2, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const recommendationIcons = {
  nutrition: Utensils,
  exercise: Dumbbell,
  sleep: Moon,
  stress_management: Brain,
  hydration: Droplets,
  supplements: Heart,
  lifestyle: Heart,
  hair_care: Sparkles
};

const recommendationColors = {
  nutrition: "from-green-500 to-emerald-500",
  exercise: "from-blue-500 to-cyan-500",
  sleep: "from-indigo-500 to-purple-500",
  stress_management: "from-pink-500 to-rose-500",
  hydration: "from-cyan-500 to-blue-500",
  supplements: "from-orange-500 to-amber-500",
  lifestyle: "from-purple-500 to-pink-500",
  hair_care: "from-yellow-500 to-orange-500"
};

export default function WellnessHub({ clientEmail }) {
  const queryClient = useQueryClient();

  const { data: recommendations } = useQuery({
    queryKey: ['wellnessRecommendations', clientEmail],
    queryFn: async () => {
      return await base44.entities.WellnessRecommendation.filter({
        client_email: clientEmail,
        status: 'active'
      }, '-created_date');
    },
    enabled: !!clientEmail,
    initialData: [],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }) => {
      return await base44.entities.WellnessRecommendation.update(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellnessRecommendations'] });
      toast.success('Updated!');
    },
  });

  const essentialRecs = recommendations.filter(r => r.priority === 'essential');
  const recommendedRecs = recommendations.filter(r => r.priority === 'recommended');
  const optionalRecs = recommendations.filter(r => r.priority === 'optional');

  const renderRecommendationCard = (rec, idx) => {
    const Icon = recommendationIcons[rec.recommendation_type];
    const colorClass = recommendationColors[rec.recommendation_type];

    return (
      <motion.div
        key={rec.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: idx * 0.05 }}
      >
        <Card className="border-2 border-gray-200 hover:border-purple-300 transition-colors">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-base mb-1">{rec.title}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {rec.recommendation_type.replace(/_/g, ' ')}
                  </Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateStatusMutation.mutate({ id: rec.id, status: 'dismissed' })}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700">{rec.description}</p>

            {rec.why_relevant && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-xs text-purple-900">
                  <strong>Why this matters:</strong> {rec.why_relevant}
                </p>
              </div>
            )}

            {rec.expected_benefit && (
              <div className="flex items-start gap-2 text-sm text-gray-600">
                <Sparkles className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p>{rec.expected_benefit}</p>
              </div>
            )}

            {rec.frequency && (
              <Badge variant="outline" className="text-xs">
                {rec.frequency}
              </Badge>
            )}

            <Button
              size="sm"
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              onClick={() => updateStatusMutation.mutate({ id: rec.id, status: 'completed' })}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark as Done
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
          <Heart className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Wellness Hub</h2>
          <p className="text-gray-600 text-sm">Personalized recommendations for optimal results</p>
        </div>
      </div>

      {recommendations.length > 0 ? (
        <Tabs defaultValue="essential" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="essential">
              Essential
              {essentialRecs.length > 0 && (
                <Badge className="ml-2 bg-red-500 text-white">{essentialRecs.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="recommended">
              Recommended
              {recommendedRecs.length > 0 && (
                <Badge className="ml-2 bg-blue-500 text-white">{recommendedRecs.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="optional">Optional</TabsTrigger>
          </TabsList>

          <TabsContent value="essential" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {essentialRecs.map((rec, idx) => renderRecommendationCard(rec, idx))}
            </div>
            {essentialRecs.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500" />
                  <p>All essential recommendations completed!</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="recommended" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {recommendedRecs.map((rec, idx) => renderRecommendationCard(rec, idx))}
            </div>
            {recommendedRecs.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <p>No recommended items at the moment</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="optional" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              {optionalRecs.map((rec, idx) => renderRecommendationCard(rec, idx))}
            </div>
            {optionalRecs.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center text-gray-500">
                  <p>No optional recommendations</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Wellness Recommendations Coming Soon</h3>
            <p className="text-gray-600">
              Your personal concierge will provide tailored wellness recommendations based on your treatment
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}