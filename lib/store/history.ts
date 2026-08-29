import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { DEMO_ENTRY_PREFIX } from '@/lib/demo/seed';
import type { Diagnosis, HistoryEntry } from '@/lib/types';
import { createId } from '@/lib/utils';

/** Older entries fall off so AsyncStorage never grows without bound. */
const MAX_ENTRIES = 50;

function isDemoEntry(entry: HistoryEntry): boolean {
  return entry.id.startsWith(DEMO_ENTRY_PREFIX);
}

interface HistoryState {
  entries: HistoryEntry[];
  hydrated: boolean;
  save: (diagnosis: Diagnosis) => HistoryEntry;
  remove: (id: string) => void;
  clear: () => void;
  /** Swaps in the seeded demo entries; real entries are left untouched. */
  seedDemo: (entries: HistoryEntry[]) => void;
  /** Removes only the seeded entries. */
  removeDemo: () => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      hydrated: false,
      save: (diagnosis) => {
        const existing = get().entries.find((entry) => entry.diagnosis.id === diagnosis.id);
        if (existing) return existing;

        const entry: HistoryEntry = {
          id: createId(),
          savedAt: new Date().toISOString(),
          diagnosis,
        };
        set((state) => ({ entries: [entry, ...state.entries].slice(0, MAX_ENTRIES) }));
        return entry;
      },
      remove: (id) =>
        set((state) => ({ entries: state.entries.filter((entry) => entry.id !== id) })),
      clear: () => set({ entries: [] }),
      seedDemo: (demoEntries) =>
        set((state) => ({
          entries: [...demoEntries, ...state.entries.filter((entry) => !isDemoEntry(entry))]
            .sort((first, second) => second.savedAt.localeCompare(first.savedAt))
            .slice(0, MAX_ENTRIES),
        })),
      removeDemo: () =>
        set((state) => ({ entries: state.entries.filter((entry) => !isDemoEntry(entry)) })),
    }),
    {
      name: 'mobidoc.history',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ entries: state.entries }),
      onRehydrateStorage: () => () => {
        useHistoryStore.setState({ hydrated: true });
      },
    },
  ),
);

/** Reads outside React, e.g. when a route resolves a saved diagnosis by id. */
export function getSavedDiagnosis(diagnosisId: string): Diagnosis | undefined {
  return useHistoryStore.getState().entries.find((entry) => entry.diagnosis.id === diagnosisId)
    ?.diagnosis;
}

export function useSavedDiagnosis(diagnosisId: string | undefined): Diagnosis | undefined {
  return useHistoryStore((state) =>
    diagnosisId === undefined
      ? undefined
      : state.entries.find((entry) => entry.diagnosis.id === diagnosisId)?.diagnosis,
  );
}
