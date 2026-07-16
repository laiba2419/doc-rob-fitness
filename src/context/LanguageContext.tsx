import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

import i18n, { LANGUAGE_STORAGE_KEY } from '@/lib/i18n';

export type LanguageCode = 'en' | 'ur' | 'ar' | 'es' | 'fr';

export const RTL_LANGUAGES: LanguageCode[] = ['ur', 'ar'];

type LanguageContextType = {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  isRTL: boolean;
  loading: boolean;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  isRTL: false,
  loading: true,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const saved = (await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY)) as LanguageCode | null;
      if (saved) {
        setLanguageState(saved);
        i18n.changeLanguage(saved);
      }
      setLoading(false);
    })();
  }, []);

  const setLanguage = async (lang: LanguageCode) => {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
    await i18n.changeLanguage(lang);
    setLanguageState(lang);
    // Note: we intentionally do NOT call I18nManager.forceRTL here.
    // Forcing native RTL requires a full app restart, which Expo Go
    // cannot reliably do (only a hard close/reopen works). Instead,
    // screens should use the `isRTL` flag below to manually flip
    // textAlign / flexDirection where needed -- no restart required.
  };

  const isRTL = RTL_LANGUAGES.includes(language);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, loading }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);