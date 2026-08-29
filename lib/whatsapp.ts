/**
 * WhatsApp handoff.
 *
 * Repairs in Pakistan get arranged on WhatsApp, so a diagnosis is only useful
 * if the customer can hand it to a shop in one tap. These helpers turn a
 * diagnosis into a short, plain message and open it in a chat.
 *
 * The fiddly part is the number. WhatsApp only accepts a mobile number in
 * E.164 form, and Google Places lists plenty of repair shops with a landline
 * (`042 3712 3456`) or with a national number whose country code is only
 * implied. Handing either of those to `wa.me` produces "the phone number is
 * invalid" inside WhatsApp, which reads to the user as the app being broken.
 * So numbers are classified before they are used, and a number that cannot
 * receive WhatsApp is never put in the link.
 */

import { Linking, Platform, Share } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import type { TFunction } from 'i18next';

import type { Diagnosis } from '@/lib/types';

/** How the message ended up leaving the app, so the UI can explain itself. */
export type SendOutcome = 'whatsapp' | 'shared' | 'copied' | 'failed';

/**
 * What we can do with a listed phone number.
 * - `mobile`: usable, `number` is E.164 digits with no `+`.
 * - `landline`: a real number, but WhatsApp cannot deliver to it.
 * - `none`: nothing usable was listed.
 */
export type WhatsAppTarget =
  | { kind: 'mobile'; number: string }
  | { kind: 'landline'; number: string }
  | { kind: 'none' };

/** Pakistan country code, used when a number is written in national form. */
const PK_CODE = '92';

/**
 * Turns one written number into E.164 digits (no `+`). National forms are read
 * as Pakistani, which is correct for this app: shop search, pricing and the
 * Places request are all region `PK`.
 */
function toInternationalDigits(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  const isInternational = trimmed.startsWith('+') || trimmed.startsWith('00');
  const allDigits = trimmed.replace(/\D/g, '');
  const digits = isInternational && allDigits.startsWith('00') ? allDigits.slice(2) : allDigits;

  if (digits.length < 8 || digits.length > 15) return null;
  if (isInternational) return digits;

  // 0300 1234567 / 042 3712 3456 -> drop the trunk zero, add the country code.
  if (digits.startsWith('0')) return `${PK_CODE}${digits.slice(1)}`;
  // Already carries the country code without a plus.
  if (digits.startsWith(PK_CODE) && digits.length >= 11) return digits;
  // A bare mobile number such as 3001234567.
  if (digits.length === 10 && digits.startsWith('3')) return `${PK_CODE}${digits}`;

  return null;
}

/**
 * Pakistani mobile numbers are `92 3xx xxxxxxx`; everything else on `92` is a
 * landline and cannot receive WhatsApp. For any other country code we cannot
 * tell from the digits alone, so we let WhatsApp be the judge.
 */
function isWhatsAppCapable(digits: string): boolean {
  if (!digits.startsWith(PK_CODE)) return true;
  return /^923\d{9}$/.test(digits);
}

/**
 * Picks the best number to message from the forms a shop listing gives us.
 * Pass the international form first — it needs no country guessing. Listings
 * sometimes pack two numbers into one string, so each part is considered.
 */
export function resolveWhatsAppTarget(
  ...candidates: (string | null | undefined)[]
): WhatsAppTarget {
  let landline: string | null = null;

  for (const candidate of candidates) {
    if (!candidate) continue;

    for (const part of candidate.split(/[,;/]|\bor\b/i)) {
      const digits = toInternationalDigits(part);
      if (!digits) continue;
      if (isWhatsAppCapable(digits)) return { kind: 'mobile', number: digits };
      landline ??= digits;
    }
  }

  return landline ? { kind: 'landline', number: landline } : { kind: 'none' };
}

function joinLines(lines: (string | null)[]): string {
  return lines.filter((line): line is string => line !== null).join('\n');
}

/**
 * The full handoff: what the phone is, what the customer said, what MobiDoc
 * thinks, and the questions worth asking at the counter. The cost estimate is
 * deliberately left out — the shop should quote its own price, and showing our
 * range first anchors the negotiation against the customer.
 */
export function buildRepairMessage(diagnosis: Diagnosis, t: TFunction, shopName?: string): string {
  const topCause = diagnosis.likelyCauses[0];
  const questions = diagnosis.questionsForShop.slice(0, 3);

  return joinLines([
    shopName ? t('whatsapp.greetingShop') : t('whatsapp.greeting'),
    '',
    t('whatsapp.device', { device: `${diagnosis.device.brand} ${diagnosis.device.model}` }),
    t('whatsapp.problem', { problem: diagnosis.description }),
    '',
    t('whatsapp.reading', { issue: diagnosis.issueTitle }),
    topCause ? t('whatsapp.cause', { cause: topCause.title }) : null,
    t('whatsapp.time', { time: diagnosis.repairTime }),
    diagnosis.photoUri ? t('whatsapp.photoNote') : null,
    questions.length > 0 ? '' : null,
    questions.length > 0 ? t('whatsapp.questionsTitle') : null,
    ...questions.map((question, index) => `${index + 1}. ${question}`),
    '',
    t('whatsapp.closing'),
    t('whatsapp.footer'),
  ]);
}

/** Used when someone messages a shop before running a diagnosis. */
export function buildEnquiryMessage(t: TFunction): string {
  return joinLines([t('whatsapp.greetingShop'), '', t('whatsapp.enquiry')]);
}

/**
 * On web, `Linking.openURL` swallows a blocked popup and still resolves, so the
 * user sees nothing happen. Calling `window.open` directly lets us detect it
 * and fall back to the clipboard instead of reporting success.
 */
function openNewTab(url: string): boolean {
  if (typeof window === 'undefined') return false;

  try {
    return window.open(url, '_blank', 'noopener,noreferrer') !== null;
  } catch {
    return false;
  }
}

async function copyMessage(message: string): Promise<boolean> {
  try {
    await Clipboard.setStringAsync(message);
    return true;
  } catch {
    return false;
  }
}

/**
 * Opens the message in WhatsApp.
 *
 * `number` must already be WhatsApp-capable E.164 digits from
 * `resolveWhatsAppTarget`; pass nothing to open WhatsApp with the text ready
 * and let the user pick the chat. The app scheme is tried first because it goes
 * straight to the conversation, `wa.me` next because it also works in a
 * browser, then the share sheet, and the clipboard as the last resort so the
 * message is never simply lost.
 */
export async function sendToWhatsApp(
  message: string,
  number?: string | null,
): Promise<SendOutcome> {
  const text = encodeURIComponent(message);
  const webUrl = `https://wa.me/${number ?? ''}?text=${text}`;

  if (Platform.OS === 'web') {
    if (openNewTab(webUrl)) return 'whatsapp';
    return (await copyMessage(message)) ? 'copied' : 'failed';
  }

  const appUrl = `whatsapp://send?${number ? `phone=${number}&` : ''}text=${text}`;

  for (const url of [appUrl, webUrl]) {
    try {
      await Linking.openURL(url);
      return 'whatsapp';
    } catch {
      // Nothing handles this URL; try the next route.
    }
  }

  try {
    await Share.share({ message });
    return 'shared';
  } catch {
    // No share sheet either.
  }

  return (await copyMessage(message)) ? 'copied' : 'failed';
}
