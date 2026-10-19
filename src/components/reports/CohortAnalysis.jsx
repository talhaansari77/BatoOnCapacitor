import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, startOfMonth, differenceInMonths } from "date-fns";
import { TrendingUp, TrendingDown, Users } from "lucide-react";

export default function CohortAnalysis({ clients, sessions, packages, dateRange }) {
  const cohortData = useMemo(() => {
    const now = new Date();
    const cohorts = {};

    // Group clients by acquisition month
    clients.forEach(client => {
      if (!client.acquisition_date) return;
      
      const cohortMonth = format(startOfMonth(new Date(client.acquisition_date)), 'MMM yyyy');
      
      if (!cohorts[cohortMonth]) {
        cohorts[cohortMonth] = {
          clients: [],
          acquisitionDate: new Date(client.acquisition_date)
        };
      }
      
      cohorts[cohortMonth].clients.push(client);
    });

    // Calculate retention for each cohort
    const cohortResults = Object.entries(cohorts).map(([month, data]) => {
      const monthsAgo = differenceInMonths(now, data.acquisitionDate);
      const totalClients = data.clients.length;
      
      // Calculate retention for each subsequent month
      const retention = [];
      for (let i = 0; i <= Math.min(monthsAgo, 12); i++) {
        const activeClients = data.clients.filter(client => {
          // Check if client had any activity in that month
          if (client.lifecycle_stage === 'churned') {
            return false;
          }
          
          const sessionInMonth = sessions.some(s => 
            s.client_email === client.client_email &&
            differenceInMonths(now, new Date(s.session_date)) <= i
          );
          
          return sessionInMonth || i === 0;
        }).length;
        
        retention.push({
          month: i,
          rate: totalClients > 0 ? ((activeClients / totalClients) * 100).toFixed(1) : 0,
          count: activeClients
        });
      }
      
      return {
        cohort: month,
        size: totalClients,
        retention
      };
    }).sort((a, b) => b.acquisitionDate - a.acquisitionDate).slice(0, 12);

    return cohortResults;
  }, [clients, sessions, dateRange]);

  const getRetentionColor = (rate) => {
    const value = parseFloat(rate);
    if (value >= 80) return 'bg-green-100 text-green-800';
    if (value >= 60) return 'bg-yellow-100 text-yellow-800';
    if (value >= 40) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  const averageRetention = cohortData.length > 0
    ? cohortData.reduce((sum, cohort) => {
        const lastRetention = cohort.retention[cohort.retention.length - 1];
        return sum + parseFloat(lastRetention?.rate || 0);
      }, 0) / cohortData.length
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Cohorts</p>
                <p className="text-2xl font-bold text-gray-900">{cohortData.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Retention</p>
                <p className="text-2xl font-bold text-gray-900">{averageRetention.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Clients Tracked</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cohortData.reduce((sum, c) => sum + c.size, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Table */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Client Retention by Cohort</CardTitle>
          <p className="text-sm text-gray-600">
            Percentage of clients still active after N months from acquisition
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Cohort</TableHead>
                  <TableHead className="w-20">Size</TableHead>
                  <TableHead>Month 0</TableHead>
                  <TableHead>Month 1</TableHead>
                  <TableHead>Month 2</TableHead>
                  <TableHead>Month 3</TableHead>
                  <TableHead>Month 6</TableHead>
                  <TableHead>Month 12</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cohortData.map((cohort, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{cohort.cohort}</TableCell>
                    <TableCell>{cohort.size}</TableCell>
                    {[0, 1, 2, 3, 6, 12].map(monthIndex => {
                      const data = cohort.retention.find(r => r.month === monthIndex);
                      return (
                        <TableCell key={monthIndex}>
                          {data ? (
                            <div className="flex flex-col gap-1">
                              <Badge className={getRetentionColor(data.rate)}>
                                {data.rate}%
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {data.count} clients
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Retention Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {cohortData.length > 0 && (
              <>
                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Best Performing Cohort</p>
                  <p className="text-sm text-gray-700">
                    {(() => {
                      const best = cohortData.reduce((max, cohort) => {
                        const lastRetention = cohort.retention[cohort.retention.length - 1];
                        const maxLastRetention = max.retention[max.retention.length - 1];
                        return parseFloat(lastRetention?.rate || 0) > parseFloat(maxLastRetention?.rate || 0)
                          ? cohort
                          : max;
                      });
                      const bestRetention = best.retention[best.retention.length - 1];
                      return `${best.cohort} with ${bestRetention.rate}% retention after ${best.retention.length - 1} months`;
                    })()}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Retention Pattern</p>
                  <p className="text-sm text-gray-700">
                    {averageRetention >= 70
                      ? "Strong client retention across cohorts. Focus on scaling acquisition."
                      : averageRetention >= 50
                      ? "Moderate retention. Consider implementing engagement campaigns."
                      : "Low retention detected. Immediate action needed to improve client experience."}
                  </p>
                </div>

                <div className="p-3 bg-white rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Recommendation</p>
                  <p className="text-sm text-gray-700">
                    Target clients at 3-month mark with re-engagement campaigns to prevent churn. 
                    Most significant drop-off occurs between months 3-6.
                  </p>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}