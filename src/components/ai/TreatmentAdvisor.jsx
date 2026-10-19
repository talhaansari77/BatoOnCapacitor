
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sparkles,
  Send,
  Loader2,
  Image as ImageIcon,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Brain,
  MessageSquare
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function TreatmentAdvisor({ clientEmail, caseFile, sessions }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("analyze");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [customQuery, setCustomQuery] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const analyzeProgress = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      // Gather all photos from sessions
      const allPhotos = sessions.flatMap(s => s.photos || []);
      const beforePhotos = caseFile?.before_photos || [];

      const prompt = `As an AI hair restoration treatment advisor, analyze this client's treatment progress:

CLIENT CASE OVERVIEW:
- Diagnosis: ${caseFile?.diagnosis || 'Not specified'}
- Treatment Plan: ${caseFile?.treatment_plan || 'Not specified'}
- Case Status: ${caseFile?.case_status}
- Start Date: ${caseFile?.start_date || 'Not started'}
- Assigned Doctor: ${caseFile?.assigned_doctor || 'Not assigned'}
- Total Sessions Planned: ${caseFile?.total_sessions_planned || 'Not specified'}
- Total Grafts Planned: ${caseFile?.total_grafts_planned || 'Not specified'}

TREATMENT HISTORY:
${sessions.map((s, idx) => `
Session ${s.session_number}:
- Date: ${s.session_date}
- Type: ${s.treatment_type}
- Grafts: ${s.grafts_count || 'N/A'}
- Areas: ${s.areas_treated || 'N/A'}
- Doctor Notes: ${s.doctor_notes || 'None'}
- Photos: ${s.photos?.length || 0} available
`).join('\n')}

TOTAL SESSIONS COMPLETED: ${sessions.length}
TOTAL GRAFTS DONE: ${sessions.reduce((sum, s) => sum + (s.grafts_count || 0), 0)}

Please provide a comprehensive analysis including:
1. Overall progress assessment (excellent/good/moderate/needs attention)
2. Key observations from treatment history
3. Comparison to planned treatment goals
4. Areas showing positive response
5. Any concerns or areas needing attention
6. Estimated progress percentage toward full recovery
7. Recommendations for next steps

${allPhotos.length > 0 ? `The client has ${allPhotos.length} progress photos and ${beforePhotos.length} before photos available for visual tracking.` : ''}

Format your response in a clear, professional manner that's easy for the client to understand.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setAnalysis({
        type: 'progress',
        content: result,
        timestamp: new Date().toISOString()
      });

      toast.success("Progress analysis complete!");
    } catch (error) {
      console.error("Error analyzing progress:", error);
      toast.error("Failed to analyze progress");
    }

    setIsAnalyzing(false);
  };

  const analyzePhotos = async () => {
    if (!sessions.some(s => s.photos?.length > 0) && !caseFile?.before_photos?.length) {
      toast.error("No photos available to analyze");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const allPhotos = [
        ...(caseFile?.before_photos || []),
        ...sessions.flatMap(s => s.photos || [])
      ];

      const prompt = `As an AI hair restoration specialist, analyze these treatment progress photos in detail.

CONTEXT:
- Total Photos: ${allPhotos.length}
- Treatment Type: ${caseFile?.diagnosis || 'Hair restoration'}
- Sessions Completed: ${sessions.length}
- Total Grafts: ${sessions.reduce((sum, s) => sum + (s.grafts_count || 0), 0)}

Please provide:
1. Visual assessment of hair density changes
2. Graft survival rate estimation
3. Areas showing excellent growth vs areas needing attention
4. Hairline naturalness and design evaluation
5. Overall cosmetic outcome assessment
6. Comparison between early and recent photos
7. Any visible complications or concerns
8. Recommendations based on visual analysis

Be specific about what you observe in the images and provide percentage-based estimates where appropriate.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        file_urls: allPhotos.slice(0, 10), // Limit to 10 most recent photos
        add_context_from_internet: false
      });

      setAnalysis({
        type: 'photos',
        content: result,
        timestamp: new Date().toISOString(),
        photosAnalyzed: Math.min(allPhotos.length, 10)
      });

      toast.success("Photo analysis complete!");
    } catch (error) {
      console.error("Error analyzing photos:", error);
      toast.error("Failed to analyze photos");
    }

    setIsAnalyzing(false);
  };

  const generateSummary = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const prompt = `Create a comprehensive, client-friendly treatment summary for this hair restoration case:

CASE INFORMATION:
- Diagnosis: ${caseFile?.diagnosis || 'Not specified'}
- Treatment Status: ${caseFile?.case_status}
- Start Date: ${caseFile?.start_date || 'Not started'}
- Doctor: ${caseFile?.assigned_doctor || 'Not assigned'}

TREATMENT SESSIONS (${sessions.length} total):
${sessions.map(s => `
• Session ${s.session_number} - ${s.session_date}
  Type: ${s.treatment_type}
  Grafts: ${s.grafts_count || 'N/A'}
  Areas: ${s.areas_treated || 'N/A'}
  Notes: ${s.doctor_notes || 'None'}
  Next Steps: ${s.next_steps || 'None'}
