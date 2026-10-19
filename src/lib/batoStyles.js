/**
 * Shared component-finish tokens (item 13) — scoped, mobile-first.
 * Applied explicitly alongside Tailwind classes on BATO clinical surfaces.
 * Deliberately NOT global selectors, so the Academy's blue-purple identity stays untouched.
 */
export const batoFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3a2e1e]/40 focus-visible:ring-offset-1";
export const batoCard = "rounded-2xl border border-[#eeebe6] bg-white shadow-sm";
export const batoInput = "min-h-11 rounded-xl";
// Pressed micro-state, defined once in index.css (.bato-press).
export const batoPress = "bato-press";