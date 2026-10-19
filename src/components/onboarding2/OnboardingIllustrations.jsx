/**
 * BATO Onboarding Illustrations
 * Inline SVG — no external requests, lightweight, premium clinic aesthetic.
 * Uses BATO palette: #3a2e1e, #c4aa8b, #e7cb50, #eeebe6, #7c8689
 */
import React from "react";

// ─── Shared defs / helpers ────────────────────────────────────────────────────

const BASE_PROPS = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 280 160",
};

// ─── 1. Welcome — Hair-led growth journey (no generic network look) ──────────
export function WelcomeIllustration() {
  return (
    <svg {...BASE_PROPS} className="mx-auto w-full max-w-[280px]" aria-hidden="true">
      {/* Soft warm backdrop */}
      <ellipse cx="140" cy="88" rx="104" ry="62" fill="rgba(196,170,139,0.08)" />

      {/* Scalp arc */}
      <path d="M92 106 Q140 46 188 106" stroke="rgba(58,46,30,0.15)" strokeWidth="1.8" fill="rgba(196,170,139,0.05)" />

      {/* Hair strands — sparse on the left, fuller to the right (the growth story) */}
      {[104, 116, 128, 140, 152, 164, 176].map((sx, i) => (
        <path key={i}
          d={`M ${sx} 104 Q ${sx + (i % 2 === 0 ? -3 : 3)} ${76 - i * 3} ${sx + (i % 2 === 0 ? 1 : -1)} ${54 - i * 2}`}
          stroke="#c4aa8b" strokeWidth={1.4 + (i / 7) * 0.8} strokeLinecap="round" fill="none"
          opacity={0.35 + (i / 7) * 0.55} />
      ))}

      {/* Growth arrow */}
      <path d="M140 44 L136 52 L144 52 Z" fill="#c4aa8b" opacity="0.7" />

      {/* Assessment dot on the scalp */}
      <circle cx="140" cy="102" r="4.5" fill="#3a2e1e" />
      <circle cx="140" cy="102" r="2" fill="#c4aa8b" />

      {/* Refined sparkles */}
      <path d="M186 42 L187.5 46 L192 47.5 L187.5 49 L186 53 L184.5 49 L180 47.5 L184.5 46 Z" stroke="#e7cb50" strokeWidth="1.2" fill="none" opacity="0.6" />
      <circle cx="90" cy="126" r="3" fill="#c4aa8b" opacity="0.3" />
      <circle cx="204" cy="112" r="2.5" fill="#e7cb50" opacity="0.4" />
    </svg>
  );
}

// ─── 2. Booked path — appointment confirmed + team preparing ─────────────────
export function BookedIllustration() {
  return (
    <svg {...BASE_PROPS} className="w-full" aria-hidden="true">
      {/* Warm bg */}
      <rect x="0" y="0" width="280" height="160" rx="0" fill="rgba(58,46,30,0.03)" />

      {/* Calendar card */}
      <rect x="50" y="20" width="80" height="90" rx="12" fill="var(--bato-surface, white)" stroke="rgba(196,170,139,0.35)" strokeWidth="1.2" />
      {/* Calendar header */}
      <rect x="50" y="20" width="80" height="24" rx="12" fill="#3a2e1e" />
      <rect x="50" y="32" width="80" height="12" rx="0" fill="#3a2e1e" />

      {/* Date grid */}
      {[0,1,2,3,4,5].map(i => (
        <rect key={i} x={58 + (i % 3) * 22} y={52 + Math.floor(i / 3) * 18} width="14" height="10" rx="3"
          fill={i === 2 ? "#c4aa8b" : "rgba(196,170,139,0.1)"} />
      ))}
      {/* Checkmark on selected date */}
      <circle cx="72" cy="57" r="5" fill="#c4aa8b" />
      <path d="M69.5 57 L71.5 59 L75 55" stroke="var(--bato-surface, white)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Time row */}
      <rect x="58" y="92" width="64" height="8" rx="3" fill="rgba(196,170,139,0.12)" />
      <rect x="62" y="94" width="24" height="4" rx="2" fill="#c4aa8b" opacity="0.4" />

      {/* Team card */}
      <rect x="152" y="30" width="82" height="80" rx="12" fill="var(--bato-surface, white)" stroke="rgba(196,170,139,0.3)" strokeWidth="1.2" />
      {/* Avatar row */}
      <circle cx="178" cy="60" r="14" fill="rgba(58,46,30,0.06)" stroke="rgba(196,170,139,0.3)" strokeWidth="1" />
      <circle cx="178" cy="56" r="5" fill="rgba(196,170,139,0.35)" />
      <path d="M168 72 Q178 66 188 72" fill="rgba(196,170,139,0.2)" />
      {/* "Preparing" bar */}
      <rect x="162" y="82" width="58" height="5" rx="2.5" fill="rgba(196,170,139,0.15)" />
      <rect x="162" y="82" width="38" height="5" rx="2.5" fill="#c4aa8b" opacity="0.5" />
      <rect x="162" y="91" width="44" height="4" rx="2" fill="rgba(196,170,139,0.1)" />


      {/* Connection arrow */}
      <path d="M132 65 L150 65" stroke="rgba(196,170,139,0.5)" strokeWidth="1.5" markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" markerWidth="5" markerHeight="5" refX="3" refY="2.5" orient="auto">
          <path d="M0 0 L5 2.5 L0 5 Z" fill="rgba(196,170,139,0.5)" />
        </marker>
      </defs>

      {/* Gold accent */}
      <circle cx="240" cy="25" r="5" fill="#e7cb50" opacity="0.45" />
      <circle cx="38" cy="130" r="3.5" fill="#c4aa8b" opacity="0.25" />
    </svg>
  );
}

