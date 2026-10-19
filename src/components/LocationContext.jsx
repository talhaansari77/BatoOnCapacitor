import React, { createContext, useContext, useState, useEffect } from "react";

const LocationContext = createContext();
const readPreference = key => {try{return localStorage.getItem(key);}catch{return null;}};
const savePreference = (key,value) => {try{if(value===null)localStorage.removeItem(key);else localStorage.setItem(key,value);}catch{/* Preferences remain usable in memory. */}};

const LOCATIONS = {
  dubai: {
    id: 'dubai',
    name: 'Dubai',
    nameAr: 'دبي',
    country: 'UAE',
    countryAr: 'الإمارات',
    currency: 'AED',
    currencySymbol: 'AED',
    currencySymbolAr: 'د.إ',
    phone: '+971 4 XXX XXXX',
    address: 'Dubai, UAE'
  },
  kuwait: {
    id: 'kuwait',
    name: 'Kuwait',
    nameAr: 'الكويت',
    country: 'Kuwait',
    countryAr: 'الكويت',
    currency: 'KWD',
    currencySymbol: 'KWD',
    currencySymbolAr: 'د.ك',
    phone: '+965 XXXX XXXX',
    address: 'Kuwait City, Kuwait'
  }
};

const LANGUAGES = {
  en: { id: 'en', name: 'English', nameNative: 'English', dir: 'ltr' },
  ar: { id: 'ar', name: 'Arabic', nameNative: 'العربية', dir: 'rtl' }
};

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    const saved = readPreference('bato_location');
    return saved && LOCATIONS[saved] ? saved : 'dubai';
  });

  const [shopCurrencyPreference, setShopCurrencyPreference] = useState(() => {
    const saved = readPreference("bato_shop_currency");
    return ["AED", "KWD", "USD"].includes(saved) ? saved : "auto";
  });
  const setShopCurrency = value => {
    if (["auto", "AED", "KWD", "USD"].includes(value)) setShopCurrencyPreference(value);
  };
  useEffect(() => {
    if (shopCurrencyPreference === "auto") savePreference("bato_shop_currency",null);
    else savePreference("bato_shop_currency", shopCurrencyPreference);
  }, [shopCurrencyPreference]);

  const [language, setLanguage] = useState(() => {
    const saved = readPreference('bato_language');
    return saved && LANGUAGES[saved] ? saved : 'ar';
  });

  useEffect(() => {
    savePreference('bato_location', location);
  }, [location]);

  useEffect(() => {
    savePreference('bato_language', language);
    document.documentElement.dir = LANGUAGES[language].dir;
    document.documentElement.lang = language;
    // Force re-render by updating a data attribute
    document.documentElement.setAttribute('data-lang', language);
  }, [language]);

  const currentLocation = LOCATIONS[location];
  const currentLanguage = LANGUAGES[language];
  const isRTL = language === 'ar';

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '-';
    const symbol = isRTL ? currentLocation.currencySymbolAr : currentLocation.currencySymbol;
    return isRTL 
      ? `${amount.toLocaleString('ar-AE')} ${symbol}`
      : `${symbol} ${amount.toLocaleString()}`;
  };

  const t = (en, ar) => (language === 'ar' ? ar : en);

  return (
    <LocationContext.Provider value={{
      location,
      setLocation,
      currentLocation,
      shopCurrency: shopCurrencyPreference === "auto" ? currentLocation.currency : shopCurrencyPreference,
      shopCurrencyPreference,
      setShopCurrency,
      locations: LOCATIONS,
      language,
      setLanguage,
      currentLanguage,
      languages: LANGUAGES,
      isRTL,
      formatCurrency,
      t
    }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within LocationProvider');
  }
  return context;
}

export { LOCATIONS };