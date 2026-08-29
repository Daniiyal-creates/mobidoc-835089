import { View } from 'react-native';
import { Typography, useThemeColor } from 'heroui-native';
import { FlaskConical } from 'lucide-react-native';

import { useLocale } from '@/hooks/useDirection';
import { useDemoMode } from '@/lib/store/demo';
import { cn } from '@/lib/utils';

interface DemoBannerProps {
  className?: string;
}

/**
 * Shown on every screen that can display seeded content while demo mode is on,
 * so a sample answer is never mistaken for a live one.
 */
export function DemoBanner({ className }: DemoBannerProps) {
  const isDemo = useDemoMode();
  const { t, textAlign, row } = useLocale();
  const caution = useThemeColor('warning');

  if (!isDemo) return null;

  return (
    <View
      className={cn(
        'bg-severity-caution-soft border-severity-caution items-center gap-2 rounded-2xl border px-3 py-2',
        row,
        className,
      )}
      accessibilityRole="alert"
    >
      <FlaskConical size={14} color={caution} />
      <Typography type="body-xs" weight="medium" className={cn('flex-1', textAlign)}>
        {t('demo.banner')}
      </Typography>
    </View>
  );
}