`).join('\n')}

PROGRESS METRICS:
- Sessions Completed: ${sessions.length} / ${caseFile?.total_sessions_planned || '?'}
- Grafts Implanted: ${sessions.reduce((sum, s) => sum + (s.grafts_count || 0), 0)} / ${caseFile?.total_grafts_planned || '?'}

Please create:
1. Executive summary of the entire treatment journey
2. Timeline of key milestones achieved
3. Summary of each major treatment phase
4. Current status and what to expect next
5. Important care instructions and reminders
6. Estimated timeline to final results
7. Overall prognosis and expected outcome

Write in a warm, encouraging tone that's easy to understand. Help the client see the progress they've made and what's ahead.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: false
      });

      setAnalysis({
        type: 'summary',
        content: result,
        timestamp: new Date().toISOString()
      });

      toast.success("Treatment summary generated!");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error("Failed to generate summary");
    }

    setIsAnalyzing(false);
  };

  const askCustomQuestion = async () => {
    if (!customQuery.trim()) {
      toast.error("Please enter a question");
      return;
    }

    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const prompt = `You are an AI hair restoration treatment advisor. Answer this client's question based on their treatment data:

CLIENT QUESTION: "${customQuery}"

CASE CONTEXT:
- Diagnosis: ${caseFile?.diagnosis || 'Not specified'}
- Status: ${caseFile?.case_status}
- Treatment Plan: ${caseFile?.treatment_plan || 'Not specified'}
- Sessions Done: ${sessions.length}
- Total Grafts: ${sessions.reduce((sum, s) => sum + (s.grafts_count || 0), 0)}
- Start Date: ${caseFile?.start_date || 'Not started'}

Recent Session Info:
${sessions.slice(0, 3).map(s => `- Session ${s.session_number}: ${s.treatment_type}, ${s.session_date}`).join('\n')}

