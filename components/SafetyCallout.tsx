import { View } from 'react-native';
import { Typography, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react-native';

import type { SafetyFlag } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SafetyCalloutProps {
  flags: SafetyFlag[];
  className?: string;
}

/**
 * Hazards are shown in a single unmissable red block that always sits above the
 * price. A swollen battery must never be something the user scrolls past.
 */
export function SafetyCallout({ flags, className }: SafetyCalloutProps) {
  const { t } = useTranslation();
  const danger = useThemeColor('danger');

  if (flags.length === 0) return null;

  return (
    <View
      className={cn(
        'bg-severity-danger-soft border-severity-danger gap-3 rounded-2xl border p-4',
        className,
      )}
      accessible
      accessibilityRole="alert"
    >
      <View className="flex-row items-center gap-2">
        <AlertTriangle size={18} color={danger} />
        <Typography type="body-sm" weight="bold" className="text-severity-danger-text">
          {t('result.safetyTitle')}
        </Typography>
      </View>

      <View className="gap-3">
        {flags.map((flag) => (
          <View key={`${flag.kind}-${flag.title}`} className="gap-1">
            <Typography type="body-sm" weight="semibold">
              {flag.title}
            </Typography>
            <Typography type="body-sm" color="muted">
              {flag.advice}
            </Typography>
          </View>
        ))}
      </View>
    </View>
  );
}
