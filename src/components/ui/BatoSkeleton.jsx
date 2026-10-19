// Premium BATO skeleton loader component
// Warm neutral tones, soft shimmer, no harsh grey
import React from "react";

const shimmerStyle = {
  background: "linear-gradient(90deg, #f0ece6 25%, #e8e3db 50%, #f0ece6 75%)",
  backgroundSize: "200% 100%",
  animation: "batoShimmer 1.6s ease-in-out infinite",
};

export function SkeletonBlock({ className = "", style = {} }) {
  return (
    <div
      aria-hidden="true" className={`bato-skeleton-block max-w-full rounded-xl ${className}`}
      style={{ ...shimmerStyle, ...style }}
    />
  );
}

export function DashboardSkeleton({ isRTL = false }) {
  return (
    <div
      className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`}
      style={{ background: "#eeebe6" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <style>{`
        @keyframes batoShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Hero skeleton */}
        <div className="rounded-3xl p-6 space-y-4" style={{ background: "rgba(58,46,30,0.08)" }}>
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <SkeletonBlock className="w-36 h-4" style={{ borderRadius: 8 }} />
            <SkeletonBlock className="w-12 h-12 ms-auto" style={{ borderRadius: "50%" }} />
          </div>
          <div className={`flex items-center gap-6 ${isRTL ? "flex-row-reverse" : ""}`}>
            <SkeletonBlock className="w-24 h-24 flex-shrink-0" style={{ borderRadius: "50%" }} />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="w-full h-4" />
              <SkeletonBlock className="w-3/4 h-3" />
              <SkeletonBlock className="w-1/2 h-3" />
              <SkeletonBlock className="w-28 h-8" style={{ borderRadius: 12 }} />
            </div>
          </div>
        </div>

        {/* Timeline skeleton */}
        <div className="bg-white rounded-2xl p-5 space-y-4 shadow-sm border border-[#eeebe6]">
          <div className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}>
            <SkeletonBlock className="w-8 h-8" style={{ borderRadius: 8 }} />
            <SkeletonBlock className="w-32 h-4" />
          </div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <SkeletonBlock className="w-7 h-7 flex-shrink-0" style={{ borderRadius: "50%" }} />
              <div className="min-w-0 flex-1 space-y-1">
                <SkeletonBlock className="w-28 h-3" />
                <SkeletonBlock className="w-20 h-2.5" />
              </div>
            </div>
          ))}
        </div>

        {/* Action card skeleton */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-[#eeebe6]">
          <div className={`flex items-center gap-3 mb-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <SkeletonBlock className="w-9 h-9" style={{ borderRadius: 12 }} />
            <SkeletonBlock className="w-40 h-4" />
          </div>
          <div className="space-y-2">
            <SkeletonBlock className="w-full h-3" />
            <SkeletonBlock className="w-5/6 h-3" />
            <SkeletonBlock className="w-4/6 h-3" />
          </div>
        </div>

        {/* Two mini cards */}
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-[#eeebe6]">
              <SkeletonBlock className="w-8 h-8 mb-3" style={{ borderRadius: 10 }} />
              <SkeletonBlock className="w-full h-3 mb-1.5" />
              <SkeletonBlock className="w-2/3 h-2.5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function JourneySkeleton({ isRTL = false }) {
  return (
    <div style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      <style>{`
        @keyframes batoShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        {/* Page header */}
        <div className={`flex flex-wrap gap-3 items-start justify-between ${isRTL ? "flex-row-reverse" : ""}`}>
          <div className="space-y-1.5">
            <SkeletonBlock className="w-36 h-6" />
            <SkeletonBlock className="w-52 h-3.5" />
          </div>
          <SkeletonBlock className="w-24 h-6" style={{ borderRadius: 99 }} />
        </div>
        {/* Hero */}
        <div className="rounded-3xl p-6 space-y-4" style={{ background: "rgba(58,46,30,0.1)" }}>
          <SkeletonBlock className="w-40 h-3" />
          <SkeletonBlock className="w-56 h-5" />
          <div className={`flex items-center gap-5 ${isRTL ? "flex-row-reverse" : ""}`}>
            <SkeletonBlock className="w-22 h-22 flex-shrink-0" style={{ borderRadius: "50%", width: 88, height: 88 }} />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="w-full h-3.5" />
              <SkeletonBlock className="w-3/4 h-3" />
              <SkeletonBlock className="w-full h-9" style={{ borderRadius: 12 }} />
            </div>
          </div>
        </div>
        {/* Section cards */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-[#eeebe6]">
            <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
              <SkeletonBlock className="w-9 h-9" style={{ borderRadius: 12 }} />
              <div className="min-w-0 flex-1">
                <SkeletonBlock className="w-36 h-4 mb-1" />
                <SkeletonBlock className="w-48 h-3" />
              </div>
              <SkeletonBlock className="w-4 h-4" style={{ borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChannelListSkeleton({ isRTL = false }) {
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-3">
      <style>{`
        @keyframes batoShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-4 border border-[#eeebe6] flex items-center gap-3"
          style={{ borderColor: "rgba(196,170,139,0.15)" }}>
          <SkeletonBlock className="w-11 h-11 flex-shrink-0" style={{ borderRadius: 12 }} />
          <div className="min-w-0 flex-1 space-y-1.5">
            <SkeletonBlock className="w-32 h-3.5" />
            <SkeletonBlock className="w-48 h-2.5" />
          </div>
          <SkeletonBlock className="w-4 h-4 flex-shrink-0" style={{ borderRadius: 4 }} />
        </div>
      ))}
    </div>
  );
}

export function AppointmentCardSkeleton({ isRTL = false }) {
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-3">
      <style>{`
        @keyframes batoShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-4 border border-[#eeebe6] shadow-sm">
          <div className={`flex items-start gap-4 ${isRTL ? "flex-row-reverse" : ""}`}>
            <SkeletonBlock className="w-14 h-14 flex-shrink-0" style={{ borderRadius: 14 }} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <SkeletonBlock className="w-40 h-4" />
              <SkeletonBlock className="w-28 h-3" />
              <SkeletonBlock className="w-20 h-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3">
      <style>{`
        @keyframes batoShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[#eeebe6] shadow-sm">
          <SkeletonBlock className="w-full" style={{ height: 150 }} />
          <div className="p-3 space-y-1.5">
            <SkeletonBlock className="w-full h-3.5" />
            <SkeletonBlock className="w-2/3 h-3" />
            <SkeletonBlock className="w-1/3 h-4 mt-2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function TierCardSkeleton({ isRTL = false }) {
  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="space-y-4">
      <style>{`
        @keyframes batoShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
      <div className="rounded-3xl p-6 space-y-4" style={{ background: "rgba(58,46,30,0.09)" }}>
        <SkeletonBlock className="w-48 h-5" />
        <SkeletonBlock className="w-full h-3" />
        <div className="flex gap-4">
          {[1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="flex-1 h-16" style={{ borderRadius: 12 }} />
          ))}
        </div>
        <SkeletonBlock className="w-full h-9" style={{ borderRadius: 12 }} />
      </div>
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl p-4 border border-[#eeebe6]">
          <div className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
            <SkeletonBlock className="w-10 h-10" style={{ borderRadius: 12 }} />
            <div className="min-w-0 flex-1 space-y-1.5">
              <SkeletonBlock className="w-40 h-3.5" />
              <SkeletonBlock className="w-56 h-2.5" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}