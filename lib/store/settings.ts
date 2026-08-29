import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { applyUiLanguage, deviceUiLanguage } from '@/lib/i18n';
import type { UiLanguage } from '@/lib/types';

interface SettingsState {
  /** Resolved app language actually in use. */
  language: UiLanguage;
  /** When true, `language` tracks the device locale on every launch. */
  followDeviceLanguage: boolean;
  /** Set once the location primer has been shown, so it isn't repeated. */
  hasSeenLocationPrimer: boolean;
  setLanguage: (language: UiLanguage) => void;
  followDevice: () => void;
  markLocationPrimerSeen: () => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: deviceUiLanguage(),
      followDeviceLanguage: true,
      hasSeenLocationPrimer: false,
      setLanguage: (language) => {
        applyUiLanguage(language);
        set({ language, followDeviceLanguage: false });
      },
      followDevice: () => {
        const language = deviceUiLanguage();
        applyUiLanguage(language);
        set({ language, followDeviceLanguage: true });
      },
      markLocationPrimerSeen: () => set({ hasSeenLocationPrimer: true }),
    }),
    {
      name: 'mobidoc.settings',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        const language = state.followDeviceLanguage ? deviceUiLanguage() : state.language;
        applyUiLanguage(language);
        if (language !== state.language) {
          useSettingsStore.setState({ language });
        }
      },
    },
  ),
);

export function useUiLanguage(): UiLanguage {
  return useSettingsStore((state) => state.language);
}
