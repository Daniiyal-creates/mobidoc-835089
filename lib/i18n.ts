import i18next, { changeLanguage, use as registerI18nextPlugin } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';

import { en } from '@/lib/locales/en';
import { ur } from '@/lib/locales/ur';
import type { UiLanguage } from '@/lib/types';

export const UI_LANGUAGES: readonly UiLanguage[] = ['en', 'ur'];

/** Urdu when the device asks for it, English otherwise. */
export function deviceUiLanguage(): UiLanguage {
  for (const locale of getLocales()) {
    if (locale.languageCode === 'ur') return 'ur';
  }
  return 'en';
}

if (!i18next.isInitialized) {
  void registerI18nextPlugin(initReactI18next).init({
    resources: {
      en: { translation: en },
      ur: { translation: ur },
    },
    lng: deviceUiLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export function applyUiLanguage(language: UiLanguage): void {
  if (i18next.language !== language) {
    void changeLanguage(language);
  }
}

export { i18next };
