/**
 * How MobiDoc decides which repair shop to recommend.
 *
 * The backend returns raw Places signals (star rating, review volume, distance,
 * open-now, a few review excerpts) and this module turns them into one score
 * plus the plain-language reasons behind it. Keeping the maths on the client
 * means the same numbers drive the list order, the "top pick" card and the
 * explanation on a shop's own screen — and re-sorting costs no network call.
 *
 * Three things move the score:
 *   - ratings, smoothed towards the market average so one 5-star review cannot
 *     outrank a shop with hundreds of happy customers,
 *   - review volume, log-scaled because 300 reviews is not twice as convincing
 *     as 150,
 *   - distance, decaying smoothly so a clearly better shop a little further
 *     away can still win.
 *
 * What reviewers actually say nudges the score a few points either way, and
 * being open right now is a small tie-breaker.
 */

import type { RepairShop, ReviewSnippet } from '@/lib/types';

/** Order the user can put the list in. `recommended` is the blended score. */
export type SortMode = 'recommended' | 'rating' | 'distance';

export const SORT_MODES: readonly SortMode[] = ['recommended', 'rating', 'distance'];

/** Reason codes; each maps to a `shops.reasons.*` translation key. */
export type ShopReason =
  | 'topRated'
  | 'goodRating'
  | 'manyReviews'
  | 'wellReviewed'
  | 'veryClose'
  | 'nearby'
  | 'openNow'
  | 'fewReviews'
  | 'unrated'
  | 'farther';

/** Themes mined from review text; maps to a `shops.themes.*` translation key. */
export type ReviewTheme =
  | 'fairPricing'
  | 'genuineParts'
  | 'fastService'
  | 'skilledStaff'
  | 'priceComplaints'
  | 'serviceComplaints';

export interface ShopScore {
  /** 0-100, comparable only against other shops in the same search. */
  score: number;
  /** Each 0-1, so the UI can show what carried the score. */
  ratingScore: number;
  reviewScore: number;
  distanceScore: number;
  /** Rating pulled towards the market average by review count; null if unrated. */
  trustedRating: number | null;
  /** Positive reasons, strongest first. */
  strengths: ShopReason[];
  /** Things worth knowing before choosing this shop. */
  cautions: ShopReason[];
  positiveThemes: ReviewTheme[];
  negativeThemes: ReviewTheme[];
}

export interface RankedShop {
  shop: RepairShop;
  score: ShopScore;
  /** Position in the recommended order, 1-based; stable across sort modes. */
  rank: number;
}

const RATING_PRIOR = 3.9;
const RATING_PRIOR_WEIGHT = 8;
const REVIEW_VOLUME_TARGET = 150;
const DISTANCE_DECAY_METERS = 1500;

const WEIGHT_RATING = 0.45;
const WEIGHT_REVIEWS = 0.18;
const WEIGHT_DISTANCE = 0.32;
const OPEN_NOW_BONUS = 0.04;
const THEME_BONUS = 0.03;
const THEME_BONUS_CAP = 0.06;
const THEME_PENALTY = 0.05;
const THEME_PENALTY_CAP = 0.1;

/** Score given to a shop with no ratings at all: unproven, not bad. */
const UNRATED_QUALITY = 0.35;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

interface ThemeRule {
  theme: ReviewTheme;
  tone: 'positive' | 'negative';
  /** Matched against review text; English and Roman Urdu wording both appear. */
  pattern: RegExp;
}

const THEME_RULES: readonly ThemeRule[] = [
  {
    theme: 'fairPricing',
    tone: 'positive',
    pattern: /(reasonab|fair price|fair rate|honest|affordab|good price|best price|munasib|sasta)/i,
  },
  {
    theme: 'genuineParts',
    tone: 'positive',
    pattern: /(genuine|original part|original panel|oem|authentic|asli|quality part)/i,
  },
  {
    theme: 'fastService',
    tone: 'positive',
    pattern:
      /(same day|within an hour|in 30 min|quick(ly)? (fix|repair|service)|fast service|jaldi|foran|prompt)/i,
  },
  {
    theme: 'skilledStaff',
    tone: 'positive',
    pattern: /(expert|skilled|professional|experienced|knowledgeab|best technician|mahir|master)/i,
  },
  {
    theme: 'priceComplaints',
    tone: 'negative',
    pattern: /(overcharg|over charge|overprice|too expensive|very expensive|rip ?off|mehnga|loot)/i,
  },
  {
    theme: 'serviceComplaints',
    tone: 'negative',
    pattern:
      /(fake|duplicate part|cheat|fraud|scam|rude|worst|waste of (time|money)|damaged my|not recommend|never go)/i,
  },
];

/**
 * Themes worth surfacing from a handful of review excerpts. Praise only counts
 * from a 4-5 star review and complaints only from a 1-3 star one, so a phrase
 * quoted out of context does not flip the meaning.
 */
