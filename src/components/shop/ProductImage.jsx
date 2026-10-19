import React, { useState } from "react";
import { Package } from "lucide-react";
import { useLocation } from "../LocationContext";

export default function ProductImage({ src, name, className = "w-full h-full object-cover" }) {
  const [failedSource, setFailedSource] = useState(null);
  const { t } = useLocation();
  if (!src || failedSource === src) return (
    <div role="img" aria-label={name} className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#f9f8f6] p-3 text-center">
      <Package aria-hidden="true" className="w-10 h-10 text-[#c4aa8b]" />
      <span className="text-xs text-[#7c8689]">{t("Image unavailable", "الصورة غير متاحة")}</span>
    </div>
  );
  return <img src={src} alt={name} className={className} onError={() => setFailedSource(src)} />;
}
