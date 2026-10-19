import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Play, 
  Pause, 
  CheckCircle2, 
  TrendingUp,
  Target,
  BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

export default function ABTestManager() {
  const [showNewTestDialog, setShowNewTestDialog] = useState(false);
  const [newTest, setNewTest] = useState({
    test_name: "",
    test_type: "email_subject",
    variant_a_name: "Control",
    variant_a_description: "",
    variant_b_name: "Test",
    variant_b_description: ""
  });

  const queryClient = useQueryClient();

  const { data: tests } = useQuery({
    queryKey: ['abTests'],
    queryFn: async () => {
      return await base44.entities.ABTest.list('-created_date');
    },
    initialData: [],
  });

  const createTestMutation = useMutation({
    mutationFn: async (testData) => {
      const user = await base44.auth.me();
      return await base44.entities.ABTest.create({
        ...testData,
        created_by: user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
      setShowNewTestDialog(false);
      setNewTest({
        test_name: "",
        test_type: "email_subject",
        variant_a_name: "Control",
        variant_a_description: "",
        variant_b_name: "Test",
        variant_b_description: ""
      });
      toast.success('A/B test created successfully!');
    },
  });

  const updateTestMutation = useMutation({
    mutationFn: async ({ testId, updates }) => {
      return await base44.entities.ABTest.update(testId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abTests'] });
      toast.success('Test updated!');
    },
  });

  const handleCreateTest = () => {
    if (!newTest.test_name || !newTest.variant_a_description || !newTest.variant_b_description) {
      toast.error('Please fill in all required fields');
      return;
    }
    createTestMutation.mutate(newTest);
  };

  const handleStartTest = (test) => {
    updateTestMutation.mutate({
      testId: test.id,
      updates: {
        status: 'running',
        start_date: new Date().toISOString()
      }
    });
  };

  const handlePauseTest = (test) => {
    updateTestMutation.mutate({
      testId: test.id,
      updates: { status: 'paused' }
    });
  };

  const handleCompleteTest = (test) => {
    // Calculate winner
    const variantARate = test.variant_a_leads > 0 
      ? (test.variant_a_conversions / test.variant_a_leads) * 100 
      : 0;
    const variantBRate = test.variant_b_leads > 0 
      ? (test.variant_b_conversions / test.variant_b_leads) * 100 
      : 0;

    let winner = 'inconclusive';
    if (Math.abs(variantARate - variantBRate) > 5) {
      winner = variantARate > variantBRate ? 'variant_a' : 'variant_b';
    }

    updateTestMutation.mutate({
      testId: test.id,
      updates: {
        status: 'completed',
        end_date: new Date().toISOString(),
        winner,
        variant_a_conversion_rate: variantARate,
        variant_b_conversion_rate: variantBRate
      }
    });
  };

  const statusConfig = {
    draft: { color: 'bg-gray-100 text-gray-800', icon: Target },
    running: { color: 'bg-blue-100 text-blue-800', icon: Play },
    paused: { color: 'bg-yellow-100 text-yellow-800', icon: Pause },
    completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 }
  };

  const testTypeLabels = {
    email_subject: 'Email Subject Line',
    email_content: 'Email Content',
    offer_type: 'Offer Type',
    timing: 'Send Timing',
    channel: 'Communication Channel',
    landing_page: 'Landing Page'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">A/B Tests</h2>
          <p className="text-gray-600">Test and optimize your conversion strategies</p>
        </div>
        <Dialog open={showNewTestDialog} onOpenChange={setShowNewTestDialog}>
          <DialogTrigger asChild>
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              <Plus className="w-4 h-4 mr-2" />
              New Test
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New A/B Test</DialogTitle>
              <DialogDescription>
                Set up a new test to compare two variants and find the best performer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Test Name</Label>
                <Input
                  value={newTest.test_name}
                  onChange={(e) => setNewTest({ ...newTest, test_name: e.target.value })}
                  placeholder="e.g., Welcome Email Subject Test"
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Test Type</Label>
                <Select
                  value={newTest.test_type}
                  onValueChange={(value) => setNewTest({ ...newTest, test_type: value })}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(testTypeLabels).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>Variant A (Control) Name</Label>
                  <Input
                    value={newTest.variant_a_name}
                    onChange={(e) => setNewTest({ ...newTest, variant_a_name: e.target.value })}
                    placeholder="Control"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>Variant B (Test) Name</Label>
                  <Input
                    value={newTest.variant_b_name}
                    onChange={(e) => setNewTest({ ...newTest, variant_b_name: e.target.value })}
                    placeholder="Test"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label>Variant A Description</Label>
                <Textarea
                  value={newTest.variant_a_description}
                  onChange={(e) => setNewTest({ ...newTest, variant_a_description: e.target.value })}
                  placeholder="Describe the control variant..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Variant B Description</Label>
                <Textarea
                  value={newTest.variant_b_description}
                  onChange={(e) => setNewTest({ ...newTest, variant_b_description: e.target.value })}
                  placeholder="Describe the test variant..."
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowNewTestDialog(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateTest}
                  disabled={createTestMutation.isPending}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700"
                >
                  {createTestMutation.isPending ? 'Creating...' : 'Create Test'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tests List */}
      {tests.length > 0 ? (
        <div className="grid gap-6">
          {tests.map((test) => {
            const StatusIcon = statusConfig[test.status]?.icon;
            const variantARate = test.variant_a_leads > 0 
              ? ((test.variant_a_conversions / test.variant_a_leads) * 100).toFixed(1)
              : 0;
            const variantBRate = test.variant_b_leads > 0 
              ? ((test.variant_b_conversions / test.variant_b_leads) * 100).toFixed(1)
              : 0;

            return (
              <Card key={test.id} className="border-gray-200">
                <CardHeader className="border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg mb-2">{test.test_name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {testTypeLabels[test.test_type]}
                        </Badge>
                        <Badge className={statusConfig[test.status]?.color}>
                          {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
                          {test.status}
                        </Badge>
                        {test.winner && test.status === 'completed' && (
                          <Badge className="bg-green-600 text-white">
                            Winner: {test.winner === 'variant_a' ? test.variant_a_name : test.variant_b_name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {test.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartTest(test)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {test.status === 'running' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePauseTest(test)}
                          >
                            <Pause className="w-4 h-4 mr-1" />
                            Pause
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleCompleteTest(test)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Complete
                          </Button>
                        </>
                      )}
                      {test.status === 'paused' && (
                        <Button
                          size="sm"
                          onClick={() => handleStartTest(test)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="w-4 h-4 mr-1" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    {/* Variant A */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{test.variant_a_name}</h4>
                        {test.winner === 'variant_a' && (
                          <Badge className="bg-yellow-400 text-yellow-900">Winner</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{test.variant_a_description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Leads</span>
                          <span className="font-semibold">{test.variant_a_leads || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Conversions</span>
                          <span className="font-semibold">{test.variant_a_conversions || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Conversion Rate</span>
                          <span className="font-bold text-lg text-cyan-600">{variantARate}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Variant B */}
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900">{test.variant_b_name}</h4>
                        {test.winner === 'variant_b' && (
                          <Badge className="bg-yellow-400 text-yellow-900">Winner</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{test.variant_b_description}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Leads</span>
                          <span className="font-semibold">{test.variant_b_leads || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Conversions</span>
                          <span className="font-semibold">{test.variant_b_conversions || 0}</span>
                        </div>
                        <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                          <span className="text-gray-600">Conversion Rate</span>
                          <span className="font-bold text-lg text-teal-600">{variantBRate}%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {test.start_date && (
                    <div className="mt-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
                      <p>Started: {format(new Date(test.start_date), "MMM d, yyyy")}</p>
                      {test.end_date && (
                        <p>Ended: {format(new Date(test.end_date), "MMM d, yyyy")}</p>
                      )}
                    </div>
                  )}

                  {test.notes && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-900">{test.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="border-gray-200">
          <CardContent className="p-12 text-center">
            <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No A/B Tests Yet</h3>
            <p className="text-gray-600 mb-6">
              Create your first test to start optimizing conversion rates
            </p>
            <Button
              onClick={() => setShowNewTestDialog(true)}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create First Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}