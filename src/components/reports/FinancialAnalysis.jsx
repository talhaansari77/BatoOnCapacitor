import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { format, startOfMonth, subMonths, differenceInDays } from "date-fns";
import { AlertTriangle, TrendingUp, DollarSign, Clock, CheckCircle2 } from "lucide-react";

export default function FinancialAnalysis({ invoices, payments, packages, dateRange }) {
  const analysis = useMemo(() => {
    const now = new Date();
    
    // Revenue variance analysis
    const last3Months = Array.from({ length: 3 }, (_, i) => {
      const monthDate = subMonths(now, 2 - i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = startOfMonth(subMonths(now, 1 - i));
      
      const monthPayments = payments.filter(p => {
        const date = new Date(p.payment_date);
        return date >= monthStart && date < monthEnd;
      });
      
      const monthInvoices = invoices.filter(inv => {
        const date = new Date(inv.issue_date);
        return date >= monthStart && date < monthEnd;
      });
      
      const revenue = monthPayments.reduce((sum, p) => sum + p.amount, 0);
      const invoiced = monthInvoices.reduce((sum, i) => sum + i.total_amount, 0);
      const variance = revenue - invoiced;
      
      return {
        month: format(monthDate, 'MMM'),
        revenue,
        invoiced,
        variance,
        variancePercent: invoiced > 0 ? ((variance / invoiced) * 100).toFixed(1) : 0
      };
    });
    
    // Cash flow analysis
    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingAR = invoices
      .filter(i => ['sent', 'partially_paid', 'overdue'].includes(i.status))
      .reduce((sum, i) => sum + (i.balance_due || 0), 0);
    
    // Payment timing analysis
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const avgDaysToPayment = paidInvoices.length > 0
      ? paidInvoices.reduce((sum, inv) => {
          const payment = payments.find(p => p.invoice_id === inv.id);
          if (!payment) return sum;
          return sum + differenceInDays(new Date(payment.payment_date), new Date(inv.issue_date));
        }, 0) / paidInvoices.length
      : 0;
    
    // Discrepancy detection
    const discrepancies = [];
    
    // Check for overdue invoices
    const overdueAmount = invoices
      .filter(i => i.status === 'overdue')
      .reduce((sum, i) => sum + (i.balance_due || 0), 0);
    
    if (overdueAmount > 5000) {
      discrepancies.push({
        type: 'overdue',
        severity: 'high',
        message: `$${overdueAmount.toLocaleString()} in overdue invoices`,
        recommendation: 'Send immediate collection reminders'
      });
    }
    
    // Check for large variance
    const latestVariance = last3Months[last3Months.length - 1];
    if (Math.abs(parseFloat(latestVariance.variancePercent)) > 20) {
      discrepancies.push({
        type: 'variance',
        severity: 'medium',
        message: `${latestVariance.variancePercent}% revenue variance detected`,
        recommendation: 'Review invoicing and collection processes'
      });
    }
    
    // Check for slow payment
    if (avgDaysToPayment > 45) {
      discrepancies.push({
        type: 'timing',
        severity: 'medium',
        message: `Average ${Math.round(avgDaysToPayment)} days to payment`,
        recommendation: 'Implement early payment incentives'
      });
    }
    
    // Payment method analysis
    const methodBreakdown = payments.reduce((acc, p) => {
      const method = p.payment_method || 'unknown';
      acc[method] = (acc[method] || 0) + p.amount;
      return acc;
    }, {});
    
    return {
      last3Months,
      totalRevenue,
      outstandingAR,
      avgDaysToPayment: Math.round(avgDaysToPayment),
      discrepancies,
      methodBreakdown,
      collectionRate: invoices.length > 0
        ? ((invoices.filter(i => i.status === 'paid').length / invoices.length) * 100).toFixed(1)
        : 0
    };
  }, [invoices, payments, packages, dateRange]);

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-orange-100 text-orange-800';
      case 'low': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Total Revenue</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${(analysis.totalRevenue / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-gray-500 mt-1">Collected</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-gray-600">Outstanding A/R</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              ${(analysis.outstandingAR / 1000).toFixed(0)}k
            </p>
            <p className="text-xs text-gray-500 mt-1">Uncollected</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-gray-600">Avg Payment Time</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analysis.avgDaysToPayment}</p>
            <p className="text-xs text-gray-500 mt-1">Days</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <p className="text-sm text-gray-600">Collection Rate</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">{analysis.collectionRate}%</p>
            <p className="text-xs text-gray-500 mt-1">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Variance */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Revenue Variance Analysis</CardTitle>
          <p className="text-sm text-gray-600">
            Comparing invoiced amounts vs actual collections
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analysis.last3Months}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="invoiced" fill="#3b82f6" name="Invoiced" />
              <Bar dataKey="revenue" fill="#10b981" name="Collected" />
            </BarChart>
          </ResponsiveContainer>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            {analysis.last3Months.map((month, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-semibold text-gray-900 mb-2">{month.month}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Variance:</span>
                    <span className={`font-bold ${month.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(month.variance).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">%:</span>
                    <span className="font-bold">{month.variancePercent}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Discrepancies */}
      {analysis.discrepancies.length > 0 && (
        <Card className="border-0 shadow-xl border-red-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Financial Discrepancies Detected</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysis.discrepancies.map((disc, idx) => (
                <div key={idx} className={`p-4 rounded-lg border-2 ${
                  disc.severity === 'high' ? 'bg-red-50 border-red-200' :
                  disc.severity === 'medium' ? 'bg-orange-50 border-orange-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-semibold text-gray-900">{disc.message}</p>
                    <Badge className={getSeverityColor(disc.severity)}>
                      {disc.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Recommended Action:</strong> {disc.recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Methods */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Revenue by Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(analysis.methodBreakdown)
              .sort(([,a], [,b]) => b - a)
              .map(([method, amount], idx) => {
                const percentage = (amount / analysis.totalRevenue) * 100;
                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {method.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        ${(amount / 1000).toFixed(0)}k ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Root Cause Analysis */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-blue-600" />
            Root Cause Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-1">Cash Flow Health</p>
              <p className="text-sm text-gray-700">
                {analysis.collectionRate >= 90
                  ? "Excellent collection rate. Cash flow is healthy."
                  : analysis.collectionRate >= 75
                  ? "Good collection rate but room for improvement. Focus on reducing payment delays."
                  : "Low collection rate detected. Immediate action needed on AR management."}
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-1">Payment Timing Issues</p>
              <p className="text-sm text-gray-700">
                {analysis.avgDaysToPayment <= 30
                  ? "Payment timing is optimal. Clients paying promptly."
                  : analysis.avgDaysToPayment <= 45
                  ? `Average ${analysis.avgDaysToPayment} days to payment. Consider early payment discounts.`
                  : `High ${analysis.avgDaysToPayment} days to payment. Review credit terms and follow-up processes.`}
              </p>
            </div>

            <div className="p-3 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-900 mb-1">Strategic Recommendations</p>
              <ul className="text-sm text-gray-700 space-y-1 ml-4">
                <li>• Implement automated payment reminders at 7, 14, and 30 days</li>
                <li>• Offer 2% discount for payments within 10 days</li>
                <li>• Review and potentially tighten credit terms for late payers</li>
                <li>• Set up recurring payments for regular clients</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}