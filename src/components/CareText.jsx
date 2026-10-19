import React from "react";
import { useLocation } from "./LocationContext";
import { selectCareLanguage, selectCareProse } from "@/lib/careArabic";

// Text-only localization: no DOM wrapper, spacing or layout changes.
export default function CareText({ value, prose = false }) {
  const { language } = useLocation();
  return prose ? selectCareProse(value, language) : selectCareLanguage(value, language);
}
