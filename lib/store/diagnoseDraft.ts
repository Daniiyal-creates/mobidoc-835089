import { create } from 'zustand';

import type { DamagePhoto, InputLanguage } from '@/lib/types';

/** Two input steps; the result lives on its own route. */
export const DIAGNOSE_STEPS = 2;

interface DiagnoseDraftState {
  step: 1 | 2;
  brand: string;
  model: string;
  description: string;
  /** Optional photo of the damage, sent to the model with the description. */
  photo: DamagePhoto | null;
  /** Set when the user corrects the language MobiDoc detected. */
  languageOverride: InputLanguage | null;
  setBrand: (brand: string) => void;
  setModel: (model: string) => void;
  setDescription: (description: string) => void;
  setPhoto: (photo: DamagePhoto | null) => void;
  appendSymptom: (symptom: string) => void;
  setLanguageOverride: (language: InputLanguage | null) => void;
  goToStep: (step: 1 | 2) => void;
  reset: () => void;
}

/** Session-only: a half-finished description is not worth persisting. */
export const useDiagnoseDraftStore = create<DiagnoseDraftState>()((set, get) => ({
  step: 1,
  brand: '',
  model: '',
  description: '',
  photo: null,
  languageOverride: null,
  setBrand: (brand) => set({ brand }),
  setModel: (model) => set({ model }),
  setDescription: (description) => set({ description }),
  setPhoto: (photo) => set({ photo }),
  appendSymptom: (symptom) => {
    const current = get().description.trim();
    if (current.length === 0) {
      set({ description: symptom });
      return;
    }
    if (current.toLowerCase().includes(symptom.toLowerCase())) return;
    set({ description: `${current}. ${symptom}` });
  },
  setLanguageOverride: (languageOverride) => set({ languageOverride }),
  goToStep: (step) => set({ step }),
  reset: () =>
    set({
      step: 1,
      brand: '',
      model: '',
      description: '',
      photo: null,
      languageOverride: null,
    }),
}));

export function useDraftIsDeviceValid(): boolean {
  return useDiagnoseDraftStore((state) => state.brand.length > 0 && state.model.trim().length > 1);
}

export function useDraftIsIssueValid(): boolean {
  return useDiagnoseDraftStore((state) => state.description.trim().length >= 4);
}
