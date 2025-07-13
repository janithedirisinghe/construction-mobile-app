import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';

// Import translation files
import en from './locales/en.json';
import si from './locales/si.json';
import ta from './locales/ta.json';

const resources = {
  en: { translation: en },
  si: { translation: si },
  ta: { translation: ta },
};

i18n
  .use(initReactI18next)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return resources[language as keyof typeof resources]?.translation;
    })
  )
  .init({
    lng: 'en', // default language
    fallbackLng: 'en',
    debug: false,

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },

    react: {
      useSuspense: false,
    },

    resources,
  });

export default i18n;