// ─── 3. Explorer — four guided journeys ──────────────────────────────────────
export function ExplorerIllustration() {
  const journeys = [
    { x: 36, label: "Hair", icon: "〰" },
    { x: 95, label: "Skin", icon: "✦" },
    { x: 154, label: "Health", icon: "◎" },
    { x: 213, label: "Laser", icon: "⟡" },
  ];
  return (
    <svg {...BASE_PROPS} className="w-full" aria-hidden="true">
      {/* Connecting baseline */}
      <path d="M56 110 Q88 90 116 110 Q144 130 172 110 Q200 90 228 110"
        stroke="rgba(196,170,139,0.2)" strokeWidth="1.5" fill="none" />

      {journeys.map((j, i) => (
        <g key={j.label}>
          {/* Card */}
          <rect x={j.x} y="30" width="50" height="76" rx="12"
            fill={i === 0 ? "#3a2e1e" : "var(--bato-surface, white)"}
            stroke={i === 0 ? "transparent" : "rgba(196,170,139,0.25)"}
            strokeWidth="1" />
          {/* Icon circle */}
          <circle cx={j.x + 25} cy="58" r="14"
            fill={i === 0 ? "rgba(196,170,139,0.15)" : "rgba(196,170,139,0.08)"} />

          {/* Label */}

          {/* Dot indicator */}
          <circle cx={j.x + 25} cy="98" r="2.5"
            fill={i === 0 ? "#e7cb50" : "rgba(196,170,139,0.3)"} />
        </g>
      ))}

      {/* Subtle top sparkles */}
      <circle cx="60" cy="18" r="2.5" fill="#e7cb50" opacity="0.5" />
      <circle cx="220" cy="16" r="2" fill="#c4aa8b" opacity="0.4" />
    </svg>
  );
}

