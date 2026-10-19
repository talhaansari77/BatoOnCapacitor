import React from "react";
import { useLocation } from "./LocationContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Globe } from "lucide-react";

export default function LocationSelector({ compact = false }) {
  const { location, setLocation, locations, language, setLanguage, isRTL } = useLocation();

  const handleLanguageChange = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);

  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setLocation(location === 'dubai' ? 'kuwait' : 'dubai')}
          className="flex items-center gap-1.5 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MapPin className="w-3.5 h-3.5" />
          <span className="font-medium">
            {isRTL ? locations[location].nameAr : locations[location].name}
          </span>
        </button>
        <button
          aria-label={language==="en"?"Switch to Arabic":"التبديل إلى الإنجليزية"} onClick={handleLanguageChange}
          className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span className="font-medium">{isRTL ? 'الإنجليزية' : 'Arabic'}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={location} onValueChange={setLocation}>
        <SelectTrigger className="w-auto h-8 text-xs border-gray-200 gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-gray-500" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.values(locations).map((loc) => (
            <SelectItem key={loc.id} value={loc.id}>
              {isRTL ? `${loc.nameAr}، ${loc.countryAr}` : `${loc.name}, ${loc.country}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-auto h-8 text-xs border-gray-200 gap-1.5">
          <Globe className="w-3.5 h-3.5 text-gray-500" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{isRTL ? "الإنجليزية" : "English"}</SelectItem>
          <SelectItem value="ar">{isRTL ? "العربية" : "Arabic"}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}