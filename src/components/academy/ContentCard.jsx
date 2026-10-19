import {selectCareLanguage} from "@/lib/careArabic";
import CareText from "@/components/CareText";
import {learningLabel} from "@/lib/learningLabels";
import {useLocation} from "@/components/LocationContext";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  Award, 
  CheckCircle2,
  Play,
  BookOpen,
  Video,
  FileText,
  Star
} from "lucide-react";
import { motion } from "@/components/motion/BatoMotion";

const contentTypeIcons = {
  course: BookOpen,
  guide: BookOpen,
  ebook: FileText,
  article: FileText,
  research: FileText,
  webinar: Video,
  tutorial: Play,
  video: Video
};

const difficultyColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800"
};

export default function ContentCard({ content, progress, onStart, featured = false, isNew = false }) {
  const {t,isRTL}=useLocation();
  const Icon = contentTypeIcons[content.content_type] || BookOpen;
  const isCompleted = progress?.status === 'completed';
  const isInProgress = progress?.status === 'in_progress';

  return (
    <motion.div className="h-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={`border-2 hover:shadow-xl transition-all h-full ${
        featured ? 'border-indigo-200 bg-gradient-to-br from-indigo-50 to-white' : 'border-gray-200'
      }`}>
        <CardContent className="p-0 h-full flex flex-col">
          {/* Thumbnail */}
          <div className="relative h-32 min-[390px]:h-40 shrink-0 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-t-xl overflow-hidden">
            {content.thumbnail_url ? (
              <img 
                src={content.thumbnail_url} 
                alt={selectCareLanguage(content.title,isRTL?"ar":"en")}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon className="w-16 h-16 text-white opacity-50" />
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-3 end-3 start-3 flex flex-wrap justify-end gap-2">
              {isNew && (
                <Badge className="bg-rose-700 text-white">{t("NEW","جديد")}</Badge>
              )}
              {featured && (
                <Badge className="bg-yellow-200 text-yellow-950">
                  <Star className="w-3 h-3 me-1" />{t("Featured","مميز")}</Badge>
              )}
              {isCompleted && (
                <Badge className="bg-green-700 text-white">
                  <CheckCircle2 className="w-3 h-3 me-1" />{t("Completed","مكتمل")}</Badge>
              )}
            </div>

            {/* Progress Bar */}
            {isInProgress && progress && (
              <div className="absolute bottom-0 left-0 right-0 h-2 bg-white/30" role="progressbar" aria-label={t("Learning progress","تقدم التعلّم")} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.max(0,Math.min(100,Number(progress.progress_percentage)||0))}>
                <div 
                  className="h-full bg-green-500 transition-all"
                  style={{ width: `${Math.max(0,Math.min(100,Number(progress.progress_percentage)||0))}%` }}
                />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {learningLabel(content.content_type,t)}
              </Badge>
              <Badge className={difficultyColors[content.difficulty_level]}>
                {learningLabel(content.difficulty_level,t)}
              </Badge>
            </div>

            <h3 className="font-bold text-gray-900 mb-2 leading-6 min-h-12 line-clamp-2">
              <CareText value={content.title} />
            </h3>

            <p className="text-sm leading-6 text-gray-600 mb-4 min-h-12 line-clamp-2">
              <CareText value={content.description} prose />
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {content.estimated_duration_minutes??"—"}{" "}{t("min","دقيقة")}</span>
                <span className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-yellow-600" />
                  +{content.points_reward??0}{" "}{t("pts","نقطة")}</span>
              </div>
            </div>

            <Button
              onClick={onStart}
              className={`w-full mt-auto min-h-11 ${
                isCompleted 
                  ? 'bg-gray-600 hover:bg-gray-700' 
                  : isInProgress 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isCompleted ? (
                <>
                  <CheckCircle2 className="w-4 h-4 me-2" />{t("Review","مراجعة")}</>
              ) : isInProgress ? (
                <>
                  <Play className="w-4 h-4 me-2" />{t("Continue","متابعة")}</>
              ) : (
                <>
                  <Play className="w-4 h-4 me-2" />{t("Start Learning","ابدأ التعلّم")}</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}