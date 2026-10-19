import { useBatoText } from "@/lib/batoText";
// Shared UI primitives for BATO onboarding screens
import React, {useId} from "react";
import { Lock, Info } from "lucide-react";

export function ScreenTitle({ title, subtitle, centered = false }) {
  const tr = useBatoText();
  return (
    <div className={`mb-6 ${centered ? "text-center" : ""}`}>
      <h1 className="text-2xl font-bold text-[#333435] leading-tight">{tr(title)}</h1>
      {tr(subtitle && <p className="text-sm text-[#7c8689] mt-1.5 leading-relaxed">{tr(subtitle)}</p>)}
    </div>
  );
}

export function ChoiceCard({ label, description, selected, onClick, icon: Icon }) {
  const tr = useBatoText();
  return (
    <button
      type="button" aria-pressed={!!selected}
      onClick={onClick}
      className="bato-onboarding-choice w-full flex items-start gap-3 p-5 rounded-2xl border text-start transition-all"
      style={{
        background: selected ? "rgba(196,170,139,0.08)" : "#ffffff",
        borderColor: selected ? "#c4aa8b" : "rgba(196,170,139,0.2)",
        boxShadow: selected ? "0 0 0 1.5px #c4aa8b" : "none"
      }}
    >
      {tr(Icon && (
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: selected ? "rgba(196,170,139,0.15)" : "#f9f8f6" }}>
          <Icon className="w-5 h-5" style={{ color: selected ? "#c4aa8b" : "#7c8689" }} />
        </div>
      ))}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-base text-[#3a2e1e]">{tr(label)}</p>
        {tr(description && <p className="text-xs text-[#7c8689] mt-0.5 leading-relaxed">{tr(description)}</p>)}
      </div>
      <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ borderColor: selected ? "#c4aa8b" : "rgba(196,170,139,0.3)", background: selected ? "#c4aa8b" : "transparent" }}>
        {tr(selected && <div className="w-2 h-2 rounded-full bg-white" />)}
      </div>
    </button>
  );
}

export function Chip({ label, selected, onClick }) {
  const tr = useBatoText();
  return (
    <button
      type="button" aria-pressed={!!selected}
      onClick={onClick}
      className="bato-filter-option min-h-11 px-4 py-2 rounded-full text-xs font-medium transition-all"
      style={selected
        ? { background: "#3a2e1e", color: "#c4aa8b", border: "1px solid transparent" }
        : { background: "#ffffff", color: "#7c8689", border: "1px solid rgba(196,170,139,0.25)" }}
    >
      {tr(label)}
    </button>
  );
}

export function YesNoToggle({ label, hint, value, onChange }) {
  const tr = useBatoText();
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "rgba(196,170,139,0.2)" }}>
      <div className="flex items-center justify-between bg-white px-4 py-3.5">
        <p className="text-sm font-medium text-[#333435] min-w-0 flex-1 pe-3">{tr(label)}</p>
        <div className="flex gap-1.5 flex-shrink-0">
          {tr(["Yes", "No"].map(opt => (
            <button type="button" aria-pressed={value === (opt === "Yes")} aria-label={tr(label)+": "+tr(opt)} key={opt} onClick={() => onChange(opt === "Yes")}
              className="bato-filter-option w-12 min-h-11 rounded-full text-xs font-semibold transition-all"
              style={value === (opt === "Yes")
                ? { background: "#3a2e1e", color: "#c4aa8b" }
                : { background: "#f0ede9", color: "#7c8689" }}>
              {tr(opt)}
            </button>
          )))}
        </div>
      </div>
      {tr(hint && (
        <div className="px-4 py-2 border-t" style={{ background: "rgba(196,170,139,0.04)", borderColor: "rgba(196,170,139,0.1)" }}>
          <p className="text-[11px] text-[#7c8689] leading-relaxed">{tr(hint)}</p>
        </div>
      ))}
    </div>
  );
}

