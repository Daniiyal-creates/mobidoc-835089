/**
 * Client wrappers around the MobiDoc backend automations.
 *
 * Every network call goes through these functions so no screen ever talks to
 * Gemini or Google Places directly — the API keys live only on the server.
 */

import { bilt } from '@/lib/backend';
import type {
  Coordinates,
  DiagnoseInput,
  Diagnosis,
  RepairShop,
  ReviewSnippet,
  ShopDetails,
} from '@/lib/types';

/** The diagnosis fields the server produces; the client adds id, time, and device. */
export type DiagnosisPayload = Omit<Diagnosis, 'id' | 'createdAt' | 'device' | 'description'>;

/** Thrown for any automation failure, carrying a translation key for the UI. */
export class ApiError extends Error {
  readonly messageKey: string;

  constructor(messageKey: string, detail?: string) {
    super(detail ?? messageKey);
    this.name = 'ApiError';
    this.messageKey = messageKey;
  }
}

function hasContext(error: unknown): error is { context: unknown } {
  return typeof error === 'object' && error !== null && 'context' in error;
}

function hasErrorField(body: unknown): body is { error: string } {
  return (
    typeof body === 'object' && body !== null && 'error' in body && typeof body.error === 'string'
  );
}

/**
 * Failed invocations surface as a generic transport error, with the real
 * server error code sitting in the untouched Response on `context`.
 */
async function serverErrorCode(error: unknown): Promise<string | null> {
  const context = hasContext(error) ? error.context : undefined;
  if (!(context instanceof Response)) return null;
  try {
    const body: unknown = await context.clone().json();
    return hasErrorField(body) ? body.error : null;
  } catch {
    return null;
  }
}

async function invoke<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await bilt.functions.invoke<T>(name, { body });

  if (error) {
    const code = await serverErrorCode(error);
    throw new ApiError(code ? mapServerError(code) : 'errors.network', code ?? error.message);
  }
  if (!data) {
    throw new ApiError('errors.unexpected', `${name} returned no data`);
  }

  const failure = (data as { error?: string }).error;
  if (failure) {
    throw new ApiError(mapServerError(failure), failure);
  }

  return data;
}

/** Turns a server error code into the translation key the UI should show. */
function mapServerError(code: string): string {
  switch (code) {
    case 'description_too_short':
    case 'missing_fields':
      return 'errors.moreDetail';
    case 'diagnosis_failed':
      return 'errors.diagnosisFailed';
    case 'invalid_coordinates':
      return 'errors.locationUnavailable';
    case 'places_failed':
    case 'not_found':
      return 'errors.shopsFailed';
    case 'server_misconfigured':
      return 'errors.serverConfig';
    default:
      return 'errors.unexpected';
  }
}

function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Runs the Gemini diagnosis and returns a complete, screen-ready Diagnosis. */
export async function requestDiagnosis(input: DiagnoseInput): Promise<Diagnosis> {
  const data = await invoke<{ diagnosis: DiagnosisPayload }>('diagnose', { ...input });

  return {
    id: randomId(),
    createdAt: new Date().toISOString(),
    device: { brand: input.brand, model: input.model },
    description: input.description,
    ...data.diagnosis,
  };
}

/** Nearby repair shops with the signals the recommendation scorer needs. */
export async function fetchNearbyShops(
  coords: Coordinates,
  query?: string,
): Promise<{ shops: RepairShop[]; radiusMeters: number }> {
  const data = await invoke<{ shops: RepairShop[]; radiusMeters: number }>('nearby-shops', {
    latitude: coords.latitude,
    longitude: coords.longitude,
    ...(query ? { query } : {}),
  });

  return { shops: (data.shops ?? []).map(withReviewSnippets), radiusMeters: data.radiusMeters };
}

/**
 * Guarantees `reviewSnippets` exists and holds usable entries, so screens never
 * have to guard against an older cached payload or a Places tier without
 * review text.
 */
function withReviewSnippets<T extends RepairShop>(shop: T): T {
  const snippets = Array.isArray(shop.reviewSnippets) ? shop.reviewSnippets : [];

  return {
    ...shop,
    reviewSnippets: snippets
      .filter(
        (snippet): snippet is ReviewSnippet =>
          typeof snippet?.text === 'string' &&
          snippet.text.trim().length > 0 &&
          typeof snippet.rating === 'number',
      )
      .slice(0, 3),
  };
}

/** Full profile for one shop. Distance is relative to `coords` when provided. */
export async function fetchShopDetails(
  placeId: string,
  coords?: Coordinates | null,
): Promise<ShopDetails> {
  const data = await invoke<{ shop: ShopDetails }>('place-details', {
    placeId,
    ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
  });

  const reviews = Array.isArray(data.shop.reviews) ? data.shop.reviews : [];
  const existing = Array.isArray(data.shop.reviewSnippets) ? data.shop.reviewSnippets : [];

  // The details automation returns full reviews; reuse them as the snippets the
  // recommendation scorer reads, so the same reasons show on this screen.
  return withReviewSnippets({
    ...data.shop,
    reviews,
    reviewSnippets:
      existing.length > 0
        ? existing
        : reviews.map((review) => ({ rating: review.rating, text: review.text })),
  });
}
