import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "../LocationContext";

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b" style={{ borderColor: "rgba(196,170,139,0.12)" }}>
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 py-3 text-left">
        <p className="text-sm font-medium text-[#333435]">{q}</p>
        {open ? <ChevronUp className="w-4 h-4 text-[#7c8689] flex-shrink-0" />
               : <ChevronDown className="w-4 h-4 text-[#7c8689] flex-shrink-0" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="a" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }} className="overflow-hidden">
            <p className="text-sm text-[#7c8689] leading-relaxed pb-3">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function HairFAQ() {
  const { t } = useLocation();

  const FAQS = [
    {
      q: t("When will I see visible progress?", "متى سأرى تقدمًا ظاهرًا؟"),
      a: t("Hair progress varies by person. It is typically tracked across multiple sessions through photos and scalp response. The team will advise you based on your individual case.", "يختلف تقدم العلاج من شخص لآخر. نتابعه خلال الجلسات من خلال الصور واستجابة فروة الرأس. سيرشدك الفريق بحسب حالتك."),
    },
    {
      q: t("Is shedding normal during treatment?", "هل التساقط طبيعي خلال العلاج؟"),
      a: t("Temporary changes in shedding can happen during a hair journey. Your team will help you understand what is normal for your specific case and stage.", "قد يتغير معدل التساقط مؤقتاً أثناء العلاج. يساعدك الفريق على معرفة ما هو متوقع في حالتك ومرحلتك الحالية."),
    },
    {
      q: t("What if I miss a session?", "ماذا يحدث إذا فاتتني جلسة؟"),
      a: t("Try to reschedule as soon as possible. Consistency is important for best results. The team can advise on how to adjust if sessions are delayed.", "حاول إعادة حجز الجلسة في أقرب وقت. الانتظام مهم لنتائج العلاج، ويمكن للفريق تعديل الجدول إذا تأخرت."),
    },
    {
      q: t("Can I wash my hair after treatment?", "هل يمكنني غسل شعري بعد العلاج؟"),
      a: t("Follow the specific instructions your specialist gives you after each session. Timing and method may vary depending on the treatment performed.", "اتبع تعليمات أخصائيك بعد كل جلسة؛ فقد يختلف موعد غسل الشعر وطريقته بحسب العلاج."),
    },
    {
      q: t("Can I exercise after a session?", "هل يمكنني ممارسة الرياضة بعد الجلسة؟"),
      a: t("Generally, intense exercise and sweating may be advised against immediately after some treatments. Your specialist will let you know after each session.", "قد يُنصح بتجنب التمارين الشاقة والتعرق مباشرة بعد بعض العلاجات. سيعطيك أخصائيك التعليمات بعد الجلسة."),
    },
    {
      q: t("What products should I use?", "ما المنتجات التي يجب أن أستخدمها؟"),
      a: t("Use only BATO-approved or team-prescribed products. Do not introduce new products without checking with your specialist first.", "استخدم المنتجات التي يعتمدها باتو أو يوصي بها الفريق. اسأل أخصائيك قبل إضافة منتج جديد."),
    },
    {
      q: t("Do I need PRP?", "هل أحتاج إلى علاج البلازما؟"),
      a: t("PRP is only added when the team believes it would add value to your specific case. It is not automatically part of every programme.", "يُضاف علاج البلازما عندما يرى الفريق أنه مناسب لحالتك. وليس جزءاً أساسياً من كل برنامج."),
    },
    {
      q: t("Do I need blood tests?", "هل أحتاج تحاليل دم؟"),
      a: t("Internal panels may be reviewed if the team sees a relevant connection to your hair case. They are not required for every client.", "قد يطلب الفريق تحاليل إذا كانت مرتبطة بحالة شعرك. لا يحتاج إليها كل عميل."),
    },
    {
      q: t("What happens after Session 6?", "ماذا يحدث بعد الجلسة 6؟"),
      a: t("After your core sessions, the team reviews your response and decides the next path — which may include maintenance, renewal, review-only, or additional support.", "بعد الجلسات الأساسية، يراجع الفريق استجابتك ويحدد الخطوة التالية: الحفاظ على النتائج، أو تجديد البرنامج، أو المتابعة، أو دعم إضافي."),
    },
    {
      q: t("When should I contact your specialist?", "متى يجب أن أتواصل مع أخصائيك؟"),
      a: t("Reach out if you experience strong irritation, unusual pain, sudden heavy shedding, prolonged redness, or are unsure about any aftercare instruction.", "تواصل إذا شعرت بتهيج شديد أو ألم غير عادي أو تساقط مفاجئ وغزير أو احمرار مستمر، أو إذا كنت غير متأكد من أي تعليمات للرعاية اللاحقة."),
    },
  ];

  return (
    <div>
      {FAQS.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
    </div>
  );
}