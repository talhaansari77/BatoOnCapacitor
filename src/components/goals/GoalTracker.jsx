import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Target, Plus, TrendingUp, Calendar, CheckCircle2, AlertCircle, Sparkles, Trophy } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function GoalTracker({ clientEmail }) {
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoal, setNewGoal] = useState({
    goal_title: '',
    goal_description: '',
    goal_type: 'hair_density',
    target_date: '',
    target_metric: 0
  });
  const queryClient = useQueryClient();

  const { data: goals } = useQuery({
    queryKey: ['treatmentGoals', clientEmail],
    queryFn: async () => {
      return await base44.entities.TreatmentGoal.filter({ client_email: clientEmail }, '-created_date');
    },
    enabled: !!clientEmail,
    initialData: [],
  });

  const createGoalMutation = useMutation({
    mutationFn: async (goalData) => {
      return await base44.entities.TreatmentGoal.create({
        ...goalData,
        client_email: clientEmail
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentGoals'] });
      setShowAddGoal(false);
      setNewGoal({ goal_title: '', goal_description: '', goal_type: 'hair_density', target_date: '', target_metric: 0 });
      toast.success('Goal created! We\'ll track your progress');
    },
  });

  const updateProgressMutation = useMutation({
    mutationFn: async ({ goalId, progress }) => {
      return await base44.entities.TreatmentGoal.update(goalId, { current_progress: progress });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['treatmentGoals'] });
      toast.success('Progress updated!');
    },
  });

  const goalTypes = [
    { value: 'hair_density', label: 'Hair Density Improvement' },
    { value: 'hair_thickness', label: 'Hair Thickness' },
    { value: 'hairline_restoration', label: 'Hairline Restoration' },
    { value: 'coverage', label: 'Coverage Area' },
    { value: 'confidence', label: 'Confidence & Well-being' },
    { value: 'overall_appearance', label: 'Overall Appearance' }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'achieved': return 'bg-green-100 text-green-800';
      case 'on_track': return 'bg-blue-100 text-blue-800';
      case 'needs_attention': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const activeGoals = goals.filter(g => g.status !== 'achieved');
  const achievedGoals = goals.filter(g => g.status === 'achieved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-purple-600" />
            Your Treatment Goals
          </h2>
          <p className="text-gray-600 text-sm mt-1">Set personal goals and track your journey</p>
        </div>
        <Dialog open={showAddGoal} onOpenChange={setShowAddGoal}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Goal Type</label>
                <Select value={newGoal.goal_type} onValueChange={(value) => setNewGoal({...newGoal, goal_type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {goalTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Goal Title</label>
                <Input
                  placeholder="e.g., Restore 80% hair density"
                  value={newGoal.goal_title}
                  onChange={(e) => setNewGoal({...newGoal, goal_title: e.target.value})}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Description</label>
                <Textarea
                  placeholder="Describe what success looks like for you..."
                  value={newGoal.goal_description}
                  onChange={(e) => setNewGoal({...newGoal, goal_description: e.target.value})}
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Target Date</label>
                <Input
                  type="date"
                  value={newGoal.target_date}
                  onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                />
              </div>

              <Button
                onClick={() => createGoalMutation.mutate(newGoal)}
                disabled={!newGoal.goal_title || !newGoal.goal_description}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600"
              >
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Goals */}
      {activeGoals.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {activeGoals.map((goal, idx) => {
            const daysRemaining = goal.target_date ? differenceInDays(new Date(goal.target_date), new Date()) : null;
            
            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="border-2 border-purple-200 overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg mb-1">{goal.goal_title}</CardTitle>
                        <Badge className={getStatusColor(goal.status)}>
                          {goal.status?.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-bold text-purple-600">{goal.current_progress}%</p>
                        <p className="text-xs text-gray-500">Complete</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <p className="text-sm text-gray-700">{goal.goal_description}</p>

                    {/* Progress Bar */}
                    <div>
                      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${goal.current_progress}%` }}
                          transition={{ duration: 1, delay: 0.3 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex items-center justify-between text-sm">
                      {goal.target_date && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {daysRemaining > 0 ? `${daysRemaining} days left` : 'Overdue'}
                          </span>
                        </div>
                      )}
                      {goal.next_predicted_improvement && (
                        <div className="flex items-center gap-2 text-purple-600">
                          <Sparkles className="w-4 h-4" />
                          <span className="text-xs">
                            Next improvement: {format(new Date(goal.next_predicted_improvement), 'MMM d')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Update Progress */}
                    <div className="pt-4 border-t">
                      <label className="text-xs font-medium text-gray-700 mb-2 block">Update Progress</label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="%"
                          className="w-20"
                          onBlur={(e) => {
                            const value = parseInt(e.target.value);
                            if (value >= 0 && value <= 100) {
                              updateProgressMutation.mutate({ goalId: goal.id, progress: value });
                            }
                          }}
                        />
                        <div className="flex gap-1">
                          {[25, 50, 75, 100].map(val => (
                            <Button
                              key={val}
                              variant="outline"
                              size="sm"
                              onClick={() => updateProgressMutation.mutate({ goalId: goal.id, progress: val })}
                              className="text-xs"
                            >
                              {val}%
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Achieved Goals */}
      {achievedGoals.length > 0 && (
        <Card className="border-2 border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Achieved Goals ({achievedGoals.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{goal.goal_title}</p>
                  <p className="text-xs text-gray-600">{goal.goal_description}</p>
                </div>
                <Badge className="bg-green-600 text-white">Achieved!</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {goals.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300">
          <CardContent className="p-12 text-center">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Set Your First Goal</h3>
            <p className="text-gray-600 mb-6">
              Define your personal treatment goals and track your progress
            </p>
            <Button
              onClick={() => setShowAddGoal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}