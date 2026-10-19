// Minimal line-art SVG illustrations for BATO clinic
// All use BATO's warm palette: #c4aa8b (gold), #3a2e1e (dark brown), #7c8689 (grey)

export function IlluScalpTreatment({ size = 80, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Head outline */}
      <ellipse cx="40" cy="34" rx="20" ry="22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      {/* Hair lines on top */}
      <path d="M28 18 Q32 10 40 8 Q48 10 52 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Scalp lines */}
      <path d="M30 22 Q35 16 40 15 Q45 16 50 22" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5"/>
      {/* Shoulders */}
      <path d="M20 56 Q16 64 14 72" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M60 56 Q64 64 66 72" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M20 56 Q30 60 40 61 Q50 60 60 56" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      {/* Spark / treatment dots */}
      <circle cx="40" cy="22" r="1.8" fill={color} opacity="0.7"/>
      <circle cx="34" cy="25" r="1.2" fill={color} opacity="0.5"/>
      <circle cx="46" cy="25" r="1.2" fill={color} opacity="0.5"/>
      {/* Sparkle */}
      <path d="M58 14 L59.5 18 L63.5 19.5 L59.5 21 L58 25 L56.5 21 L52.5 19.5 L56.5 18 Z" stroke={color} strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

export function IlluHairGrowth({ size = 80, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Base scalp arc */}
      <path d="M15 55 Q40 35 65 55" stroke={color} strokeWidth="1.8" strokeLinecap="round" fill="none"/>
      {/* Hair strands - short (early) */}
      <path d="M22 50 Q20 42 22 36" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      <path d="M28 46 Q26 36 29 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
      {/* Hair strands - medium */}
      <path d="M35 44 Q34 32 37 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
      <path d="M40 43 Q40 30 42 18" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
      {/* Hair strands - long/strong */}
      <path d="M46 44 Q48 30 47 16" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M52 47 Q56 33 55 20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M58 51 Q63 38 62 26" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      {/* Arrow up = growth */}
      <path d="M42 12 L40 8 L38 12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M40 8 L40 20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

export function IlluCalendar({ size = 60, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="14" width="44" height="38" rx="6" stroke={color} strokeWidth="1.8"/>
      <path d="M8 26 L52 26" stroke={color} strokeWidth="1.5"/>
      <path d="M20 8 L20 20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M40 8 L40 20" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      {/* Check on a date */}
      <rect x="22" y="32" width="16" height="13" rx="3" fill={color} opacity="0.12" stroke={color} strokeWidth="1.2"/>
      <path d="M26 39 L29 42 L34 36" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IlluMilestone({ size = 60, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Trophy */}
      <path d="M20 10 L40 10 L40 32 Q40 44 30 47 Q20 44 20 32 Z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      <path d="M20 18 Q12 18 12 26 Q12 34 20 34" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M40 18 Q48 18 48 26 Q48 34 40 34" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M24 50 L36 50" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M30 47 L30 50" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      {/* Star */}
      <path d="M30 20 L31.5 24.5 L36 24.5 L32.5 27.5 L34 32 L30 29 L26 32 L27.5 27.5 L24 24.5 L28.5 24.5 Z" stroke={color} strokeWidth="1.2" fill="none"/>
    </svg>
  );
}

export function IlluCamera({ size = 60, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="18" width="48" height="34" rx="6" stroke={color} strokeWidth="1.8"/>
      <path d="M20 18 L24 10 L36 10 L40 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="30" cy="35" r="9" stroke={color} strokeWidth="1.8"/>
      <circle cx="30" cy="35" r="4.5" stroke={color} strokeWidth="1.2" opacity="0.5"/>
      <circle cx="44" cy="25" r="2" fill={color} opacity="0.5"/>
    </svg>
  );
}

export function IlluDroplet({ size = 60, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Bottle/serum */}
      <rect x="22" y="22" width="16" height="26" rx="5" stroke={color} strokeWidth="1.8"/>
      <path d="M26 22 L26 16 L34 16 L34 22" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M30 14 L30 10" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <circle cx="30" cy="9" r="2" fill={color} opacity="0.5"/>
      {/* Drops */}
      <path d="M22 36 Q18 40 20 44 Q22 48 26 46" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5"/>
      <path d="M38 32 Q42 36 40 40 Q38 44 34 42" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.5"/>
      {/* Lines on bottle = label */}
      <path d="M25 32 L35 32" stroke={color} strokeWidth="1" opacity="0.4"/>
      <path d="M25 36 L33 36" stroke={color} strokeWidth="1" opacity="0.4"/>
    </svg>
  );
}

export function IlluChecklist({ size = 60, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="8" width="40" height="48" rx="6" stroke={color} strokeWidth="1.8"/>
      {/* Lines */}
      <path d="M20 22 L44 22" stroke={color} strokeWidth="1.2" opacity="0.4"/>
      <path d="M20 32 L44 32" stroke={color} strokeWidth="1.2" opacity="0.4"/>
      <path d="M20 42 L44 42" stroke={color} strokeWidth="1.2" opacity="0.4"/>
      {/* Checks */}
      <path d="M14 22 L17 25 L22 18" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14 32 L17 35 L22 28" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Circle (incomplete) */}
      <circle cx="16" cy="42" r="3" stroke={color} strokeWidth="1.5" opacity="0.4"/>
    </svg>
  );
}

export function IlluTimeline({ size = 70, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Vertical line */}
      <path d="M20 8 L20 62" stroke={color} strokeWidth="1.5" strokeDasharray="2 3" opacity="0.3"/>
      {/* Nodes */}
      <circle cx="20" cy="14" r="5" fill={color}/>
      <path d="M18 14 L22 14 M20 12 L20 16" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="20" cy="30" r="5" fill={color} opacity="0.8"/>
      <path d="M17.5 30 L20 32.5 L23 27.5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="20" cy="46" r="5" stroke={color} strokeWidth="1.5" fill="none"/>
      <circle cx="20" cy="62" r="4" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4"/>
      {/* Labels */}
      <path d="M30 14 L58 14" stroke={color} strokeWidth="1.2" opacity="0.5"/>
      <path d="M30 30 L55 30" stroke={color} strokeWidth="1.2" opacity="0.5"/>
      <path d="M30 46 L50 46" stroke={color} strokeWidth="1.2" opacity="0.3"/>
      <path d="M30 62 L46 62" stroke={color} strokeWidth="1.2" opacity="0.2"/>
    </svg>
  );
}

export function IlluMessages({ size = 60, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Chat bubble 1 */}
      <path d="M6 10 Q6 6 10 6 L38 6 Q42 6 42 10 L42 28 Q42 32 38 32 L18 32 L10 40 L12 32 L10 32 Q6 32 6 28 Z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      {/* Chat bubble 2 */}
      <path d="M22 38 Q22 34 26 34 L50 34 Q54 34 54 38 L54 50 Q54 54 50 54 L34 54 L28 60 L30 54 Q26 54 26 50 Z" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.06" strokeLinejoin="round"/>
      {/* Dots in bubble 1 */}
      <circle cx="16" cy="19" r="2" fill={color} opacity="0.6"/>
      <circle cx="24" cy="19" r="2" fill={color} opacity="0.6"/>
      <circle cx="32" cy="19" r="2" fill={color} opacity="0.6"/>
    </svg>
  );
}

