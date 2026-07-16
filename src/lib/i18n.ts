import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/auth.en.json';
import ur from '@/locales/auth.ur.json';
import ar from '@/locales/auth.ar.json';
import es from '@/locales/auth.es.json';
import fr from '@/locales/auth.fr.json';

export const LANGUAGE_STORAGE_KEY = 'app_language';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  resources: {
    en: { translation: en },
    ur: { translation: ur },
    ar: { translation: ar },
    es: { translation: es },
    fr: { translation: fr },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;