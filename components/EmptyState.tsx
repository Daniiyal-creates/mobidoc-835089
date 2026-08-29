import { View } from 'react-native';
import { Button, Typography, useThemeColor } from 'heroui-native';
import type { LucideIcon } from 'lucide-react-native';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  const accent = useThemeColor('accent');

  return (
    <View className={cn('items-center gap-3 px-8 py-12', className)}>
      <View className="bg-accent-soft size-14 items-center justify-center rounded-full">
        <Icon size={26} color={accent} />
      </View>
      <Typography type="body" weight="semibold" align="center">
        {title}
      </Typography>
      {description ? (
        <Typography type="body-sm" color="muted" align="center">
          {description}
        </Typography>
      ) : null}
      {actionLabel && onAction ? (
        <Button variant="secondary" size="sm" onPress={onAction} className="mt-1">
          <Button.Label>{actionLabel}</Button.Label>
        </Button>
      ) : null}
    </View>
  );
}
