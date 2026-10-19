import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Download, Filter, Play, Save } from "lucide-react";
import { format } from "date-fns";

export default function ReportBuilder({ clients, leads, invoices, payments, sessions, packages, dateRange, onExportCSV, onExportPDF }) {
  const [selectedDataSource, setSelectedDataSource] = useState("clients");
  const [selectedFields, setSelectedFields] = useState([]);
  const [reportName, setReportName] = useState("");
  const [generatedData, setGeneratedData] = useState(null);

  const dataSources = {
    clients: {
      label: "Client Lifecycle",
      data: clients,
      fields: [
        { value: "client_email", label: "Email" },
        { value: "lifecycle_stage", label: "Stage" },
        { value: "lifetime_value", label: "LTV" },
        { value: "engagement_score", label: "Engagement" },
        { value: "churn_risk_score", label: "Churn Risk" },
        { value: "total_sessions_completed", label: "Sessions" },
        { value: "loyalty_points", label: "Points" },
        { value: "vip_status", label: "VIP Status" }
      ]
    },
    leads: {
      label: "Leads",
      data: leads,
      fields: [
        { value: "email", label: "Email" },
        { value: "full_name", label: "Name" },
        { value: "stage", label: "Stage" },
        { value: "source", label: "Source" },
        { value: "interest_level", label: "Interest" },
        { value: "lead_score", label: "Score" },
        { value: "created_date", label: "Created" }
      ]
    },
    invoices: {
      label: "Invoices",
      data: invoices,
      fields: [
        { value: "invoice_number", label: "Invoice #" },
        { value: "client_email", label: "Client" },
        { value: "total_amount", label: "Amount" },
        { value: "status", label: "Status" },
        { value: "issue_date", label: "Issued" },
        { value: "due_date", label: "Due Date" },
        { value: "balance_due", label: "Balance" }
      ]
    },
    payments: {
      label: "Payments",
      data: payments,
      fields: [
        { value: "client_email", label: "Client" },
        { value: "amount", label: "Amount" },
        { value: "payment_method", label: "Method" },
        { value: "payment_date", label: "Date" },
        { value: "status", label: "Status" }
      ]
    },
    sessions: {
      label: "Treatment Sessions",
      data: sessions,
      fields: [
        { value: "client_email", label: "Client" },
        { value: "session_date", label: "Date" },
        { value: "department", label: "Department" },
        { value: "treatment_type", label: "Treatment" },
        { value: "specialist_name", label: "Specialist" },
        { value: "client_satisfaction", label: "Satisfaction" }
      ]
    },
    packages: {
      label: "Packages",
      data: packages,
      fields: [
        { value: "client_email", label: "Client" },
        { value: "package_name", label: "Package" },
        { value: "total_sessions", label: "Total Sessions" },
        { value: "sessions_used", label: "Used" },
        { value: "price", label: "Price" },
        { value: "status", label: "Status" }
      ]
    }
  };

  const currentSource = dataSources[selectedDataSource];

  const handleFieldToggle = (field) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const handleGenerateReport = () => {
    if (selectedFields.length === 0) {
      return;
    }

    const data = currentSource.data.map(item => {
      const row = {};
      selectedFields.forEach(field => {
        row[field] = item[field] || 'N/A';
      });
      return row;
    });

    setGeneratedData(data);
  };

  return (
    <div className="space-y-6">
      {/* Configuration */}
      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle>Report Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <Label>Report Name</Label>
              <Input
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="e.g., Monthly Client Report"
                className="mt-2"
              />
            </div>
            <div>
              <Label>Data Source</Label>
              <Select value={selectedDataSource} onValueChange={setSelectedDataSource}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(dataSources).map(([key, source]) => (
                    <SelectItem key={key} value={key}>{source.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="mb-3 block">Select Fields to Include</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {currentSource.fields.map(field => (
                <div key={field.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={field.value}
                    checked={selectedFields.includes(field.value)}
                    onCheckedChange={() => handleFieldToggle(field.value)}
                  />
                  <label
                    htmlFor={field.value}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {field.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleGenerateReport}
              disabled={selectedFields.length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Play className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {generatedData && (
        <Card className="border-0 shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{reportName || "Generated Report"}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {generatedData.length} records • Generated on {format(new Date(), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => onExportCSV(reportName || 'report', generatedData)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onExportPDF(reportName || 'report')}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedFields.map(field => {
                      const fieldLabel = currentSource.fields.find(f => f.value === field)?.label;
                      return (
                        <TableHead key={field}>{fieldLabel}</TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedData.slice(0, 100).map((row, idx) => (
                    <TableRow key={idx}>
                      {selectedFields.map(field => (
                        <TableCell key={field}>
                          {typeof row[field] === 'boolean'
                            ? row[field] ? 'Yes' : 'No'
                            : typeof row[field] === 'number'
                            ? field.includes('amount') || field.includes('price') || field.includes('value')
                              ? `$${row[field].toLocaleString()}`
                              : row[field]
                            : row[field]}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {generatedData.length > 100 && (
              <p className="text-sm text-gray-600 mt-4 text-center">
                Showing first 100 of {generatedData.length} records. Export to see all data.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}