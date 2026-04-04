import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '../locales/en.json';
import ar from '../locales/ar.json';

const STORAGE_KEY = 'clinicLanguage';
const supportedLngs = ['en', 'ar'] as const;

const getInitialLanguage = () => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored && supportedLngs.includes(stored as typeof supportedLngs[number])) {
    return stored as typeof supportedLngs[number];
  }
  const browserLang = navigator.language?.slice(0, 2).toLowerCase();
  return supportedLngs.includes(browserLang as typeof supportedLngs[number]) ? browserLang as typeof supportedLngs[number] : 'en';
};

const setDocumentDirection = (language: string) => {
  if (typeof document === 'undefined') return;
  const dir = language === 'ar' ? 'rtl' : 'ltr';
  document.documentElement.lang = language;
  document.documentElement.dir = dir;
  window.localStorage.setItem(STORAGE_KEY, language);
};

const initialLanguage = getInitialLanguage();

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: ['en', 'ar'],
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

setDocumentDirection(initialLanguage);
i18n.on('languageChanged', setDocumentDirection);

export default i18n;
