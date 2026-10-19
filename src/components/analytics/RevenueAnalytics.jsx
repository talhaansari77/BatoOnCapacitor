import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { DollarSign, TrendingUp, ShoppingCart, Crown } from "lucide-react";
import { format } from "date-fns";

export default function RevenueAnalytics({ orders, clients }) {
  // Total revenue
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // VIP vs Non-VIP revenue
  const vipOrders = orders.filter(order => {
    const client = clients.find(c => c.client_email === order.client_email);
    return client?.vip_status;
  });

  const vipRevenue = vipOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  const nonVipRevenue = totalRevenue - vipRevenue;

  const vipRevenueData = [
    { name: 'VIP Revenue', value: vipRevenue, color: '#FFD700' },
    { name: 'Regular Revenue', value: nonVipRevenue, color: '#94a3b8' }
  ];

  // Revenue trend over last 12 months
  const now = new Date();
  const monthlyRevenue = {};
  
  for (let i = 11; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = format(month, 'MMM yyyy');
    monthlyRevenue[monthKey] = 0;
  }

  orders.forEach(order => {
    const orderDate = new Date(order.created_date);
    const monthKey = format(orderDate, 'MMM yyyy');
    if (Object.prototype.hasOwnProperty.call(monthlyRevenue, monthKey)) {
      monthlyRevenue[monthKey] += order.total_amount || 0;
    }
  });

  const revenueTrendData = Object.entries(monthlyRevenue).map(([month, revenue]) => ({
    month,
    revenue: Math.round(revenue)
  }));

  // Order status distribution
  const statusDistribution = orders.reduce((acc, order) => {
    acc[order.status] = (acc[order.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
    status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count
  }));

  // Average order value
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

  // VIP average order value
  const avgVipOrderValue = vipOrders.length > 0 ? vipRevenue / vipOrders.length : 0;
  const avgNonVipOrderValue = (orders.length - vipOrders.length) > 0 
    ? nonVipRevenue / (orders.length - vipOrders.length) 
    : 0;

  const avgValueData = [
    { category: 'VIP Clients', value: Math.round(avgVipOrderValue) },
    { category: 'Regular Clients', value: Math.round(avgNonVipOrderValue) },
    { category: 'Overall Average', value: Math.round(avgOrderValue) }
  ];

  // Top revenue months
  const topMonths = Object.entries(monthlyRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([month, revenue]) => ({
      month,
      revenue: Math.round(revenue)
    }));

  const COLORS = ['#FFD700', '#94a3b8', '#0891b2', '#06b6d4', '#22d3ee'];

  return (
    <div className="grid gap-6">
      {/* Top Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 mb-1 font-medium">Total Revenue</p>
                <p className="text-3xl font-bold text-green-900">${(totalRevenue / 1000).toFixed(1)}k</p>
              </div>
              <DollarSign className="w-12 h-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 mb-1 font-medium">VIP Revenue</p>
                <p className="text-3xl font-bold text-yellow-900">${(vipRevenue / 1000).toFixed(1)}k</p>
                <p className="text-xs text-yellow-600 mt-1">
                  {((vipRevenue / totalRevenue) * 100).toFixed(1)}% of total
                </p>
              </div>
              <Crown className="w-12 h-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-cyan-50 to-blue-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-700 mb-1 font-medium">Total Orders</p>
                <p className="text-3xl font-bold text-cyan-900">{orders.length}</p>
              </div>
              <ShoppingCart className="w-12 h-12 text-cyan-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 mb-1 font-medium">Avg Order Value</p>
                <p className="text-3xl font-bold text-purple-900">${avgOrderValue.toFixed(0)}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Revenue Trend (Last 12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* VIP vs Non-VIP Revenue */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-600" />
              VIP vs Regular Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vipRevenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: $${(value / 1000).toFixed(1)}k`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {vipRevenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Average Order Value Comparison */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-cyan-600" />
              Average Order Value Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={avgValueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value}`} />
                <Bar dataKey="value" fill="#0891b2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-purple-600" />
              Order Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#9333ea" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Revenue Months */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Top 5 Revenue Months
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topMonths}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Bar dataKey="revenue" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}