import React from "react";

/**
 * Shared intentional empty state (item 24).
 * One honest, warm surface reused across Messages, Orders, photos, Academy and appointments —
 * with a distinction between "nothing here yet" and "no results for your filters".
 */
export default function BatoEmptyState({ icon: Icon, title, description, action, tone = "warm" }) {
  return (
    <div
      role="status"
      data-bato-empty-tone={tone}
      className={`bato-empty-state text-center py-8 px-5 rounded-2xl ${tone==="warm"?"border border-[#c4aa8b]/25 bg-white/80":""}`}
    >
      {Icon && <Icon className="w-10 h-10 mx-auto mb-3 text-[#c4aa8b]" aria-hidden="true" />}
      <p className={`text-base font-semibold ${tone==="inverse"?"text-white":"text-[#333435]"}`}>{title}</p>
      {description && (
        <p className={`text-sm mt-1 leading-relaxed max-w-xs mx-auto ${tone==="inverse"?"text-[#eeebe6]":"text-[#7c8689]"}`}>{description}</p>
      )}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}