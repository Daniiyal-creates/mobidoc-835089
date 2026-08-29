import { View } from 'react-native';
import { Chip } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import type { Severity } from '@/lib/types';
import { cn } from '@/lib/utils';

interface SeverityConfig {
  color: 'success' | 'warning' | 'danger';
  variant: 'soft' | 'primary';
  dot: string;
}

/**
 * `critical` is deliberately the only filled variant — a swollen battery
 * should not look like a scratched screen.
 */
const SEVERITY_CONFIG: Record<Severity, SeverityConfig> = {
  low: { color: 'success', variant: 'soft', dot: 'bg-success' },
  medium: { color: 'warning', variant: 'soft', dot: 'bg-warning' },
  high: { color: 'danger', variant: 'soft', dot: 'bg-danger' },
  critical: { color: 'danger', variant: 'primary', dot: 'bg-danger-foreground' },
};

interface SeverityBadgeProps {
  severity: Severity;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function SeverityBadge({ severity, size = 'sm', className }: SeverityBadgeProps) {
  const { t } = useTranslation();
  const config = SEVERITY_CONFIG[severity];

  return (
    <Chip
      size={size}
      color={config.color}
      variant={config.variant}
      className={className}
      accessibilityRole="text"
      accessibilityLabel={t(`severity.a11y.${severity}`)}
    >
      <View className={cn('size-1.5 rounded-full', config.dot)} />
      <Chip.Label>{t(`severity.${severity}`)}</Chip.Label>
    </Chip>
  );
}
