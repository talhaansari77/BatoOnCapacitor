import CustomerLoadState from "@/components/CustomerLoadState";
import CustomerCareHub from "@/components/care/CustomerCareHub";
import CareText from "@/components/CareText";
import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { motion } from "@/components/motion/BatoMotion";
import { Button } from "@/components/ui/button";
import {
  ClipboardList, User, Search, CheckCircle2, ShieldCheck,
  MessageSquare, Sparkles, Layers, Activity, Heart, Star,
  Eye, Droplets, TrendingUp
} from "lucide-react";
import { useLocation } from "../components/LocationContext";
import { useNavigate } from "react-router-dom";

const AESTHETIC_TYPES = [
  "botox_forehead_eyes","botox_underarms","botox_neck","botox_jawline",
  "skin_booster","profhilo","salmon_dna","mesotherapy","filler_dissolve",
  "teosyal_kiss_lips","juvederm_ultra_lips",
];

// ─── Explorer view ─────────────────────────────────────────────────────────────
function AestheticExplore({ isRTL, t }) {
  const navigate = useNavigate();
  const handleStartAssessment = () => navigate("/ClinicAppointments?book=1&type=consultation&department=injections");
  const handleAskTeam = () => navigate("/Messages?channel=advisors&department=injections&context=aesthetic_assessment");

  return (
    <div className="space-y-5">

      {/* ── HERO ── */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="bato-style-hero relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(150deg, #241c12 0%, #2e2418 30%, #3a2e1e 65%, #3d3228 100%)" }}>

        {/* Soft glow layers */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: [
            "radial-gradient(ellipse 65% 55% at 82% 10%, rgba(196,170,139,0.22) 0%, transparent 55%)",
            "radial-gradient(ellipse 40% 50% at 12% 90%, rgba(231,203,80,0.05) 0%, transparent 50%)",
          ].join(", ")
        }} />
        {/* Subtle arc motif */}
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-[0.06]"
          style={{ width: 160, height: 160, borderRadius: "50%", border: "40px solid rgba(196,170,139,1)", transform: "translate(40%, 40%)" }} />
        <div className="absolute right-10 bottom-10 pointer-events-none opacity-[0.04]"
          style={{ width: 100, height: 100, borderRadius: "50%", border: "24px solid rgba(196,170,139,1)", transform: "translate(40%, 40%)" }} />

        <div className="relative z-10 p-5 min-[390px]:p-6 pb-8">
          <div className="flex items-start justify-between mb-5">
            <p className="text-[10px] font-semibold tracking-widest uppercase" style={{ color: "rgba(196,170,139,0.6)" }}>{t("Aesthetic Consultation", "استشارة التجميل")}</p>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.2)" }}>
              <Sparkles className="w-4 h-4" style={{ color: "#c4aa8b" }} />
            </div>
          </div>

          <h2 className="text-white font-bold text-2xl leading-snug mb-2.5">{t("Refinement, not overcorrection.", "تحسين متوازن… دون مبالغة.")}</h2>
          <p className="text-sm leading-relaxed mb-7" style={{ color: "rgba(238,235,230,0.55)" }}>
            {t("BATO starts by understanding your facial balance, goals, previous treatments, and natural-look preferences before recommending Botox, fillers, boosters, or other aesthetic care.", "نبدأ في باتو بفهم ملامحك وأهدافك وتجاربك السابقة والنتيجة الطبيعية التي تريدها، قبل اقتراح البوتوكس أو الفيلر أو معززات البشرة أو أي علاج آخر.")}
          </p>

          <div className="space-y-2.5 mb-7">
            <Button onClick={handleStartAssessment} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold border-0"
              style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              {t("Request an Aesthetic Consultation", "اطلب استشارة تجميلية")}
            </Button>
            <Button onClick={handleAskTeam} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold"
              style={{ background: "transparent", color: "#c4aa8b", border: "1px solid rgba(196,170,139,0.35)" }}>
              {t("Connect with an advisor", "تواصل مع مرشد")}
            </Button>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: "rgba(238,235,230,0.38)" }}>
            <span>{t("Choose a preferred visit time or ask a question.", "اختر الوقت المفضل لزيارتك أو اطرح سؤالك.")}</span>
            <span>{t("Appointment requests need clinic confirmation.", "تحتاج طلبات المواعيد إلى تأكيد العيادة.")}</span>
          </div>
        </div>
      </motion.div>

      {/* ── CORE POSITIONING ── */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="bato-style-surface relative overflow-hidden rounded-2xl p-5"
        style={{ background: "#faf9f7", border: "1px solid rgba(196,170,139,0.2)", boxShadow: "0 2px 12px rgba(58,46,30,0.05)" }}>
        <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,170,139,0.1) 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-2.5">{t("The BATO philosophy", "فلسفة باتو")}</p>
        <p className="text-sm font-semibold text-[#333435] mb-1.5 leading-snug">
          {t("The best aesthetic work should look like you — just more rested, balanced, and refined.", "العناية التجميلية الجيدة تحافظ على مظهرك الطبيعي وتمنحه مزيداً من النضارة والتوازن.")}
        </p>
        <p className="text-sm text-[#7c8689] leading-relaxed">
          {t("Aesthetic care should not start with \"what injection do you want?\" It should start with your goal, facial balance, history, and what you want to avoid.", "نبدأ بهدفك وملامحك وتجاربك السابقة وما تريد تجنبه، قبل اختيار نوع الحقن.")}
        </p>
      </motion.div>

      {/* ── DEEP DISCOVERY — labeled progressive disclosure; the CTA stays early ── */}
      <details className="rounded-2xl border bg-white overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
        <summary className="cursor-pointer px-5 py-4 text-sm font-semibold text-[#333435]">
          {t("Learn more: how BATO approaches this journey", "اعرف المزيد: نهج باتو في هذه الرحلة")}
        </summary>
        <div className="px-3 pb-4 space-y-5">
      {/* ── WHAT BATO LOOKS AT ── */}
      <section className="space-y-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]">{t("What BATO looks at", "ما الذي يراجعه فريق باتو؟")}</p>
        <div className="grid grid-cols-1 min-[390px]:grid-cols-2 gap-3">
          {[
            { labelEn: "Your Goal", labelAr: "هدفك", descEn: "What you want to improve: freshness, balance, lines, volume, hydration, or skin quality.", descAr: "ما ترغب في تحسينه: النضارة أو توازن الملامح أو الخطوط أو الامتلاء أو الترطيب أو جودة البشرة.", Icon: Star },
            { labelEn: "Natural-Look Preference", labelAr: "النتيجة الطبيعية أولًا", descEn: "What you want to avoid: looking overdone, puffy, frozen, or unnatural.", descAr: "ما ترغب في تجنبه: المبالغة أو الانتفاخ أو فقدان حركة الوجه أو المظهر غير الطبيعي.", Icon: Eye },
            { labelEn: "Facial Balance", labelAr: "التوازن قبل الحجم", descEn: "The team considers proportion, symmetry, movement, and overall harmony.", descAr: "يراعي الفريق النسب والتماثل والحركة والانسجام العام.", Icon: Layers },
            { labelEn: "Previous Treatments", labelAr: "التجارب السابقة", descEn: "Botox, fillers, boosters, threads, reactions, timing, and past results.", descAr: "البوتوكس والفيلر ومعززات البشرة والخيوط، وأي تفاعلات سابقة، ومواعيد العلاج ونتائجه.", Icon: ClipboardList },
            { labelEn: "Safety Context", labelAr: "الصحة وسلامة العلاج", descEn: "Medical history, pregnancy, medications, allergies, bruising tendency, or previous reactions.", descAr: "التاريخ الصحي والحمل والأدوية والحساسية وسهولة ظهور الكدمات وأي تفاعلات سابقة.", Icon: ShieldCheck },
            { labelEn: "Treatment Fit", labelAr: "ملاءمة الإجراء", descEn: "Whether Botox, fillers, boosters, Profhilo, or another option fits the goal.", descAr: "هل يناسب هدفك البوتوكس أو الفيلر أو معززات البشرة أو بروفايلو أو خيار آخر؟", Icon: CheckCircle2 },
          ].map((item, idx) => (
            <motion.div key={item.labelEn} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.04 }}
              className="bato-style-surface p-4 rounded-2xl border"
              style={{ background: "white", borderColor: "rgba(196,170,139,0.15)", boxShadow: "0 1px 6px rgba(58,46,30,0.04)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mb-2.5"
                style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.15)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <p className="text-sm font-semibold text-[#333435] mb-1 leading-tight"><CareText value={isRTL ? item.labelAr : item.labelEn} /></p>
              <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={isRTL ? item.descAr : item.descEn} /></p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── YOUR REFINEMENT MAP ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="bato-style-surface rounded-2xl overflow-hidden border"
        style={{ background: "#faf9f7", borderColor: "rgba(196,170,139,0.18)", boxShadow: "0 2px 12px rgba(58,46,30,0.05)" }}>
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-1.5">{t("Your Refinement Map", "فهم أهدافك التجميلية")}</p>
          <p className="text-sm font-semibold text-[#333435] mb-0.5">{t("BATO looks at your goals from multiple angles", "نراجع أهدافك من جوانب مختلفة")}</p>
          <p className="text-sm text-[#7c8689] mb-4 leading-relaxed">{t("Before recommending aesthetic care, your team reviews all relevant dimensions.", "يراجع الفريق الجوانب المرتبطة بحالتك قبل اقتراح العلاج.")}</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { labelEn: "Expression", labelAr: "تعابير الوجه", descEn: "Lines, movement, and where softening may be appropriate.", descAr: "خطوط الوجه وحركته والمناطق التي قد يناسبها تخفيف الخطوط.", Icon: Activity },
              { labelEn: "Volume", labelAr: "الحجم", descEn: "Balance, contour, support, and areas that should not look heavy.", descAr: "الامتلاء وتحديد الملامح ودعمها، مع تجنب المظهر المبالغ فيه.", Icon: Layers },
              { labelEn: "Skin Quality", labelAr: "جودة البشرة", descEn: "Hydration, glow, texture, firmness, and collagen-supporting treatments.", descAr: "الترطيب والإشراقة والملمس والشد والعلاجات الداعمة للكولاجين.", Icon: Sparkles },
              { labelEn: "Facial Balance", labelAr: "توازن الملامح", descEn: "Harmony between features instead of treating isolated areas.", descAr: "انسجام الملامح معاً، بدلاً من النظر إلى كل منطقة وحدها.", Icon: Eye },
              { labelEn: "Safety", labelAr: "السلامة", descEn: "History, medications, allergies, previous reactions, and timing.", descAr: "التاريخ الصحي والأدوية والحساسية والتفاعلات السابقة ومواعيد العلاج.", Icon: ShieldCheck },
            ].map((item) => (
              <div key={item.labelEn} className="bato-style-surface flex gap-2.5 items-start p-3 rounded-xl"
                style={{ background: "white", border: "1px solid rgba(196,170,139,0.1)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(196,170,139,0.08)" }}>
                  <item.Icon className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#333435] mb-0.5"><CareText value={isRTL ? item.labelAr : item.labelEn} /></p>
                  <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={isRTL ? item.descAr : item.descEn} /></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── WHY ASSESSMENT COMES FIRST ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
        className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(135deg, #faf9f7 0%, #f4f1ec 100%)", border: "1px solid rgba(196,170,139,0.22)", boxShadow: "0 2px 16px rgba(58,46,30,0.06)" }}>
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,170,139,0.11) 0%, transparent 70%)", transform: "translate(35%, -35%)" }} />
        <div className="relative z-10 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-2.5">{t("Why assessment comes first", "لماذا يبدأ الأمر بالتقييم")}</p>
          <p className="text-base font-semibold text-[#333435] leading-snug mb-1.5">
            {t("The same treatment can create very different results.", "نفس الإجراء قد يُعطي نتائج مختلفة تمامًا من شخص لآخر.")}
          </p>
          <p className="text-sm text-[#7c8689] leading-relaxed mb-4">
            {t("That's why BATO starts with your goal, face, history, and safety context before recommending aesthetic care.", "لذلك تبدأ باتو بهدفك وملامحك وتاريخك وسياق السلامة قبل التوصية بأي عناية تجميلية.")}
          </p>
          <div className="flex flex-wrap gap-2">
            {(isRTL
              ? ["الهدف", "التوازن", "الحركة", "تاريخ الحالة", "السلامة", "الخطوة التالية"]
              : ["Goal", "Balance", "Movement", "History", "Safety", "Next step"]
            ).map((chip) => (
              <div key={chip} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.22)" }}>
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#c4aa8b" }} />
                <span className="text-xs font-medium" style={{ color: "#3a2e1e" }}><CareText value={chip} /></span>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ── HOW IT WORKS ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
        className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]">{t("How it works", "كيف نبدأ؟")}</p>
        <div className="bato-style-surface rounded-2xl border overflow-hidden"
          style={{ background: "#faf9f7", borderColor: "rgba(196,170,139,0.15)", boxShadow: "0 1px 8px rgba(58,46,30,0.04)" }}>
          {[
            { step: "1", titleEn: "Start Aesthetic Consultation", titleAr: "ابدأ الاستشارة التجميلي", descEn: "Tell us what you want to improve and what you want to avoid.", descAr: "أخبرنا بما تريد تحسينه وما تريد تجنبه.", Icon: ClipboardList },
            { step: "2", titleEn: "Share Your History", titleAr: "شارك تجاربك السابقة", descEn: "Add previous Botox, fillers, boosters, reactions, timing, medications, and preferences.", descAr: "أخبرنا بعلاجات البوتوكس والفيلر ومعززات البشرة السابقة، ومواعيدها وأي تفاعلات حدثت، وأدويتك وتفضيلاتك.", Icon: User },
            { step: "3", titleEn: "BATO Reviews the Goal", titleAr: "يراجع فريق باتو هدفك", descEn: "Your team considers facial balance, natural-look preferences, and treatment fit.", descAr: "يراعي الفريق توازن ملامحك والنتيجة الطبيعية التي تفضلها ومدى ملاءمة الإجراء.", Icon: Search },
            { step: "4", titleEn: "Get Your Next Step", titleAr: "حدد خطوتك التالية", descEn: "BATO guides you toward the right action: aesthetic consultation, Botox, filler, skin booster, Profhilo, Salmon DNA, follow-up, or no treatment if not suitable.", descAr: "يساعدك فريق باتو على اختيار الخطوة المناسبة: استشارة أو بوتوكس أو فيلر أو معززات البشرة أو بروفايلو أو حقن الحمض النووي للسلمون أو متابعة. وقد يكون الأنسب عدم العلاج.", Icon: CheckCircle2 },
          ].map((item, idx, arr) => (
            <div key={item.step} className="flex gap-3 px-4 py-3.5 items-start"
              style={{ borderBottom: idx < arr.length - 1 ? "1px solid rgba(196,170,139,0.1)" : "none" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: "rgba(196,170,139,0.1)", border: "1px solid rgba(196,170,139,0.12)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-bold" style={{ color: "rgba(196,170,139,0.7)" }}><CareText value={item.step} /></span>
                  <p className="text-sm font-semibold text-[#333435]"><CareText value={isRTL ? item.titleAr : item.titleEn} /></p>
                </div>
                <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={isRTL ? item.descAr : item.descEn} /></p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ── THE BATO AESTHETIC APPROACH ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="space-y-2">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689]">{t("The BATO aesthetic approach", "نهج باتو في التجميل")}</p>
        <div className="grid grid-cols-1 gap-2">
          {[
            { titleEn: "Natural first", titleAr: "النتيجة الطبيعية أولًا", descEn: "The goal is refinement, not obvious overcorrection.", descAr: "الهدف هو التحسين المتوازن، وليس المبالغة الظاهرة.", Icon: Sparkles },
            { titleEn: "Balance before volume", titleAr: "التوازن قبل الحجم", descEn: "BATO considers the whole face, not just isolated areas.", descAr: "نراعي الوجه كاملاً، ولا ننظر إلى كل منطقة وحدها.", Icon: Layers },
            { titleEn: "Safety-aware care", titleAr: "عناية تراعي السلامة", descEn: "Your history, allergies, medications, bruising tendency, and previous reactions matter.", descAr: "تاريخك الصحي وحساسيتك وأدويتك وسهولة ظهور الكدمات وأي تفاعلات سابقة؛ كلها تؤخذ في الاعتبار.", Icon: ShieldCheck },
            { titleEn: "Skin quality matters", titleAr: "جودة البشرة مهمة", descEn: "Sometimes the best first step is hydration, texture, glow, or collagen support — not filler.", descAr: "قد تكون الخطوة الأولى تحسين الترطيب أو الملمس أو النضارة أو دعم الكولاجين، قبل التفكير في الفيلر.", Icon: Droplets },
            { titleEn: "Doctor-guided decisions", titleAr: "قرارات بإشراف الطبيب", descEn: "Aesthetic recommendations should be reviewed by the right BATO professional.", descAr: "يراجع الأخصائي المناسب في باتو التوصيات التجميلية.", Icon: User },
          ].map((item, idx) => (
            <motion.div key={item.titleEn} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.04 }}
              className="bato-style-surface flex gap-3 items-start p-4 rounded-xl border"
              style={{ background: "white", borderColor: "rgba(196,170,139,0.13)", boxShadow: "0 1px 4px rgba(58,46,30,0.03)" }}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(196,170,139,0.09)", border: "1px solid rgba(196,170,139,0.13)" }}>
                <item.Icon className="w-4 h-4" style={{ color: "#c4aa8b" }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#333435] mb-0.5"><CareText value={isRTL ? item.titleAr : item.titleEn} /></p>
                <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={isRTL ? item.descAr : item.descEn} /></p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* ── TREATMENT OPTIONS TEASER ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34 }}
        className="bato-style-surface rounded-2xl border overflow-hidden"
        style={{ background: "#faf9f7", borderColor: "rgba(196,170,139,0.18)", boxShadow: "0 2px 12px rgba(58,46,30,0.05)" }}>
        <div className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-1.5">{t("Treatment options", "خيارات العلاج")}</p>
          <p className="text-sm font-semibold text-[#333435] mb-3">{t("Aesthetic care may include", "من خيارات التجميل المتاحة")}</p>
          <div className="space-y-2">
            {[
              { label: "Botox", descEn: "For expression lines and movement softening when appropriate.", descAr: "لتخفيف خطوط التعبير مع مراعاة حركة الوجه عند الحاجة.", Icon: Activity },
              { label: t("Fillers", "الفيلر"), descEn: "For volume, contour, and balance when suitable.", descAr: "لزيادة الامتلاء وتحديد الملامح وتحسين توازنها عند الحاجة.", Icon: Layers },
              { label: t("Skin Boosters", "معززات البشرة"), descEn: "For hydration, glow, and skin quality support.", descAr: "للترطيب والإشراقة ودعم جودة البشرة.", Icon: Droplets },
              { label: "Profhilo", descEn: "For skin firmness and hydration support when suitable.", descAr: "لدعم شد البشرة وترطيبها عندما يكون مناسباً للحالة.", Icon: TrendingUp },
              { label: "Salmon DNA / PDRN", labelAr: "الحمض النووي للسلمون (PDRN)", descEn: "For skin recovery, quality, and regenerative support when appropriate.", descAr: "لدعم تعافي البشرة وجودتها وتجددها عندما يكون مناسباً للحالة.", Icon: Heart },
              { label: t("Follow-Up Review", "مراجعة المتابعة"), descEn: "For clients who need review before deciding.", descAr: "للعملاء الذين يحتاجون إلى مراجعة قبل اتخاذ القرار.", Icon: ClipboardList },
            ].map((item) => (
              <div key={item.label} className="flex gap-3 items-start p-3 rounded-xl bg-white border"
                style={{ borderColor: "rgba(196,170,139,0.1)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(196,170,139,0.08)" }}>
                  <item.Icon className="w-3.5 h-3.5" style={{ color: "#c4aa8b" }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#333435] mb-0.5"><CareText value={isRTL && item.labelAr ? item.labelAr : item.label} /></p>
                  <p className="text-sm text-[#7c8689] leading-relaxed"><CareText value={isRTL ? item.descAr : item.descEn} /></p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-[#7c8689] italic mt-3 leading-relaxed">
            {t("This is educational only. Treatment fit is determined after assessment and team review.", "هذه معلومات تثقيفية فقط. تُحدَّد ملاءمة العلاج بعد التقييم ومراجعة الفريق.")}
          </p>
        </div>
      </motion.section>

      {/* ── NATURAL-LOOK TRUST SECTION ── */}
      <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.37 }}
        className="relative overflow-hidden rounded-2xl"
        style={{ background: "linear-gradient(135deg, #faf9f7 0%, #f4f1ec 100%)", border: "1px solid rgba(196,170,139,0.2)", boxShadow: "0 2px 12px rgba(58,46,30,0.05)" }}>
        <div className="absolute top-0 left-0 w-20 h-20 rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(196,170,139,0.08) 0%, transparent 70%)", transform: "translate(-30%, -30%)" }} />
        <div className="relative z-10 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-2">{t("Natural-look reassurance", "نتيجة تحافظ على مظهرك الطبيعي")}</p>
          <p className="text-sm font-semibold text-[#333435] mb-2 leading-snug">{t("Worried about looking overdone?", "هل تخشى نتيجة تبدو مبالغاً فيها؟")}</p>
          <p className="text-sm text-[#7c8689] leading-relaxed mb-4">
            {t("Many clients want aesthetic care that looks natural. BATO starts by understanding what you want to improve — and what you want to avoid — before recommending anything.", "يرغب كثير من العملاء في نتيجة طبيعية. نفهم أولاً ما تريد تحسينه وما تريد تجنبه، ثم نقترح الخيارات المناسبة.")}
          </p>
          <div className="space-y-2">
            {(isRTL ? [
              "تجنب الإفراط في التعديل",
              "احترام توازن الملامح",
              "اختيار تدخل بسيط عند الحاجة",
              "مراجعة العلاجات السابقة",
              "إعطاء الأولوية للسلامة",
            ] : [
              "Avoid overcorrection",
              "Respect facial balance",
              "Start conservatively when appropriate",
              "Review previous treatments",
              "Prioritize safety",
            ]).map((point) => (
              <div key={point} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#c4aa8b" }} />
                <p className="text-xs text-[#333435]"><CareText value={point} /></p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

        </div>
      </details>

      {/* ── BOTTOM CTA ── */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bato-style-hero bato-closing-invitation relative overflow-hidden rounded-3xl"
        style={{ background: "linear-gradient(150deg, #241c12 0%, #2e2418 30%, #3a2e1e 65%, #3d3228 100%)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(ellipse 55% 60% at 88% 15%, rgba(196,170,139,0.18) 0%, transparent 55%)",
        }} />
        <div className="relative z-10 p-5 min-[390px]:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: "rgba(196,170,139,0.6)" }}>{t("Ready when you are", "ابدأ عندما تكون مستعداً")}</p>
          <p className="text-white font-bold text-xl leading-snug mb-2">{t("Ready to explore aesthetic care?", "هل ترغب في معرفة خيارات التجميل؟")}</p>
          <p className="text-sm mb-7 leading-relaxed" style={{ color: "rgba(238,235,230,0.48)" }}>
            {t("Request a consultation or connect with an advisor to understand your options.", "اطلب استشارة أو تواصل مع مرشد لفهم خياراتك.")}
          </p>
          <div className="space-y-2.5">
            <Button onClick={handleStartAssessment} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold border-0"
              style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
              {t("Request an Aesthetic Consultation", "اطلب استشارة تجميلية")}
            </Button>
            <Button onClick={handleAskTeam} className="w-full rounded-xl min-h-11 h-auto py-3 whitespace-normal text-sm font-semibold"
              style={{ background: "transparent", color: "#c4aa8b", border: "1px solid rgba(196,170,139,0.3)" }}>
              {t("Connect with an advisor", "تواصل مع مرشد")}
            </Button>
          </div>
        </div>
      </motion.div>

    </div>
  );
}

// ─── Active dossier placeholder (minimal — active clients have real data via SkinJourney) ──
function AestheticActive({ packages }) {
  const navigate = useNavigate();
  const { t } = useLocation();
  const STATUS_LABELS = {
    active: t("Active", "نشط"),
    completed: t("Completed", "مكتمل"),
    expired: t("Expired", "منتهي"),
    cancelled: t("Cancelled", "ملغى"),
  };
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl p-5 border border-[#eeebe6] shadow-sm">
        <p className="text-sm font-semibold text-[#333435] mb-1">{t("Your Aesthetic Care", "عنايتك التجميلية")}</p>
        <p className="text-xs text-[#7c8689] mb-4">{t("Your aesthetic treatment history is managed by the BATO team.", "يتابع فريق باتو سجل علاجاتك التجميلية.")}</p>
        <div className="space-y-2">
          {packages.map(pkg => (
            <div key={pkg.id} className="bato-style-surface flex items-center justify-between p-3 rounded-xl" style={{ background: "#f9f8f6" }}>
              <p className="text-sm font-medium text-[#333435]"><CareText value={pkg.package_name} /></p>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(196,170,139,0.15)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.3)" }}>
                <CareText value={STATUS_LABELS[pkg.status] || pkg.status} />
              </span>
            </div>
          ))}
        </div>
        <Button onClick={() => navigate("/Messages?channel=aesthetic_team&context=aesthetic_review")}
          className="w-full mt-4 rounded-xl min-h-11 h-auto py-3 text-sm font-semibold border-0"
          style={{ background: "#c4aa8b", color: "#3a2e1e" }}>
          <MessageSquare className="w-4 h-4 mr-2" />{t("Contact your specialist", "تواصل مع أخصائيك")}
        </Button>
      </div>
    </div>
  );
}

// ─── Page entry ────────────────────────────────────────────────────────────────
export default function AestheticCare() {
  const accountQuery = useQuery({
    queryKey: ["AestheticCareAccount"],
    queryFn: () => base44.auth.me(),
    retry: 1, gcTime: 0, refetchOnMount: "always",
  });
  const user = !accountQuery.isFetching ? accountQuery.data : null;
  const { isRTL, t } = useLocation();



  const { data: packages = [], isPending: packagesPending, isError: packagesError } = useQuery({
    queryKey: ["packages", user?.email, "AestheticCare"],
    queryFn: () => base44.entities.Package.filter({ client_email: user.email }, "-created_date"),
    enabled: !!user,
  });

  const aestheticPackages = packages.filter(p => p.department === "injections" || AESTHETIC_TYPES.includes(p.package_type));
  const hasActive = aestheticPackages.some(p => p.status === "active");
  if (accountQuery.isPending || accountQuery.isFetching || (!!user && packagesPending)) return <div role="status" className="p-6 bg-[#eeebe6] text-[#7c8689]">{t("Loading your care…", "جارٍ تحميل ملف الرعاية…")}</div>;
  if (accountQuery.isError || packagesError) return <CustomerLoadState error/>;

  return (
    <div className={`min-h-screen pb-10 ${isRTL ? "text-right" : "text-left"}`} style={{ background: "#eeebe6" }} dir={isRTL ? "rtl" : "ltr"}>
      <div className="max-w-lg mx-auto px-4 py-5 space-y-4">
        <div className="bato-page-heading grid grid-cols-1 gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#333435]"><CareText value={hasActive ? t("Aesthetic Care", "العناية التجميلية") : t("Aesthetic Consultation", "استشارة التجميل")} /></h1>
            <p className="text-xs text-[#7c8689]">
              <CareText value={hasActive ? t("Your aesthetic care history and team notes", "سجل علاجاتك التجميلية وملاحظات الفريق") : t("Understand your goals before choosing treatment.", "افهم أهدافك قبل اختيار الإجراء المناسب.")} />
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full mt-0.5 flex-shrink-0"
            style={hasActive
              ? { background: "rgba(196,170,139,0.15)", color: "#3a2e1e", border: "1px solid rgba(196,170,139,0.35)" }
              : { background: "#f9f8f6", color: "#7c8689", border: "1px solid rgba(124,134,137,0.2)" }}>
            <CareText value={hasActive ? t("Active", "نشط") : aestheticPackages.length ? t("Care history", "سجل الرعاية") : t("First step", "الخطوة الأولى")} />
          </span>
        </div>
        <CustomerCareHub user={user} department="injections" journeyPage />
        {aestheticPackages.length > 0 ? <AestheticActive packages={aestheticPackages} /> : <AestheticExplore isRTL={isRTL} t={t} />}
      </div>
    </div>
  );
}