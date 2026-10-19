import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, addMonths, startOfMonth, subMonths, endOfMonth } from "date-fns";
import { TrendingUp, Target, AlertCircle, Zap } from "lucide-react";

export default function SalesForecasting({ leads, clients, packages, dateRange }) {
  const forecastData = useMemo(() => {
    const now = new Date();
    
    // Calculate historical monthly revenue
    const monthlyRevenue = [];
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthPackages = packages.filter(p => {
        const date = new Date(p.created_date);
        return date >= monthStart && date <= monthEnd;
      });
      
      const revenue = monthPackages.reduce((sum, p) => sum + (p.price || 0), 0);
      
      monthlyRevenue.push({
        month: format(monthDate, 'MMM yyyy'),
        actual: revenue,
        type: 'historical'
      });
    }
    
    // Calculate growth rate
    const recentRevenues = monthlyRevenue.slice(-3).map(m => m.actual);
    const avgGrowthRate = recentRevenues.length > 1
      ? ((recentRevenues[recentRevenues.length - 1] - recentRevenues[0]) / recentRevenues[0]) / recentRevenues.length
      : 0.05; // Default 5% growth
    
    // Generate 6-month forecast
    const lastRevenue = monthlyRevenue[monthlyRevenue.length - 1].actual;
    const forecast = [];
    
    for (let i = 1; i <= 6; i++) {
      const monthDate = addMonths(now, i);
      const projectedRevenue = lastRevenue * Math.pow(1 + avgGrowthRate, i);
      
      // Add confidence intervals
      const optimistic = projectedRevenue * 1.15;
      const pessimistic = projectedRevenue * 0.85;
      
      forecast.push({
        month: format(monthDate, 'MMM yyyy'),
        projected: Math.round(projectedRevenue),
        optimistic: Math.round(optimistic),
        pessimistic: Math.round(pessimistic),
        type: 'forecast'
      });
    }
    
    return {
      historical: monthlyRevenue,
      forecast,
      growthRate: (avgGrowthRate * 100).toFixed(1),
      lastRevenue
    };
  }, [packages, dateRange]);

  const combinedData = [...forecastData.historical.slice(-6), ...forecastData.forecast];

  // Calculate pipeline metrics
  const pipelineMetrics = useMemo(() => {
    const activeLeads = leads.filter(l => !['lost', 'converted'].includes(l.stage));
    const qualifiedLeads = leads.filter(l => ['qualified', 'consultation_booked', 'proposal_sent'].includes(l.stage));
    
    const avgConversionRate = leads.length > 0
      ? (leads.filter(l => l.converted_to_client).length / leads.length) * 100
      : 15;
    
    const avgDealValue = packages.length > 0
      ? packages.reduce((sum, p) => sum + (p.price || 0), 0) / packages.length
      : 5000;
    
    const projectedRevenue = qualifiedLeads.length * (avgConversionRate / 100) * avgDealValue;
    
    return {
      activeLeads: activeLeads.length,
      qualifiedLeads: qualifiedLeads.length,
      conversionRate: avgConversionRate.toFixed(1),
      avgDealValue,
      projectedRevenue: Math.round(projectedRevenue)
    };
  }, [leads, packages]);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Growth Rate</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{forecastData.growthRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Monthly average</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Pipeline Value</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${(pipelineMetrics.projectedRevenue / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-gray-500 mt-1">Projected from leads</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600">Conversion Rate</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{pipelineMetrics.conversionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Lead to client</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Target className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-gray-600">Avg Deal Size</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${(pipelineMetrics.avgDealValue / 1000).toFixed(1)}k
            </p>
            <p className="text-xs text-gray-500 mt-1">Per package</p>
          </CardContent>
        </Card>
      </div>

      {/* Forecast Chart */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>6-Month Revenue Forecast</CardTitle>
          <p className="text-sm text-gray-600">
            Based on historical trends and current pipeline
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={combinedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="actual" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Actual Revenue"
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="projected" 
                stroke="#3b82f6" 
                strokeWidth={3}
                strokeDasharray="5 5"
                name="Projected"
              />
              <Line 
                type="monotone" 
                dataKey="optimistic" 
                stroke="#8b5cf6" 
                strokeWidth={1}
                strokeDasharray="3 3"
                name="Optimistic"
              />
              <Line 
                type="monotone" 
                dataKey="pessimistic" 
                stroke="#f59e0b" 
                strokeWidth={1}
                strokeDasharray="3 3"
                name="Pessimistic"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Forecast Breakdown */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Monthly Forecast Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {forecastData.forecast.map((month, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-gray-900">{month.month}</p>
                  <Badge className="bg-blue-100 text-blue-700">
                    ${(month.projected / 1000).toFixed(0)}k projected
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Pessimistic</p>
                    <p className="font-bold text-orange-600">
                      ${(month.pessimistic / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expected</p>
                    <p className="font-bold text-blue-600">
                      ${(month.projected / 1000).toFixed(0)}k
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Optimistic</p>
                    <p className="font-bold text-purple-600">
                      ${(month.optimistic / 1000).toFixed(0)}k
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-purple-600" />
            Forecasting Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-1">Growth Trajectory</p>
              <p className="text-sm text-gray-700">
                {parseFloat(forecastData.growthRate) > 10
                  ? `Strong ${forecastData.growthRate}% monthly growth. Maintain current strategies and consider scaling.`
                  : parseFloat(forecastData.growthRate) > 0
                  ? `Modest ${forecastData.growthRate}% growth. Focus on optimizing conversion rates and deal sizes.`
                  : `Negative growth detected. Immediate intervention needed in sales and marketing.`}
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-1">Pipeline Health</p>
              <p className="text-sm text-gray-700">
                {pipelineMetrics.qualifiedLeads} qualified leads worth ${(pipelineMetrics.projectedRevenue / 1000).toFixed(0)}k. 
                {pipelineMetrics.qualifiedLeads < 20
                  ? " Increase lead generation efforts."
                  : " Strong pipeline. Focus on conversion."}
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-1">Action Items</p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• Target {Math.ceil(pipelineMetrics.qualifiedLeads * 1.2)} qualified leads next month</li>
                <li>• Focus on deals above ${(pipelineMetrics.avgDealValue * 1.1).toLocaleString()} to beat forecast</li>
                <li>• Accelerate {pipelineMetrics.qualifiedLeads} opportunities in pipeline</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}