Provide a helpful, accurate, and reassuring answer. If the question is medical in nature, remind them to consult with their doctor. Be specific and reference their actual treatment data when relevant.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: prompt,
        add_context_from_internet: true // Allow web search for general hair restoration info
      });

      setAnalysis({
        type: 'custom',
        content: result,
        timestamp: new Date().toISOString(),
        question: customQuery
      });

      setCustomQuery("");
      toast.success("Answer generated!");
    } catch (error) {
      console.error("Error answering question:", error);
      toast.error("Failed to get answer");
    }

    setIsAnalyzing(false);
  };

  const getAnalysisIcon = () => {
    switch (analysis?.type) {
      case 'progress': return TrendingUp;
      case 'photos': return ImageIcon;
      case 'summary': return FileText;
      case 'custom': return MessageSquare;
      default: return Sparkles;
    }
  };

  const AnalysisIcon = analysis ? getAnalysisIcon() : Sparkles;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-purple-600 hover:bg-purple-700">
            <Brain className="w-5 h-5 mr-2" />
            AI Advisor
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Treatment Advisor
            </DialogTitle>
            <DialogDescription>
              Get AI-powered insights about your treatment progress
            </DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
            <TabsList className="inline-flex h-11 bg-gray-100 p-1 rounded-lg mb-4">
              <TabsTrigger value="analyze" className="rounded-md text-sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="photos" className="rounded-md text-sm">
                <ImageIcon className="w-4 h-4 mr-2" />
                Photos
              </TabsTrigger>
              <TabsTrigger value="summary" className="rounded-md text-sm">
                <FileText className="w-4 h-4 mr-2" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="ask" className="rounded-md text-sm">
                <MessageSquare className="w-4 h-4 mr-2" />
                Ask AI
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4">
              <TabsContent value="analyze" className="mt-0">
                <Card className="border-none shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
                    <CardTitle className="text-base">Overall Progress Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Get a comprehensive AI analysis of your treatment progress, including effectiveness assessment,
                      milestone tracking, and recommendations for next steps.
                    </p>
                    <Button
                      onClick={analyzeProgress}
                      disabled={isAnalyzing || sessions.length === 0}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Analyze My Progress
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="photos" className="mt-0">
                <Card className="border-none shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-cyan-50 to-teal-50">
                    <CardTitle className="text-base">Photo Analysis</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        AI will analyze your before/after photos to assess hair density, graft survival,
                        and overall aesthetic results.
                      </p>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <Badge variant="outline">
                          {caseFile?.before_photos?.length || 0} before photos
                        </Badge>
                        <Badge variant="outline">
                          {sessions.reduce((sum, s) => sum + (s.photos?.length || 0), 0)} progress photos
                        </Badge>
                      </div>
                    </div>
                    <Button
                      onClick={analyzePhotos}
                      disabled={isAnalyzing || (!caseFile?.before_photos?.length && !sessions.some(s => s.photos?.length))}
                      className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing Photos...
                        </>
                      ) : (
                        <>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          Analyze Photos
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="summary" className="mt-0">
                <Card className="border-none shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
                    <CardTitle className="text-base">Treatment Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Generate a comprehensive, easy-to-understand summary of your entire treatment journey,
                      including all sessions, milestones, and what to expect next.
                    </p>
                    <Button
                      onClick={generateSummary}
                      disabled={isAnalyzing || sessions.length === 0}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate Summary
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="ask" className="mt-0">
                <Card className="border-none shadow-sm">
                  <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
                    <CardTitle className="text-base">Ask Questions</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                      Ask any questions about your treatment, expected results, care instructions, or timeline.
                    </p>
                    <div className="space-y-3">
                      <Textarea
                        placeholder="Example: When will I see full results? What should I avoid during recovery?"
                        value={customQuery}
                        onChange={(e) => setCustomQuery(e.target.value)}
                        rows={3}
                        className="resize-none"
                      />
                      <Button
                        onClick={askCustomQuestion}
                        disabled={isAnalyzing || !customQuery.trim()}
                        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600"
                      >
                        {isAnalyzing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Thinking...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Ask AI
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analysis Results */}
              {analysis && (
                <Card className="mt-4 border-2 border-purple-200 shadow-lg">
                  <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <AnalysisIcon className="w-5 h-5 text-purple-600" />
                      AI Analysis Results
                      <Badge variant="outline" className="ml-auto">
                        {new Date(analysis.timestamp).toLocaleTimeString()}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    {analysis.question && (
                      <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-sm font-medium text-orange-900">Your Question:</p>
                        <p className="text-sm text-orange-700 mt-1">{analysis.question}</p>
                      </div>
                    )}

                    {analysis.photosAnalyzed && (
                      <div className="mb-4">
                        <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          Analyzed {analysis.photosAnalyzed} photos
                        </Badge>
                      </div>
                    )}

                    <div className="prose prose-sm max-w-none">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="mb-3 ml-4 space-y-1 list-disc text-gray-700">{children}</ul>,
                          ol: ({ children }) => <ol className="mb-3 ml-4 space-y-1 list-decimal text-gray-700">{children}</ol>,
                          li: ({ children }) => <li className="text-gray-700">{children}</li>,
                          h1: ({ children }) => <h1 className="text-xl font-bold mb-3 text-gray-900">{children}</h1>,
                          h2: ({ children }) => <h2 className="text-lg font-semibold mb-2 text-gray-900">{children}</h2>,
                          h3: ({ children }) => <h3 className="text-base font-semibold mb-2 text-gray-900">{children}</h3>,
                          strong: ({ children }) => <strong className="font-semibold text-gray-900">{children}</strong>,
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-purple-400 pl-4 my-3 text-gray-600 italic">
                              {children}
                            </blockquote>
                          ),
                        }}
                      >
                        {analysis.content}
                      </ReactMarkdown>
                    </div>

                    <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-900 mb-1">AI-Assisted Analysis</p>
                          <p className="text-xs text-amber-700">
                            This analysis is generated by AI and should be used as supplementary information.
                            Always consult with your medical team for final treatment decisions and personalized advice.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}
