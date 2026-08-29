import { View } from 'react-native';
import { Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

interface StepHeaderProps {
  /** 1-based current step. */
  step: number;
  totalSteps: number;
  title: string;
  subtitle?: string;
  className?: string;
}

export function StepHeader({ step, totalSteps, title, subtitle, className }: StepHeaderProps) {
  const { t } = useTranslation();
  const segments = Array.from({ length: totalSteps }, (_, index) => index);

  return (
    <View className={cn('gap-3', className)}>
      <View
        className="flex-row gap-1.5"
        accessible
        accessibilityLabel={t('common.stepOf', { step, total: totalSteps })}
      >
        {segments.map((index) => (
          <View
            key={index}
            className={cn('h-1 flex-1 rounded-full', index < step ? 'bg-accent' : 'bg-default')}
          />
        ))}
      </View>
      <View className="gap-1">
        <Typography type="body-xs" color="muted" weight="medium">
          {t('common.stepOf', { step, total: totalSteps })}
        </Typography>
        <Typography type="h4" weight="bold">
          {title}
        </Typography>
        {subtitle ? (
          <Typography type="body-sm" color="muted">
            {subtitle}
          </Typography>
        ) : null}
      </View>
    </View>
  );
}
