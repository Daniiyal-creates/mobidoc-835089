import { Pressable, View } from 'react-native';
import { Card, Chip, Typography, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { ChevronRight, MapPin, Star } from 'lucide-react-native';

import { ShopReasonChips, ShopScoreValue } from '@/components/ShopReasons';
import type { ShopScore } from '@/lib/recommendation';
import type { RepairShop } from '@/lib/types';
import { formatDistance, formatRating } from '@/lib/utils';

interface ShopCardProps {
  shop: RepairShop;
  onPress: () => void;
  /** Recommendation score; omitted only if a caller has none to show. */
  score?: ShopScore;
  /** Position in the recommended order. Shown for the first few shops. */
  rank?: number;
}

export function ShopCard({ shop, onPress, score, rank }: ShopCardProps) {
  const { t } = useTranslation();
  const [warning, muted] = useThemeColor(['warning', 'muted']);
  const showRank = typeof rank === 'number' && rank <= 3;

  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={shop.name}>
      <Card>
        <Card.Body className="flex-row items-center gap-3">
          <View className="flex-1 gap-1.5">
            <View className="flex-row items-center gap-2">
              {showRank ? (
                <Chip size="sm" variant="tertiary" color="default">
                  <Chip.Label>{t('shops.rankBadge', { rank })}</Chip.Label>
                </Chip>
              ) : null}
              <Typography type="body" weight="semibold" numberOfLines={1} className="flex-1">
                {shop.name}
              </Typography>
            </View>

            <View className="flex-row flex-wrap items-center gap-x-3 gap-y-1">
              {shop.rating === null ? (
                <Typography type="body-xs" color="muted">
                  {t('shops.noRating')}
                </Typography>
              ) : (
                <View className="flex-row items-center gap-1">
                  <Star size={13} color={warning} fill={warning} />
                  <Typography type="body-sm" weight="medium">
                    {formatRating(shop.rating)}
                  </Typography>
                  <Typography type="body-xs" color="muted">
                    {t('shops.reviews', { count: shop.reviewCount })}
                  </Typography>
                </View>
              )}

              <View className="flex-row items-center gap-1">
                <MapPin size={13} color={muted} />
                <Typography type="body-xs" color="muted">
                  {formatDistance(shop.distanceMeters)}
                </Typography>
              </View>
            </View>

            {score ? <ShopReasonChips score={score} limit={2} /> : null}

            <Typography type="body-xs" color="muted" numberOfLines={1}>
              {shop.address}
            </Typography>
          </View>

          <View className="items-end gap-2">
            {shop.openNow === null ? null : (
              <Chip size="sm" variant="soft" color={shop.openNow ? 'success' : 'danger'}>
                <Chip.Label>{shop.openNow ? t('shops.openNow') : t('shops.closed')}</Chip.Label>
              </Chip>
            )}
            {score ? <ShopScoreValue score={score.score} /> : null}
            <ChevronRight size={18} color={muted} />
          </View>
        </Card.Body>
      </Card>
    </Pressable>
  );
}
