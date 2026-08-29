import { View } from 'react-native';
import { Button, Card, Typography, useThemeColor } from 'heroui-native';
import { Check, MapPinned } from 'lucide-react-native';

import { cn } from '@/lib/utils';

interface PermissionPrimerProps {
  title: string;
  description: string;
  /** Short reasons shown as a checklist, so the OS prompt is not a surprise. */
  points?: string[];
  allowLabel: string;
  onAllow: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  isBusy?: boolean;
  className?: string;
}

export function PermissionPrimer({
  title,
  description,
  points,
  allowLabel,
  onAllow,
  secondaryLabel,
  onSecondary,
  isBusy = false,
  className,
}: PermissionPrimerProps) {
  const [accent, success] = useThemeColor(['accent', 'success']);

  return (
    <Card className={cn('w-full', className)}>
      <Card.Body className="gap-4">
        <View className="bg-accent-soft size-12 items-center justify-center rounded-2xl">
          <MapPinned size={24} color={accent} />
        </View>

        <View className="gap-1.5">
          <Typography type="h5" weight="bold">
            {title}
          </Typography>
          <Typography type="body-sm" color="muted">
            {description}
          </Typography>
        </View>

        {points?.length ? (
          <View className="gap-2">
            {points.map((point) => (
              <View key={point} className="flex-row items-start gap-2">
                <Check size={16} color={success} />
                <Typography type="body-sm" className="flex-1">
                  {point}
                </Typography>
              </View>
            ))}
          </View>
        ) : null}

        <View className="gap-2">
          <Button onPress={onAllow} isDisabled={isBusy}>
            <Button.Label>{allowLabel}</Button.Label>
          </Button>
          {secondaryLabel && onSecondary ? (
            <Button variant="ghost" onPress={onSecondary}>
              <Button.Label>{secondaryLabel}</Button.Label>
            </Button>
          ) : null}
        </View>
      </Card.Body>
    </Card>
  );
}