export function reviewThemes(snippets: ReviewSnippet[] | undefined): {
  positive: ReviewTheme[];
  negative: ReviewTheme[];
} {
  const positive = new Set<ReviewTheme>();
  const negative = new Set<ReviewTheme>();

  for (const snippet of snippets ?? []) {
    for (const rule of THEME_RULES) {
      if (!rule.pattern.test(snippet.text)) continue;
      if (rule.tone === 'positive' && snippet.rating >= 4) positive.add(rule.theme);
      if (rule.tone === 'negative' && snippet.rating <= 3) negative.add(rule.theme);
    }
  }

  return { positive: Array.from(positive).slice(0, 2), negative: Array.from(negative).slice(0, 1) };
}

/** Rating adjusted for how many people actually left one. */
export function trustedRating(rating: number | null, reviewCount: number): number | null {
  if (rating === null) return null;
  return (
    (rating * reviewCount + RATING_PRIOR * RATING_PRIOR_WEIGHT) /
    (reviewCount + RATING_PRIOR_WEIGHT)
  );
}

/** The one number the recommendation is built on, plus why it came out that way. */
export function scoreShop(shop: RepairShop): ShopScore {
  const trusted = trustedRating(shop.rating, shop.reviewCount);

  const ratingScore = trusted === null ? UNRATED_QUALITY : clamp01((trusted - 2.5) / 2.5);
  const reviewScore = clamp01(Math.log1p(shop.reviewCount) / Math.log1p(REVIEW_VOLUME_TARGET));
  const distanceScore = 1 / (1 + Math.max(0, shop.distanceMeters) / DISTANCE_DECAY_METERS);

  const { positive, negative } = reviewThemes(shop.reviewSnippets);
  const themeAdjustment =
    Math.min(THEME_BONUS_CAP, positive.length * THEME_BONUS) -
    Math.min(THEME_PENALTY_CAP, negative.length * THEME_PENALTY);

  const raw =
    ratingScore * WEIGHT_RATING +
    reviewScore * WEIGHT_REVIEWS +
    distanceScore * WEIGHT_DISTANCE +
    (shop.openNow === true ? OPEN_NOW_BONUS : 0) +
    themeAdjustment;

  const strengths: ShopReason[] = [];
  if (trusted !== null && trusted >= 4.4 && shop.reviewCount >= 20) strengths.push('topRated');
  else if (trusted !== null && trusted >= 4) strengths.push('goodRating');
  if (shop.reviewCount >= 100) strengths.push('manyReviews');
  else if (shop.reviewCount >= 25) strengths.push('wellReviewed');
  if (shop.distanceMeters <= 1000) strengths.push('veryClose');
  else if (shop.distanceMeters <= 3000) strengths.push('nearby');
  if (shop.openNow === true) strengths.push('openNow');

  const cautions: ShopReason[] = [];
  if (shop.rating === null) cautions.push('unrated');
  else if (shop.reviewCount < 5) cautions.push('fewReviews');
  if (shop.distanceMeters > 8000) cautions.push('farther');

  return {
    score: Math.round(clamp01(raw) * 100),
    ratingScore,
    reviewScore,
    distanceScore,
    trustedRating: trusted,
    strengths,
    cautions,
    positiveThemes: positive,
    negativeThemes: negative,
  };
}

/** Scores every shop and assigns the recommended rank. */
export function rankShops(shops: RepairShop[]): RankedShop[] {
  return shops
    .map((shop) => ({ shop, score: scoreShop(shop), rank: 0 }))
    .sort((a, b) => b.score.score - a.score.score || a.shop.distanceMeters - b.shop.distanceMeters)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));
}

/** Re-orders an already ranked list. Ranks stay as assigned by `rankShops`. */
export function sortRanked(ranked: RankedShop[], mode: SortMode): RankedShop[] {
  if (mode === 'recommended') return ranked;

  const copy = [...ranked];
  if (mode === 'distance') {
    copy.sort(
      (a, b) => a.shop.distanceMeters - b.shop.distanceMeters || b.score.score - a.score.score,
    );
    return copy;
  }

  copy.sort((a, b) => {
    const aRating = a.score.trustedRating ?? 0;
    const bRating = b.score.trustedRating ?? 0;
    return bRating - aRating || b.shop.reviewCount - a.shop.reviewCount;
  });
  return copy;
}

/**
 * A short quote to show under the top pick: a positive, substantial review,
 * preferring one that mentions something concrete about the service.
 */
export function pickReviewQuote(snippets: ReviewSnippet[] | undefined): string | null {
  const candidates = (snippets ?? []).filter(
    (snippet) => snippet.rating >= 4 && snippet.text.length >= 40,
  );
  if (candidates.length === 0) return null;

  const withTheme = candidates.find((snippet) =>
    THEME_RULES.some((rule) => rule.tone === 'positive' && rule.pattern.test(snippet.text)),
  );
  const chosen = withTheme ?? candidates[0];
  return chosen.text.length > 160 ? `${chosen.text.slice(0, 157).trimEnd()}…` : chosen.text;
}
