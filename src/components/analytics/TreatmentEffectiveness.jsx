import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, ResponsiveContainer, RadarChart, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts";
import { Target, TrendingUp, Star, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function TreatmentEffectiveness({ sessions, caseFiles }) {
  const [aiReport, setAiReport] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Average satisfaction by department
  const deptSatisfaction = {};
  const deptCounts = {};

  sessions.forEach(session => {
    if (session.client_satisfaction) {
      const dept = session.department || 'Unknown';
      deptSatisfaction[dept] = (deptSatisfaction[dept] || 0) + session.client_satisfaction;
      deptCounts[dept] = (deptCounts[dept] || 0) + 1;
    }
  });

  const satisfactionData = Object.entries(deptSatisfaction).map(([dept, total]) => ({
    department: dept.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    avgSatisfaction: (total / deptCounts[dept]).toFixed(1),
    count: deptCounts[dept]
  }));

  // Treatment type effectiveness
  const treatmentSatisfaction = {};
  const treatmentCounts = {};

  sessions.forEach(session => {
    if (session.client_satisfaction) {
      const treatment = session.treatment_type || 'Unknown';
      treatmentSatisfaction[treatment] = (treatmentSatisfaction[treatment] || 0) + session.client_satisfaction;
      treatmentCounts[treatment] = (treatmentCounts[treatment] || 0) + 1;
    }
  });

  const treatmentData = Object.entries(treatmentSatisfaction)
    .map(([treatment, total]) => ({
      treatment: treatment.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      avgSatisfaction: (total / treatmentCounts[treatment]).toFixed(1),
      sessionCount: treatmentCounts[treatment]
    }))
    .sort((a, b) => b.avgSatisfaction - a.avgSatisfaction)
    .slice(0, 10);

  // Case file progress
  const progressDistribution = {
    'Initial': caseFiles.filter(c => c.case_status === 'initial_consultation').length,
    'Planned': caseFiles.filter(c => c.case_status === 'treatment_planned').length,
    'In Treatment': caseFiles.filter(c => c.case_status === 'in_treatment').length,
    'Post Treatment': caseFiles.filter(c => c.case_status === 'post_treatment').length,
    'Completed': caseFiles.filter(c => c.case_status === 'completed').length
  };

  const progressData = Object.entries(progressDistribution).map(([status, count]) => ({
    status,
    count
  }));

  // Pain level analysis
  const painLevels = sessions.filter(s => s.pain_level).map(s => s.pain_level);
  const avgPainLevel = painLevels.length > 0 
    ? (painLevels.reduce((sum, p) => sum + p, 0) / painLevels.length).toFixed(1)
    : 0;

  // Satisfaction trend over time
  const satisfactionTrend = sessions
    .filter(s => s.client_satisfaction && s.session_date)
    .sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
    .slice(-20)
    .map(s => ({
      session: `Session ${s.session_number}`,
      satisfaction: s.client_satisfaction
    }));

  // Generate AI Report
  const generateAIReport = async () => {
    setGenerating(true);
    try {
      const prompt = `Analyze the following treatment effectiveness data and provide insights:

Total Sessions: ${sessions.length}
Average Client Satisfaction: ${sessions.filter(s => s.client_satisfaction).reduce((sum, s) => sum + s.client_satisfaction, 0) / sessions.filter(s => s.client_satisfaction).length}
Average Pain Level: ${avgPainLevel}

Department Performance:
${satisfactionData.map(d => `- ${d.department}: ${d.avgSatisfaction}/10 (${d.count} sessions)`).join('\n')}

Top Treatments by Satisfaction:
${treatmentData.slice(0, 5).map(t => `- ${t.treatment}: ${t.avgSatisfaction}/10 (${t.sessionCount} sessions)`).join('\n')}

Case File Status:
${progressData.map(p => `- ${p.status}: ${p.count} cases`).join('\n')}

Please provide:
1. Overall treatment effectiveness assessment
2. Top performing departments and why
3. Areas needing improvement
4. Recommendations for enhancing patient satisfaction
5. Insights on pain management
6. Trends and patterns observed

Keep the response structured and actionable.`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setAiReport(response);
      toast.success('AI report generated successfully!');
    } catch (error) {
      console.error('Error generating AI report:', error);
      toast.error('Failed to generate AI report');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="grid gap-6">
      {/* Top Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Satisfaction</p>
                <p className="text-3xl font-bold text-green-600">
                  {sessions.filter(s => s.client_satisfaction).length > 0
                    ? (sessions.reduce((sum, s) => sum + (s.client_satisfaction || 0), 0) / 
                       sessions.filter(s => s.client_satisfaction).length).toFixed(1)
                    : 0}/10
                </p>
              </div>
              <Star className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-cyan-600">{sessions.length}</p>
              </div>
              <Target className="w-12 h-12 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Pain Level</p>
                <p className="text-3xl font-bold text-orange-600">{avgPainLevel}/10</p>
              </div>
              <TrendingUp className="w-12 h-12 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed Cases</p>
                <p className="text-3xl font-bold text-purple-600">
                  {caseFiles.filter(c => c.case_status === 'completed').length}
                </p>
              </div>
              <Target className="w-12 h-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Report Generation */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI-Generated Treatment Effectiveness Report
            </CardTitle>
            <Button 
              onClick={generateAIReport}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Report
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        {aiReport && (
          <CardContent>
            <div className="bg-white rounded-lg p-6 whitespace-pre-wrap text-sm text-gray-700">
              {aiReport}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Department Satisfaction */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-600" />
              Satisfaction by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={satisfactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Bar dataKey="avgSatisfaction" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Treatments */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-600" />
              Top 10 Treatments by Satisfaction
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={treatmentData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 10]} />
                <YAxis dataKey="treatment" type="category" width={150} />
                <Tooltip />
                <Bar dataKey="avgSatisfaction" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Case Progress */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Case File Progress Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#9333ea" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfaction Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600" />
              Recent Satisfaction Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={satisfactionTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="session" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="satisfaction" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}