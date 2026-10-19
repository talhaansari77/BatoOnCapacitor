import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

export default function ConversionFunnel({ totalLeads, consultations, procedures }) {
  const stages = [
    {
      label: "New Leads",
      count: totalLeads,
      color: "from-blue-500 to-cyan-500",
      width: 100
    },
    {
      label: "Consultations Booked",
      count: consultations,
      color: "from-cyan-500 to-teal-500",
      width: totalLeads > 0 ? (consultations / totalLeads) * 100 : 0,
      rate: totalLeads > 0 ? ((consultations / totalLeads) * 100).toFixed(1) : 0
    },
    {
      label: "Procedures Scheduled",
      count: procedures,
      color: "from-teal-500 to-green-500",
      width: consultations > 0 ? (procedures / consultations) * 100 : 0,
      rate: consultations > 0 ? ((procedures / consultations) * 100).toFixed(1) : 0
    }
  ];

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle>Conversion Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {stages.map((stage, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-700">{stage.label}</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-gray-900">{stage.count}</p>
                  {stage.rate !== undefined && (
                    <span className="text-sm text-gray-600">({stage.rate}%)</span>
                  )}
                </div>
              </div>
              
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stage.width}%` }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                className={`h-12 bg-gradient-to-r ${stage.color} rounded-lg flex items-center justify-center text-white font-semibold shadow-lg`}
              >
                {stage.count > 0 && (
                  <span>{Math.round(stage.width)}% of {idx === 0 ? 'total' : stages[idx - 1].label.toLowerCase()}</span>
                )}
              </motion.div>

              {idx < stages.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowDown className="w-6 h-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-lg border border-cyan-200">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Overall Conversion Rate:</strong>
          </p>
          <p className="text-3xl font-bold text-cyan-600">
            {totalLeads > 0 ? ((procedures / totalLeads) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-gray-600 mt-1">
            From lead to scheduled procedure
          </p>
        </div>
      </CardContent>
    </Card>
  );
}