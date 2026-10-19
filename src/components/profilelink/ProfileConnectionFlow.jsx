import { useBatoText } from "@/lib/batoText";
import React, { useState,useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, CheckCircle2, MessageSquare, ArrowRight, Loader2, Globe, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { base44 } from "@/api/base44Client";
import { runMatcher } from "./useProfileMatcher";
import { useLocation } from "../LocationContext";

const COUNTRY_CODES = [
  { code: "+971", label: "🇦🇪 UAE (+971)" },
  { code: "+965", label: "🇰🇼 Kuwait (+965)" },
  { code: "+966", label: "🇸🇦 Saudi (+966)" },
  { code: "+974", label: "🇶🇦 Qatar (+974)" },
  { code: "+973", label: "🇧🇭 Bahrain (+973)" },
  { code: "+968", label: "🇴🇲 Oman (+968)" },
  { code: "+44",  label: "🇬🇧 UK (+44)" },
  { code: "+1",   label: "🇺🇸 US (+1)" },
  { code: "+20",  label: "🇪🇬 Egypt (+20)" },
  { code: "+962", label: "🇯🇴 Jordan (+962)" },
  { code: "+961", label: "🇱🇧 Lebanon (+961)" },
  { code: "+34",  label: "🇪🇸 Spain (+34)" },
];

// Screen 1: Enter phone
function PhoneEntryScreen({ onSubmit, onSkip }) {
  const tr = useBatoText();
  const {location}=useLocation();
  const [countryCode, setCountryCode] = useState(location==="kuwait"?"+965":"+971");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!phone.trim() || loading) return;
    setLoading(true);
    try{await onSubmit({ phone: phone.trim(), countryCode });}
    finally{setLoading(false);}
  };

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center pt-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(196,170,139,0.12)" }}>
          <Phone className="w-7 h-7" style={{ color: "#c4aa8b" }} />
        </div>
        <h1 className="text-xl font-bold text-[#333435] mb-2">{tr("Connect your BATO profile")}</h1>
        <p className="text-sm text-[#7c8689] leading-relaxed px-2">{tr("Add your WhatsApp number so we can connect your appointment, BATO Profile, and care journey.")}</p>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="profile-country-code" className="text-xs font-medium text-[#7c8689] block mb-1.5">{tr("Country code")}</label>
          <select
            id="profile-country-code" disabled={loading}
            value={countryCode}
            onChange={e => setCountryCode(e.target.value)}
            className="w-full px-3 py-3 rounded-2xl border text-sm bg-white text-[#333435] focus:outline-none"
            style={{ borderColor: "rgba(196,170,139,0.3)" }}
          >
            {tr(COUNTRY_CODES.map(c => (
              <option key={c.code} value={c.code}>{tr(c.label)}</option>
            )))}
          </select>
        </div>

        <div>
          <label htmlFor="profile-whatsapp" className="text-xs font-medium text-[#7c8689] block mb-1.5">{tr("WhatsApp number")}</label>
          <input
            id="profile-whatsapp" type="tel" autoComplete="tel-national" inputMode="tel" dir="ltr" disabled={loading}
            value={phone}
            onChange={e => setPhone(e.target.value)}
            placeholder={tr("e.g. 50 123 4567")}
            className="w-full px-4 py-3 rounded-2xl border text-sm text-[#333435] placeholder-[#7c8689] focus:outline-none"
            style={{ borderColor: "rgba(196,170,139,0.3)", background: "#fff" }}
            onKeyDown={e => e.key === "Enter" && handleSubmit()}
          />
          <p className="text-[11px] text-[#7c8689] mt-1.5">{tr("Enter the number you use on WhatsApp — without the country code.")}</p>
        </div>
      </div>

      <div className="space-y-2">
        <Button
          onClick={handleSubmit}
          disabled={!phone.trim() || loading}
          className="w-full h-12 rounded-2xl text-sm font-semibold border-0"
          style={{ background: "#3a2e1e", color: "#eeebe6" }}
        >
          {tr(loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ArrowRight className="w-4 h-4 mr-2" />)}{tr("Connect My Profile")}</Button>
        <button
          onClick={onSkip}
          className="w-full py-3 text-xs text-[#7c8689] underline underline-offset-2"
        >{tr("I don't have an appointment — skip this step")}</button>
      </div>

      <div className="p-4 rounded-2xl text-center" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
        <p className="text-[11px] text-[#7c8689] leading-relaxed">{tr("🔒 Your phone number is only used to connect your BATO appointment and profile. It is never shared.")}</p>
      </div>
    </motion.div>
  );
}

