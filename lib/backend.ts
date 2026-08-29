import { createClient, memoryStorage } from '@biltme/backend';

const url = process.env.EXPO_PUBLIC_BILT_URL;
const anonKey = process.env.EXPO_PUBLIC_BILT_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Backend credentials are missing. Reconnect bilt-cloud for this project.');
}

/**
 * Backend client. MobiDoc has no accounts in v1, so sessions are never
 * persisted — the client exists purely to invoke the server automations that
 * hold the Gemini and Google Places keys.
 */
export const bilt = createClient(url, anonKey, {
  auth: {
    storage: memoryStorage(),
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});