export function TextareaField({ label, placeholder, value, onChange, optional = true, hint }) {
  const tr = useBatoText();
  const fieldId=useId();
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label htmlFor={fieldId} className="text-sm font-medium text-[#333435]">{tr(label)}</label>
        {tr(optional && <span className="text-[10px] text-[#7c8689]">{tr("Optional")}</span>)}
      </div>
      <textarea
        id={fieldId}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        placeholder={tr(placeholder)}
        rows={3}
        className="w-full rounded-xl border px-3.5 py-3 text-sm text-[#333435] placeholder:text-[#b0b8bc] resize-none outline-none"
        style={{ borderColor: "rgba(196,170,139,0.25)", background: "#ffffff" }}
      />
      {tr(hint && <p className="text-[11px] text-[#7c8689] mt-1.5 leading-relaxed">{tr(hint)}</p>)}
    </div>
  );
}

export function CTAButton({ label, onClick, disabled = false, secondary = false }) {
  const tr = useBatoText();
  if (secondary) {
    return (
      <button onClick={onClick} disabled={disabled}
        data-bato-button="true" data-bato-variant="outline" className="w-full min-h-12 py-3 rounded-xl text-sm font-medium transition-all"
        style={{ background: "#ffffff", color: "#7c8689", border: "1px solid rgba(196,170,139,0.25)" }}>
        {tr(label)}
      </button>
    );
  }
  return (
    <button onClick={onClick} disabled={disabled}
      data-bato-button="true" data-bato-variant="default" className="bato-onboarding-cta w-full min-h-12 py-3.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
      style={{ background: disabled ? "rgba(196,170,139,0.4)" : "#c4aa8b", color: "#3a2e1e" }}>
      {tr(label)}
    </button>
  );
}

export function PrivacyNote({ text }) {
  const tr = useBatoText();
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl mt-3"
      style={{ background: "rgba(196,170,139,0.06)", border: "1px solid rgba(196,170,139,0.15)" }}>
      <Lock className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "#c4aa8b" }} />
      <p className="text-[11px] text-[#7c8689] leading-relaxed">{tr(text)}</p>
    </div>
  );
}

export function MicrocopyHint({ text }) {
  const tr = useBatoText();
  return (
    <div className="flex items-start gap-2 mb-4">
      <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "rgba(196,170,139,0.7)" }} />
      <p className="text-[11px] text-[#7c8689] leading-relaxed italic">{tr(text)}</p>
    </div>
  );
}

export function ReflectionCard({ concern, fear, onContinue }) {
  const tr = useBatoText();
  return (
    <div className="space-y-4">
      <div className="text-center mb-2">
        <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
          style={{ background: "rgba(196,170,139,0.12)" }}>
          <span className="text-xl">✓</span>
        </div>
        <h2 className="text-xl font-bold text-[#333435]">{tr("Got it.")}</h2>
      </div>
      <div className="rounded-2xl p-5 space-y-3"
        style={{ background: "#ffffff", border: "1px solid rgba(196,170,139,0.2)" }}>
        {tr(concern && (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-0.5">{tr("Your main concern")}</p>
            <p className="text-sm font-medium text-[#333435]">{tr(concern)}</p>
          </div>
        ))}
        {tr(fear && (
          <div className="pt-3 border-t" style={{ borderColor: "rgba(196,170,139,0.15)" }}>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] mb-0.5">{tr("What worries you most")}</p>
            <p className="text-sm font-medium text-[#333435]">{tr(fear)}</p>
          </div>
        ))}
      </div>
      <p className="text-xs text-[#7c8689] leading-relaxed text-center px-4">{tr("Your team will know this before your visit — so the conversation starts with what matters to you.")}</p>
      <CTAButton label={tr("Continue")} onClick={onContinue} />
    </div>
  );
}

export function SectionDivider({ label }) {
  const tr = useBatoText();
  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px" style={{ background: "rgba(196,170,139,0.2)" }} />
      {tr(label && <p className="text-[10px] font-semibold uppercase tracking-wider text-[#7c8689] flex-shrink-0">{tr(label)}</p>)}
      <div className="flex-1 h-px" style={{ background: "rgba(196,170,139,0.2)" }} />
    </div>
  );
}

export function SavedProgressNote() {
  const tr = useBatoText();
  return (
    <p className="text-center text-[10px] text-[#7c8689] mt-5">{tr("Your last step is saved. Changes are saved when you continue.")}</p>
  );
}