import BatoSectionIntro from "@/components/design/BatoSectionIntro";
import JourneyDiscovery from "@/components/dashboard/JourneyDiscovery";
import CustomerCareHub from "@/components/care/CustomerCareHub";
import { loadCompletedTreatmentSessions } from "@/lib/treatmentSessions";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useLocation } from "../components/LocationContext";
import { careAppointments, caseForProgram } from "@/lib/customerCare";
import { toast } from "sonner";
import { requireEntityList } from "@/lib/entityResponse";

// Dashboard sub-components
import HairJourneyHero from "../components/dashboard/HairJourneyHero";
import {programDepartment, sessionsForProgram, appointmentsForProgram} from "@/lib/carePrograms";
import TreatmentTimeline from "../components/dashboard/TreatmentTimeline";
import ProgressGalleryCard from "../components/dashboard/ProgressGalleryCard";
import MilestoneCards from "../components/dashboard/MilestoneCards";
import InternalSupport from "../components/dashboard/InternalSupport";
import ExplorerDashboard from "../components/dashboard/ExplorerDashboard";

// Existing components kept
import FeedbackNotification from "../components/feedback/FeedbackNotification";
import BookingCalendar from "../components/appointments/BookingCalendar";

import ChurnPreventionOffer from "../components/upsell/ChurnPreventionOffer";
import { DashboardSkeleton } from "../components/ui/BatoSkeleton";
import PersonalConciergeChat from "../components/concierge/PersonalConciergeChat";
import TierProgressIndicator from "../components/loyalty/TierProgressIndicator";
import VIPDashboardWidget from "../components/loyalty/VIPDashboardWidget";
import IncompleteProfileBanner from "../components/dashboard/IncompleteProfileBanner";
import PreVisitReadinessDashboard from "../components/readiness/PreVisitReadinessDashboard";
import MissingFieldsPrompt from "../components/onboarding2/MissingFieldsPrompt";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [showBookingCalendar, setShowBookingCalendar] = useState(false);
  const [showChurnOffer, setShowChurnOffer] = useState(true);
  const [showConcierge, setShowConcierge] = useState(false);
  const [batoProfile, setBatoProfile] = useState(null);
  const [isReturningUser, setIsReturningUser] = useState(false);
  const { isRTL, t } = useLocation();

  useEffect(() => { loadUser(); }, []);

  const loadUser = async () => {
    setLoadError(false);
    try {
      const userData = await base44.auth.me();
      setUser(userData);

      // Existing profiles can resume onboarding voluntarily from the dashboard.
      try {
        const batoProfiles = requireEntityList(
          await base44.entities.BATOProfile.filter({ client_email: userData.email }),
          "BATOProfile"
        );
        if (batoProfiles.length > 0) {
          setBatoProfile(batoProfiles[0]);
          setIsReturningUser(true);
          setCheckingOnboarding(false);
          return;
        }
      } catch (profileError) {
        console.error("Error checking BATOProfile:", profileError);
        // A failed profile check must not look like an empty account.
        setLoadError(true);
        setCheckingOnboarding(false);
        return;
      }

      // Phone-linked users have already started; do not restart their first visit.
      try {
        const linkers = requireEntityList(
          await base44.entities.ProfileLinker.filter({ auth_email: userData.email }, '-created_date', 1),
          "ProfileLinker"
        );
        if (linkers.length > 0) {
          setIsReturningUser(true);
          setCheckingOnboarding(false);
          return;
        }
      } catch (linkerError) {
        console.error("Error checking ProfileLinker:", linkerError);
        setLoadError(true);
        setCheckingOnboarding(false);
        return;
      }

      // Only genuinely new users enter the initial onboarding flow.
      setCheckingOnboarding(false);
      navigate(createPageUrl("Onboarding"), { replace: true });
    } catch (error) {
      console.error("Error loading user:", error);
      setLoadError(true);
      setCheckingOnboarding(false);
    }
  };

  const { data: caseFiles = [], isLoading: caseFileLoading, isError: caseFileError } = useQuery({
    queryKey: ['caseFile', user?.email, 'dashboardHair'],
    queryFn: async () => {
      const cases = await base44.entities.CaseFile.filter({ client_email: user.email, primary_department: "hair_restoration" }, "-created_date");
      return requireEntityList(cases, "CaseFile");
    },
    enabled: !!user && !checkingOnboarding,
    initialData: undefined,
  });

  const { data: upcomingAppointments = [], isPending: appointmentsLoading, isError: appointmentsError } = useQuery({
    queryKey: ['upcomingAppointments', user?.email],
    queryFn: async () => {
      const appointments = requireEntityList(
        await base44.entities.Appointment.filter({ client_email: user.email }, '-appointment_date'),
        "Appointment"
      );
      return appointments
        .filter(apt => careAppointments([apt]).live.length > 0)
        .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
        ;
    },
    enabled: !!user && !checkingOnboarding,
  });

  const { data: recentSessions = [], isPending: sessionsLoading, isError: sessionsError } = useQuery({
    queryKey: ['completedTreatmentSessions', user?.email],
    queryFn: () => loadCompletedTreatmentSessions(user.email),
    enabled: !!user && !checkingOnboarding,
  });

  const { data: activePackages = [], isLoading: packagesLoading, isError: packagesError } = useQuery({
    queryKey: ['activePackages', user?.email],
    queryFn: async () => requireEntityList(
      await base44.entities.Package.filter({ client_email: user.email }, '-created_date'),
      "Package"
    ),
    enabled: !!user && !checkingOnboarding,
  });

  const { data: clientLifecycle } = useQuery({
    queryKey: ['clientLifecycle', user?.email],
    queryFn: async () => {
      const lc = requireEntityList(
        await base44.entities.ClientLifecycle.filter({ client_email: user.email }, '-updated_date'),
        "ClientLifecycle"
      );
      return lc[0] || null;
    },
    enabled: !!user && !checkingOnboarding,
    initialData: null,
  });

  const validPackages = Array.isArray(activePackages) ? activePackages : [];
  const invalidPackageData = !Array.isArray(activePackages);
  const activeHairPackage = validPackages.find(p => p.status === "active" && programDepartment(p) === "hair_restoration") || null;
  const hairSessions = sessionsForProgram(Array.isArray(recentSessions) ? recentSessions : [], activeHairPackage, validPackages);
  const hairAppointments = appointmentsForProgram(Array.isArray(upcomingAppointments) ? upcomingAppointments : [], activeHairPackage, validPackages);
  const activeHairCase = caseForProgram(Array.isArray(caseFiles) ? caseFiles : [], activeHairPackage, validPackages);

  useEffect(() => {
    if (user && clientLifecycle) {
      let dismissed;
      try { dismissed = localStorage.getItem(`churn_offer_dismissed_${user.email}`); } catch { dismissed = null; }
      if (dismissed && (Date.now() - parseInt(dismissed)) / (1000 * 60 * 60) < 48) {
        setShowChurnOffer(false);
      }
    }
  }, [user, clientLifecycle]);

  const handleChurnPreventionDismiss = () => {
    try { localStorage.setItem(`churn_offer_dismissed_${user?.email}`, Date.now().toString()); } catch { /* Dismiss remains usable in memory. */ }
    setShowChurnOffer(false);
  };

  const handleChurnPreventionContact = () => {
    navigate("/Messages?channel=client_care");
  };

  if (loadError || caseFileError || packagesError || invalidPackageData || appointmentsError || sessionsError) return <div className="max-w-lg mx-auto p-6 text-center">
    <p className="text-[#3a2e1e]">{t("We couldn't load your dashboard.", "تعذر تحميل لوحة التحكم.")}</p>
    <button className="mt-4 rounded-xl bg-[#3a2e1e] text-white px-4 py-2" onClick={() => window.location.reload()}>{t("Try again", "حاول مرة أخرى")}</button>
  </div>;
  if (checkingOnboarding || !user || packagesLoading || appointmentsLoading || sessionsLoading) return <DashboardSkeleton isRTL={isRTL} />;
  if (caseFileLoading) return <DashboardSkeleton isRTL={isRTL} />;

  // Show Explorer Dashboard when user has no active CaseFile
  // Guard: only show after onboarding check is done and caseFile query has resolved
  if (!checkingOnboarding && !caseFileLoading && !caseFiles.length && validPackages.length === 0) {
    return <ExplorerDashboard user={user} batoProfile={batoProfile} isReturningUser={isReturningUser} isRTL={isRTL} t={t} />;
  }

  return (
    <div className={`min-h-screen pb-10 overflow-x-hidden ${isRTL ? 'text-right' : 'text-left'}`} style={{ background: "#eeebe6" }} dir={isRTL ? 'rtl' : 'ltr'}>
      <h1 className="sr-only">{t("Dashboard","لوحة التحكم")}</h1>
      <div className="w-full max-w-lg mx-auto px-4 py-5 space-y-4">
        {activeHairPackage && <HairJourneyHero
          user={user}
          activePackage={activeHairPackage}
          caseFile={activeHairCase}
          sessionsCount={hairSessions.length}
          onBookSession={() => setShowBookingCalendar(true)}
          upcomingAppointments={hairAppointments}
          isRTL={isRTL}
          t={t}
        />}

        {/* Without an active hair program, Hair discovery leads the dashboard. */}
        {!activeHairPackage && <JourneyDiscovery hairOnly />}

        {user && <CustomerCareHub user={user} view="today" />}
        {!activeHairPackage && <CustomerCareHub user={user} profile={batoProfile} view="overview" />}

        {/* PRE-VISIT READINESS */}
        {user && upcomingAppointments.length > 0 && <PreVisitReadinessDashboard userEmail={user.email} />}

        {activeHairPackage && <>
        <BatoSectionIntro title={t("Your Hair progress", "تقدم رحلة شعرك")} description={t("Sessions, recorded photos and milestones", "الجلسات والصور المسجلة والمراحل")} />
        {/* 2. TREATMENT TIMELINE */}
        <TreatmentTimeline
          activePackage={activeHairPackage}
          caseFile={activeHairCase}
          sessionsCount={hairSessions.length}
          sessions={hairSessions}
          upcomingAppointments={hairAppointments}
          isRTL={isRTL}
          t={t}
        />

        {/* 5. PROGRESS GALLERY — compact, only when official photos exist */}
        <ProgressGalleryCard
          caseFile={activeHairCase}
          sessions={hairSessions}
          userEmail={user?.email}
          isRTL={isRTL}
          t={t}
        />

        {/* 6. MILESTONES */}
        <MilestoneCards
          activePackage={activeHairPackage}
          caseFile={activeHairCase}
          sessionsCount={hairSessions.length}
          isRTL={isRTL}
          t={t}
        />


        </>}

        {activeHairPackage && <CustomerCareHub user={user} profile={batoProfile} excludeHair view="overview" />}
        {activeHairPackage && <>
          <BatoSectionIntro title={t("Supporting your Hair care", "دعم العناية بشعرك")} />
        {/* 7. INTERNAL SUPPORT */}
        <InternalSupport
          packages={validPackages}
          isRTL={isRTL}
          t={t}
        />

        </>}
        <JourneyDiscovery excludeHair={!activeHairPackage} />

        {/* Returning clients can finish their saved onboarding without being forced into it. */}
        {batoProfile && !batoProfile.completed && (
          <Link to={createPageUrl("Onboarding")} className="block rounded-xl bg-white border border-[#c4aa8b] p-4 text-sm font-medium text-[#3a2e1e]">
            {t("Complete your profile →", "أكمل ملفك الشخصي ←")}
          </Link>
        )}

        {/* Incomplete profile reminder */}
        {user && <IncompleteProfileBanner userEmail={user.email} />}

        {/* Missing emotional fields prompt for existing users */}
        {user && batoProfile && (!batoProfile.desired_result || !batoProfile.biggest_worry) && (
          <MissingFieldsPrompt profile={batoProfile} userEmail={user.email} onComplete={() => setBatoProfile(p => ({ ...p, desired_result: "set", biggest_worry: "set" }))} />
        )}


        {/* 9. REWARDS — lowest priority */}
        {clientLifecycle?.vip_status && (
          <VIPDashboardWidget
            clientLifecycle={clientLifecycle}
            upcomingAppointments={upcomingAppointments}
            onOpenConcierge={() => setShowConcierge(true)}
          />
        )}
        {clientLifecycle && !clientLifecycle.vip_status && (
          <div className="opacity-80">
            <TierProgressIndicator
              currentTier={clientLifecycle.loyalty_level || 'bronze'}
              currentPoints={clientLifecycle.loyalty_points || 0}
              totalSessions={recentSessions.length}
            />
          </div>
        )}

        {/* Feedback / Churn */}
        {user && <FeedbackNotification userEmail={user.email} />}
        {user && clientLifecycle?.churn_risk_score > 0.5 && showChurnOffer && (
          <ChurnPreventionOffer
            clientLifecycle={clientLifecycle}
            onDismiss={handleChurnPreventionDismiss}
            onContactUs={handleChurnPreventionContact}
          />
        )}
      </div>

      {/* Modals */}
      {user && (
        <PersonalConciergeChat
          userEmail={user.email}
          open={showConcierge}
          onClose={() => setShowConcierge(false)}
        />
      )}
      {user && (
        <BookingCalendar
          open={showBookingCalendar}
          onClose={() => setShowBookingCalendar(false)}
          userEmail={user.email}
          packageData={activeHairPackage}
          appointmentType="treatment"
          onBookingSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['upcomingAppointments', user.email] });
            queryClient.invalidateQueries({ queryKey: ['activePackages', user.email] });
          }}
        />
      )}
    </div>
  );
}