// Screen 2: Match found
function MatchFoundScreen({ appointment, onContinue }) {
  const tr = useBatoText();
  const { isRTL } = useLocation();
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center pt-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(196,170,139,0.12)" }}>
          <CheckCircle2 className="w-7 h-7" style={{ color: "#c4aa8b" }} />
        </div>
        <h1 className="text-xl font-bold text-[#333435] mb-2">{tr("We found your BATO profile")}</h1>
        <p className="text-sm text-[#7c8689] leading-relaxed px-2">{tr("We matched your account to your BATO appointment and care journey.")}</p>
      </div>

      {tr(appointment && (
        <div className="bg-white rounded-2xl p-4 border space-y-2" style={{ borderColor: "rgba(196,170,139,0.25)" }}>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#7c8689] mb-3">{tr("Your appointment")}</p>
          <div className="flex justify-between text-sm">
            <span className="text-[#7c8689]">{tr("Service")}</span>
            <span className="font-medium text-[#333435]">{tr(appointment.department?.replace(/_/g, " ") || "—")}</span>
          </div>
          {tr(appointment.appointment_date && (
            <div className="flex justify-between text-sm">
              <span className="text-[#7c8689]">{tr("Date")}</span>
              <span className="font-medium text-[#333435]">{tr(new Date(appointment.appointment_date).toLocaleString(isRTL ? "ar-AE" : "en-GB"))}</span>
            </div>
          ))}
          {tr(appointment.location && (
            <div className="flex justify-between text-sm">
              <span className="text-[#7c8689]">{tr("Branch")}</span>
              <span className="font-medium text-[#333435]">{tr(appointment.location)}</span>
            </div>
          ))}
          {tr(appointment.status && (
            <div className="flex justify-between text-sm">
              <span className="text-[#7c8689]">{tr("Status")}</span>
              <span className="font-medium capitalize" style={{ color: appointment.status === "confirmed" ? "#c4aa8b" : "#7c8689" }}>
                {tr(appointment.status)}
              </span>
            </div>
          ))}
        </div>
      ))}

      <Button
        onClick={onContinue}
        className="w-full h-12 rounded-2xl text-sm font-semibold border-0"
        style={{ background: "#3a2e1e", color: "#eeebe6" }}
      >{tr("Continue")}<ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );
}

// Screen 3: Multiple matches
function MultipleMatchScreen({ appointmentIds, userEmail, onSelect, onSkip }) {
  const tr = useBatoText();
  const { isRTL } = useLocation();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const load = async () => {
      // Fetch appointments for each possible match directly rather than full table scan
      const fetched = await Promise.all(
        appointmentIds.slice(0, 5).map(id =>
          base44.entities.Appointment.filter({ client_email: userEmail }).catch(() => [])
        )
      );
      const all = fetched.flat();
      const results = appointmentIds.slice(0, 5)
        .map(id => all.find(a => a.id === id))
        .filter(Boolean);
      setAppointments(results);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
      <div className="text-center pt-4">
        <h1 className="text-xl font-bold text-[#333435] mb-2">{tr("Confirm your appointment")}</h1>
        <p className="text-sm text-[#7c8689] leading-relaxed px-2">{tr("We found more than one possible match. Select the appointment that belongs to you.")}</p>
      </div>

      {tr(loading ? (
        <div className="text-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mx-auto" style={{ color: "#c4aa8b" }} />
        </div>
      ) : (
        <div className="space-y-2">
          {tr(appointments.map(appt => (
            <button
              key={appt.id}
              onClick={() => onSelect(appt.id)}
              className="w-full bg-white rounded-2xl p-4 border text-start transition-all hover:shadow-sm"
              style={{ borderColor: "rgba(196,170,139,0.25)" }}
            >
              <p className="text-sm font-semibold text-[#333435] mb-1">
                {tr(appt.department?.replace(/_/g, " ") || "Appointment")}
              </p>
              {tr(appt.appointment_date && (
                <p className="text-xs text-[#7c8689]">{tr(new Date(appt.appointment_date).toLocaleString(isRTL ? "ar-AE" : "en-GB"))}</p>
              ))}
              {tr(appt.location && (
                <p className="text-xs text-[#7c8689]">{tr(appt.location)}</p>
              ))}
            </button>
          )))}
        </div>
      ))}

      <button onClick={onSkip} className="w-full py-3 text-xs text-[#7c8689]">{tr("None of these are mine — Continue as Explorer")}</button>
    </motion.div>
  );
}

