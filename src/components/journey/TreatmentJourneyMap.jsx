
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Circle, 
  Calendar,
  Image as ImageIcon,
  Smile,
  Target,
  Award,
  TrendingUp,
  Sparkles,
  Clock
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";

export default function TreatmentJourneyMap({ caseFile, sessions }) {
  // Calculate milestones based on actual data
  const milestones = useMemo(() => {
    const items = [];
    
    // 1. Initial Consultation
    if (caseFile) {
      items.push({
        id: 'consultation',
        title: 'Initial Consultation',
        description: caseFile.diagnosis ? `Diagnosis: ${caseFile.diagnosis}` : 'Case opened',
        date: caseFile.created_date,
        completed: true,
        icon: Calendar,
        color: 'from-blue-500 to-indigo-500',
        type: 'milestone'
      });
    }

    // 2. Treatment Plan Created
    if (caseFile?.treatment_plan) {
      items.push({
        id: 'plan',
        title: 'Treatment Plan Created',
        description: `${caseFile.total_sessions_planned || 'Multiple'} sessions planned`,
        date: caseFile.start_date || caseFile.created_date,
        completed: true,
        icon: Target,
        color: 'from-purple-500 to-pink-500',
        type: 'milestone'
      });
    }

    // 3. First Treatment Session
    if (sessions.length > 0) {
      const firstSession = sessions[sessions.length - 1]; // Assuming sessions are ordered newest to oldest, so last element is chronologically first
      items.push({
        id: 'first-session',
        title: 'First Treatment Session',
        description: `${firstSession.treatment_type.replace(/_/g, ' ').toUpperCase()}${firstSession.grafts_count ? ` - ${firstSession.grafts_count} grafts` : ''}`,
        date: firstSession.session_date,
        completed: true,
        icon: Sparkles,
        color: 'from-cyan-500 to-teal-500',
        type: 'milestone',
        hasPhotos: firstSession.photos?.length > 0
      });
    }

    // 4. Quarter Graft Target (25%)
    const totalGraftsPlanned = caseFile?.total_grafts_planned || 0;
    const totalGraftsCompleted = sessions.reduce((sum, s) => sum + (s.grafts_count || 0), 0);
    if (totalGraftsPlanned > 0 && totalGraftsCompleted >= totalGraftsPlanned * 0.25) {
      // Find the session where 25% was cumulatively met or exceeded
      let cumulativeGrafts = 0;
      const targetSession = sessions.slice().sort((a, b) => new Date(a.session_date) - new Date(b.session_date)).find(s => {
        cumulativeGrafts += s.grafts_count || 0;
        return cumulativeGrafts >= totalGraftsPlanned * 0.25;
      });
      
      if (targetSession) {
        items.push({
          id: 'quarter-grafts',
          title: '25% Graft Milestone',
          description: `${Math.round(totalGraftsPlanned * 0.25)} grafts achieved`,
          date: targetSession.session_date,
          completed: true,
          icon: Award,
          color: 'from-amber-500 to-orange-500',
          type: 'achievement',
          progress: 25
        });
      }
    }

    // 5. Half Graft Target (50%)
    if (totalGraftsPlanned > 0 && totalGraftsCompleted >= totalGraftsPlanned * 0.5) {
      let cumulativeGrafts = 0;
      const targetSession = sessions.slice().sort((a, b) => new Date(a.session_date) - new Date(b.session_date)).find(s => {
        cumulativeGrafts += s.grafts_count || 0;
        return cumulativeGrafts >= totalGraftsPlanned * 0.5;
      });

      if (targetSession) {
        items.push({
          id: 'half-grafts',
          title: 'Halfway There! 🎉',
          description: `${Math.round(totalGraftsPlanned * 0.5)} grafts achieved`,
          date: targetSession.session_date,
          completed: true,
          icon: TrendingUp,
          color: 'from-green-500 to-emerald-500',
          type: 'achievement',
          progress: 50
        });
      }
    }

    // 6. First Photos Milestone
    const sessionsWithPhotos = sessions.filter(s => s.photos?.length > 0)
                                      .sort((a, b) => new Date(a.session_date) - new Date(b.session_date)); // Sort by date to get earliest
    if (sessionsWithPhotos.length > 0) {
      const firstPhotoSession = sessionsWithPhotos[0]; // Earliest session with photos
      items.push({
        id: 'first-photos',
        title: 'Progress Photos Captured',
        description: `${sessionsWithPhotos.reduce((sum, s) => sum + (s.photos?.length || 0), 0)} photos total`,
        date: firstPhotoSession.session_date,
        completed: true,
        icon: ImageIcon,
        color: 'from-pink-500 to-rose-500',
        type: 'milestone',
        photoCount: sessionsWithPhotos.reduce((sum, s) => sum + (s.photos?.length || 0), 0)
      });
    }

    // 7. High Satisfaction Milestone
    const sessionsWithHighSatisfaction = sessions.filter(s => s.client_satisfaction >= 8)
                                                  .sort((a, b) => new Date(a.session_date) - new Date(b.session_date));
    if (sessionsWithHighSatisfaction.length >= 3) {
      const latestHighSat = sessionsWithHighSatisfaction[sessionsWithHighSatisfaction.length - 1]; // Use the latest session to mark the date
      items.push({
        id: 'satisfaction',
        title: 'Excellent Satisfaction Streak',
        description: `${sessionsWithHighSatisfaction.length} sessions rated 8+ out of 10`,
        date: latestHighSat.session_date,
        completed: true,
        icon: Smile,
        color: 'from-yellow-500 to-amber-500',
        type: 'achievement',
        satisfactionScore: sessionsWithHighSatisfaction.reduce((sum, s) => sum + s.client_satisfaction, 0) / sessionsWithHighSatisfaction.length
      });
    }

    // 8. Three-Quarter Graft Target (75%)
    if (totalGraftsPlanned > 0 && totalGraftsCompleted >= totalGraftsPlanned * 0.75) {
      let cumulativeGrafts = 0;
      const targetSession = sessions.slice().sort((a, b) => new Date(a.session_date) - new Date(b.session_date)).find(s => {
        cumulativeGrafts += s.grafts_count || 0;
        return cumulativeGrafts >= totalGraftsPlanned * 0.75;
      });

      if (targetSession) {
        items.push({
          id: 'three-quarter-grafts',
          title: 'Almost Complete! 🌟',
          description: `${Math.round(totalGraftsPlanned * 0.75)} grafts achieved`,
          date: targetSession.session_date,
          completed: true,
          icon: Award,
          color: 'from-indigo-500 to-purple-500',
          type: 'achievement',
          progress: 75
        });
      }
    }

    // 9. All Planned Sessions Completed
    // Ensure sessions are sorted chronologically to get the correct last session date
    const sortedSessions = sessions.slice().sort((a, b) => new Date(a.session_date) - new Date(b.session_date));
    if (caseFile?.total_sessions_planned && sortedSessions.length >= caseFile.total_sessions_planned) {
      const lastSession = sortedSessions[sortedSessions.length - 1]; // last session chronologically
      items.push({
        id: 'sessions-complete',
        title: 'All Sessions Completed',
        description: `${sortedSessions.length} treatment sessions finished`,
        date: lastSession.session_date,
        completed: true,
        icon: CheckCircle2,
        color: 'from-green-500 to-teal-500',
        type: 'achievement'
      });
    }

    // 10. Treatment Complete / Expected Completion
    if (caseFile?.expected_completion) {
      const isComplete = caseFile.case_status === 'completed' || caseFile.case_status === 'post_treatment';
      const isPast = new Date(caseFile.expected_completion) < new Date();
      
      items.push({
        id: 'completion',
        title: isComplete ? 'Treatment Complete! 🎊' : 'Expected Completion',
        description: isComplete ? 'Journey complete, results looking great!' : 'Final results and evaluation',
        date: caseFile.expected_completion,
        completed: isComplete,
        icon: isComplete ? Award : Clock,
        color: isComplete ? 'from-yellow-500 to-orange-500' : 'from-gray-400 to-gray-500',
        type: 'milestone',
        isFuture: !isPast && !isComplete
      });
    }

    // Sort by date
    return items.sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [caseFile, sessions]);

  // Calculate overall progress
  const overallProgress = useMemo(() => {
    const completedMilestones = milestones.filter(m => m.completed).length;
    const totalMilestones = milestones.length;
    return totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;
  }, [milestones]);

  // Calculate days in journey
  const daysInJourney = useMemo(() => {
    if (!caseFile?.created_date) return 0;
    return differenceInDays(new Date(), new Date(caseFile.created_date));
  }, [caseFile]);

  if (milestones.length === 0) {
    return null;
  }

  return (
    <Card className="border-gray-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-cyan-600 to-cyan-700 text-white border-b-0 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl flex items-center gap-3 mb-2">
              <Sparkles className="w-6 h-6" />
              Treatment Journey
            </CardTitle>
            <p className="text-cyan-100">
              {daysInJourney} days into your transformation
            </p>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
            <div className="text-3xl font-bold mb-1">{overallProgress}%</div>
            <div className="text-xs text-cyan-100">Complete</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-8 bg-white">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="bato-progress-track h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-cyan-600 rounded-full"
            />
          </div>
          <div className="flex justify-between mt-3 text-sm text-gray-600">
            <span>Start</span>
            <span className="font-medium text-gray-900">
              {milestones.filter(m => m.completed).length} of {milestones.length} milestones
            </span>
            <span>Complete</span>
          </div>
        </div>

        {/* Journey Timeline */}
        <div className="relative">
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-8">
            {milestones.map((milestone, index) => {
              const Icon = milestone.icon;

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.08 }}
                  className="relative flex gap-5"
                >
                  <div className={`relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white ${
                    milestone.completed 
                      ? `bg-gradient-to-br ${milestone.color} shadow-md` 
                      : 'bg-gray-300'
                  }`}>
                    <Icon className={`w-6 h-6 ${milestone.completed ? 'text-white' : 'text-gray-500'}`} />
                  </div>

                  <div className="flex-1 pb-2">
                    <div className={`rounded-xl p-5 border-2 ${
                      milestone.completed 
                        ? milestone.type === 'achievement' 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-white border-gray-200'
                        : 'bg-gray-50 border-gray-200'
                    } ${milestone.isFuture ? 'opacity-60' : ''}`}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className={`font-semibold ${
                            milestone.completed ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {milestone.title}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            milestone.completed ? 'text-gray-600' : 'text-gray-400'
                          }`}>
                            {milestone.description}
                          </p>
                        </div>
                        {milestone.completed && (
                          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(milestone.date), "MMM d, yyyy")}
                        </Badge>
                        
                        {milestone.progress && (
                          <Badge className="bg-green-600 text-white text-xs">
                            {milestone.progress}% Complete
                          </Badge>
                        )}

                        {milestone.type === 'achievement' && (
                          <Badge className="bg-purple-600 text-white text-xs">
                            <Award className="w-3 h-3 mr-1" />
                            Achievement
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: sessions.length, label: "Sessions", color: "cyan" },
              { value: sessions.reduce((sum, s) => sum + (s.grafts_count || 0), 0).toLocaleString(), label: "Grafts", color: "purple" },
              { value: sessions.reduce((sum, s) => sum + (s.photos?.length || 0), 0), label: "Photos", color: "yellow" },
              { value: milestones.filter(m => m.type === 'achievement').length, label: "Achievements", color: "green" }
            ].map((stat, idx) => (
              <div key={idx} className={`text-center p-4 bg-${stat.color}-50 rounded-xl border border-${stat.color}-100`}>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
