import React from "react";
import {customerDate} from "@/lib/customerDate";
import { useLocation } from "@/components/LocationContext";
import useShopCurrency from "@/hooks/useShopCurrency";

export default function ShopCurrencySelector({disabled = false}) {
  const {currency, preference, setCurrency, rateDate, refresh} = useShopCurrency();
  const {t, isRTL, currentLocation} = useLocation();
  return <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#7c8689]">
    <label className="flex items-center gap-2">
      {t("Currency", "العملة")}
      <select disabled={disabled} aria-label={t("Shop currency", "عملة المتجر")} value={preference}
        onChange={event => setCurrency(event.target.value)}
        className="bg-white border border-[#eeebe6] rounded-xl min-h-11 px-3 py-2 text-[#333435]">
        <option value="auto">{t("Location default", "تلقائياً حسب الموقع")} ({currentLocation.currency})</option>
        {["AED", "KWD", "USD"].map(code => <option key={code} value={code}>{code}</option>)}
      </select>
    </label>
    <span>{currency}{rateDate && ` · ${customerDate(rateDate,isRTL)}`}</span>
    <details className="w-full">
      <summary className="min-h-11 py-3 underline cursor-pointer">{t("Rate details", "تفاصيل أسعار الصرف")}</summary>
      <a href="https://www.exchangerate-api.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center min-h-11 py-2 underline">{t("Rates by Exchange Rate API", "أسعار الصرف من Exchange Rate API")}</a>
      {" "}
      <button type="button" disabled={disabled} onClick={() => refresh()} className="underline">{t("Refresh rates", "تحديث أسعار الصرف")}</button>
    </details>
  </div>;
}