export function IlluPhotoCompare({ size = 70, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 70 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left photo frame */}
      <rect x="4" y="14" width="26" height="42" rx="4" stroke={color} strokeWidth="1.8"/>
      {/* Right photo frame */}
      <rect x="40" y="14" width="26" height="42" rx="4" stroke={color} strokeWidth="1.8"/>
      {/* Left: sparse hair strands */}
      <path d="M12 44 Q11 36 13 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M17 42 Q17 34 18 26" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <path d="M22 44 Q23 35 22 28" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      {/* Right: denser hair strands */}
      <path d="M46 44 Q44 34 47 22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M50 42 Q49 32 51 20" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M54 44 Q55 33 54 22" stroke={color} strokeWidth="1.8" strokeLinecap="round"/>
      <path d="M58 46 Q60 36 58 26" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      {/* Arrows in middle */}
      <path d="M32 35 L38 35" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M36 32 L39 35 L36 38" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {/* Labels */}
      <path d="M8 52 L26 52" stroke={color} strokeWidth="1" opacity="0.3"/>
      <path d="M44 52 L64 52" stroke={color} strokeWidth="1" opacity="0.3"/>
    </svg>
  );
}

export function IlluShield({ size = 60, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M30 6 L50 14 L50 30 Q50 46 30 54 Q10 46 10 30 L10 14 Z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      <path d="M20 30 L26 36 L40 22" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function IlluNoPhotos({ size = 80, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="22" width="64" height="46" rx="8" stroke={color} strokeWidth="1.8" opacity="0.4"/>
      <path d="M8 38 L72 38" stroke={color} strokeWidth="1.2" opacity="0.2"/>
      <circle cx="40" cy="55" r="12" stroke={color} strokeWidth="1.5" opacity="0.3"/>
      <circle cx="40" cy="55" r="5" stroke={color} strokeWidth="1.2" opacity="0.25"/>
      <path d="M26 22 L30 14 L50 14 L54 22" stroke={color} strokeWidth="1.8" strokeLinejoin="round" opacity="0.4"/>
      {/* Clock hands — "coming soon" vibe */}
      <circle cx="58" cy="28" r="8" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      <path d="M58 24 L58 28 L61 31" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

export function IlluWave({ size = 80, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 40 Q16 20 26 40 Q36 60 46 40 Q56 20 66 40 Q72 52 76 44" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <path d="M6 52 Q16 32 26 52 Q36 72 46 52 Q56 32 66 52 Q72 62 76 56" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.35"/>
    </svg>
  );
}

export function IlluHairCare({ size = 72, color = "#c4aa8b" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Hand holding */}
      <path d="M20 52 Q16 58 20 64 L52 64 Q56 64 56 58 L56 44 Q56 40 52 40 L42 40 L42 24 Q42 20 38 20 Q34 20 34 24 L34 40 L30 40 Q28 38 26 36 Q22 32 18 34 Q14 36 16 42 L20 52Z" stroke={color} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      {/* Sparkle = treatment */}
      <path d="M48 12 L49.5 16.5 L54 18 L49.5 19.5 L48 24 L46.5 19.5 L42 18 L46.5 16.5 Z" stroke={color} strokeWidth="1.2" fill="none"/>
      <path d="M58 26 L59 29 L62 30 L59 31 L58 34 L57 31 L54 30 L57 29 Z" stroke={color} strokeWidth="1" fill="none" opacity="0.6"/>
    </svg>
  );
}