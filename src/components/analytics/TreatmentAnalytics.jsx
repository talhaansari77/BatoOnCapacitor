import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Target,
  Smile,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  ThumbsUp,
  TrendingDown,
  Minus
} from "lucide-react";
import { format, differenceInDays, parseISO } from "date-fns";

export default function TreatmentAnalytics({ sessions, caseFile }) {
  const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6'];

  // Calculate cumulative grafts over time
  const graftsOverTime = useMemo(() => {
    const sorted = [...sessions].sort((a, b) => 
      new Date(a.session_date) - new Date(b.session_date)
    );
    
    let cumulative = 0;
    return sorted.map(session => {
      cumulative += session.grafts_count || 0;
      return {
        date: format(new Date(session.session_date), 'MMM d'),
        fullDate: session.session_date,
        grafts: session.grafts_count || 0,
        cumulative: cumulative,
        session: session.session_number,
        planned: caseFile?.total_grafts_planned || 0
      };
    });
  }, [sessions, caseFile]);

  // Treatment type distribution
  const treatmentDistribution = useMemo(() => {
    const types = {};
    sessions.forEach(session => {
      const type = session.treatment_type;
      types[type] = (types[type] || 0) + 1;
    });
    
    return Object.entries(types).map(([name, value]) => ({
      name: name.replace(/_/g, ' ').toUpperCase(),
      value,
      sessions: value
    }));
  }, [sessions]);

  // Satisfaction scores over time
  const satisfactionOverTime = useMemo(() => {
    return sessions
      .filter(s => s.client_satisfaction)
      .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
      .map(session => ({
        date: format(new Date(session.session_date), 'MMM d'),
        satisfaction: session.client_satisfaction,
        session: session.session_number
      }));
  }, [sessions]);

  // Density and survival rate trends
  const densityTrends = useMemo(() => {
    return sessions
      .filter(s => s.estimated_density || s.graft_survival_rate)
      .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
      .map(session => ({
        date: format(new Date(session.session_date), 'MMM d'),
        density: session.estimated_density || 0,
        survival: session.graft_survival_rate || 0,
        session: session.session_number
      }));
  }, [sessions]);

  // Feedback analytics
  const feedbackStats = useMemo(() => {
    const sessionsWithFeedback = sessions.filter(s => s.client_satisfaction);
    const totalFeedback = sessionsWithFeedback.length;
    
    if (totalFeedback === 0) {
      return null;
    }

    const avgSatisfaction = sessionsWithFeedback.reduce((sum, s) => sum + s.client_satisfaction, 0) / totalFeedback;
    const avgPain = sessionsWithFeedback.filter(s => s.pain_level).reduce((sum, s) => sum + (s.pain_level || 0), 0) / 
                    (sessionsWithFeedback.filter(s => s.pain_level).length || 1);
    
    // Satisfaction distribution
    const satisfactionDist = {
      excellent: sessionsWithFeedback.filter(s => s.client_satisfaction >= 8).length,
      good: sessionsWithFeedback.filter(s => s.client_satisfaction >= 5 && s.client_satisfaction < 8).length,
      poor: sessionsWithFeedback.filter(s => s.client_satisfaction < 5).length
    };

    // Recent trend (last 3 sessions with feedback vs previous)
    const recentSessions = sessionsWithFeedback.slice(-3);
    const previousSessions = sessionsWithFeedback.slice(-6, -3);
    
    const recentAvg = recentSessions.reduce((sum, s) => sum + s.client_satisfaction, 0) / (recentSessions.length || 1);
    const previousAvg = previousSessions.length > 0 
      ? previousSessions.reduce((sum, s) => sum + s.client_satisfaction, 0) / previousSessions.length 
      : recentAvg;
    
    const trend = recentAvg > previousAvg + 0.5 ? 'improving' : 
                  recentAvg < previousAvg - 0.5 ? 'declining' : 'stable';

    return {
      totalFeedback,
      avgSatisfaction,
      avgPain,
      satisfactionDist,
      trend,
      feedbackRate: (totalFeedback / sessions.length * 100).toFixed(0)
    };
  }, [sessions]);

  // Timeline adherence
  const timelineAdherence = useMemo(() => {
    if (!caseFile?.start_date || !caseFile?.expected_completion) {
      return null;
    }

    const startDate = new Date(caseFile.start_date);
    const expectedEnd = new Date(caseFile.expected_completion);
    const today = new Date();
    
    const totalDays = differenceInDays(expectedEnd, startDate);
    const daysPassed = differenceInDays(today, startDate);
    const percentTimePassed = Math.min((daysPassed / totalDays) * 100, 100);
    
    const sessionsPlanned = caseFile.total_sessions_planned || sessions.length;
    const sessionsCompleted = sessions.length;
    const percentSessionsCompleted = (sessionsCompleted / sessionsPlanned) * 100;
    
    const graftsPlanned = caseFile.total_grafts_planned || 0;
    const graftsCompleted = sessions.reduce((sum, s) => sum + (s.grafts_count || 0), 0);
    const percentGraftsCompleted = graftsPlanned ? (graftsCompleted / graftsPlanned) * 100 : 0;

    return {
      percentTimePassed: Math.round(percentTimePassed),
      percentSessionsCompleted: Math.round(percentSessionsCompleted),
      percentGraftsCompleted: Math.round(percentGraftsCompleted),
      onTrack: percentSessionsCompleted >= percentTimePassed - 10,
      daysRemaining: Math.max(0, differenceInDays(expectedEnd, today)),
      sessionsRemaining: Math.max(0, sessionsPlanned - sessionsCompleted),
      graftsRemaining: Math.max(0, graftsPlanned - graftsCompleted)
    };
  }, [sessions, caseFile]);

  // Performance radar chart data
  const performanceData = useMemo(() => {
    const avgSatisfaction = satisfactionOverTime.length > 0
      ? satisfactionOverTime.reduce((sum, s) => sum + s.satisfaction, 0) / satisfactionOverTime.length
      : 0;
    
    const avgSurvival = densityTrends.length > 0
      ? densityTrends.reduce((sum, s) => sum + s.survival, 0) / densityTrends.length
      : 0;

    const timelineScore = timelineAdherence?.onTrack ? 9 : 6;
    const sessionFrequency = sessions.length >= 3 ? 8 : 5;

    return [
      { metric: 'Satisfaction', value: avgSatisfaction, fullMark: 10 },
      { metric: 'Graft Survival', value: avgSurvival / 10, fullMark: 10 },
      { metric: 'Timeline', value: timelineScore, fullMark: 10 },
      { metric: 'Consistency', value: sessionFrequency, fullMark: 10 },
      { metric: 'Grafts Progress', value: (timelineAdherence?.percentGraftsCompleted || 0) / 10, fullMark: 10 }
    ];
  }, [satisfactionOverTime, densityTrends, timelineAdherence, sessions]);

  // Stats cards data
  const stats = {
    totalGrafts: sessions.reduce((sum, s) => sum + (s.grafts_count || 0), 0),
    avgSatisfaction: satisfactionOverTime.length > 0
      ? (satisfactionOverTime.reduce((sum, s) => sum + s.satisfaction, 0) / satisfactionOverTime.length).toFixed(1)
      : 'N/A',
    avgSurvival: densityTrends.length > 0
      ? (densityTrends.reduce((sum, s) => sum + s.survival, 0) / densityTrends.length).toFixed(1)
      : 'N/A',
    currentDensity: densityTrends.length > 0
      ? densityTrends[densityTrends.length - 1].density
      : 'N/A'
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const getTrendIcon = (trend) => {
    if (trend === 'improving') return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (trend === 'declining') return <TrendingDown className="w-4 h-4 text-red-600" />;
    return <Minus className="w-4 h-4 text-gray-600" />;
  };

  const getTrendColor = (trend) => {
    if (trend === 'improving') return 'bg-green-100 text-green-800';
    if (trend === 'declining') return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Grafts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalGrafts.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-cyan-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Satisfaction</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgSatisfaction}/10</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Smile className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Survival</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgSurvival}%</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Current Density</p>
                <p className="text-2xl font-bold text-gray-900">
                  {typeof stats.currentDensity === 'number' ? `${stats.currentDensity}/cm²` : stats.currentDensity}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feedback Summary Card */}
      {feedbackStats && (
        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ThumbsUp className="w-5 h-5 text-yellow-600" />
                Client Feedback Summary
              </span>
              <Badge className={getTrendColor(feedbackStats.trend)}>
                {getTrendIcon(feedbackStats.trend)}
                <span className="ml-1 capitalize">{feedbackStats.trend}</span>
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Feedback Rate</p>
                <p className="text-3xl font-bold text-gray-900">{feedbackStats.feedbackRate}%</p>
                <p className="text-xs text-gray-500 mt-1">{feedbackStats.totalFeedback} of {sessions.length} sessions</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Avg Satisfaction</p>
                <p className="text-3xl font-bold text-purple-700">{feedbackStats.avgSatisfaction.toFixed(1)}/10</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Avg Pain Level</p>
                <p className="text-3xl font-bold text-orange-700">{feedbackStats.avgPain.toFixed(1)}/10</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <div className="flex justify-center gap-2 mb-2">
                  <Badge className="bg-green-100 text-green-800">{feedbackStats.satisfactionDist.excellent}</Badge>
                  <Badge className="bg-yellow-100 text-yellow-800">{feedbackStats.satisfactionDist.good}</Badge>
                  <Badge className="bg-red-100 text-red-800">{feedbackStats.satisfactionDist.poor}</Badge>
                </div>
                <p className="text-xs text-gray-500">Excellent / Good / Poor</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Timeline Adherence */}
      {timelineAdherence && (
        <Card className="border-none shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Treatment Timeline Progress
              {timelineAdherence.onTrack ? (
                <Badge className="ml-auto bg-green-100 text-green-800">On Track</Badge>
              ) : (
                <Badge className="ml-auto bg-yellow-100 text-yellow-800">Needs Attention</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Time Progress</p>
                  <p className="text-3xl font-bold text-gray-900">{timelineAdherence.percentTimePassed}%</p>
                  <p className="text-xs text-gray-500 mt-1">{timelineAdherence.daysRemaining} days remaining</p>
                </div>
                <div className="text-center p-4 bg-cyan-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Sessions Progress</p>
                  <p className="text-3xl font-bold text-cyan-700">{timelineAdherence.percentSessionsCompleted}%</p>
                  <p className="text-xs text-gray-500 mt-1">{timelineAdherence.sessionsRemaining} sessions remaining</p>
                </div>
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Grafts Progress</p>
                  <p className="text-3xl font-bold text-teal-700">{timelineAdherence.percentGraftsCompleted}%</p>
                  <p className="text-xs text-gray-500 mt-1">{timelineAdherence.graftsRemaining} grafts remaining</p>
                </div>
              </div>

              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={[
                  { name: 'Time', progress: timelineAdherence.percentTimePassed, color: '#94a3b8' },
                  { name: 'Sessions', progress: timelineAdherence.percentSessionsCompleted, color: '#06b6d4' },
                  { name: 'Grafts', progress: timelineAdherence.percentGraftsCompleted, color: '#14b8a6' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="progress" radius={[8, 8, 0, 0]}>
                    {[0, 1, 2].map((index) => (
                      <Cell key={index} fill={['#94a3b8', '#06b6d4', '#14b8a6'][index]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Grafts Over Time */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-600" />
              Grafts Implanted Over Time
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={graftsOverTime}>
                <defs>
                  <linearGradient id="colorGrafts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="cumulative" 
                  stroke="#06b6d4" 
                  fillOpacity={1} 
                  fill="url(#colorGrafts)"
                  name="Total Grafts"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Treatment Distribution */}
        <Card className="border-none shadow-lg">
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-purple-600" />
              Treatment Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={treatmentDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {treatmentDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfaction Scores */}
        {satisfactionOverTime.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Smile className="w-5 h-5 text-purple-600" />
                Client Satisfaction Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={satisfactionOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line 
                    type="monotone" 
                    dataKey="satisfaction" 
                    stroke="#8b5cf6" 
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                    name="Satisfaction Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Density & Survival Trends */}
        {densityTrends.length > 0 && (
          <Card className="border-none shadow-lg">
            <CardHeader className="border-b">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Density & Survival Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={densityTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="density" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 4 }}
                    name="Density (per cm²)"
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="survival" 
                    stroke="#ec4899" 
                    strokeWidth={2}
                    dot={{ fill: '#ec4899', r: 4 }}
                    name="Survival Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Performance Radar */}
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Overall Treatment Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <ResponsiveContainer width="100%" height={400}>
            <RadarChart data={performanceData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis domain={[0, 10]} />
              <Radar 
                name="Performance Score" 
                dataKey="value" 
                stroke="#8b5cf6" 
                fill="#8b5cf6" 
                fillOpacity={0.6} 
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Overall performance across key treatment metrics (scale: 0-10)
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}