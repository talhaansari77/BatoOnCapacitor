import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { Calendar, Clock, Stethoscope, TrendingUp } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from "date-fns";

export default function AppointmentAnalytics({ appointments }) {
  // Booking status distribution
  const statusDistribution = appointments.reduce((acc, apt) => {
    acc[apt.status] = (acc[apt.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = Object.entries(statusDistribution).map(([status, count]) => ({
    status: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count
  }));

  // Popular services/departments
  const departmentCounts = appointments.reduce((acc, apt) => {
    const dept = apt.department || 'Unknown';
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const departmentData = Object.entries(departmentCounts)
    .map(([dept, count]) => ({
      department: dept.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count
    }))
    .sort((a, b) => b.count - a.count);

  // Specialist utilization
  const specialistCounts = appointments.reduce((acc, apt) => {
    const specialist = apt.specialist_name || 'Unassigned';
    acc[specialist] = (acc[specialist] || 0) + 1;
    return acc;
  }, {});

  const specialistData = Object.entries(specialistCounts)
    .map(([specialist, count]) => ({
      specialist,
      count
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Booking trend over last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const last30DaysAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.created_date);
    return aptDate >= thirtyDaysAgo && aptDate <= now;
  });

  const dailyBookings = {};
  last30DaysAppointments.forEach(apt => {
    const day = format(new Date(apt.created_date), 'MM/dd');
    dailyBookings[day] = (dailyBookings[day] || 0) + 1;
  });

  const trendData = Object.entries(dailyBookings).map(([day, count]) => ({
    day,
    bookings: count
  }));

  // Appointment type distribution
  const typeDistribution = appointments.reduce((acc, apt) => {
    acc[apt.type] = (acc[apt.type] || 0) + 1;
    return acc;
  }, {});

  const typeData = Object.entries(typeDistribution).map(([type, count]) => ({
    type: type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    count
  }));

  const COLORS = ['#0891b2', '#06b6d4', '#22d3ee', '#67e8f9', '#a5f3fc'];

  return (
    <div className="grid gap-6">
      {/* Top Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Appointments</p>
                <p className="text-3xl font-bold text-cyan-600">{appointments.length}</p>
              </div>
              <Calendar className="w-12 h-12 text-cyan-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {appointments.filter(a => a.status === 'completed').length}
                </p>
              </div>
              <TrendingUp className="w-12 h-12 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-blue-600">
                  {appointments.filter(a => new Date(a.appointment_date) > new Date() && a.status !== 'cancelled').length}
                </p>
              </div>
              <Clock className="w-12 h-12 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Cancellation Rate</p>
                <p className="text-3xl font-bold text-red-600">
                  {appointments.length > 0 
                    ? ((appointments.filter(a => a.status === 'cancelled').length / appointments.length) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
              <Calendar className="w-12 h-12 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Booking Trend */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              Booking Trend (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="bookings" stroke="#0891b2" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Status */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-600" />
              Appointment Status Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ status, count }) => `${status}: ${count}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
        {/* Popular Services */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-purple-600" />
              Popular Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#9333ea" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Specialist Utilization */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-600" />
              Top 10 Specialist Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={specialistData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="specialist" type="category" width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#14b8a6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Appointment Type Distribution */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Appointment Type Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}