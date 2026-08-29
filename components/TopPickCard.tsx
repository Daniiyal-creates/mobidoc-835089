import { Linking, Pressable, View } from 'react-native';
import { Button, Card, Chip, Typography, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Star, Trophy } from 'lucide-react-native';

import { ShopReasonChips, ShopScoreBar } from '@/components/ShopReasons';
import { pickReviewQuote, type RankedShop } from '@/lib/recommendation';
import { formatDistance, formatRating } from '@/lib/utils';

interface TopPickCardProps {
  entry: RankedShop;
  onPress: () => void;
}

/**
 * The single shop MobiDoc would send a friend to: highest blended score across
 * ratings, review volume, what reviewers say, and how far it is. The reasons are
 * always on screen so the pick never looks arbitrary.
 */
export function TopPickCard({ entry, onPress }: TopPickCardProps) {
  const { t } = useTranslation();
  const { shop, score } = entry;
  const [accent, warning, muted] = useThemeColor(['accent', 'warning', 'muted']);
  const quote = pickReviewQuote(shop.reviewSnippets);

  return (
    <Card className="border-accent/40 bg-accent/5 border">
      <Card.Body className="gap-3">
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`${t('shops.topPick')}: ${shop.name}`}
          className="gap-3"
        >
          <View className="flex-row items-center justify-between gap-2">
            <View className="flex-row items-center gap-1.5">
              <Trophy size={14} color={accent} />
              <Typography type="body-xs" weight="semibold" className="text-accent">
                {t('shops.topPick')}
              </Typography>
            </View>
            <Typography
              type="body-xs"
              color="muted"
              accessibilityLabel={t('shops.scoreA11y', { score: score.score })}
            >
              {t('shops.scoreLabel', { score: score.score })}
            </Typography>
          </View>

          <View className="gap-1.5">
            <Typography type="h5" weight="bold" numberOfLines={2}>
              {shop.name}
            </Typography>

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

              {shop.openNow === null ? null : (
                <Chip size="sm" variant="soft" color={shop.openNow ? 'success' : 'danger'}>
                  <Chip.Label>{shop.openNow ? t('shops.openNow') : t('shops.closed')}</Chip.Label>
                </Chip>
              )}
            </View>
          </View>

          <ShopScoreBar score={score.score} />
          <ShopReasonChips score={score} limit={4} />

          {quote ? (
            <Typography type="body-xs" color="muted">
              {t('shops.reviewQuote', { quote })}
            </Typography>
          ) : null}
        </Pressable>

        <View className="flex-row gap-2">
          <Button variant="secondary" size="sm" className="flex-1" onPress={onPress}>
            <Button.Label>{t('shops.viewShop')}</Button.Label>
          </Button>
          {shop.phone ? (
            <Button
              variant="tertiary"
              size="sm"
              className="flex-1"
              onPress={() => void Linking.openURL(`tel:${shop.phone}`)}
            >
              <Phone size={14} color={accent} />
              <Button.Label>{t('shops.call')}</Button.Label>
            </Button>
          ) : null}
        </View>
      </Card.Body>
    </Card>
  );
}
