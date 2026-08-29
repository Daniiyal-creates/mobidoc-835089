/**
 * WhatsApp handoff.
 *
 * Repairs in Pakistan get arranged on WhatsApp, so a diagnosis is only useful
 * if the customer can hand it to a shop in one tap. These helpers turn a
 * diagnosis into a short, plain message and open it in a chat.
 */

import { Linking, Platform, Share } from 'react-native';
import type { TFunction } from 'i18next';

import type { Diagnosis } from '@/lib/types';
import { formatPkrRange } from '@/lib/utils';

/** How the message ended up leaving the app, so the UI can explain itself. */
export type SendOutcome = 'whatsapp' | 'shared' | 'failed';

/**
 * Places lists Pakistani numbers as `+92 42 …`, `042 …` or `0300 …`; WhatsApp
 * wants digits only, country code included and no leading zero.
 */
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;

  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);

  if (digits.length < 7) return null;
  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  // A bare mobile number such as 3001234567 is still a Pakistani number.
  if (digits.length === 10 && digits.startsWith('3')) return `92${digits}`;

  return digits;
}

function joinLines(lines: (string | null)[]): string {
  return lines.filter((line): line is string => line !== null).join('\n');
}

/**
 * The full handoff: what the phone is, what the customer said, what MobiDoc
 * thinks, the expected range, and the questions worth asking at the counter.
 */
export function buildRepairMessage(diagnosis: Diagnosis, t: TFunction, shopName?: string): string {
  const { cost } = diagnosis;
  const topCause = diagnosis.likelyCauses[0];
  const questions = diagnosis.questionsForShop.slice(0, 3);
  const needsParts = cost.partsMax > 0;

  return joinLines([
    shopName ? t('whatsapp.greetingShop') : t('whatsapp.greeting'),
    '',
    t('whatsapp.device', { device: `${diagnosis.device.brand} ${diagnosis.device.model}` }),
    t('whatsapp.problem', { problem: diagnosis.description }),
    '',
    t('whatsapp.reading', { issue: diagnosis.issueTitle }),
    topCause ? t('whatsapp.cause', { cause: topCause.title }) : null,
    t('whatsapp.cost', { range: formatPkrRange(cost.min, cost.max) }),
    needsParts
      ? t('whatsapp.costParts', {
          parts: formatPkrRange(cost.partsMin, cost.partsMax),
          labour: formatPkrRange(cost.labourMin, cost.labourMax),
        })
      : null,
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
 * Opens the message in WhatsApp. The app scheme is tried first because it goes
 * straight to the chat; `wa.me` is the fallback that also works in a browser,
 * and the system share sheet is the last resort when WhatsApp is missing.
 */
export async function sendToWhatsApp(message: string, phone?: string | null): Promise<SendOutcome> {
  const number = toWhatsAppNumber(phone);
  const text = encodeURIComponent(message);

  if (Platform.OS !== 'web') {
    const appUrl = `whatsapp://send?${number ? `phone=${number}&` : ''}text=${text}`;
    try {
      await Linking.openURL(appUrl);
      return 'whatsapp';
    } catch {
      // WhatsApp is not installed; fall through to the web link.
    }
  }

  try {
    await Linking.openURL(`https://wa.me/${number ?? ''}?text=${text}`);
    return 'whatsapp';
  } catch {
    // Neither route opened — offer the message through any other app.
  }

  try {
    await Share.share({ message });
    return 'shared';
  } catch {
    return 'failed';
  }
}
