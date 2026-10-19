import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { AlertTriangle, Search, Mail, Phone, TrendingDown, Users } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function AtRiskClients({ clients, sessions }) {
  const [searchTerm, setSearchTerm] = useState('');

  // Identify at-risk clients
  const atRiskClients = clients
    .filter(client => {
      const hasHighChurnRisk = client.churn_risk_score > 60;
      const hasLowEngagement = client.engagement_score < 40;
      const hasLowSatisfaction = client.satisfaction_score < 6;
      
      return hasHighChurnRisk || hasLowEngagement || hasLowSatisfaction;
    })
    .map(client => {
      const clientSessions = sessions.filter(s => s.client_email === client.client_email);
      const avgSatisfaction = clientSessions.filter(s => s.client_satisfaction).length > 0
        ? clientSessions.reduce((sum, s) => sum + (s.client_satisfaction || 0), 0) / 
          clientSessions.filter(s => s.client_satisfaction).length
        : 0;
      
      const lastSessionDate = client.last_session_date 
        ? new Date(client.last_session_date)
        : null;
      
      const daysSinceLastVisit = lastSessionDate 
        ? differenceInDays(new Date(), lastSessionDate)
        : null;

      return {
        ...client,
        avgSatisfaction,
        daysSinceLastVisit,
        riskLevel: client.churn_risk_score > 80 ? 'critical' 
                  : client.churn_risk_score > 60 ? 'high'
                  : 'medium'
      };
    })
    .sort((a, b) => b.churn_risk_score - a.churn_risk_score);

  // Filter by search
  const filteredClients = atRiskClients.filter(client => 
    searchTerm === '' || 
    client.client_email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRiskColor = (level) => {
    switch(level) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getRiskReasons = (client) => {
    const reasons = [];
    if (client.churn_risk_score > 60) reasons.push('High churn risk score');
    if (client.engagement_score < 40) reasons.push('Low engagement');
    if (client.satisfaction_score < 6) reasons.push('Low satisfaction');
    if (client.daysSinceLastVisit && client.daysSinceLastVisit > 90) reasons.push('Inactive for 90+ days');
    return reasons;
  };

  return (
    <div className="grid gap-6">
      {/* Overview Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-orange-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-700 font-medium mb-1">Total At Risk</p>
                <p className="text-4xl font-bold text-red-900">{atRiskClients.length}</p>
                <p className="text-xs text-red-600 mt-1">
                  {((atRiskClients.length / clients.length) * 100).toFixed(1)}% of total
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-yellow-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-medium mb-1">Critical Risk</p>
                <p className="text-4xl font-bold text-orange-900">
                  {atRiskClients.filter(c => c.riskLevel === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="w-12 h-12 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-700 font-medium mb-1">High Risk</p>
                <p className="text-4xl font-bold text-yellow-900">
                  {atRiskClients.filter(c => c.riskLevel === 'high').length}
                </p>
              </div>
              <TrendingDown className="w-12 h-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-medium mb-1">Avg Churn Score</p>
                <p className="text-4xl font-bold text-purple-900">
                  {atRiskClients.length > 0
                    ? Math.round(atRiskClients.reduce((sum, c) => sum + c.churn_risk_score, 0) / atRiskClients.length)
                    : 0}
                </p>
              </div>
              <Users className="w-12 h-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Search clients by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* At-Risk Clients List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            At-Risk Clients Requiring Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredClients.length > 0 ? (
            <div className="space-y-4">
              {filteredClients.map((client, idx) => (
                <div 
                  key={client.id}
                  className="p-6 border-2 rounded-xl hover:shadow-lg transition-all"
                  style={{ 
                    borderColor: client.riskLevel === 'critical' ? '#dc2626' 
                               : client.riskLevel === 'high' ? '#f97316' 
                               : '#eab308' 
                  }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg">{client.client_email}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRiskColor(client.riskLevel)}>
                              {client.riskLevel.toUpperCase()} RISK
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Score: {client.churn_risk_score}/100
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Engagement Score</p>
                      <p className="text-xl font-bold text-gray-900">{client.engagement_score || 0}/100</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Avg Satisfaction</p>
                      <p className="text-xl font-bold text-gray-900">{client.avgSatisfaction.toFixed(1)}/10</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Lifetime Value</p>
                      <p className="text-xl font-bold text-gray-900">${client.lifetime_value || 0}</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Last Visit</p>
                      <p className="text-xl font-bold text-gray-900">
                        {client.daysSinceLastVisit ? `${client.daysSinceLastVisit}d ago` : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-red-900 mb-2">Risk Factors:</p>
                    <ul className="space-y-1">
                      {getRiskReasons(client).map((reason, idx) => (
                        <li key={idx} className="text-sm text-red-800 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full"></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-900 mb-2">Recommended Actions:</p>
                    <ul className="space-y-1 text-sm text-blue-800">
                      <li>• Schedule a personal check-in call within 48 hours</li>
                      <li>• Offer exclusive discount or VIP upgrade incentive</li>
                      <li>• Send personalized email highlighting treatment progress</li>
                      <li>• Assign to retention specialist for proactive follow-up</li>
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600">No at-risk clients found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}