import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations, locales } from './translations.js';

const LanguageContext = createContext(null);

const STORAGE_KEY = 'sahi-locale';

export function LanguageProvider({ children }) {
  const [locale, setLocale] = useState(() => {
    if (typeof window === 'undefined') return 'tr';
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return locales.includes(saved) ? saved : 'tr';
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, locale);
      document.documentElement.lang = locale;
    }
  }, [locale]);

  const t = useCallback(
    (key) => {
      const dict = translations[locale] || translations.tr;
      return dict[key] ?? key;
    },
    [locale]
  );

  const toggleLocale = useCallback(() => {
    setLocale((prev) => (prev === 'tr' ? 'en' : 'tr'));
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, toggleLocale, t }),
    [locale, t, toggleLocale]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside <LanguageProvider>');
  return ctx;
}