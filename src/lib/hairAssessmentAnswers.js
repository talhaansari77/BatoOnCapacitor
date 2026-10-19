export const QUESTIONS = [
  {
    id: "concern",
    key: "main_concern",
    questionEn: "What are you noticing most?",
    questionAr: "ما أكثر تغير تلاحظه؟",
    optionsEn: ["Hair shedding", "Thinning / lower density", "Hairline / temples", "Crown / top scalp", "Scalp irritation", "Not sure"],
    optionsAr: ["تساقط الشعر", "ترقق الشعر / انخفاض الكثافة", "خط الشعر / الصدغان", "تاج الرأس / أعلى فروة الرأس", "تهيج فروة الرأس", "غير متأكد"],
  },
  {
    id: "timeline",
    key: "timeline",
    questionEn: "When did you first notice it?",
    questionAr: "متى لاحظت هذا التغير؟",
    optionsEn: ["Recently", "1–3 months ago", "3–6 months ago", "More than 6 months ago", "It comes and goes"],
    optionsAr: ["مؤخراً", "منذ 1-3 أشهر", "منذ 3-6 أشهر", "أكثر من 6 أشهر", "يظهر ويختفي"],
  },
  {
    id: "pattern",
    key: "pattern",
    questionEn: "How would you describe the pattern?",
    questionAr: "كيف تصف النمط؟",
    optionsEn: ["Sudden shedding", "Gradual thinning", "Patchy areas", "Hairline changes", "Diffuse thinning", "Not sure"],
    optionsAr: ["تساقط مفاجئ", "ترقق تدريجي", "فراغات في مناطق متفرقة", "تغيرات في خط الشعر", "ترقق منتشر", "غير متأكد"],
  },
  {
    id: "treatments",
    key: "previous_treatments",
    questionEn: "Have you tried anything before?",
    questionAr: "هل جربت أي شيء من قبل؟",
    optionsEn: ["No", "PRP / clinic treatment", "Supplements", "Minoxidil / topical treatment", "Hair transplant", "Other"],
    optionsAr: ["لا", "البلازما / علاج في العيادة", "مكملات", "مينوكسيديل / علاج موضعي", "زراعة شعر", "غير ذلك"],
    multiple: false,
  },
  {
    id: "factors",
    key: "internal_factors",
    questionEn: "Have you recently experienced any of these?",
    questionAr: "هل عانيت مؤخراً من أي من هذه؟",
    optionsEn: ["Stress / poor sleep", "Weight change / diet change", "Pregnancy / postpartum", "Hormonal concerns", "Low iron / vitamin D / thyroid history", "None / not sure"],
    optionsAr: ["التوتر / قلة النوم", "تغير الوزن / تغير النظام الغذائي", "الحمل / ما بعد الولادة", "مشكلات هرمونية محتملة", "نقص سابق في الحديد أو فيتامين د / مشكلات في الغدة الدرقية", "لا شيء مما سبق / غير متأكد"],
    multiple: true,
  },
  {
    id: "worry",
    key: "biggest_worry",
    questionEn: "What worries you most?",
    questionAr: "ما أكثر ما يقلقك؟",
    optionsEn: ["It keeps getting worse", "I don't know the cause", "I tried things before and they didn't work", "I'm afraid treatment will waste money", "I want a clear plan", "Other"],
    optionsAr: ["المشكلة تزداد", "لا أعرف السبب", "جربت علاجات ولم ألاحظ تحسناً", "أخشى أن أدفع دون نتيجة", "أريد خطة واضحة", "غير ذلك"],
  },
];

export function hairAssessmentAnswer(value, isRTL = false) {
  if (Array.isArray(value)) return value.map(answer => hairAssessmentAnswer(answer, isRTL)).join(isRTL ? "، " : ", ");
  for (const question of QUESTIONS) {
    const index = question.optionsEn.findIndex((answer, i) => answer === value || question.optionsAr[i] === value);
    if (index !== -1) return (isRTL ? question.optionsAr : question.optionsEn)[index];
  }
  return value || "—";
}
