import { explorerStart, explorerBookingUrl, explorerMessageUrl } from "@/lib/explorerStart";
import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useLocation } from "../components/LocationContext";
import PathSelector from "../components/onboarding2/PathSelector";
import { isStandaloneBuild } from "@/test-mode/previewClient";
import BookedOnboarding from "../components/onboarding2/BookedOnboarding";
import ExplorerOnboarding from "../components/onboarding2/ExplorerOnboarding.jsx";
import OnboardingShell from "../components/onboarding2/OnboardingShell";
import ProfileConnectionFlow from "../components/profilelink/ProfileConnectionFlow";
import MakeItYours from "@/components/appearance/MakeItYours";
import { readPatientAuth } from "@/native/patientApi";
import PatientOriginalOnboarding from "@/components/onboarding2/PatientOriginalOnboarding";

function buildStaffSummary(data, userName) {
  return `Pre-Visit Summary — ${userName}

Booked for: ${data.booked_service_type || "Not specified"}

Main concern: ${data.main_concern || "Not specified"}

Biggest fear: ${data.biggest_worry || "Not specified"}

Desired outcome: ${data.desired_result || "Not specified"}

Fears / concerns: ${data.fears_and_concerns || "None"}

Previous experience: ${(data.previous_treatments || []).join(", ") || "None"} — ${data.previous_experience_result || "Not specified"}
Notes: ${data.previous_experience_notes || "None"}

Medical flags:
  Allergies: ${data.has_allergies ? (data.allergies_detail || "Yes — no detail") : "None"}
  Medications: ${data.has_medications ? (data.medications_detail || "Yes — no detail") : "None"}
  Supplements: ${data.has_supplements ? (data.supplements_detail || "Yes — no detail") : "None"}
  Medical conditions: ${data.has_medical_conditions ? (data.medical_conditions_detail || "Yes — no detail") : "None"}
  Recent surgery: ${data.had_recent_surgery ? "Yes" : "No"}
  Bad reaction: ${data.had_bad_reaction ? (data.bad_reaction_detail || "Yes — no detail") : "No"}
  Pregnant/breastfeeding: ${data.is_pregnant_or_breastfeeding ? "Yes" : "No/Not specified"}
  Known issues: ${(data.known_deficiencies || []).join(", ") || "None"}

Files uploaded: ${(data.uploaded_photos || []).length} photo(s), ${(data.uploaded_documents || []).length} document(s)

Source: ${data.referral_source || "Not specified"}${data.referral_influencer ? ` (Influencer: ${data.referral_influencer})` : ""}${data.referral_person ? ` (Referred by: ${data.referral_person})` : ""}

Other interests: ${(data.additional_concerns || []).join(", ") || "None"}

Goals: ${(data.goals || []).join(", ") || "Not specified"}

Team reminder: Review before consultation.`;
}

function computeProfileQuality(data) {
  const hasCore = data.booked_service_type && data.main_concern && data.consent_acknowledged;
  const hasSafety = data.has_allergies !== undefined && data.has_medications !== undefined && data.has_medical_conditions !== undefined;
  const isComplete = hasCore && hasSafety && data.appointment_confirmed;
  if (isComplete) return "Complete";
  if (hasSafety && data.booked_service_type) return "Partial";
  return "Missing Key Info";
}

async function sendStaffNotification(data, userName, profileQuality) {
  const hasPhotos = (data.uploaded_photos || []).length > 0;
  const hasLabs = (data.uploaded_documents || []).length > 0;
  const medFlags = [
    data.has_allergies && "Allergies",
    data.has_medications && "Medications",
    data.has_medical_conditions && "Medical conditions",
    data.had_bad_reaction && "Previous bad reaction",
    data.is_pregnant_or_breastfeeding && "Pregnant/breastfeeding",
  ].filter(Boolean).join(", ") || "None";

  await base44.entities.Notification.create({
    client_email: "admin@batoclinic.com",
    type: "general",
    title: "🆕 New BATO Profile completed",
    message: `Client: ${userName} | Service: ${data.booked_service_type || "Not specified"} | Concern: ${data.main_concern || "—"} | Medical flags: ${medFlags} | Source: ${data.referral_source || "—"} | Profile quality: ${profileQuality} | Photos: ${hasPhotos ? "Yes" : "No"} | Labs: ${hasLabs ? "Yes" : "No"}`,
    priority: profileQuality === "Missing Key Info" ? "high" : "normal",
  });
}

