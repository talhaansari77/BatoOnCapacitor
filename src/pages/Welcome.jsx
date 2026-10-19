import React, { useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";
import { ArrowRight, MessageSquare, Phone, Sparkles, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { isStandaloneBuild } from "@/test-mode/previewClient";

const JOURNEYS = [
  { icon: "🌿", title: "Hair", description: "For shedding, thinning, scalp concerns, or density support.", cta: "Explore Hair Journey", link: "/HairJourney" },
  { icon: "✨", title: "Skin", description: "For glow, texture, pigmentation, acne, or skin quality.", cta: "Explore Skin Journey", link: "/SkinJourney" },
  { icon: "🩸", title: "Health", description: "For blood tests, internal support, energy, deficiencies, or drips.", cta: "Explore Health Journey", link: "/HealthJourney" },
  { icon: "⚡", title: "Laser", description: "For smoother skin and long-term hair reduction.", cta: "Explore Laser Journey", link: "/LaserJourney" },
  { icon: "💉", title: "Injectables", description: "For Botox, boosters, fillers, and natural-looking refinement.", cta: "Ask About Injectables", link: "/Messages" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Choose your concern", body: "Tell us what you want help with — hair, skin, health, laser, or aesthetics." },
  { step: "02", title: "Start with assessment", body: "Your team reviews your concern before recommending the right next step." },
  { step: "03", title: "Follow your journey", body: "Your app keeps your progress, care instructions, updates, and team communication in one place." },
];

const DIFFERENTIATORS = [
  { title: "Assessment before treatment", body: "We start by understanding the case before recommending care." },
  { title: "Hair + health connected", body: "Hair and skin concerns can be connected to internal markers, lifestyle, and treatment history." },
  { title: "Progress you can follow", body: "Your journey, sessions, photos, care instructions, and updates live inside the app." },
  { title: "Team-guided care", body: "Message the right BATO team instead of a generic clinic inbox." },
];

export default function Welcome() {
  const navigate = useNavigate();

  useEffect(() => {
    if (isStandaloneBuild) return; // Always show Welcome first in an offline iOS build.
    base44.auth.me()
      .then(() => navigate(createPageUrl("Dashboard")))
      .catch(() => {});
  }, [navigate]);

  return (
    <div className="min-h-screen pb-16" style={{ background: "#eeebe6", paddingTop: isStandaloneBuild ? "env(safe-area-inset-top, 0px)" : undefined }}>
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* ── Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bato-style-hero rounded-3xl overflow-hidden"
          style={{ background: "#3a2e1e" }}
        >
          <div className="px-7 py-10">
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: "#c4aa8b" }}>
              Welcome to BATO
            </p>
            <h1 className="text-3xl font-bold leading-snug mb-3" style={{ color: "#eeebe6" }}>
              Start with the right assessment, then let your team guide the journey.
            </h1>
            <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(238,235,230,0.6)" }}>
              Explore hair, skin, health, laser, and aesthetic care — all connected through one BATO experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#what-brings-you">
                <Button
                  className="w-full sm:w-auto h-12 px-6 rounded-2xl text-sm font-semibold border-0"
                  style={{ background: "#c4aa8b", color: "#3a2e1e" }}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find My Starting Point
                </Button>
              </a>
              <Button
                onClick={() => isStandaloneBuild ? navigate("/SignIn") : base44.auth.redirectToLogin()}
                variant="outline"
                className="w-full sm:w-auto h-12 px-6 rounded-2xl text-sm font-semibold"
                style={{ borderColor: "rgba(196,170,139,0.4)", color: "#c4aa8b", background: "transparent" }}
              >
                Sign In
              </Button>
            </div>
          </div>
        </motion.div>

        {/* ── What brings you to BATO? ── */}
        <section id="what-brings-you">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-4">
            What brings you to BATO?
          </p>
          <div className="space-y-3">
            {JOURNEYS.map((j, i) => (
              <motion.div
                key={j.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="bg-white rounded-2xl p-5 flex items-center justify-between gap-4 shadow-sm"
                style={{ border: "1px solid rgba(196,170,139,0.15)" }}
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl leading-none mt-0.5">{j.icon}</span>
                  <div>
                    <p className="font-semibold text-[#333435] text-sm mb-0.5">{j.title}</p>
                    <p className="text-xs text-[#7c8689] leading-relaxed">{j.description}</p>
                  </div>
                </div>
                <Button
                  onClick={() => isStandaloneBuild ? navigate("/SignIn") : base44.auth.redirectToLogin()}
                  size="sm"
                  className="h-9 px-4 rounded-xl text-xs font-semibold border-0 whitespace-nowrap flex-shrink-0"
                  style={{ background: "#3a2e1e", color: "#c4aa8b" }}
                >
                  {j.cta}
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── How BATO guides you ── */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-4">
            How BATO guides you
          </p>
          <div className="bg-white rounded-3xl p-6 shadow-sm space-y-6" style={{ border: "1px solid rgba(196,170,139,0.15)" }}>
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="flex gap-5">
                <div className="flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold"
                  style={{ background: "rgba(196,170,139,0.1)", color: "#c4aa8b" }}>
                  {step.step}
                </div>
                <div className="pt-1.5">
                  <p className="font-semibold text-[#333435] text-sm mb-1">{step.title}</p>
                  <p className="text-xs text-[#7c8689] leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Why BATO is different ── */}
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-4">
            Why BATO is different
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DIFFERENTIATORS.map((d, i) => (
              <motion.div
                key={d.title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                className="bg-white rounded-2xl p-5 shadow-sm"
                style={{ border: "1px solid rgba(196,170,139,0.15)" }}
              >
                <p className="font-semibold text-[#333435] text-sm mb-1.5">{d.title}</p>
                <p className="text-xs text-[#7c8689] leading-relaxed">{d.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Already booked? ── */}
        <section
          className="rounded-3xl p-6"
          style={{ background: "rgba(196,170,139,0.08)", border: "1px solid rgba(196,170,139,0.2)" }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#7c8689] mb-3">
            Already booked with BATO?
          </p>
          <h3 className="text-base font-bold text-[#333435] mb-1.5">Connect your profile</h3>
          <p className="text-xs text-[#7c8689] leading-relaxed mb-5">
            Connect your WhatsApp number so we can link your appointment and BATO profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={() => isStandaloneBuild ? navigate("/SignIn") : base44.auth.redirectToLogin()}
              className="h-11 px-5 rounded-2xl text-sm font-semibold border-0"
              style={{ background: "#3a2e1e", color: "#eeebe6" }}
            >
              <Phone className="w-4 h-4 mr-2" />
              Sign In to Connect Profile
            </Button>
            <Button
              onClick={() => isStandaloneBuild ? navigate("/SignIn") : base44.auth.redirectToLogin()}
              variant="outline"
              className="h-11 px-5 rounded-2xl text-sm font-semibold"
              style={{ borderColor: "rgba(58,46,30,0.2)", color: "#3a2e1e" }}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message Customer service
            </Button>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bato-style-hero rounded-3xl overflow-hidden" style={{ background: "#3a2e1e" }}>
          <div className="px-7 py-8 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: "#c4aa8b" }}>
              Not sure where to start?
            </p>
            <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(238,235,230,0.65)" }}>
              Answer a few quick questions and we'll guide you to the best first step.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="#what-brings-you">
                <Button
                  className="h-12 px-6 rounded-2xl text-sm font-semibold border-0 w-full sm:w-auto"
                  style={{ background: "#c4aa8b", color: "#3a2e1e" }}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Find My Starting Point
                </Button>
              </a>
              <Button
                onClick={() => isStandaloneBuild ? navigate("/SignIn") : base44.auth.redirectToLogin()}
                variant="outline"
                className="h-12 px-6 rounded-2xl text-sm font-semibold w-full sm:w-auto"
                style={{ borderColor: "rgba(196,170,139,0.4)", color: "#c4aa8b", background: "transparent" }}
              >
                Sign In to BATO
              </Button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}