// ─── 4. Profile being built ───────────────────────────────────────────────────
export function ProfileBuildIllustration() {
  return (
    <svg {...BASE_PROPS} className="w-full" aria-hidden="true">
      {/* Document card */}
      <rect x="60" y="15" width="160" height="130" rx="14" fill="var(--bato-surface, white)" stroke="rgba(196,170,139,0.3)" strokeWidth="1.2" />

      {/* Header bar */}
      <rect x="60" y="15" width="160" height="28" rx="14" fill="#3a2e1e" />
      <rect x="60" y="29" width="160" height="14" rx="0" fill="#3a2e1e" />

      {/* BATO logo mark */}
      <circle cx="80" cy="29" r="9" fill="rgba(196,170,139,0.15)" />



      {/* Lock icon top-right */}
      <rect x="192" y="22" width="14" height="12" rx="3" fill="rgba(196,170,139,0.15)" />
      <path d="M196 22 Q196 18 199 18 Q202 18 202 22" stroke="rgba(196,170,139,0.6)" strokeWidth="1.2" fill="none" />
      <circle cx="199" cy="27" r="1.5" fill="#c4aa8b" opacity="0.7" />

      {/* Profile rows */}
      {[0, 1, 2, 3, 4].map(i => (
        <g key={i}>
          <rect x="78" y={54 + i * 17} width="10" height="10" rx="3" fill={i < 3 ? "rgba(196,170,139,0.2)" : "rgba(196,170,139,0.07)"} />
          <rect x="94" y={56 + i * 17} width={i < 3 ? 90 - i * 8 : 60} height="5" rx="2.5"
            fill={i < 3 ? "#c4aa8b" : "rgba(196,170,139,0.12)"} opacity={i < 3 ? 0.6 - i * 0.1 : 1} />
          {i < 3 && <circle cx="78" y={54 + i * 17} r="0" />}
        </g>
      ))}

      {/* Progress bar at bottom */}
      <rect x="78" y="142" width="124" height="5" rx="2.5" fill="rgba(196,170,139,0.1)" />
      <rect x="78" y="142" width="80" height="5" rx="2.5" fill="#c4aa8b" opacity="0.55" />

      {/* Side glow */}
      <circle cx="240" cy="80" r="18" fill="rgba(231,203,80,0.06)" />
      <circle cx="40" cy="40" r="12" fill="rgba(196,170,139,0.06)" />
    </svg>
  );
}

// ─── 5. Visit-specific — category icon visuals ───────────────────────────────
export function CategoryIllustration({ category = "hair" }) {
  const configs = {
    hair: {
      color: "#c4aa8b",
      lines: [
        "M 105 130 Q 110 80 115 50 Q 120 30 125 50 Q 130 80 130 130",
        "M 125 130 Q 130 80 140 50 Q 145 30 150 50 Q 155 80 155 130",
        "M 148 130 Q 150 80 160 55 Q 164 38 168 55 Q 170 80 172 130",
      ],
      label: "Scalp & Hair",
    },
    skin: {
      color: "#c4aa8b",
      label: "Skin Analysis",
    },
    laser: {
      color: "#c4aa8b",
      label: "Laser Care",
    },
    injectables: {
      color: "#c4aa8b",
      label: "Facial Care",
    },
    health: {
      color: "#c4aa8b",
      label: "Internal Health",
    },
    general: {
      color: "#c4aa8b",
      label: "Consultation",
    },
  };

  const cfg = configs[category] || configs.general;

  return (
    <svg {...BASE_PROPS} className="w-full" aria-hidden="true">
      {/* Central oval */}
      <ellipse cx="140" cy="82" rx="75" ry="62" fill="rgba(196,170,139,0.06)" stroke="rgba(196,170,139,0.15)" strokeWidth="1" />

      {category === "hair" && (
        <g>
          {/* Scalp arc */}
          <path d="M 90 100 Q 140 40 190 100" stroke="rgba(58,46,30,0.12)" strokeWidth="1.5" fill="rgba(196,170,139,0.04)" />
          {/* Hair strands */}
          {[100, 115, 128, 140, 153, 166, 180].map((sx, i) => (
            <path key={i}
              d={`M ${sx} 100 Q ${sx + (i % 2 === 0 ? -3 : 3)} ${72 - i * 2} ${sx + (i % 2 === 0 ? 1 : -1)} 50`}
              stroke="#c4aa8b" strokeWidth="1.8" strokeLinecap="round" fill="none" opacity={0.5 + (i % 3) * 0.15} />
          ))}
          {/* Assessment dots */}
          <circle cx="140" cy="97" r="4.5" fill="#3a2e1e" />
          <circle cx="140" cy="97" r="2" fill="#c4aa8b" />
        </g>
      )}

      {category === "skin" && (
        <g>
          {/* Face outline */}
          <ellipse cx="140" cy="80" rx="38" ry="46" fill="rgba(196,170,139,0.08)" stroke="rgba(196,170,139,0.25)" strokeWidth="1.2" />
          {/* Scan lines */}
          {[55, 65, 75, 85, 95, 105].map((y, i) => (
            <line key={i} x1={105 + i} y1={y} x2={175 - i} y2={y}
              stroke="rgba(196,170,139,0.2)" strokeWidth="0.8" />
          ))}
          {/* Analysis dot */}
          <circle cx="140" cy="78" r="5" fill="#c4aa8b" opacity="0.4" />
          <circle cx="140" cy="78" r="2.5" fill="#c4aa8b" />
        </g>
      )}

      {category === "laser" && (
        <g>
          {/* Beam */}
          <line x1="80" y1="50" x2="200" y2="130" stroke="rgba(231,203,80,0.35)" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="80" cy="50" r="6" fill="#e7cb50" opacity="0.4" />
          <circle cx="80" cy="50" r="3" fill="#e7cb50" opacity="0.7" />
          {/* Target area */}
          <circle cx="175" cy="112" r="16" fill="none" stroke="rgba(196,170,139,0.3)" strokeWidth="1.2" strokeDasharray="3 3" />
          <circle cx="175" cy="112" r="8" fill="none" stroke="rgba(196,170,139,0.4)" strokeWidth="1" />
          <circle cx="175" cy="112" r="3" fill="#c4aa8b" opacity="0.6" />
        </g>
      )}

      {category === "injectables" && (
        <g>
          {/* Face silhouette */}
          <ellipse cx="140" cy="82" rx="34" ry="44" fill="rgba(196,170,139,0.08)" stroke="rgba(196,170,139,0.2)" strokeWidth="1" />
          {/* Refined dots — injection points */}
          {[[126, 65], [154, 65], [140, 58], [128, 90], [152, 90], [140, 104]].map(([px, py], i) => (
            <circle key={i} cx={px} cy={py} r="2.5" fill="#c4aa8b" opacity={0.35 + i * 0.08} />
          ))}
        </g>
      )}

      {(category === "health" || category === "general") && (
        <g>
          {/* Panel vials */}
          {[105, 128, 151].map((px, i) => (
            <g key={i}>
              <rect x={px} y="52" width="14" height="42" rx="7" fill="rgba(196,170,139,0.1)" stroke="rgba(196,170,139,0.3)" strokeWidth="1" />
              <rect x={px} y={52 + 42 - (16 + i * 6)} width="14" height={16 + i * 6} rx="7"
                fill={["#c4aa8b", "#e7cb50", "#3a2e1e"][i]} opacity={[0.45, 0.35, 0.55][i]} />
              <rect x={px + 4} y="48" width="6" height="8" rx="2" fill="rgba(58,46,30,0.2)" />
            </g>
          ))}
          {/* Connecting line */}
          <line x1="112" y1="94" x2="158" y2="94" stroke="rgba(196,170,139,0.2)" strokeWidth="1" strokeDasharray="3 2" />
        </g>
      )}

      {/* Category label */}
      <rect x="100" y="132" width="80" height="16" rx="8" fill="rgba(58,46,30,0.06)" />


      {/* Accent sparkles */}
      <circle cx="220" cy="30" r="3.5" fill="#e7cb50" opacity="0.4" />
      <circle cx="55" cy="130" r="2.5" fill="#c4aa8b" opacity="0.3" />
    </svg>
  );
}