// Screen 4: Pending confirmation (no match)
function PendingScreen({ onMessageCare, onExplorer }) {
  const tr = useBatoText();
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center pt-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(196,170,139,0.08)" }}>
          <Globe className="w-7 h-7" style={{ color: "#c4aa8b" }} />
        </div>
        <h1 className="text-xl font-bold text-[#333435] mb-2">{tr("We're confirming your profile")}</h1>
        <p className="text-sm text-[#7c8689] leading-relaxed px-2">{tr("Your BATO account is ready. Customer service can help connect your appointment details if you already booked.")}</p>
      </div>

      <div className="p-4 rounded-2xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
        <p className="text-xs text-[#7c8689] leading-relaxed text-center">{tr("We've saved your details. A member of the BATO team will confirm your profile connection shortly.")}</p>
      </div>

      <div className="space-y-2">
        <Button
          onClick={onMessageCare}
          className="w-full h-12 rounded-2xl text-sm font-semibold border-0"
          style={{ background: "#3a2e1e", color: "#eeebe6" }}
        >
          <MessageSquare className="w-4 h-4 mr-2" />{tr("Message Customer service")}</Button>
        <button onClick={onExplorer} className="w-full py-3 text-xs text-[#7c8689]">{tr("Continue as Explorer")}</button>
      </div>
    </motion.div>
  );
}

// Screen 5: Explorer confirm (with back arrow in header)
function ExplorerConfirmScreen({ onBack, onConfirm }) {
  const tr = useBatoText();
  return (
    <motion.div
      key="explorer_confirm"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-6"
    >
      <div className="text-center pt-4">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ background: "rgba(196,170,139,0.12)" }}>
          <Globe className="w-7 h-7" style={{ color: "#c4aa8b" }} />
        </div>
        <h1 className="text-xl font-bold text-[#333435] mb-2">{tr("Continue as Explorer?")}</h1>
        <p className="text-sm text-[#7c8689] leading-relaxed px-2">{tr("If you've booked an appointment with BATO, adding your WhatsApp number helps us connect your profile, care journey, and results.")}</p>
      </div>

      <div className="p-4 rounded-2xl" style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
        <p className="text-xs text-[#7c8689] leading-relaxed text-center">{tr("You can always connect your profile later from your account settings.")}</p>
      </div>

      <div className="space-y-2">
        <Button
          onClick={onBack}
          className="w-full h-12 rounded-2xl text-sm font-semibold border-0"
          style={{ background: "#3a2e1e", color: "#eeebe6" }}
        >
          <Phone className="w-4 h-4 mr-2" />{tr("Add My WhatsApp Number")}</Button>
        <button
          onClick={onConfirm}
          className="w-full py-3 text-xs text-[#7c8689]"
        >{tr("No, continue without connecting")}</button>
      </div>
    </motion.div>
  );
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

