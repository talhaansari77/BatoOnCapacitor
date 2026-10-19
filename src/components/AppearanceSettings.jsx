import React, {useId} from "react";
import StyleChooser from "@/components/appearance/StyleChooser";
import {useVisualStyle} from "@/components/appearance/VisualStyleProvider";
import { useTheme } from "next-themes";
import { Monitor, Sun, Moon } from "lucide-react";
import { useLocation } from "@/components/LocationContext";

export default function AppearanceSettings({showStyles = true}) {
  const { theme = "system" } = useTheme();
  const {setAppearance,syncState,retrySync} = useVisualStyle();
  const id=useId();
  const { t } = useLocation();
  const options = [
    { value: "system", label: t("System", "النظام"), Icon: Monitor },
    { value: "light", label: t("Light", "فاتح"), Icon: Sun },
    { value: "dark", label: t("Dark", "داكن"), Icon: Moon },
  ];
  return (
    <div className="bato-appearance-settings space-y-5">
    <fieldset className="bato-appearance space-y-3">
      <legend className="font-semibold text-sm">{t("Appearance", "المظهر")}</legend>
      <p className="text-xs text-muted-foreground">{t("Choose your look. System follows your device settings.", "اختر المظهر المناسب لك. خيار النظام يتبع إعدادات جهازك.")}</p>
      <div className="grid grid-cols-3 gap-2">
        {options.map(({ value, label, Icon }) => (
          <label key={value} className="bato-theme-option">
            <input type="radio" name={id} value={value} checked={theme === value} onChange={() => setAppearance(value)} />
            <span><Icon size={19} aria-hidden="true" /><span>{label}</span></span>
          </label>
        ))}
      </div>
    </fieldset>
    {showStyles && <StyleChooser />}
    {syncState === "error" && <div role="status" className="text-sm"><p>{t("Applied here. We couldn’t save it to your account yet.", "تم تطبيق اختيارك هنا. لم نتمكن من حفظه في حسابك بعد.")}</p><button type="button" className="underline min-h-11" onClick={()=>retrySync().catch(()=>{})}>{t("Try saving again", "أعد محاولة الحفظ")}</button></div>}
    </div>
  );
}
