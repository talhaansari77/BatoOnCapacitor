import CustomerLoadState from "@/components/CustomerLoadState";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { isFuture } from "date-fns";
import PreVisitReadinessDetail from "./PreVisitReadinessDetail";
import ReadinessNotificationEngine from "./ReadinessNotificationEngine";
import ReadinessActionCard from "./ReadinessActionCard";
import ReadinessCompactStrip from "./ReadinessCompactStrip";
import {
  computeReadinessItems,
  computeReadinessStatus,
  getAppointmentUrgency,
} from "./readinessUtils";

export default function PreVisitReadinessDashboard({ userEmail }) {
  const [profile, setProfile] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError,setLoadError]=useState(false);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (userEmail) load();
  }, [userEmail]);

  const load = async () => {
    setLoading(true);setLoadError(false);
    try {
    const [profiles, appointments] = await Promise.all([
      base44.entities.BATOProfile.filter({ client_email: userEmail }),
      base44.entities.Appointment.filter({ client_email: userEmail }, "appointment_date"),
    ]);
    const p = profiles[0] || null;
    setProfile(p);
    const upcoming = appointments.filter(a => ["requested", "scheduled", "confirmed"].includes(a.status) && isFuture(new Date(a.appointment_date)));
    setAppointment(upcoming[0] || null);
    } catch (e) {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (updates) => {
    if (!profile) return;
    const updated = await base44.entities.BATOProfile.update(profile.id, {
      ...updates,
      last_updated_at: new Date().toISOString(),
    });
    setProfile(updated);

  };

  if (loadError)return <CustomerLoadState error onRetry={load}/>;
  if (loading || !profile || !appointment) return null;

  // Explorers with no appointment: hide entirely
  if (profile.onboarding_path === "explorer" && !appointment) return null;

  const items = computeReadinessItems(profile, appointment);
  const status = computeReadinessStatus(items, appointment);
  const urgency = getAppointmentUrgency(appointment);

  // Don't show anything if appointment is past
  if (urgency === "past") return null;

  // Client-controlled missing items (exclude appointment — BATO's responsibility)
  const missingClientItems = items.filter(
    i => i.required && !i.complete && i.key !== "appointment"
  );

  // Determine if client has actual work to do
  const clientHasAction = missingClientItems.length > 0;

  // Urgent = today/tomorrow with incomplete profile
  const isUrgent = (urgency === "today" || urgency === "tomorrow") && clientHasAction;

  // Show the detail modal
  if (showDetail) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto" style={{ background: "#eeebe6" }}>
        <PreVisitReadinessDetail
          profile={profile}
          appointment={appointment}
          onClose={() => setShowDetail(false)}
          onProfileUpdate={handleProfileUpdate}
        />
      </div>
    );
  }

  return (
    <>


      {/* Client has required action → show visible action card */}
      {clientHasAction && (
        <ReadinessActionCard
          urgency={urgency}
          missingItems={missingClientItems}
          onOpen={() => setShowDetail(true)}
        />
      )}

      {/* Profile complete or BATO handling appointment → compact passive strip only */}
      {!clientHasAction && (status === "ready" || status === "pending_confirmation") && (
        <ReadinessCompactStrip
          status={status}
          onOpen={() => setShowDetail(true)}
        />
      )}
    </>
  );
}