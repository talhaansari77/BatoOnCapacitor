import React, { useState, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, ChevronLeft, ChevronRight, SplitSquareHorizontal, X } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "../LocationContext";

function ComparisonSlider({ beforePhoto, afterPhoto }) {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const isDragging = useRef(false);

  const getPos = useCallback((clientX) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (x / rect.width) * 100;
  }, []);

  const onMouseDown = (e) => {
    isDragging.current = true;
    e.preventDefault();
  };
  const onMouseMove = useCallback((e) => {
    if (!isDragging.current) return;
    setSliderPos(getPos(e.clientX));
  }, [getPos]);
  const onMouseUp = () => { isDragging.current = false; };

  const onTouchMove = useCallback((e) => {
    setSliderPos(getPos(e.touches[0].clientX));
  }, [getPos]);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square rounded-xl overflow-hidden select-none cursor-col-resize"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onTouchMove={onTouchMove}
    >
      {/* After (full background) */}
      <img
        src={afterPhoto.url}
        alt="After"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* Before (clipped left portion) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforePhoto.url}
          alt="Before"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: `${100 / (sliderPos / 100)}%`, maxWidth: "none" }}
          draggable={false}
        />
      </div>

      {/* Divider line */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg z-10"
        style={{ left: `${sliderPos}%` }}
      >
        {/* Handle */}
        <div
          onMouseDown={onMouseDown}
          onTouchStart={onMouseDown}
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-9 h-9 bg-white rounded-full shadow-xl flex items-center justify-center cursor-col-resize z-20 border border-gray-200"
        >
          <SplitSquareHorizontal className="w-4 h-4 text-gray-600" />
        </div>
      </div>

      {/* Labels */}
      <div className="absolute top-3 left-3 z-10">
        <span className="bg-black/60 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
          {beforePhoto.label}
        </span>
      </div>
      <div className="absolute top-3 right-3 z-10">
        <span className="bg-cyan-600/90 text-white text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
          {afterPhoto.label}
        </span>
      </div>

      {/* Drag hint */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10">
        <span className="bg-black/40 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" />
          drag
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </div>
  );
}

export default function BeforeAfterComparison({ caseFile, sessions }) {
  const { isRTL, t } = useLocation();
  const [selectedPair, setSelectedPair] = useState(null);

  // Build the "before" reference (first before_photo from caseFile)
  const beforePhoto = caseFile?.before_photos?.[0]
    ? {
        url: caseFile.before_photos[0],
        label: t("Before", "قبل"),
        date: caseFile.start_date || caseFile.created_date,
      }
    : null;

  // Build pairs: each session that has photos gets compared to "before"
  const pairs = sessions
    .filter((s) => s.photos?.length > 0)
    .map((s) => ({
      sessionNumber: s.session_number,
      sessionDate: s.session_date,
      treatmentType: s.treatment_type,
      afterPhoto: {
        url: s.photos[0],
        label: `${t("Session", "جلسة")} ${s.session_number}`,
        date: s.session_date,
      },
    }));

  const hasComparisons = beforePhoto && pairs.length > 0;

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <CardContent className="p-4">
        {/* Header */}
        <div className={`flex items-center gap-3 mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <SplitSquareHorizontal className="w-5 h-5 text-white" />
          </div>
          <div className={isRTL ? "text-right" : "text-left"}>
            <h3 className="font-semibold text-gray-900">{t("Before & After", "قبل وبعد")}</h3>
            <p className="text-xs text-gray-500">
              {hasComparisons
                ? `${pairs.length} ${t("comparisons available", "مقارنة متاحة")}`
                : t("Photos will appear after your first session", "ستظهر الصور بعد جلستك الأولى")}
            </p>
          </div>
        </div>

        {!hasComparisons ? (
          <div className="text-center py-8 text-gray-400">
            <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-200" />
            <p className="text-sm text-gray-500">
              {!beforePhoto
                ? t("Before photos not yet uploaded by your specialist.", "لم يرفع أخصائيك صور ما قبل العلاج بعد.")
                : t("No session photos yet.", "لا توجد صور للجلسات بعد.")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pairs.map((pair, idx) => (
              <motion.button
                key={pair.sessionNumber}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                onClick={() => setSelectedPair(pair)}
                className="w-full"
              >
                <div className="flex gap-2 rounded-xl overflow-hidden border border-gray-100 hover:border-cyan-300 transition-colors group">
                  {/* Before thumbnail */}
                  <div className="relative w-1/2 aspect-square">
                    <img
                      src={beforePhoto.url}
                      alt="Before"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      {t("Before", "قبل")}
                    </span>
                  </div>

                  {/* After thumbnail */}
                  <div className="relative w-1/2 aspect-square">
                    <img
                      src={pair.afterPhoto.url}
                      alt={pair.afterPhoto.label}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                    <span className="absolute bottom-1 right-1 bg-cyan-600/90 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
                      {pair.afterPhoto.label}
                    </span>
                  </div>
                </div>

                {/* Session info */}
                <div className={`flex items-center justify-between mt-1.5 px-1 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <p className="text-xs font-medium text-gray-700">
                    {pair.treatmentType.replace(/_/g, ' ')}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Badge className="bg-cyan-100 text-cyan-700 text-[10px] px-2">
                      {t("Session", "جلسة")} {pair.sessionNumber}
                    </Badge>
                    <p className="text-[10px] text-gray-400">
                      {format(new Date(pair.sessionDate), "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </CardContent>

      {/* Full-screen comparison dialog */}
      <Dialog open={!!selectedPair} onOpenChange={(open) => !open && setSelectedPair(null)}>
        <DialogContent className="max-w-md p-4" dir={isRTL ? 'rtl' : 'ltr'}>
          {selectedPair && (
            <div className="space-y-3">
              <div className={`flex items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="font-bold text-gray-900 text-base">
                    {t("Before & After", "قبل وبعد")} — {t("Session", "جلسة")} {selectedPair.sessionNumber}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(selectedPair.sessionDate), "MMMM d, yyyy")}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPair(null)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              <ComparisonSlider
                beforePhoto={{ ...beforePhoto }}
                afterPhoto={{ ...selectedPair.afterPhoto }}
              />

              <div className={`flex items-center justify-between text-xs text-gray-500 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <span>
                  {t("Before", "قبل")}: {caseFile?.start_date ? format(new Date(caseFile.start_date), "MMM d, yyyy") : "—"}
                </span>
                <span className="text-cyan-600 font-medium">
                  {t("After", "بعد")}: {format(new Date(selectedPair.sessionDate), "MMM d, yyyy")}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}