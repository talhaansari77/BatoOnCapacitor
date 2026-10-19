import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Crown, Star, Lock, Unlock, Award } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useLocation } from "@/components/LocationContext";

const TIER_COLORS = {
  diamond:  "#e7cb50",
  platinum: "#c4aa8b",
  gold:     "#e7cb50",
  silver:   "#9aabb0",
  bronze:   "#c4aa8b",
};

export default function LoyaltyLeaderboard({ userEmail, currentLifecycle }) {
  const { t, isRTL } = useLocation();
  const queryClient = useQueryClient();
  const busy = useRef(false);
  const [saving, setSaving] = useState(false);
  const [showPublic, setShowPublic] = useState(currentLifecycle?.show_on_leaderboard || false);

  useEffect(() => { setShowPublic(!!currentLifecycle?.show_on_leaderboard); }, [currentLifecycle?.show_on_leaderboard]);

  const { data: leaderboard = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["loyaltyLeaderboard"],
    queryFn: () => base44.entities.ClientLifecycle.filter({ show_on_leaderboard: true }, "-loyalty_points", 20),
    enabled: !!userEmail,
    retry: 1,
  });

  const handleToggle = async (nextValue) => {
    if (busy.current || !userEmail) return;
    busy.current = true; setSaving(true);
    try {
      const records = await base44.entities.ClientLifecycle.filter({client_email:userEmail});
      const record = records[0];
      const preference = {show_on_leaderboard:nextValue};
      if (record) await base44.entities.ClientLifecycle.update(record.id, preference);
      else await base44.entities.ClientLifecycle.create({client_email:userEmail,...preference,leaderboard_display_name:"Member"});
      setShowPublic(nextValue);
      await queryClient.invalidateQueries({queryKey:["loyaltyLeaderboard"]});
      await queryClient.invalidateQueries({queryKey:["clientLifecycle"]});
      toast.success(nextValue ? t("Member recognition enabled","تم تفعيل ظهورك في تقدير الأعضاء") : t("Member recognition disabled","تم إيقاف ظهورك في تقدير الأعضاء"));
    } catch {
      toast.error(t("Could not save your preference. Please try again.","تعذر حفظ اختيارك. حاول مرة أخرى."));
    } finally { busy.current=false; setSaving(false); }
  };

  const enriched = leaderboard;
  const currentUserRank = enriched.findIndex(l => l.client_email === userEmail) + 1;

  return (
    <div className="bg-white rounded-2xl border border-[#eeebe6] overflow-hidden">
      {/* Header */}
      <div className="px-5 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(196,170,139,0.12)" }}>
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-[#333435] text-sm">{t("Member Recognition","تقدير الأعضاء")}</h3>
            <p className="text-[11px] text-[#7c8689] mt-0.5">{t("Members who actively engage with their care journey","أعضاء يشاركون في رحلة رعايتهم")}</p>
          </div>
          {currentUserRank > 0 && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
              style={{ background: "rgba(196,170,139,0.12)", color: "#c4aa8b", border: "1px solid rgba(196,170,139,0.25)" }}>
              #{currentUserRank}
            </span>
          )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Opt-in toggle */}
        <div className="bato-style-surface flex items-center gap-3 p-3.5 rounded-xl"
          style={{ background: "#f9f8f6", border: "1px solid rgba(196,170,139,0.15)" }}>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              {showPublic
                ? <Unlock className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                : <Lock className="w-3.5 h-3.5 text-[#7c8689]" />}
              <Label htmlFor="recognition-toggle" className="text-sm font-medium text-[#333435] cursor-pointer">
                {t("Appear in Member Recognition","الظهور في تقدير الأعضاء")}
              </Label>
            </div>
            <p className="text-[11px] text-[#7c8689]">{t("Optional. Only your display name, points and badges appear when you opt in.","اختياري. يظهر اسم العرض والنقاط والشارات فقط بموافقتك.")}</p>
          </div>
          <Switch
            id="recognition-toggle"
            checked={showPublic}
            disabled={saving}
            onCheckedChange={handleToggle}
          />
        </div>

        {/* List */}
        {isLoading ? <p role="status">{t("Loading recognition…","جارٍ تحميل تقدير الأعضاء…")}</p> : isError ? <div role="alert"><p>{t("Could not load recognition.","تعذر تحميل تقدير الأعضاء.")}</p><button onClick={() => refetch()} className="underline">{t("Try again","حاول مرة أخرى")}</button></div> : enriched.length > 0 ? (
          <div className="space-y-2">
            {enriched.slice(0, 10).map((lc, idx) => {
              const rank = idx + 1;
              const isMe = lc.client_email === userEmail;
              const tierColor = TIER_COLORS[lc.loyalty_level] || "#c4aa8b";
              const displayName = lc.leaderboard_display_name || t("Member","عضو");

              return (
                <div key={lc.id}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    background: isMe ? "rgba(196,170,139,0.08)" : "#f9f8f6",
                    border: isMe ? "1px solid rgba(196,170,139,0.35)" : "1px solid rgba(196,170,139,0.1)"
                  }}>
                  {/* Rank */}
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: rank <= 3 ? "rgba(196,170,139,0.15)" : "rgba(196,170,139,0.06)" }}>
                    {rank === 1
                      ? <Crown className="w-4 h-4" style={{ color: "#e7cb50" }} />
                      : rank <= 3
                        ? <Award className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                        : <span className="text-xs font-bold text-[#7c8689]">#{rank}</span>}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-[#333435] truncate">{displayName}</p>
                      {isMe && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                          style={{ background: "rgba(196,170,139,0.15)", color: "#c4aa8b" }}>{t("YOU","أنت")}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-medium capitalize" style={{ color: tierColor }}>
                        {isRTL ? ({bronze:"برونزي",silver:"فضي",gold:"ذهبي",platinum:"بلاتيني",diamond:"ماسي"}[lc.loyalty_level] || "عضو") : lc.loyalty_level}
                      </span>
                      <span className="text-[10px] text-[#7c8689]">
                        {lc.loyalty_badges?.length || 0} {t("milestones","إنجازات")}
                      </span>
                    </div>
                  </div>

                  {/* Points */}
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold" style={{ color: "#333435" }}>
                      {(lc.loyalty_points || 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-[#7c8689]">{t("pts","نقطة")}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Star className="w-8 h-8 mx-auto mb-2" style={{ color: "rgba(196,170,139,0.3)" }} />
            <p className="text-sm font-medium text-[#333435] mb-1">{t("No members listed yet","لا يوجد أعضاء معروضون بعد")}</p>
            <p className="text-xs text-[#7c8689]">{t("Enable the toggle above to appear here.","يمكنك اختيار الظهور باستخدام المفتاح أعلاه.")}</p>
          </div>
        )}
      </div>
    </div>
  );
}