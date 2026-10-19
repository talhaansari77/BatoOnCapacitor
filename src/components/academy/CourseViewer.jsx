import { selectCareLanguage, selectCareProse } from "@/lib/careArabic";
import CareText from "@/components/CareText";
import {learningLabel} from "@/lib/learningLabels";
import {resourceUrl} from "@/lib/customerFormatting";
import {customerDate} from "@/lib/customerDate";
import {useLocation} from "@/components/LocationContext";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Clock, 
  Award,
  Download,
  ExternalLink,
  X
} from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function CourseViewer({ content, progress, onClose, onComplete, saving=false }) {
  const {t,isRTL}=useLocation();
  const downloadUrl=resourceUrl(content.content_url);
  const videoUrl=resourceUrl(content.video_embed_url);
  const [timeSpent, setTimeSpent] = useState(0);
  const isCompleted = progress?.status === 'completed';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent dir={isRTL?"rtl":"ltr"} className="bato-academy-dialog max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl mb-2"><CareText value={content.title} /></DialogTitle><DialogDescription>{t("Read the lesson, then record your progress.","اقرأ الدرس ثم سجل تقدمك.")}</DialogDescription>
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="outline">
                  {learningLabel(content.content_type,t)}
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  {learningLabel(content.difficulty_level,t)}
                </Badge>
                {isCompleted && (
                  <Badge className="bg-green-500 text-white">
                    <CheckCircle2 className="w-3 h-3 mr-1" />{t("Completed","مكتمل")}</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {content.estimated_duration_minutes??"—"}{" "}{t("min","دقيقة")}</span>
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-yellow-600" />
                  +{content.points_reward??0}{" "}{t("points","نقطة")}</span>
                <span>{t("Time spent: ","الوقت المنقضي:")}{formatTime(timeSpent)}</span>
              </div>
            </div>

          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Learning Objectives */}
          {content.learning_objectives && content.learning_objectives.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">{t("What You'll Learn","ما الذي ستتعلمه")}</h3>
              <ul className="space-y-2">
                {content.learning_objectives.map((objective, idx) => (
                  <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span><CareText value={objective} prose /></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Video Embed */}
          {videoUrl && (
            <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
              <iframe
                title={selectCareLanguage(content.title,isRTL?"ar":"en")||t("Learning video","فيديو تعليمي")}
                src={videoUrl}
                className="w-full h-full"
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
            </div>
          )}

          {/* Content Body */}
          {content.content_body && (
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{selectCareProse(content.content_body,isRTL?"ar":"en")}</ReactMarkdown>
            </div>
          )}

          {/* Download Link */}
          {downloadUrl && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.open(downloadUrl, '_blank', 'noopener,noreferrer')}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />{t("Download Resource","افتح المادة التعليمية")}</Button>
              <Button
                variant="outline"
                onClick={() => window.open(content.content_url, '_blank')}
              >
                <ExternalLink aria-label={t("Open resource","افتح المادة التعليمية")} className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Author Info */}
          {content.author && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600">
                <strong>{t("Author:","المؤلف:")}</strong> {content.author}
              </p>
            </div>
          )}

          {/* Completion Button */}
          {!isCompleted && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
              <div className="flex flex-wrap gap-4 items-center justify-between">
                <div>
                  <h3 className="font-semibold text-green-900 mb-1">{t("Ready to Complete?","هل أكملت المحتوى؟")}</h3>
                  <p className="text-sm text-green-700">{t("Mark this as complete to earn","حدد اكتمال المحتوى لاكتساب")}{" "}{content.points_reward}{" "}{t("loyalty points!","من نقاط المكافآت")}</p>
                </div>
                <Button
                  disabled={saving}
                  onClick={onComplete}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />{t("Mark Complete","حدد كمكتمل")}</Button>
              </div>
            </div>
          )}

          {/* Completed Message */}
          {isCompleted && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-green-900 mb-1">{t("Completed!","مكتمل!")}</h3>
              <p className="text-sm text-green-700">{t("You earned","اكتسبت")}{" "}{progress.points_earned}{t(" points on","نقطة بتاريخ")}{' '}
                {customerDate(progress.completed_date,isRTL)}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}