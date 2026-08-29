import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { demoHistoryEntries } from '@/lib/demo/seed';
import { useHistoryStore } from '@/lib/store/history';
import { useSettingsStore } from '@/lib/store/settings';

interface DemoState {
  /** When true, every backend call is answered from `lib/demo/seed.ts`. */
  enabled: boolean;
  hydrated: boolean;
  setEnabled: (enabled: boolean) => void;
}

/**
 * Demo mode: the whole app runs on seeded data with no internet, no GPS and no
 * API keys. Off by default, switched on by hand in Settings, and every screen
 * shows a banner while it is on so sample answers are never mistaken for live
 * ones.
 */
export const useDemoStore = create<DemoState>()(
  persist(
    (set) => ({
      enabled: false,
      hydrated: false,
      setEnabled: (enabled) => {
        set({ enabled });
        if (enabled) {
          seedHistory();
        } else {
          useHistoryStore.getState().removeDemo();
        }
      },
    }),
    {
      name: 'mobidoc.demo',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ enabled: state.enabled }),
      onRehydrateStorage: () => () => {
        useDemoStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Reads outside React, for the API wrappers. */
export function isDemoMode(): boolean {
  return useDemoStore.getState().enabled;
}

export function useDemoMode(): boolean {
  return useDemoStore((state) => state.enabled);
}

function seedHistory(): void {
  const language = useSettingsStore.getState().language;
  useHistoryStore.getState().seedDemo(demoHistoryEntries(language));
}

/**
 * Seeded history is rebuilt rather than restored, so the sample entries always
 * read as "today" and "yesterday" — a demo should never open on stale dates.
 * It waits for both stores to finish loading, whichever order that happens in.
 */
function reseedWhenReady(): void {
  if (!useDemoStore.getState().hydrated || !useHistoryStore.getState().hydrated) return;
  if (!useDemoStore.getState().enabled) return;
  seedHistory();
}

useDemoStore.subscribe((state, previous) => {
  if (state.hydrated !== previous.hydrated) reseedWhenReady();
});

useHistoryStore.subscribe((state, previous) => {
  if (state.hydrated !== previous.hydrated) reseedWhenReady();
});

// Sample diagnoses are stored in one language, so a language switch has to
// rebuild them instead of leaving English text under an Urdu interface.
useSettingsStore.subscribe((state, previous) => {
  if (state.language !== previous.language && useDemoStore.getState().enabled) {
    seedHistory();
  }
});

reseedWhenReady();