export default function ProfileConnectionFlow({ user, onComplete }) {
  const tr = useBatoText();
  const { isRTL } = useLocation();
  const [screen, setScreen] = useState("phone_entry");
  const [matchData, setMatchData] = useState(null);
  const [linkedAppointment, setLinkedAppointment] = useState(null);
  const [linkerRecord, setLinkerRecord] = useState(null);
  const [connectionError, setConnectionError] = useState('');
  const actionBusy=useRef(false);
  const [saving,setSaving]=useState(false);
  const runAction=async action=>{
    if(actionBusy.current)return;
    actionBusy.current=true;setSaving(true);setConnectionError("");
    try{await action();}
    catch{setConnectionError(isRTL?"تعذر حفظ اختيارك. حاول مرة أخرى.":"We could not save your choice. Please try again.");}
    finally{actionBusy.current=false;setSaving(false);}
  };

  const handlePhoneSubmit = async ({ phone, countryCode }) => {
    setConnectionError('');
    setScreen("matching");

    try {
    const result = await runMatcher({ email: user.email, phone, countryCode });

    const record = await base44.entities.ProfileLinker.create({
      auth_email: user.email,
      connected_phone: phone,
      phone_country_code: countryCode,
      profile_link_status: result.status,
      linked_profile_id: result.profileId || null,
      linked_appointment_id: result.appointmentId || null,
      linked_casefile_id: result.caseFileId || null,
      matched_by: result.matchedBy,
      possible_appointment_ids: result.possibleAppointments || [],
      last_match_attempt_at: new Date().toISOString(),
    });
    setLinkerRecord(record);
    setMatchData(result);

    if (result.status === "matched") {
      if (result.appointmentId) {
        const all = await base44.entities.Appointment.filter({ client_email: user.email });
        const found = all.find(a => a.id === result.appointmentId) || null;
        setLinkedAppointment(found);
      }
      setScreen("found");
    } else if (result.status === "duplicate_possible") {
      setScreen("multiple");
    } else {
      await base44.entities.Notification.create({
        client_email: "admin@batoclinic.com",
        type: "general",
        title: "🔗 Profile connection needed",
        message: `Client ${user.email} submitted phone ${countryCode}${phone} — no automatic match found. Review in Profile Connection Admin.`,
        priority: "high",
      });
      setScreen("pending");
    }
    } catch (error) {
      console.error("Profile connection failed:", error);
      setConnectionError("We couldn't connect your profile. Check your phone number and try again.");
      setScreen("phone_entry");
    }
  };

  const handleMatchSelected = appointmentId => runAction(async () => {
    if (linkerRecord) {
      await base44.entities.ProfileLinker.update(linkerRecord.id, {
        profile_link_status: "matched",
        linked_appointment_id: appointmentId,
        matched_by: "phone",
      });
    }
    // Find the appointment from already-loaded list in matchData
    const allLoaded = await base44.entities.Appointment.filter({ client_email: user.email });
    setLinkedAppointment(allLoaded.find(a => a.id === appointmentId) || null);
    setMatchData(prev => ({ ...prev, status: "matched", appointmentId }));
    setScreen("found");
  });

  const handleSkip = () => setScreen("explorer_confirm");

  const handleConfirmExplorer = () => runAction(async () => {
    if (linkerRecord) {
      await base44.entities.ProfileLinker.update(linkerRecord.id, {
        profile_link_status: "new_profile",
      });
    }
    await onComplete({ matchStatus: "new_profile", profileId: null, appointmentId: null });
  });

  const handleContinueAfterMatch = () => runAction(async () => {
    await onComplete({
      matchStatus: matchData?.status || "matched",
      profileId: matchData?.profileId || null,
      appointmentId: matchData?.appointmentId || null,
      caseFileId: matchData?.caseFileId || null,
    });
  });

  const handleMessageCare = () => runAction(async () => {
    await onComplete({ matchStatus: "pending_confirmation", redirectTo: "/Messages?channel=client_care" });
  });

  return (
    <div dir={isRTL ? "rtl" : "ltr"} className="min-h-screen flex flex-col" style={{ background: "#eeebe6" }}>
      {/* Header */}
      <div className="bg-white border-b border-[#eeebe6] px-4 py-4 flex items-center gap-3">
        {tr(screen === "explorer_confirm" && (
          <button
            disabled={saving} aria-label={isRTL?"الخطوة السابقة":"Previous step"} onClick={() => setScreen("phone_entry")}
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 text-[#333435]" />
          </button>
        ))}
        <div className="bato-style-emblem w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "#3a2e1e" }}>
          <span className="text-[#c4aa8b] font-bold text-xs">{tr("B")}</span>
        </div>
        <div>
          <p className="font-semibold text-[#333435] text-sm">{tr("BATO Clinic")}</p>
          <p className="text-[11px] text-[#7c8689]">{tr("Profile Setup")}</p>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-auto w-full px-4 py-6">
        {tr(connectionError && <p role="alert" className="mb-4 text-sm text-red-700">{tr(connectionError)}</p>)}
        <fieldset disabled={saving} aria-busy={saving} className="min-w-0">
        <AnimatePresence mode="wait">
          {tr(screen === "phone_entry" && (
            <motion.div key="entry" exit={{ opacity: 0, y: -10 }}>
              <PhoneEntryScreen
                onSubmit={handlePhoneSubmit}
                onSkip={handleSkip}
              />
            </motion.div>
          ))}

          {tr(screen === "matching" && (
            <motion.div key="matching" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#c4aa8b" }} />
              <p className="text-sm text-[#7c8689]">{tr("Searching your profile...")}</p>
            </motion.div>
          ))}

          {tr(screen === "found" && (
            <motion.div key="found" exit={{ opacity: 0, y: -10 }}>
              <MatchFoundScreen
                appointment={linkedAppointment}
                onContinue={handleContinueAfterMatch}
              />
            </motion.div>
          ))}

          {tr(screen === "multiple" && (
            <motion.div key="multiple" exit={{ opacity: 0, y: -10 }}>
              <MultipleMatchScreen
                appointmentIds={matchData?.possibleAppointments || []}
                userEmail={user.email}
                onSelect={handleMatchSelected}
                onSkip={handleSkip}
              />
            </motion.div>
          ))}

          {tr(screen === "pending" && (
            <motion.div key="pending" exit={{ opacity: 0, y: -10 }}>
              <PendingScreen
                onMessageCare={handleMessageCare}
                onExplorer={handleSkip}
              />
            </motion.div>
          ))}

          {tr(screen === "explorer_confirm" && (
            <ExplorerConfirmScreen
              onBack={() => setScreen("phone_entry")}
              onConfirm={handleConfirmExplorer}
            />
          ))}
        </AnimatePresence>
        </fieldset>
        {saving && <p role="status">{isRTL?"جارٍ الحفظ…":"Saving…"}</p>}
      </div>
    </div>
  );
}