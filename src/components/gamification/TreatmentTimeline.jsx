
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Star, Target, Sparkles, CheckCircle2, Flag } from "lucide-react";
import { motion } from "framer-motion";
import { format, differenceInDays } from "date-fns";

export default function TreatmentTimeline({ sessions, caseFile, gameProgress }) {
  const totalSessions = caseFile?.total_sessions_planned || 5;
  const completedSessions = sessions.length;
  const progress = (completedSessions / totalSessions) * 100;

  // Calculate days in journey
  const daysInJourney = useMemo(() => {
    if (caseFile?.start_date) {
      const startDate = new Date(caseFile.start_date);
      const today = new Date();
      return differenceInDays(today, startDate);
    }
    return 0;
  }, [caseFile?.start_date]);

  // Calculate character position
  const characterPosition = useMemo(() => {
    // Ensure character doesn't go past the last station's visual position,
    // which is typically 100% when all sessions are completed.
    // If totalSessions is 0 or 1, special handling might be needed,
    // but assuming totalSessions >= 1.
    if (totalSessions === 0) return 0; // Avoid division by zero
    return (completedSessions / totalSessions) * 100;
  }, [completedSessions, totalSessions]);

  // Generate stations
  const stations = useMemo(() => {
    const stationsList = [];
    for (let i = 1; i <= totalSessions; i++) {
      const session = sessions.find(s => s.session_number === i);
      const isCompleted = !!session;
      const isCurrent = !isCompleted && i === completedSessions + 1; // A session is 'current' if it's the next one and not yet completed
      
      stationsList.push({
        number: i,
        completed: isCompleted,
        current: isCurrent,
        session: session,
        position: totalSessions === 1 ? 50 : ((i - 1) / (totalSessions - 1)) * 100
      });
    }
    return stationsList;
  }, [sessions, totalSessions, completedSessions]);

  return (
    <Card className="border-gray-200 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white border-b-0 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-xl sm:text-2xl flex items-center gap-3 mb-2">
              <Flag className="w-5 h-5 sm:w-6 sm:h-6" />
              Your Treatment Journey
            </CardTitle>
            <p className="text-sm sm:text-base text-purple-100">
              {daysInJourney} days into your transformation
            </p>
          </div>
          <div className="text-center bg-white/10 backdrop-blur-sm rounded-xl px-4 sm:px-6 py-3 border border-white/20">
            <div className="text-2xl sm:text-3xl font-bold mb-1">{completedSessions} / {totalSessions}</div>
            <div className="text-xs text-purple-100">Sessions</div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 md:p-8 bg-white">
        {/* Progress Bar with Character */}
        <div className="relative mb-20 sm:mb-24">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-purple-600 rounded-full"
            />
          </div>

          {/* Character on path */}
          <motion.div
            initial={{ left: "0%" }}
            animate={{ left: `${characterPosition}%` }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            className="absolute -top-12 sm:-top-14 transform -translate-x-1/2"
            style={{ zIndex: 10 }}
          >
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full border-3 sm:border-4 border-white shadow-lg flex items-center justify-center relative overflow-hidden">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                
                {/* Level badge */}
                <div className="absolute -bottom-1.5 -right-1.5 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-7 sm:h-7 bg-purple-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                  <span className="text-xs font-bold text-white">L{gameProgress?.level || 1}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stations */}
          <div className="relative mt-12 sm:mt-14" style={{ minHeight: '80px' }}>
            {stations.map((station, idx) => (
              <motion.div
                key={station.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.15 }}
                className="absolute transform -translate-x-1/2"
                style={{ 
                  left: `${station.position}%`,
                  zIndex: station.completed || station.current ? 5 : 1
                }}
              >
                <div className="flex flex-col items-center">
                  {/* Station marker */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-3 sm:border-4 border-white shadow-md ${
                    station.completed
                      ? "bg-green-500"
                      : station.current
                      ? "bg-blue-500"
                      : "bg-gray-300"
                  }`}>
                    {station.completed ? (
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : station.current ? (
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                    ) : (
                      <span className="text-white text-xs sm:text-sm font-semibold">{station.number}</span>
                    )}
                  </div>

                  {/* Trophy for completed station */}
                  {station.completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: idx * 0.15 + 0.3 }}
                      className="mt-1 sm:mt-2"
                    >
                      <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500" />
                    </motion.div>
                  )}

                  {/* Station details - Conditionally show to avoid overlap */}
                  {(totalSessions <= 6 || station.completed || station.current) && (
                    <div className="mt-2 text-center" style={{ minWidth: '60px', maxWidth: '80px' }}>
                      <p className="text-xs font-semibold text-gray-700 truncate">S{station.number}</p>
                      {station.session && (
                        <p className="text-xs text-gray-500 hidden sm:block">
                          {format(new Date(station.session.session_date), "MMM d")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-8 sm:mt-12">
          <div className="text-center p-3 sm:p-4 bg-purple-50 rounded-lg sm:rounded-xl border border-purple-100">
            <Star className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-purple-600">{gameProgress?.total_points || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Points</p>
          </div>

          <div className="text-center p-3 sm:p-4 bg-yellow-50 rounded-lg sm:rounded-xl border border-yellow-100">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-yellow-600">{gameProgress?.badges_earned?.length || 0}</p>
            <p className="text-xs text-gray-600 mt-1">Badges</p>
          </div>

          <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-lg sm:rounded-xl border border-blue-100">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
            <p className="text-lg sm:text-2xl font-bold text-blue-600">L{gameProgress?.level || 1}</p>
            <p className="text-xs text-gray-600 mt-1">Level</p>
          </div>
        </div>

        {/* Completion message */}
        {completedSessions === totalSessions && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-6 p-4 sm:p-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl sm:rounded-2xl text-center"
          >
            <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white mx-auto mb-2 sm:mb-3" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-1 sm:mb-2">Journey Complete!</h3>
            <p className="text-sm sm:text-base text-white">Congratulations on completing all your treatment sessions!</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
