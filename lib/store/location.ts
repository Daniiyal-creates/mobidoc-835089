import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import { type PakistanCity, findCity } from '@/lib/cities';
import { DEMO_CITY, DEMO_COORDS } from '@/lib/demo/seed';
import { useDemoStore } from '@/lib/store/demo';
import type { Coordinates } from '@/lib/types';

export type LocationPermission = 'unknown' | 'granted' | 'denied';
export type LocationError = 'permission_denied' | 'unavailable' | null;

interface LocationState {
  permission: LocationPermission;
  coords: Coordinates | null;
  /** City resolved by reverse geocoding, used to localize pricing. */
  city: string | null;
  /** Picked by hand when location is unavailable. */
  manualCity: PakistanCity | null;
  isLocating: boolean;
  error: LocationError;
  requestLocation: () => Promise<boolean>;
  refreshPermission: () => Promise<void>;
  setManualCity: (cityName: string) => void;
  clearManualCity: () => void;
  clearError: () => void;
}

export const useLocationStore = create<LocationState>()(
  persist(
    (set) => ({
      permission: 'unknown',
      coords: null,
      city: null,
      manualCity: null,
      isLocating: false,
      error: null,
      requestLocation: async () => {
        set({ isLocating: true, error: null });
        try {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== Location.PermissionStatus.GRANTED) {
            set({ permission: 'denied', isLocating: false, error: 'permission_denied' });
            return false;
          }

          const position = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };

          let city: string | null = null;
          try {
            const [place] = await Location.reverseGeocodeAsync(coords);
            city = place?.city ?? place?.subregion ?? place?.region ?? null;
          } catch {
            city = null;
          }

          set({ permission: 'granted', coords, city, isLocating: false, error: null });
          return true;
        } catch {
          set({ isLocating: false, error: 'unavailable' });
          return false;
        }
      },
      refreshPermission: async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          set({
            permission:
              status === Location.PermissionStatus.GRANTED
                ? 'granted'
                : status === Location.PermissionStatus.DENIED
                  ? 'denied'
                  : 'unknown',
          });
        } catch {
          set({ permission: 'unknown' });
        }
      },
      setManualCity: (cityName) => {
        const city = findCity(cityName);
        if (!city) return;
        set({ manualCity: city, error: null });
      },
      clearManualCity: () => set({ manualCity: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'mobidoc.location',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ city: state.city, manualCity: state.manualCity }),
    },
  ),
);

/** GPS coordinates when available, otherwise the hand-picked city centre. */
export function useSearchCoords(): Coordinates | null {
  // Demo mode stands in for GPS, so the shops screen works with location denied.
  const isDemo = useDemoStore((state) => state.enabled);

  const coords = useLocationStore(
    useShallow((state) => {
      if (state.coords) return state.coords;
      if (state.manualCity) {
        return { latitude: state.manualCity.latitude, longitude: state.manualCity.longitude };
      }
      return null;
    }),
  );

  return coords ?? (isDemo ? DEMO_COORDS : null);
}

export function getSearchCoords(): Coordinates | null {
  const state = useLocationStore.getState();
  if (state.coords) return state.coords;
  if (state.manualCity) {
    return { latitude: state.manualCity.latitude, longitude: state.manualCity.longitude };
  }
  return useDemoStore.getState().enabled ? DEMO_COORDS : null;
}

/** City name used for pricing context; undefined when nothing is known yet. */
export function useEffectiveCity(): string | undefined {
  const isDemo = useDemoStore((state) => state.enabled);
  const city = useLocationStore((state) => state.city ?? state.manualCity?.name ?? undefined);

  return city ?? (isDemo ? DEMO_CITY.name : undefined);
}

export function getEffectiveCity(): string | undefined {
  const state = useLocationStore.getState();
  const city = state.city ?? state.manualCity?.name ?? undefined;

  return city ?? (useDemoStore.getState().enabled ? DEMO_CITY.name : undefined);
}
