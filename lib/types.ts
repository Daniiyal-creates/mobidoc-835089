/**
 * Shared domain types for MobiDoc.
 *
 * The `Diagnosis` shape mirrors the JSON schema the `diagnose` backend
 * automation asks Gemini for, so server output can be validated against it
 * before it ever reaches a screen.
 */

/** How urgent the problem is. `critical` means stop using the phone now. */
export type Severity = 'low' | 'medium' | 'high' | 'critical';

/** Language the user typed in. Roman Urdu is Urdu written in Latin script. */
export type InputLanguage = 'en' | 'ur' | 'ur-roman';

/** Languages the app chrome is translated into. */
export type UiLanguage = 'en' | 'ur';

export interface Device {
  brand: string;
  model: string;
}

export interface DiagnoseInput {
  brand: string;
  model: string;
  /** Free-text problem description in English, Urdu, or Roman Urdu. */
  description: string;
  /** City used to localize pricing; omitted when location is unavailable. */
  city?: string;
  /** Set when the user corrects the auto-detected language. */
  languageOverride?: InputLanguage;
}

export type SafetyFlagKind =
  | 'swollen_battery'
  | 'water_damage'
  | 'overheating'
  | 'burning_smell'
  | 'screen_glass_shards'
  | 'charging_hazard'
  | 'data_loss_risk'
  | 'other';

export interface SafetyFlag {
  kind: SafetyFlagKind;
  /** Short headline, already in the user's language. */
  title: string;
  /** What to do right now, e.g. "stop charging the phone". */
  advice: string;
  severity: Severity;
}

export interface LikelyCause {
  title: string;
  explanation: string;
  /** 0-1 confidence that this is the cause. */
  likelihood: number;
}

export interface CostEstimate {
  currency: 'PKR';
  min: number;
  max: number;
  partsMin: number;
  partsMax: number;
  labourMin: number;
  labourMax: number;
  /** City the rates are based on, when known. */
  city?: string;
}

export interface Diagnosis {
  id: string;
  /** ISO timestamp. */
  createdAt: string;
  device: Device;
  /** The user's original words, kept so history entries stay readable. */
  description: string;
  detectedLanguage: InputLanguage;
  issueTitle: string;
  summary: string;
  /** 0-1 confidence in the overall diagnosis. */
  confidence: number;
  severity: Severity;
  likelyCauses: LikelyCause[];
  safetyFlags: SafetyFlag[];
  cost: CostEstimate;
  /** Human phrasing, e.g. "30-60 minutes" or "same day". */
  repairTime: string;
  diyFeasible: boolean;
  diyNote?: string;
  questionsForShop: string[];
}

export interface RepairShop {
  /** Google Places place id. */
  id: string;
  name: string;
  address: string;
  rating: number | null;
  reviewCount: number;
  distanceMeters: number;
  openNow: boolean | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  /** Google Maps link used for the directions action. */
  mapsUri?: string;
}

export interface ShopReview {
  author: string;
  rating: number;
  text: string;
  relativeTime: string;
}

export interface ShopDetails extends RepairShop {
  /** One string per weekday, already formatted by Places. */
  weekdayHours: string[];
  website: string | null;
  photos: string[];
  reviews: ShopReview[];
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface HistoryEntry {
  id: string;
  savedAt: string;
  diagnosis: Diagnosis;
}