// ─── 6. Photo / Lab upload ────────────────────────────────────────────────────
export function UploadIllustration() {
  return (
    <svg {...BASE_PROPS} className="w-full" aria-hidden="true">
      {/* Main upload area */}
      <rect x="40" y="20" width="200" height="115" rx="14" fill="var(--bato-surface, white)"
        stroke="rgba(196,170,139,0.3)" strokeWidth="1.2" strokeDasharray="6 4" />

      {/* Photo grid (4 thumbnails) */}
      {[
        { x: 58, y: 38, label: "Front" },
        { x: 108, y: 38, label: "Top" },
        { x: 58, y: 88, label: "Side" },
        { x: 108, y: 88, label: "Crown" },
      ].map((p, i) => (
        <g key={i}>
          <rect x={p.x} y={p.y} width="40" height="40" rx="8"
            fill={i < 2 ? "rgba(196,170,139,0.12)" : "rgba(196,170,139,0.05)"}
            stroke="rgba(196,170,139,0.2)" strokeWidth="1" />
          {i < 2 ? (
            <>
              <circle cx={p.x + 20} cy={p.y + 16} r="7" fill="rgba(196,170,139,0.25)" />
              <path d={`M ${p.x + 8} ${p.y + 38} Q ${p.x + 20} ${p.y + 26} ${p.x + 32} ${p.y + 38}`}
                fill="rgba(196,170,139,0.15)" />
              <circle cx={p.x + 20} cy={p.y + 16} r="3" fill="#c4aa8b" opacity="0.5" />
            </>
          ) : (
            <>
              <line x1={p.x + 20} y1={p.y + 14} x2={p.x + 20} y2={p.y + 28} stroke="rgba(196,170,139,0.25)" strokeWidth="1.5" />
              <line x1={p.x + 13} y1={p.y + 21} x2={p.x + 27} y2={p.y + 21} stroke="rgba(196,170,139,0.25)" strokeWidth="1.5" />
            </>
          )}

        </g>
      ))}

      {/* Lab document */}
      <rect x="164" y="38" width="62" height="90" rx="10" fill="rgba(58,46,30,0.04)" stroke="rgba(196,170,139,0.25)" strokeWidth="1" />
      <rect x="164" y="38" width="62" height="18" rx="10" fill="rgba(58,46,30,0.08)" />
      <rect x="164" y="46" width="62" height="10" rx="0" fill="rgba(58,46,30,0.08)" />

      {[0, 1, 2, 3].map(i => (
        <rect key={i} x="172" y={62 + i * 14} width={i % 2 === 0 ? 44 : 32} height="4" rx="2"
          fill="rgba(196,170,139,0.15)" />
      ))}

      {/* Upload arrow */}
      <circle cx="195" cy="115" r="10" fill="rgba(196,170,139,0.12)" />
      <path d="M190 117 L195 111 L200 117" stroke="#c4aa8b" strokeWidth="1.5" strokeLinecap="round" fill="none" />
      <line x1="195" y1="111" x2="195" y2="121" stroke="#c4aa8b" strokeWidth="1.5" strokeLinecap="round" />

      <circle cx="248" cy="25" r="4" fill="#e7cb50" opacity="0.4" />
    </svg>
  );
}

