import { View } from 'react-native';
import { Chip, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import type { ShopScore } from '@/lib/recommendation';

interface ShopReasonChipsProps {
  score: ShopScore;
  /** How many chips to render. Cautions always keep a slot. */
  limit?: number;
}

/**
 * The plain-language "why" behind a shop's recommendation score: what it does
 * well, what reviewers keep mentioning, and anything worth knowing first.
 */
export function ShopReasonChips({ score, limit = 3 }: ShopReasonChipsProps) {
  const { t } = useTranslation();

  const warnings = [
    ...score.negativeThemes.map((theme) => ({
      key: `theme-${theme}`,
      label: t(`shops.themes.${theme}`),
      color: 'warning' as const,
    })),
    ...score.cautions.map((caution) => ({
      key: `caution-${caution}`,
      label: t(`shops.reasons.${caution}`),
      color: 'warning' as const,
    })),
  ].slice(0, 1);

  const positives = [
    ...score.strengths.map((strength) => ({
      key: `strength-${strength}`,
      label: t(`shops.reasons.${strength}`),
      color: 'accent' as const,
    })),
    ...score.positiveThemes.map((theme) => ({
      key: `theme-${theme}`,
      label: t(`shops.themes.${theme}`),
      color: 'success' as const,
    })),
  ].slice(0, Math.max(0, limit - warnings.length));

  const chips = [...positives, ...warnings];
  if (chips.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-1.5">
      {chips.map((chip) => (
        <Chip key={chip.key} size="sm" variant="soft" color={chip.color}>
          <Chip.Label>{chip.label}</Chip.Label>
        </Chip>
      ))}
    </View>
  );
}

/** Compact `82/100` readout with a spoken label that explains the number. */
export function ShopScoreValue({ score }: { score: number }) {
  const { t } = useTranslation();

  return (
    <Typography
      type="body-xs"
      color="muted"
      weight="medium"
      accessibilityLabel={t('shops.scoreA11y', { score })}
    >
      {t('shops.scoreLabel', { score })}
    </Typography>
  );
}

/** Thin bar showing the same score visually, used on the top pick card. */
export function ShopScoreBar({ score }: { score: number }) {
  return (
    <View className="bg-default h-1.5 w-full overflow-hidden rounded-full">
      <View className="bg-accent h-full rounded-full" style={{ width: `${score}%` }} />
    </View>
  );
}
