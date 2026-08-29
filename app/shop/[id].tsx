import { Image, Linking, Platform, ScrollView, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Card, Chip, Separator, Skeleton, Typography, useThemeColor } from 'heroui-native';
import { Globe, Navigation, Phone, Star, Store } from 'lucide-react-native';

import { EmptyState } from '@/components/EmptyState';
import { useLocale } from '@/hooks/useDirection';
import { ApiError, fetchShopDetails } from '@/lib/api';
import { useSearchCoords } from '@/lib/store/location';
import { formatDistance, formatRating } from '@/lib/utils';

export default function ShopDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, textAlign } = useLocale();
  const coords = useSearchCoords();
  const [accent, muted, warning, accentForeground] = useThemeColor([
    'accent',
    'muted',
    'warning',
    'accent-foreground',
  ]);

  const shopQuery = useQuery({
    queryKey: ['shop-details', id],
    queryFn: () => fetchShopDetails(id, coords),
    enabled: Boolean(id),
    staleTime: 10 * 60 * 1000,
  });

  const shop = shopQuery.data;

  if (shopQuery.isPending) {
    return (
      <View className="gap-3 px-5 pt-4">
        <Skeleton className="h-7 w-2/3 rounded-xl" />
        <Skeleton className="h-4 w-1/2 rounded-lg" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-24 w-full rounded-2xl" />
      </View>
    );
  }

  if (!shop) {
    const message =
      shopQuery.error instanceof ApiError ? t(shopQuery.error.messageKey) : t('errors.unexpected');

    return (
      <View className="flex-1 justify-center">
        <EmptyState
          icon={Store}
          title={t('shops.shopNotFound')}
          description={message}
          actionLabel={t('common.retry')}
          onAction={() => void shopQuery.refetch()}
        />
      </View>
    );
  }

  const openDirections = () => {
    const destination = `${shop.latitude},${shop.longitude}`;
    const url =
      Platform.OS === 'ios'
        ? `http://maps.apple.com/?daddr=${destination}&q=${encodeURIComponent(shop.name)}`
        : `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
    void Linking.openURL(url);
  };

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-5 px-5 pt-4 pb-12">
      <Stack.Screen options={{ title: shop.name }} />

      <View className="gap-2">
        <Typography type="h3" weight="bold" className={textAlign}>
          {shop.name}
        </Typography>

        <View className="flex-row flex-wrap items-center gap-x-3 gap-y-2">
          {shop.rating === null ? (
            <Typography type="body-sm" color="muted">
              {t('shops.noRating')}
            </Typography>
          ) : (
            <View className="flex-row items-center gap-1">
              <Star size={14} color={warning} fill={warning} />
              <Typography type="body-sm" weight="semibold">
                {formatRating(shop.rating)}
              </Typography>
              <Typography type="body-xs" color="muted">
                {t('shops.reviews', { count: shop.reviewCount })}
              </Typography>
            </View>
          )}

          {shop.distanceMeters > 0 ? (
            <Typography type="body-xs" color="muted">
              {formatDistance(shop.distanceMeters)}
            </Typography>
          ) : null}

          {shop.openNow === null ? null : (
            <Chip size="sm" variant="soft" color={shop.openNow ? 'success' : 'danger'}>
              <Chip.Label>{shop.openNow ? t('shops.openNow') : t('shops.closed')}</Chip.Label>
            </Chip>
          )}
        </View>

        <Typography type="body-sm" color="muted" className={textAlign}>
          {shop.address}
        </Typography>
      </View>

      {shop.photos.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-3"
        >
          {shop.photos.map((uri) => (
            <Image
              key={uri}
              source={{ uri }}
              style={{ width: 220, height: 150, borderRadius: 16 }}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
            />
          ))}
        </ScrollView>
      ) : null}

      <View className="flex-row gap-3">
        <Button
          className="flex-1"
          isDisabled={!shop.phone}
          onPress={() => shop.phone && void Linking.openURL(`tel:${shop.phone}`)}
        >
          <Phone size={16} color={accentForeground} />
          <Button.Label>{t('shops.call')}</Button.Label>
        </Button>
        <Button variant="secondary" className="flex-1" onPress={openDirections}>
          <Navigation size={16} color={accent} />
          <Button.Label>{t('shops.directions')}</Button.Label>
        </Button>
      </View>

      {!shop.phone ? (
        <Typography type="body-xs" color="muted" className={textAlign}>
          {t('shops.noPhone')}
        </Typography>
      ) : null}

      <Card>
        <Card.Body className="gap-2">
          <Typography type="body-sm" weight="semibold" className={textAlign}>
            {t('shops.hours')}
          </Typography>
          {shop.weekdayHours.length === 0 ? (
            <Typography type="body-sm" color="muted">
              {t('shops.noHours')}
            </Typography>
          ) : (
            shop.weekdayHours.map((line) => (
              <Typography key={line} type="body-sm" color="muted">
                {line}
              </Typography>
            ))
          )}
        </Card.Body>
      </Card>

      {shop.website ? (
        <Button variant="ghost" onPress={() => shop.website && void Linking.openURL(shop.website)}>
          <Globe size={16} color={muted} />
          <Button.Label>{t('shops.website')}</Button.Label>
        </Button>
      ) : null}

      {shop.reviews.length > 0 ? (
        <View className="gap-3">
          <Typography type="h5" weight="bold" className={textAlign}>
            {t('shops.reviewsTitle')}
          </Typography>
          <Card>
            <Card.Body className="gap-4">
              {shop.reviews.map((review, index) => (
                <View
                  key={`${review.author}-${review.relativeTime}-${review.text}`}
                  className="gap-1.5"
                >
                  {index > 0 ? <Separator className="mb-2" /> : null}
                  <View className="flex-row items-center justify-between gap-3">
                    <Typography type="body-sm" weight="semibold" className="flex-1">
                      {review.author}
                    </Typography>
                    <View className="flex-row items-center gap-1">
                      <Star size={12} color={warning} fill={warning} />
                      <Typography type="body-xs" color="muted">
                        {formatRating(review.rating)}
                      </Typography>
                    </View>
                  </View>
                  <Typography type="body-sm" color="muted">
                    {review.text}
                  </Typography>
                  {review.relativeTime ? (
                    <Typography type="body-xs" color="muted">
                      {review.relativeTime}
                    </Typography>
                  ) : null}
                </View>
              ))}
            </Card.Body>
          </Card>
        </View>
      ) : null}
    </ScrollView>
  );
}