// ─── 7. Health & safety — secure private profile ─────────────────────────────
export function HealthSafetyIllustration() {
  return (
    <svg {...BASE_PROPS} className="w-full" aria-hidden="true">
      {/* Shield */}
      <path d="M140 18 L178 34 L178 78 Q178 116 140 134 Q102 116 102 78 L102 34 Z"
        fill="rgba(58,46,30,0.05)" stroke="rgba(196,170,139,0.3)" strokeWidth="1.2" />
      <path d="M140 28 L170 41 L170 78 Q170 108 140 122 Q110 108 110 78 L110 41 Z"
        fill="rgba(196,170,139,0.08)" stroke="rgba(196,170,139,0.2)" strokeWidth="1" />

      {/* Lock body */}
      <rect x="128" y="68" width="24" height="20" rx="5" fill="#3a2e1e" />
      {/* Lock shackle */}
      <path d="M133 68 Q133 56 140 56 Q147 56 147 68" stroke="#c4aa8b" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Keyhole */}
      <circle cx="140" cy="76" r="3" fill="#c4aa8b" opacity="0.7" />
      <rect x="139" y="77" width="2" height="5" rx="1" fill="#c4aa8b" opacity="0.6" />

      {/* Subtle tick marks around shield */}
      {[0, 1, 2].map(i => (
        <g key={i} transform={`rotate(${-30 + i * 30}, 140, 76)`}>
          <circle cx="185" cy="76" r="2.5" fill="rgba(196,170,139,0.2)" />
        </g>
      ))}

      {/* Side text rows — feels like a profile card */}
      <rect x="36" y="55" width="52" height="42" rx="10" fill="var(--bato-surface, white)" stroke="rgba(196,170,139,0.2)" strokeWidth="1" />
      <rect x="44" y="64" width="36" height="4" rx="2" fill="rgba(196,170,139,0.2)" />
      <rect x="44" y="72" width="26" height="4" rx="2" fill="rgba(196,170,139,0.12)" />
      <rect x="44" y="80" width="32" height="4" rx="2" fill="rgba(196,170,139,0.12)" />
      <circle cx="44" cy="90" r="2" fill="#c4aa8b" opacity="0.5" />


      <rect x="192" y="55" width="52" height="42" rx="10" fill="var(--bato-surface, white)" stroke="rgba(196,170,139,0.2)" strokeWidth="1" />
      <rect x="200" y="64" width="36" height="4" rx="2" fill="rgba(196,170,139,0.2)" />
      <rect x="200" y="72" width="22" height="4" rx="2" fill="rgba(196,170,139,0.12)" />
      <rect x="200" y="80" width="30" height="4" rx="2" fill="rgba(196,170,139,0.12)" />
      <circle cx="200" cy="90" r="2" fill="#c4aa8b" opacity="0.5" />


      <circle cx="52" cy="28" r="3" fill="#c4aa8b" opacity="0.3" />
      <circle cx="238" cy="130" r="4" fill="#e7cb50" opacity="0.35" />
    </svg>
  );
}

