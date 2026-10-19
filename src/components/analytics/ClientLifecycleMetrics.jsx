import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line 
} from "recharts";
import { Crown, TrendingUp, Users, Award } from "lucide-react";

export default function ClientLifecycleMetrics({ clients }) {
  // Calculate VIP growth over time
  const tierDistribution = clients.reduce((acc, client) => {
    const tier = client.loyalty_level || 'bronze';
    acc[tier] = (acc[tier] || 0) + 1;
    return acc;
  }, {});

  const tierData = Object.entries(tierDistribution).map(([tier, count]) => ({
    tier: tier.charAt(0).toUpperCase() + tier.slice(1),
    count,
    percentage: ((count / clients.length) * 100).toFixed(1)
  }));

  // VIP vs Non-VIP
  const vipCount = clients.filter(c => c.vip_status).length;
  const nonVipCount = clients.length - vipCount;
  
  const vipData = [
    { name: 'VIP Members', value: vipCount, color: '#FFD700' },
    { name: 'Regular Clients', value: nonVipCount, color: '#94a3b8' }
  ];

  // Engagement score distribution
  const engagementBuckets = {
    'Low (0-30)': 0,
    'Medium (31-60)': 0,
    'High (61-80)': 0,
    'Very High (81-100)': 0
  };

  clients.forEach(client => {
    const score = client.engagement_score || 0;
    if (score <= 30) engagementBuckets['Low (0-30)']++;
    else if (score <= 60) engagementBuckets['Medium (31-60)']++;
    else if (score <= 80) engagementBuckets['High (61-80)']++;
    else engagementBuckets['Very High (81-100)']++;
  });

  const engagementData = Object.entries(engagementBuckets).map(([range, count]) => ({
    range,
    count
  }));

  // Churn risk by tier
  const churnByTier = ['bronze', 'silver', 'gold', 'platinum', 'diamond'].map(tier => {
    const tierClients = clients.filter(c => c.loyalty_level === tier);
    const avgChurn = tierClients.length > 0
      ? tierClients.reduce((sum, c) => sum + (c.churn_risk_score || 0), 0) / tierClients.length
      : 0;
    
    return {
      tier: tier.charAt(0).toUpperCase() + tier.slice(1),
      avgChurnRisk: avgChurn.toFixed(1),
      count: tierClients.length
    };
  });

  // Lifecycle stage distribution
  const stageDistribution = clients.reduce((acc, client) => {
    const stage = client.lifecycle_stage || 'new_client';
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const stageData = Object.entries(stageDistribution).map(([stage, count]) => ({
    stage: stage.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="grid gap-6">
      {/* Top Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">VIP Members</p>
                <p className="text-3xl font-bold text-yellow-600">{vipCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {((vipCount / clients.length) * 100).toFixed(1)}% of total
                </p>
              </div>
              <Crown className="w-12 h-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Engagement</p>
                <p className="text-3xl font-bold text-purple-600">
                  {clients.length > 0 
                    ? Math.round(clients.reduce((sum, c) => sum + (c.engagement_score || 0), 0) / clients.length)
                    : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">out of 100</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Clients</p>
                <p className="text-3xl font-bold text-green-600">
                  {clients.filter(c => c.lifecycle_stage === 'active' || c.lifecycle_stage === 'engaged').length}
                </p>
                <p className="text-xs text-gray-500 mt-1">currently engaged</p>
              </div>
              <Users className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Lifetime Value</p>
                <p className="text-3xl font-bold text-cyan-600">
                  ${clients.length > 0 
                    ? Math.round(clients.reduce((sum, c) => sum + (c.lifetime_value || 0), 0) / clients.length)
                    : 0}
                </p>
                <p className="text-xs text-gray-500 mt-1">per client</p>
              </div>
              <Award className="w-12 h-12 text-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Tier Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              Loyalty Tier Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tierData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* VIP vs Non-VIP */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              VIP vs Regular Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vipData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value, percentage }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vipData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Engagement Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Engagement Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#9333ea" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Churn Risk by Tier */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-orange-600" />
              Avg Churn Risk by Tier
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={churnByTier}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tier" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgChurnRisk" stroke="#f97316" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lifecycle Stage Distribution */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-600" />
            Client Lifecycle Stage Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="stage" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#06b6d4" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}