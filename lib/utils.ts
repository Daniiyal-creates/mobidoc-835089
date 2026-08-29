import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Short unique id for locally created records (diagnoses, history entries). */
export function createId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
}

/** Thin space + en dash reads better than a hyphen for numeric ranges. */
const RANGE_DASH = '\u2013';

function groupDigits(value: number): string {
  return Math.round(value)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** `4500` -> `Rs 4,500`. */
export function formatPkr(value: number): string {
  return `Rs ${groupDigits(value)}`;
}

/**
 * `4500, 7000` -> `Rs 4,500 – 7,000`.
 * Always a range: MobiDoc never shows a single exact price.
 */
export function formatPkrRange(min: number, max: number): string {
  if (min === max) return formatPkr(min);
  return `Rs ${groupDigits(min)} ${RANGE_DASH} ${groupDigits(max)}`;
}

/** `450` -> `450 m`, `1240` -> `1.2 km`. */
export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters / 10) * 10} m`;
  return `${(meters / 1000).toFixed(meters < 10_000 ? 1 : 0)} km`;
}

/** `4.35` -> `4.4`; null ratings render as an em dash by the caller. */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/** Straight-line distance in metres between two coordinates. */
export function distanceMeters(
  from: { latitude: number; longitude: number },
  to: { latitude: number; longitude: number },
): number {
  const earthRadius = 6_371_000;
  const dLat = toRadians(to.latitude - from.latitude);
  const dLon = toRadians(to.longitude - from.longitude);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.latitude)) * Math.cos(toRadians(to.latitude)) * Math.sin(dLon / 2) ** 2;
  return Math.round(earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