// ─── 8. Goals & fears — calm consultation ────────────────────────────────────
export function GoalsIllustration() {
  return (
    <svg {...BASE_PROPS} className="w-full" aria-hidden="true">
      {/* Speech bubble — client */}
      <rect x="28" y="22" width="110" height="64" rx="12" fill="var(--bato-surface, white)" stroke="rgba(196,170,139,0.3)" strokeWidth="1.2" />
      <path d="M48 86 L44 98 L58 86" fill="var(--bato-surface, white)" stroke="rgba(196,170,139,0.3)" strokeWidth="1.2" />
      {/* Lines inside bubble */}
      <rect x="40" y="36" width="86" height="5" rx="2.5" fill="rgba(58,46,30,0.08)" />
      <rect x="40" y="46" width="68" height="5" rx="2.5" fill="rgba(196,170,139,0.2)" />
      <rect x="40" y="56" width="76" height="5" rx="2.5" fill="rgba(196,170,139,0.12)" />
      <rect x="40" y="66" width="50" height="5" rx="2.5" fill="rgba(196,170,139,0.08)" />

      {/* Doctor response bubble */}
      <rect x="148" y="52" width="106" height="64" rx="12" fill="rgba(58,46,30,0.04)"
        stroke="rgba(196,170,139,0.25)" strokeWidth="1" />
      <path d="M168 52 L162 40 L178 52" fill="rgba(58,46,30,0.04)" stroke="rgba(196,170,139,0.2)" strokeWidth="1" />
      {/* BATO monogram */}
      <circle cx="170" cy="72" r="8" fill="#3a2e1e" />

      {/* Lines */}
      <rect x="184" y="66" width="58" height="4" rx="2" fill="rgba(196,170,139,0.25)" />
      <rect x="184" y="74" width="42" height="4" rx="2" fill="rgba(196,170,139,0.15)" />
      <rect x="184" y="82" width="50" height="4" rx="2" fill="rgba(196,170,139,0.1)" />
      <rect x="184" y="90" width="34" height="4" rx="2" fill="rgba(196,170,139,0.1)" />
      {/* Understood checkmark */}
      <circle cx="240" cy="104" r="8" fill="rgba(196,170,139,0.15)" />
      <path d="M236 104 L239 107 L244 101" stroke="#c4aa8b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Connector dots */}
      <circle cx="140" cy="88" r="3" fill="rgba(196,170,139,0.3)" />
      <circle cx="148" cy="88" r="2" fill="rgba(196,170,139,0.2)" />

      <circle cx="42" cy="140" r="3" fill="#c4aa8b" opacity="0.2" />
      <circle cx="248" cy="28" r="4" fill="#e7cb50" opacity="0.4" />
    </svg>
  );
}

