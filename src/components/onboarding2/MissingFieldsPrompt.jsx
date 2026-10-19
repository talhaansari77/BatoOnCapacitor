import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { motion } from "@/components/motion/BatoMotion";
import { base44 } from "@/api/base44Client";
import { CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import { useLocation as useLocationCtx } from "../LocationContext";

const WORRIES = [
  "I'm worried it won't work",
  "I'm worried about the cost",
  "I've been disappointed before",
  "I'm not sure what is right for me",
  "I'm nervous about the procedure itself",
  "Something else",
];

export default function MissingFieldsPrompt({ profile, userEmail, onComplete }) {
  const { isRTL, t } = useLocationCtx();
  const needsGoal = !profile?.desired_result;
  const needsWorry = !profile?.biggest_worry;

  const [show, setShow] = useState(true);
  const [step, setStep] = useState(needsGoal ? "goal" : "worry");
  const [desiredResult, setDesiredResult] = useState(profile?.desired_result || "");
  const [biggestWorry, setBiggestWorry] = useState(profile?.biggest_worry || "");
  const [saving, setSaving] = useState(false);

  if (!show || (!needsGoal && !needsWorry)) return null;

  const handleSave = async () => {
    setSaving(true);
    await base44.entities.BATOProfile.update(profile.id, {
      desired_result: desiredResult,
      biggest_worry: biggestWorry,
      last_updated_at: new Date().toISOString(),
    });
    setSaving(false);
    toast.success("Profile updated");
    setShow(false);
    if (onComplete) onComplete();
  };

  const canSave = (!needsGoal || desiredResult.trim().length > 3) && (!needsWorry || biggestWorry);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-white rounded-2xl border shadow-sm overflow-hidden"
          style={{ borderColor: "rgba(196,170,139,0.25)" }}
        >
          <div className="px-5 pt-5 pb-4" dir={isRTL ? "rtl" : "ltr"}>
            <div className={`flex items-start justify-between mb-1 ${isRTL ? "flex-row-reverse" : ""}`}>
              <p className="text-sm font-semibold text-[#333435]">
                {t("Complete Your BATO Profile", "أكمل ملفك في باتو")}
              </p>
              <button onClick={() => setShow(false)} className="p-1 rounded-lg hover:bg-gray-100 transition-colors ml-2 flex-shrink-0">
                <X className="w-3.5 h-3.5 text-[#7c8689]" />
              </button>
            </div>
            <p className={`text-xs text-[#7c8689] mb-4 leading-relaxed ${isRTL ? "text-right" : ""}`}>
              {t("A couple of personal details help your team understand what matters most to you.", "تساعد بعض التفاصيل الفريق على فهم حالتك وما يهمك.")}
            </p>

            {needsGoal && (
              <div className="mb-4">
                <label className={`text-xs font-medium text-[#333435] block mb-1 ${isRTL ? "text-right" : ""}`}>
                  {t("If this goes perfectly — what would that look like for you?", "ما النتيجة التي تتمنى تحقيقها من العلاج؟")}
                </label>
                <textarea
                  value={desiredResult}
                  onChange={e => setDesiredResult(e.target.value)}
                  placeholder={t('"I want to feel confident again. I want to stop hiding it."', "أريد أن أشعر بالثقة مجدداً، دون الحاجة إلى إخفاء شعري.")}
                  rows={3}
                  dir={isRTL ? "rtl" : "ltr"}
                  className="w-full rounded-xl border px-3.5 py-3 text-sm text-[#333435] placeholder:text-[#b0b8bc] resize-none outline-none"
                  style={{ borderColor: "rgba(196,170,139,0.25)", background: "#f9f8f6", fontSize: "14px" }}
                />
              </div>
            )}

            {needsWorry && (
              <div className="mb-4">
                <label className={`text-xs font-medium text-[#333435] block mb-2 ${isRTL ? "text-right" : ""}`}>
                  {t("Most people come in with a worry. What is yours?", "من الطبيعي أن يكون لديك قلق قبل العلاج. ما أكثر ما يشغلك؟")}
                </label>
                <div className="space-y-1.5">
                  {WORRIES.map(w => (
                    <button
                      key={w}
                      onClick={() => setBiggestWorry(w)}
                      className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border transition-all ${isRTL ? "flex-row-reverse text-right" : "text-left"}`}
                      style={{
                        borderColor: biggestWorry === w ? "#c4aa8b" : "rgba(196,170,139,0.2)",
                        background: biggestWorry === w ? "rgba(196,170,139,0.07)" : "#f9f8f6",
                      }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                        style={{ borderColor: biggestWorry === w ? "#c4aa8b" : "rgba(196,170,139,0.35)", background: biggestWorry === w ? "#c4aa8b" : "transparent" }}>
                        {biggestWorry === w && <div className="w-1 h-1 rounded-full bg-white" />}
                      </div>
                      <span className="text-xs text-[#333435]">{w}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSave}
              disabled={!canSave || saving}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
              style={{ background: canSave ? "#c4aa8b" : "rgba(196,170,139,0.4)", color: "#3a2e1e" }}
            >
              {saving ? t("Saving…", "جارٍ الحفظ…") : t("Save to My Profile", "حفظ في ملفي")}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}