import { View } from 'react-native';
import { Card, Chip, Separator, Typography } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react-native';
import { useThemeColor } from 'heroui-native';

import type { CostEstimate } from '@/lib/types';
import { formatPkrRange } from '@/lib/utils';

interface CostRangeCardProps {
  cost: CostEstimate;
  className?: string;
}

/**
 * Repair cost is always shown as a range split into parts and labour, with an
 * explicit "estimate, not a quote" line. Never a single exact number.
 */
export function CostRangeCard({ cost, className }: CostRangeCardProps) {
  const { t } = useTranslation();
  const muted = useThemeColor('muted');

  return (
    <Card className={className}>
      <Card.Body className="gap-3">
        <View className="flex-row items-center justify-between gap-2">
          <Typography type="body-sm" color="muted" weight="medium">
            {t('cost.title')}
          </Typography>
          {cost.city ? (
            <Chip size="sm" variant="secondary" color="default">
              <MapPin size={12} color={muted} />
              <Chip.Label>{cost.city}</Chip.Label>
            </Chip>
          ) : null}
        </View>

        <Typography type="h3" weight="bold">
          {formatPkrRange(cost.min, cost.max)}
        </Typography>

        <View className="flex-row items-stretch gap-3">
          <View className="flex-1 gap-1">
            <Typography type="body-xs" color="muted">
              {t('cost.parts')}
            </Typography>
            <Typography type="body-sm" weight="semibold">
              {formatPkrRange(cost.partsMin, cost.partsMax)}
            </Typography>
          </View>
          <Separator orientation="vertical" />
          <View className="flex-1 gap-1">
            <Typography type="body-xs" color="muted">
              {t('cost.labour')}
            </Typography>
            <Typography type="body-sm" weight="semibold">
              {formatPkrRange(cost.labourMin, cost.labourMax)}
            </Typography>
          </View>
        </View>

        <Typography type="body-xs" color="muted">
          {t('cost.disclaimer')}
        </Typography>
      </Card.Body>
    </Card>
  );
}
