import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslations from '@/locales/en.json';
import frTranslations from '@/locales/fr.json';
import ptTranslations from '@/locales/pt.json';

if (!i18n.isInitialized) {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources: {
        en: {
          translation: enTranslations,
        },
        fr: {
          translation: frTranslations,
        },
        pt: {
          translation: ptTranslations,
        },
      },
      fallbackLng: {
        'fr-FR': ['fr', 'en'],
        'fr-CA': ['fr', 'en'],
        'pt-BR': ['pt', 'en'],
        'pt-PT': ['pt', 'en'],
        'en-US': ['en'],
        'en-GB': ['en'],
        default: ['en'],
      },
      supportedLngs: ['en', 'fr', 'pt'],
      // Normalize language codes (e.g., 'fr-FR' -> 'fr', 'en-US' -> 'en')
      load: 'languageOnly',
      // Allow matching region codes to base language codes
      nonExplicitSupportedLngs: true,
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
      },
      interpolation: {
        escapeValue: false,
      },
    });
}

export default i18n;

