import { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { computeReadinessItems, computeReadinessStatus } from "./readinessUtils";
import { isFuture, differenceInHours } from "date-fns";

/**
 * Silent component — runs notification logic when mounted.
 * Place once per session on the Dashboard for booked clients.
 */
export default function ReadinessNotificationEngine({ profile, appointment }) {
  useEffect(() => {
    if (!profile || !appointment) return;
    run();
  }, [profile?.id, appointment?.id]);

  const run = async () => {
    const sessionKey = `readiness_notified_${profile.id}_${appointment.id}`;
    if (sessionStorage.getItem(sessionKey)) return; // don't re-trigger in same session
    sessionStorage.setItem(sessionKey, "1");

    const items = computeReadinessItems(profile, appointment);
    const status = computeReadinessStatus(items, appointment);
    const hoursUntil = differenceInHours(new Date(appointment.appointment_date), new Date());
    const isWithin24h = hoursUntil > 0 && hoursUntil <= 24;

    const healthItem = items.find(i => i.key === "health_safety");
    const hasSafetyFlag = healthItem?.hasSafetyFlag;
    const hasPhotos = (profile.uploaded_photos || []).length > 0;
    const hasDocs = (profile.uploaded_documents || []).length > 0;
    const hasQuestions = (profile.client_questions || []).length > 0;

    const tasks = [];

    if (isWithin24h && status !== "ready") {
      tasks.push({
        title: "⚠️ Client readiness incomplete — visit in <24h",
        message: `${profile.client_email} has an appointment in ${hoursUntil} hour(s) and their readiness is: ${status}. Missing: ${items.filter(i => i.required && !i.complete).map(i => i.label).join(", ")}.`,
        priority: "urgent",
      });
    }

    if (!healthItem?.complete) {
      tasks.push({
        title: "🩺 Health & Safety missing",
        message: `${profile.client_email} has not completed Health & Safety information. Contact client before their visit.`,
        priority: "high",
      });
    }

    if (hasSafetyFlag) {
      tasks.push({
        title: "🚨 Safety flag detected",
        message: `${profile.client_email} has flagged allergies, medications, or medical conditions. Review before appointment.`,
        priority: "high",
      });
    }

    if (hasPhotos) {
      tasks.push({
        title: "📸 Photos uploaded — review before consultation",
        message: `${profile.client_email} uploaded ${profile.uploaded_photos.length} photo(s). Review before their visit.`,
        priority: "normal",
      });
    }

    if (hasDocs) {
      tasks.push({
        title: "📄 Lab results uploaded — review before consultation",
        message: `${profile.client_email} uploaded ${profile.uploaded_documents.length} document(s). Review before their visit.`,
        priority: "normal",
      });
    }

    if (hasQuestions) {
      tasks.push({
        title: "❓ Client questions added",
        message: `${profile.client_email} added ${profile.client_questions.length} question(s) for their consultation: "${profile.client_questions[0]}"`,
        priority: "normal",
      });
    }

    for (const task of tasks) {
      await base44.entities.Notification.create({
        client_email: "admin@batoclinic.com",
        type: "general",
        title: task.title,
        message: task.message,
        priority: task.priority,
      });
    }
  };

  return null;
}