import { useTranslation } from 'react-i18next';

import { useUiLanguage } from '@/lib/store/settings';

export interface Direction {
  isRTL: boolean;
  /** For `writingDirection` / `direction` style props. */
  direction: 'ltr' | 'rtl';
  /** Row class that mirrors when the language is RTL. */
  row: 'flex-row' | 'flex-row-reverse';
  /** Text alignment class for body copy. */
  textAlign: 'text-left' | 'text-right';
  /** Chevron/arrow direction for "forward" affordances. */
  forwardIcon: 'chevron-right' | 'chevron-left';
}

/**
 * Layout direction driven by app state instead of `I18nManager.forceRTL`, which
 * only takes effect after an app restart. Screens compose these classes so the
 * language switch is instant.
 */
export function useDirection(): Direction {
  const language = useUiLanguage();
  const isRTL = language === 'ur';
  return {
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr',
    row: isRTL ? 'flex-row-reverse' : 'flex-row',
    textAlign: isRTL ? 'text-right' : 'text-left',
    forwardIcon: isRTL ? 'chevron-left' : 'chevron-right',
  };
}

/** `t` plus direction, since almost every screen needs both. */
export function useLocale() {
  const { t } = useTranslation();
  const direction = useDirection();
  return { t, ...direction };
}
