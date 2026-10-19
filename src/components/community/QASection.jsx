import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  MessageCircle,
  ThumbsUp,
  Award,
  Sparkles,
  CheckCircle2,
  Eye,
  TrendingUp
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function QASection({ userEmail, groupId }) {
  const [showAskQuestion, setShowAskQuestion] = useState(false);
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionContent, setQuestionContent] = useState("");
  const [questionCategory, setQuestionCategory] = useState("general");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [answerContent, setAnswerContent] = useState("");
  const [generatingAI, setGeneratingAI] = useState(false);

  const queryClient = useQueryClient();

  const { data: questions } = useQuery({
    queryKey: ['qa_questions', groupId],
    queryFn: async () => {
      const filter = groupId ? { group_id: groupId } : {};
      return await base44.entities.QAQuestion.filter(filter, '-created_date', 50);
    },
    initialData: [],
  });

  const askQuestionMutation = useMutation({
    mutationFn: async (data) => {
      // Get AI analysis of question quality
      const aiAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this Q&A question for quality and suggest related topics:

Title: ${data.title}
Content: ${data.content}

Return JSON with:
1. quality_score: 0-100 (clarity, detail, relevance)
2. suggested_topics: array of related topics
3. is_insightful: boolean (award 25 points if true, 10 if false)`,
        response_json_schema: {
          type: "object",
          properties: {
            quality_score: { type: "number" },
            suggested_topics: { type: "array", items: { type: "string" } },
            is_insightful: { type: "boolean" }
          }
        }
      });

      const pointsToAward = aiAnalysis.is_insightful ? 25 : 10;

      const question = await base44.entities.QAQuestion.create({
        ...data,
        ai_quality_score: aiAnalysis.quality_score,
        ai_suggested_topics: aiAnalysis.suggested_topics,
        points_awarded: pointsToAward
      });

      // Award points to user
      const lifecycle = await base44.entities.ClientLifecycle.filter({ client_email: userEmail });
      if (lifecycle[0]) {
        await base44.entities.ClientLifecycle.update(lifecycle[0].id, {
          loyalty_points: (lifecycle[0].loyalty_points || 0) + pointsToAward
        });
      }

      // Create notification
      await base44.entities.Notification.create({
        client_email: userEmail,
        type: 'general',
        title: `+${pointsToAward} Points for Your Question!`,
        message: aiAnalysis.is_insightful 
          ? "Great question! You've earned 25 points for asking an insightful question."
          : "Thanks for asking! You've earned 10 points.",
        priority: 'normal'
      });

      return question;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa_questions'] });
      queryClient.invalidateQueries({ queryKey: ['clientLifecycle'] });
      setShowAskQuestion(false);
      setQuestionTitle("");
      setQuestionContent("");
      toast.success('Question posted! Points awarded.');
    },
  });

  const submitAnswerMutation = useMutation({
    mutationFn: async (data) => {
      // Get AI analysis of answer quality
      const aiAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this Q&A answer for quality:

Question: ${selectedQuestion.title}
Answer: ${data.content}

Return JSON with:
1. quality_score: 0-100 (accuracy, helpfulness, completeness)
2. is_helpful: boolean (award 30 points if true, 15 if false)
3. suggested_sources: array of sources to cite`,
        response_json_schema: {
          type: "object",
          properties: {
            quality_score: { type: "number" },
            is_helpful: { type: "boolean" },
            suggested_sources: { type: "array", items: { type: "string" } }
          }
        }
      });

      const pointsToAward = aiAnalysis.is_helpful ? 30 : 15;

      const answer = await base44.entities.QAAnswer.create({
        ...data,
        ai_quality_score: aiAnalysis.quality_score,
        points_awarded: pointsToAward,
        sources: aiAnalysis.suggested_sources
      });

      // Update question answer count
      await base44.entities.QAQuestion.update(selectedQuestion.id, {
        answers_count: (selectedQuestion.answers_count || 0) + 1,
        status: 'answered'
      });

      // Award points to user
      const lifecycle = await base44.entities.ClientLifecycle.filter({ client_email: userEmail });
      if (lifecycle[0]) {
        await base44.entities.ClientLifecycle.update(lifecycle[0].id, {
          loyalty_points: (lifecycle[0].loyalty_points || 0) + pointsToAward
        });
      }

      // Notify question author
      await base44.entities.Notification.create({
        client_email: selectedQuestion.author_email,
        type: 'general',
        title: 'New Answer to Your Question',
        message: `Someone answered your question: "${selectedQuestion.title}"`,
        priority: 'normal'
      });

      // Notify answer author about points
      await base44.entities.Notification.create({
        client_email: userEmail,
        type: 'general',
        title: `+${pointsToAward} Points for Your Answer!`,
        message: aiAnalysis.is_helpful
          ? "Excellent answer! You've earned 30 points for providing helpful information."
          : "Thanks for contributing! You've earned 15 points.",
        priority: 'normal'
      });

      return answer;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qa_questions'] });
      queryClient.invalidateQueries({ queryKey: ['qa_answers'] });
      queryClient.invalidateQueries({ queryKey: ['clientLifecycle'] });
      setSelectedQuestion(null);
      setAnswerContent("");
      toast.success('Answer posted! Points awarded.');
    },
  });

  const generateAIAnswer = async (question) => {
    setGeneratingAI(true);
    try {
      const aiAnswer = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a knowledgeable AI assistant helping with hair restoration questions. 
Provide a helpful, accurate answer to this question:

Title: ${question.title}
Question: ${question.content}

Provide a comprehensive but concise answer. Include relevant medical facts, recovery tips, or general guidance.
Be supportive and encouraging. If medical advice is needed, suggest consulting with their doctor.`,
        add_context_from_internet: true
      });

      const answer = await base44.entities.QAAnswer.create({
        question_id: question.id,
        author_email: 'ai@hairrevive.com',
        author_name: 'AI Assistant',
        content: aiAnswer,
        is_ai_generated: true,
        is_expert_answer: false,
        ai_confidence_score: 85
      });

      // Update question
      await base44.entities.QAQuestion.update(question.id, {
        answers_count: (question.answers_count || 0) + 1,
        status: 'answered'
      });

      queryClient.invalidateQueries({ queryKey: ['qa_questions'] });
      toast.success('AI generated an answer!');
    } catch (error) {
      console.error("Error generating AI answer:", error);
      toast.error('Failed to generate AI answer');
    }
    setGeneratingAI(false);
  };

  const handleAskQuestion = () => {
    if (!questionTitle.trim() || !questionContent.trim()) {
      toast.error('Please provide both title and content');
      return;
    }

    askQuestionMutation.mutate({
      author_email: userEmail,
      author_name: "Community Member",
      title: questionTitle,
      content: questionContent,
      category: questionCategory,
      group_id: groupId || null
    });
  };

  const handleSubmitAnswer = () => {
    if (!answerContent.trim()) {
      toast.error('Please provide an answer');
      return;
    }

    submitAnswerMutation.mutate({
      question_id: selectedQuestion.id,
      author_email: userEmail,
      author_name: "Community Member",
      content: answerContent
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Expert Q&A</h2>
            <p className="text-sm text-gray-600">Ask questions, earn points for insights</p>
          </div>
        </div>

        <Dialog open={showAskQuestion} onOpenChange={setShowAskQuestion}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Ask Question
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Ask Your Question</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Question Title
                </label>
                <Input
                  placeholder="What would you like to know?"
                  value={questionTitle}
                  onChange={(e) => setQuestionTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Category
                </label>
                <select
                  value={questionCategory}
                  onChange={(e) => setQuestionCategory(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="treatment">Treatment</option>
                  <option value="recovery">Recovery</option>
                  <option value="side_effects">Side Effects</option>
                  <option value="results">Results</option>
                  <option value="cost">Cost</option>
                  <option value="general">General</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Details
                </label>
                <Textarea
                  placeholder="Provide as much detail as possible..."
                  value={questionContent}
                  onChange={(e) => setQuestionContent(e.target.value)}
                  rows={6}
                />
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-purple-900 mb-1">Earn Points!</p>
                    <p className="text-purple-700">
                      • Insightful questions: <strong>25 points</strong><br />
                      • Regular questions: <strong>10 points</strong>
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAskQuestion}
                disabled={askQuestionMutation.isPending}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {askQuestionMutation.isPending ? 'Posting...' : 'Post Question'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question, idx) => (
          <motion.div
            key={question.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="hover:shadow-lg transition-all border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-1 h-auto"
                    >
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                    </Button>
                    <span className="text-sm font-semibold text-gray-700">
                      {question.upvotes_count || 0}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">
                          {question.title}
                        </h3>
                        <p className="text-gray-700 text-sm mb-3">{question.content}</p>
                      </div>
                    </div>

                    {/* Tags */}
                    {question.ai_suggested_topics && question.ai_suggested_topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {question.ai_suggested_topics.map((topic, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{question.views_count || 0} views</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{question.answers_count || 0} answers</span>
                      </div>
                      {question.ai_quality_score && (
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-4 h-4 text-purple-600" />
                          <span className="text-purple-600 font-medium">
                            Quality: {question.ai_quality_score}/100
                          </span>
                        </div>
                      )}
                      {question.points_awarded > 0 && (
                        <div className="flex items-center gap-1">
                          <Award className="w-4 h-4 text-yellow-600" />
                          <span className="text-yellow-600 font-medium">
                            +{question.points_awarded} pts
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    {question.status === 'expert_answered' && (
                      <Badge className="bg-green-100 text-green-800 mb-3">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Expert Answered
                      </Badge>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedQuestion(question)}
                        className="bg-cyan-600 hover:bg-cyan-700"
                      >
                        Answer (+15-30 pts)
                      </Button>
                      {question.answers_count === 0 && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateAIAnswer(question)}
                          disabled={generatingAI}
                          className="border-purple-600 text-purple-600 hover:bg-purple-50"
                        >
                          <Sparkles className="w-4 h-4 mr-1" />
                          {generatingAI ? 'Generating...' : 'AI Answer'}
                        </Button>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 mt-2">
                      Asked {format(new Date(question.created_date), "MMM d")} by {question.author_name}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Answer Dialog */}
      <Dialog open={!!selectedQuestion} onOpenChange={() => setSelectedQuestion(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Answer Question</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">{selectedQuestion.title}</h3>
                <p className="text-sm text-gray-700">{selectedQuestion.content}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Your Answer
                </label>
                <Textarea
                  placeholder="Share your knowledge and experience..."
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  rows={8}
                />
              </div>

              <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <Award className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold text-cyan-900 mb-1">Earn Points!</p>
                    <p className="text-cyan-700">
                      • Helpful answers: <strong>30 points</strong><br />
                      • Regular answers: <strong>15 points</strong>
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleSubmitAnswer}
                disabled={submitAnswerMutation.isPending}
                className="w-full bg-cyan-600 hover:bg-cyan-700"
              >
                {submitAnswerMutation.isPending ? 'Posting...' : 'Post Answer'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}