export default function Onboarding() {
  if (readPatientAuth()) return <PatientOriginalOnboarding />;
  return <LegacyOnboarding />;
}

function LegacyOnboarding() {
  const navigate = useNavigate();
  const { t } = useLocation();
  const [loadError, setLoadError] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsProfileLink, setNeedsProfileLink] = useState(false);

  const urlParams = new URLSearchParams(window.location.search);
  const isPreview = urlParams.get("preview") === "true";

  useEffect(() => { init(); }, [isPreview]);

  const init = async () => {
    setLoading(true);
    setLoadError(false);
    try {
    // Preview mode: skip all DB checks immediately
    if (isPreview && !isStandaloneBuild) {
      const userData = await base44.auth.me();
      setUser(userData);
      setProfile({ client_email: userData.email, onboarding_path: null, user_status: "explorer", current_step: 0, completed: false, _preview: true });
      setLoading(false);
      return;
    }

    const userData = await base44.auth.me();
    setUser(userData);

    const existing = await base44.entities.BATOProfile.filter({ client_email: userData.email });
    if (existing.length > 0) {
      const p = existing[0];
      if (p.completed && new URLSearchParams(window.location.search).get("edit") !== "1") {
        navigate("/Dashboard");
        return;
      }
      setProfile(p);
      setLoading(false);
    } else if (isStandaloneBuild) {
      const p = await base44.entities.BATOProfile.create({
        client_email: userData.email, user_status: "explorer", current_step: 0,
        completed: false, uploaded_photos: [], uploaded_documents: []
      });
      setProfile(p);
      setLoading(false);
    } else {
      // Check if we already have a ProfileLinker record for this user
      const linkers = await base44.entities.ProfileLinker.filter({ auth_email: userData.email });
      if (linkers.length === 0) {
        // First time — show phone matching flow
        setNeedsProfileLink(true);
        setLoading(false);
      } else {
        // Already went through linking — create profile normally
        const p = await base44.entities.BATOProfile.create({
          client_email: userData.email,
          user_status: "explorer",
        });
        setProfile(p);
        setLoading(false);
      }
    }
    } catch (error) {
      console.error("Profile could not load:", error);
      setLoadError(true);
    } finally { setLoading(false); }
  };

  const saveProfile = async (updates) => {
    if (!profile) return;
    // Preview mode: update in-memory only
    if (isPreview && !isStandaloneBuild) {
      setProfile(p => ({ ...p, ...updates }));
      return;
    }
    const updated = await base44.entities.BATOProfile.update(profile.id, {
      ...updates,
      last_updated_at: new Date().toISOString(),
    });
    setProfile(updated);
  };

  const selectPath = async (path) => {
    if (isPreview && !isStandaloneBuild) {
      setProfile(p => ({ ...p, onboarding_path: path, user_status: path === "booked_client" ? "booked" : "explorer", current_step: 1 }));
      return;
    }
    await saveProfile({
      onboarding_path: path,
      user_status: path === "booked_client" ? "booked" : "explorer",
      current_step: 1,
    });
    setProfile(p => ({ ...p, onboarding_path: path, user_status: path === "booked_client" ? "booked" : "explorer", current_step: 1 }));
  };

  const prepareAppearance = async (data) => {
    await saveProfile({appearance_pending:true, appearance_pending_data:data});
    window.scrollTo(0,0);
  };
  const returnToAnswers = async () => {
    await saveProfile({appearance_pending:false});
    window.scrollTo(0,0);
  };
  const completeBooked = async (data) => {
    if (isPreview && !isStandaloneBuild) { navigate("/Dashboard"); return; }
    const summary = buildStaffSummary(data, user?.full_name || user?.email);
    const profileQuality = computeProfileQuality(data);
    await saveProfile({
      ...data,
      appearance_pending: false,
      appearance_pending_data: {},
      completed: true,
      submitted_at: new Date().toISOString(),
      staff_summary: summary,
    });
    try {
      if (!isStandaloneBuild) await sendStaffNotification(data, user?.full_name || user?.email, profileQuality);
    } catch (e) {
      console.error("Staff notification failed:", e);
    }
    navigate("/Dashboard");
  };

  const completeExplorer = async (data) => {
    const start = explorerStart({explorer_interests:data.interests,explorer_recommended_start:data.explorer_recommended_start});
    if (!start) throw new Error("Choose a starting point first");
    const destination = data.next_step === "book" ? explorerBookingUrl(start,data.branch) : data.next_step === "ask" ? explorerMessageUrl(start) : "/Dashboard";
    if (isPreview && !isStandaloneBuild) { navigate(destination); return; }
    await saveProfile({
      explorer_interests: data.interests,
      explorer_assessment: data.assessment,
      visit_specific_answers: data.visit_specific_answers,
      explorer_preferred_branch: data.branch,
      explorer_contact_name: data.name,
      explorer_contact_phone: data.phone,
      explorer_recommended_start: data.explorer_recommended_start,
      desired_result: data.desired_result,
      biggest_worry: data.biggest_worry,
      consent_acknowledged: data.consent_acknowledged === true,
      readiness_status: ["ready", "almost_ready", "needs_attention", "no_appointment"].includes(data.readiness_status) ? data.readiness_status : "no_appointment",
      staff_summary: data.staff_summary,
      appearance_pending: false,
      appearance_pending_data: {},
      completed: true,
      submitted_at: new Date().toISOString(),
    });
    navigate(destination);
  };

  const handleProfileLinkComplete = async ({ matchStatus, profileId, redirectTo }) => {
    // Create the BATOProfile now, routing based on match result
    const existing = await base44.entities.BATOProfile.filter({ client_email: user.email });
    if (existing.length > 0) {
      const p = existing[0];
      if (p.completed) { navigate("/Dashboard"); return; }
      setProfile(p);
      setNeedsProfileLink(false);
      return;
    }
    const path = profileId ? "booked_client" : "explorer";
    const p = await base44.entities.BATOProfile.create({
      client_email: user.email,
      user_status: profileId ? "booked" : "explorer",
      onboarding_path: profileId ? "booked_client" : null,
    });
    setProfile(p);
    setNeedsProfileLink(false);
    if (redirectTo) navigate(redirectTo);
  };

  if (loadError) return (
    <div className="max-w-lg mx-auto p-6 text-center space-y-4">
      <p role="alert">{t("We couldn't load your profile. Please try again.", "تعذر تحميل ملفك الشخصي. حاول مرة أخرى.")}</p>
      <button onClick={init} className="px-5 py-3 rounded-xl bg-[#3a2e1e] text-white">{t("Try again", "حاول مرة أخرى")}</button>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#eeebe6" }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: "#c4aa8b" }} />
          <p className="text-sm text-[#7c8689]">{t("Loading your profile...", "جارٍ تحميل ملفك الشخصي...")}</p>
        </div>
      </div>
    );
  }

  if (needsProfileLink && user) {
    return <ProfileConnectionFlow user={user} onComplete={handleProfileLinkComplete} />;
  }

  if (profile?.appearance_pending) {
    const answers=profile.appearance_pending_data || {};
    const interest=answers.booked_service_type || answers.explorer_recommended_start || (answers.interests || profile.explorer_interests || [])[0] || "";
    const journey=/hair/i.test(interest) ? "hair" : /skin/i.test(interest) ? "skin" : /laser/i.test(interest) ? "laser" : /health|iv|wellness/i.test(interest) ? "health" : "aesthetic";
    return <MakeItYours journey={journey} onBack={returnToAnswers} onComplete={()=>profile.onboarding_path==="booked_client" ? completeBooked(answers) : completeExplorer(answers)}/>;
  }

  if (!profile?.onboarding_path) {
    return (
      <OnboardingShell step={0} totalSteps={0} showProgress={false}>
        <PathSelector onSelect={selectPath} />
      </OnboardingShell>
    );
  }

  if (profile.onboarding_path === "booked_client") {
    return (
      <BookedOnboarding
        user={user}
        profile={profile}
        onSave={saveProfile}
        onComplete={prepareAppearance}
      />
    );
  }

  return (
    <ExplorerOnboarding
      user={user}
      profile={profile}
      onSave={saveProfile}
      onComplete={prepareAppearance}
    />
  );
}