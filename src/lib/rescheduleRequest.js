// Localize the request wrapper; preserve the customer's own reason verbatim.
export function rescheduleRequestContent({isRTL, appointmentId, branch, currentAppointment, service, preferredDate, timeRange, reason}) {
  const range = {
    "": isRTL ? "أي وقت" : "Any time",
    morning: isRTL ? "الصباح (٩ ص – ١٢ ظهراً)" : "Morning (9am – 12pm)",
    afternoon: isRTL ? "بعد الظهر (١٢ ظهراً – ٤ م)" : "Afternoon (12pm – 4pm)",
    late_afternoon: isRTL ? "المساء (٤ م – ٧ م)" : "Late Afternoon (4pm – 7pm)"
  }[timeRange] || (isRTL ? "غير محدد" : "Not specified");
  return isRTL
    ? `أرغب في طلب تغيير موعدي.\n\nمرجع الموعد: ${appointmentId}\nالفرع: ${branch || "غير مسجل"}\nالموعد الحالي: ${currentAppointment}\nالخدمة: ${service || "موعد"}\n\nالتاريخ المفضل الجديد: ${preferredDate}\nالوقت المفضل: ${range}\nسبب التغيير: ${reason.trim()}`
    : `I would like to request a reschedule for my appointment.\n\nAppointment reference: ${appointmentId}\nBranch: ${branch || "Not recorded"}\nCurrent appointment: ${currentAppointment}\nService: ${service || "appointment"}\n\nPreferred new date: ${preferredDate}\nPreferred time range: ${range}\nReason: ${reason.trim()}`;
}
