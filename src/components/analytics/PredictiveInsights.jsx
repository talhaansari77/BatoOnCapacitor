import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, DollarSign, Calendar, Loader2, AlertCircle } from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar 
} from "recharts";
import { format, addDays, addMonths } from "date-fns";
import { toast } from "sonner";

export default function PredictiveInsights({ appointments, orders, sessions, clients }) {
  const [predictions, setPredictions] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Calculate historical trends
  const last30DaysAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.created_date);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return aptDate >= thirtyDaysAgo;
  });

  const avgDailyBookings = last30DaysAppointments.length / 30;

  const last3MonthsRevenue = orders.filter(order => {
    const orderDate = new Date(order.created_date);
    const threeMonthsAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return orderDate >= threeMonthsAgo;
  });

  const avgMonthlyRevenue = last3MonthsRevenue.reduce((sum, o) => sum + (o.total_amount || 0), 0) / 3;

  // Generate predictions
  const generatePredictions = async () => {
    setGenerating(true);
    try {
      const prompt = `As a healthcare business analyst, provide predictive analytics based on the following data:

CURRENT METRICS:
- Total Clients: ${clients.length}
- VIP Clients: ${clients.filter(c => c.vip_status).length}
- Total Appointments (All Time): ${appointments.length}
- Last 30 Days Bookings: ${last30DaysAppointments.length}
- Average Daily Bookings: ${avgDailyBookings.toFixed(1)}
- Average Monthly Revenue: $${avgMonthlyRevenue.toFixed(0)}
- Total Completed Sessions: ${sessions.length}
- Average Satisfaction: ${sessions.filter(s => s.client_satisfaction).reduce((sum, s) => sum + s.client_satisfaction, 0) / sessions.filter(s => s.client_satisfaction).length}

GROWTH TRENDS:
- Client Growth Rate: ${((clients.filter(c => c.acquisition_date).length / Math.max(clients.length, 1)) * 100).toFixed(1)}%
- VIP Conversion Rate: ${((clients.filter(c => c.vip_status).length / clients.length) * 100).toFixed(1)}%
- At-Risk Clients: ${clients.filter(c => c.churn_risk_score > 60).length}

Please provide:
1. BOOKING DEMAND FORECAST for next 30 days (estimate number of bookings)
2. REVENUE FORECAST for next 3 months (provide monthly estimates)
3. VIP GROWTH PROJECTION (expected VIP client growth)
4. CAPACITY PLANNING recommendations
5. RISK FACTORS to watch out for
6. GROWTH OPPORTUNITIES identified

Format your response as JSON with these keys:
{
  "next30DaysBookings": number,
  "next3MonthsRevenue": [month1, month2, month3],
  "vipGrowthRate": "X%",
  "capacityRecommendations": "string",
  "riskFactors": ["factor1", "factor2"],
  "growthOpportunities": ["opp1", "opp2"],
  "summary": "string"
}`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false,
        response_json_schema: {
          type: "object",
          properties: {
            next30DaysBookings: { type: "number" },
            next3MonthsRevenue: { type: "array", items: { type: "number" } },
            vipGrowthRate: { type: "string" },
            capacityRecommendations: { type: "string" },
            riskFactors: { type: "array", items: { type: "string" } },
            growthOpportunities: { type: "array", items: { type: "string" } },
            summary: { type: "string" }
          }
        }
      });

      setPredictions(response);
      toast.success('Predictions generated successfully!');
    } catch (error) {
      console.error('Error generating predictions:', error);
      toast.error('Failed to generate predictions');
    } finally {
      setGenerating(false);
    }
  };

  // Simple forecast visualization data
  const forecastData = predictions ? [
    { month: format(new Date(), 'MMM'), actual: avgMonthlyRevenue, forecast: null },
    { month: format(addMonths(new Date(), 1), 'MMM'), actual: null, forecast: predictions.next3MonthsRevenue[0] },
    { month: format(addMonths(new Date(), 2), 'MMM'), actual: null, forecast: predictions.next3MonthsRevenue[1] },
    { month: format(addMonths(new Date(), 3), 'MMM'), actual: null, forecast: predictions.next3MonthsRevenue[2] }
  ] : [];

  return (
    <div className="grid gap-6">
      {/* Generate Predictions Button */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-cyan-50 via-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                AI-Powered Predictive Analytics
              </CardTitle>
              <p className="text-sm text-gray-600">
                Generate forecasts for booking demand, revenue, and growth opportunities
              </p>
            </div>
            <Button 
              onClick={generatePredictions}
              disabled={generating}
              size="lg"
              className="bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 hover:from-cyan-700 hover:via-blue-700 hover:to-purple-700 shadow-lg"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Predictions
                </>
              )}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {predictions && (
        <>
          {/* Prediction Summary */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-cyan-600" />
                Prediction Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 leading-relaxed">{predictions.summary}</p>
            </CardContent>
          </Card>

          {/* Key Predictions */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-sm text-blue-700 font-medium mb-1">Next 30 Days Bookings</p>
                <p className="text-4xl font-bold text-blue-900">{predictions.next30DaysBookings}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {((predictions.next30DaysBookings / last30DaysAppointments.length - 1) * 100).toFixed(1)}% vs last month
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-sm text-green-700 font-medium mb-1">Next Month Revenue</p>
                <p className="text-4xl font-bold text-green-900">
                  ${(predictions.next3MonthsRevenue[0] / 1000).toFixed(1)}k
                </p>
                <p className="text-xs text-green-600 mt-1">Predicted growth</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Sparkles className="w-8 h-8 text-purple-600" />
                </div>
                <p className="text-sm text-purple-700 font-medium mb-1">VIP Growth Rate</p>
                <p className="text-4xl font-bold text-purple-900">{predictions.vipGrowthRate}</p>
                <p className="text-xs text-purple-600 mt-1">Expected increase</p>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Forecast Chart */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Revenue Forecast (Next 3 Months)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecastData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => value ? `$${value.toLocaleString()}` : 'N/A'} />
                  <Legend />
                  <Line type="monotone" dataKey="actual" stroke="#10b981" strokeWidth={2} name="Actual" />
                  <Line type="monotone" dataKey="forecast" stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 5" name="Forecast" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recommendations and Risks */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Capacity Recommendations */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-600" />
                  Capacity Planning Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 text-sm leading-relaxed">{predictions.capacityRecommendations}</p>
              </CardContent>
            </Card>

            {/* Risk Factors */}
            <Card className="border-0 shadow-lg border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  Risk Factors to Monitor
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {predictions.riskFactors.map((risk, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700">{risk}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Growth Opportunities */}
          <Card className="border-0 shadow-lg border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-600" />
                Growth Opportunities Identified
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {predictions.growthOpportunities.map((opportunity, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-sm">{idx + 1}</span>
                    </div>
                    <p className="text-sm text-gray-700 flex-1">{opportunity}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {!predictions && (
        <Card className="border-0 shadow-lg">
          <CardContent className="p-12 text-center">
            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Predictions Generated Yet</h3>
            <p className="text-gray-600 mb-4">
              Click the "Generate Predictions" button above to get AI-powered insights on future trends
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}