// ─── 9. Before your visit — checklist ────────────────────────────────────────
export function BeforeVisitIllustration() {
  const items = ["Arrive 10 min early", "Bring lab results", "Prepare questions", "Upload photos"];
  return (
    <svg {...BASE_PROPS} className="w-full" aria-hidden="true">
      {/* Clipboard */}
      <rect x="62" y="14" width="156" height="130" rx="14" fill="var(--bato-surface, white)" stroke="rgba(196,170,139,0.3)" strokeWidth="1.2" />
      {/* Clip */}
      <rect x="112" y="8" width="56" height="16" rx="8" fill="#3a2e1e" />
      <rect x="128" y="10" width="24" height="12" rx="6" fill="rgba(196,170,139,0.2)" />

      {/* Header row */}
      <rect x="80" y="34" width="100" height="7" rx="3.5" fill="rgba(58,46,30,0.1)" />
      <rect x="98" y="44" width="64" height="5" rx="2.5" fill="rgba(196,170,139,0.2)" />

      {/* Checklist rows */}
      {items.map((item, i) => (
        <g key={i}>
          {/* Checkbox */}
          <rect x="78" y={58 + i * 18} width="12" height="12" rx="3"
            fill={i < 3 ? "#c4aa8b" : "rgba(196,170,139,0.12)"}
            stroke={i < 3 ? "transparent" : "rgba(196,170,139,0.25)"} strokeWidth="1" />
          {i < 3 && (
            <path d={`M ${80} ${64 + i * 18} L ${83} ${67 + i * 18} L ${88} ${60 + i * 18}`}
              stroke="var(--bato-surface, white)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          )}
          {/* Text line */}
          <rect x="96" y={61 + i * 18} width={80 - i * 4} height="5" rx="2.5"
            fill={i < 3 ? "rgba(58,46,30,0.1)" : "rgba(196,170,139,0.1)"} />
        </g>
      ))}

      {/* Calendar strip at bottom */}
      <rect x="78" y="134" width="124" height="5" rx="2.5" fill="rgba(196,170,139,0.12)" />
      <rect x="78" y="134" width="90" height="5" rx="2.5" fill="#c4aa8b" opacity="0.4" />

      {/* Gold accent dot */}
      <circle cx="238" cy="22" r="4" fill="#e7cb50" opacity="0.45" />
      <circle cx="46" cy="120" r="3" fill="#c4aa8b" opacity="0.22" />
    </svg>
  );
}

// ─── 10. Completion ───────────────────────────────────────────────────────────
export function CompletionIllustration() {
  return (
    <svg {...BASE_PROPS} className="w-full" aria-hidden="true">
      {/* Outer glow ring */}
      <circle cx="140" cy="82" r="62" fill="rgba(196,170,139,0.06)" />
      <circle cx="140" cy="82" r="48" fill="rgba(58,46,30,0.04)" stroke="rgba(196,170,139,0.2)" strokeWidth="1" />

      {/* Inner filled circle */}
      <circle cx="140" cy="82" r="36" fill="#3a2e1e" />

      {/* Large check */}
      <path d="M122 82 L134 94 L160 68" stroke="#c4aa8b" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Floating cards — team notified */}
      <rect x="18" y="44" width="72" height="52" rx="12" fill="var(--bato-surface, white)" stroke="rgba(196,170,139,0.25)" strokeWidth="1" />
      <circle cx="40" cy="62" r="9" fill="rgba(58,46,30,0.08)" />
      <circle cx="40" cy="59" r="4" fill="rgba(196,170,139,0.3)" />
      <path d="M31 72 Q40 66 49 72" fill="rgba(196,170,139,0.12)" />
      <rect x="54" y="57" width="28" height="4" rx="2" fill="rgba(196,170,139,0.3)" />
      <rect x="54" y="65" width="20" height="4" rx="2" fill="rgba(196,170,139,0.15)" />


      <rect x="190" y="44" width="72" height="52" rx="12" fill="var(--bato-surface, white)" stroke="rgba(196,170,139,0.25)" strokeWidth="1" />
      <circle cx="210" cy="62" r="9" fill="rgba(58,46,30,0.06)" />
      <rect x="204" y="58" width="12" height="8" rx="4" fill="rgba(196,170,139,0.2)" />
      <rect x="206" y="52" width="8" height="6" rx="4" fill="none" stroke="rgba(196,170,139,0.3)" strokeWidth="1" />
      <rect x="220" y="57" width="30" height="4" rx="2" fill="rgba(196,170,139,0.3)" />
      <rect x="220" y="65" width="22" height="4" rx="2" fill="rgba(196,170,139,0.15)" />


      {/* Gold sparkles */}
      <circle cx="92" cy="22" r="4" fill="#e7cb50" opacity="0.5" />
      <circle cx="188" cy="20" r="3" fill="#e7cb50" opacity="0.4" />
      <circle cx="58" cy="140" r="3.5" fill="#c4aa8b" opacity="0.25" />
      <circle cx="224" cy="138" r="3" fill="#c4aa8b" opacity="0.2" />

      {/* Connecting lines to main circle */}
      <line x1="90" y1="70" x2="104" y2="78" stroke="rgba(196,170,139,0.2)" strokeWidth="1" />
      <line x1="190" y1="70" x2="176" y2="78" stroke="rgba(196,170,139,0.2)" strokeWidth="1" />
    </svg>
  );
}
