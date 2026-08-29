import { create } from 'zustand';

import { useSavedDiagnosis } from '@/lib/store/history';
import type { Diagnosis } from '@/lib/types';

interface ResultState {
  /** The diagnosis just returned by the server, before it is saved. */
  diagnosis: Diagnosis | null;
  setResult: (diagnosis: Diagnosis) => void;
  clear: () => void;
}

/**
 * Holds the freshly returned diagnosis for the session so the result route can
 * render it before the user decides whether to keep it in history.
 */
export const useResultStore = create<ResultState>()((set) => ({
  diagnosis: null,
  setResult: (diagnosis) => set({ diagnosis }),
  clear: () => set({ diagnosis: null }),
}));

/** Resolves a diagnosis id from saved history first, then the open session. */
export function useDiagnosisById(id: string | undefined): Diagnosis | undefined {
  const saved = useSavedDiagnosis(id);
  const session = useResultStore((state) => state.diagnosis);

  if (saved) return saved;
  return session && session.id === id ? session : undefined;
}
