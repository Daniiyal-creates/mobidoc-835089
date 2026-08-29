import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Chip, Skeleton, Typography, useThemeColor } from 'heroui-native';
import { MapPin, Store } from 'lucide-react-native';

import { EmptyState } from '@/components/EmptyState';
import MapView from '@/components/MapView';
import { PermissionPrimer } from '@/components/PermissionPrimer';
import { ShopCard } from '@/components/ShopCard';
import { TopPickCard } from '@/components/TopPickCard';
import { useLocale } from '@/hooks/useDirection';
import { ApiError, fetchNearbyShops } from '@/lib/api';
import { rankShops, SORT_MODES, sortRanked, type SortMode } from '@/lib/recommendation';
import { useEffectiveCity, useLocationStore, useSearchCoords } from '@/lib/store/location';
import type { RepairShop } from '@/lib/types';
import { cn, formatDistance } from '@/lib/utils';

type ShopsView = 'list' | 'map';

/** A pick only leads the screen when there are other shops to beat. */
const MIN_SHOPS_FOR_TOP_PICK = 3;

/** Stable reference so `shops` doesn't change identity every render when there is no data yet. */
const NO_SHOPS: RepairShop[] = [];

function openShop(shop: RepairShop) {
  router.push({ pathname: '/shop/[id]', params: { id: shop.id } });
}

export default function ShopsScreen() {
  const { t } = useLocale();
  const coords = useSearchCoords();
  const city = useEffectiveCity();
  const isLocating = useLocationStore((state) => state.isLocating);
  const requestLocation = useLocationStore((state) => state.requestLocation);
  const [view, setView] = useState<ShopsView>('list');
  const [sort, setSort] = useState<SortMode>('recommended');
  const [accent, muted] = useThemeColor(['accent', 'muted']);

  const shopsQuery = useQuery({
    queryKey: [
      'nearby-shops',
      coords ? coords.latitude.toFixed(3) : null,
      coords ? coords.longitude.toFixed(3) : null,
    ],
    queryFn: () => {
      if (!coords) throw new Error('Location is required to search for shops.');
      return fetchNearbyShops(coords);
    },
    enabled: coords !== null,
    staleTime: 5 * 60 * 1000,
  });

  const shops = shopsQuery.data?.shops ?? NO_SHOPS;

  // Ranking is done once; changing the sort only re-orders the same scores.
  const ranked = useMemo(() => rankShops(shops), [shops]);
  const ordered = useMemo(() => sortRanked(ranked, sort), [ranked, sort]);

  const topPick =
    sort === 'recommended' && ordered.length >= MIN_SHOPS_FOR_TOP_PICK ? ordered[0] : null;
  const listData = topPick ? ordered.slice(1) : ordered;

  if (!coords) {
    return (
      <View className="flex-1 justify-center px-5">
        <PermissionPrimer
          title={t('location.primerTitle')}
          description={t('location.primerBody')}
          points={[
            t('location.pointRanking'),
            t('location.pointPricing'),
            t('location.pointPrivacy'),
          ]}
          allowLabel={t('location.allow')}
          onAllow={() => void requestLocation()}
          secondaryLabel={t('location.chooseCity')}
          onSecondary={() => router.push('/city-picker')}
          isBusy={isLocating}
        />
      </View>
    );
  }

  const radiusMeters = shopsQuery.data?.radiusMeters;

  const errorMessage = shopsQuery.error
    ? t(shopsQuery.error instanceof ApiError ? shopsQuery.error.messageKey : 'errors.unexpected')
    : null;

  return (
    <View className="flex-1">
      <View className="gap-3 px-5 pt-3 pb-2">
        <View className="flex-row flex-wrap items-center justify-between gap-2">
          <Chip
            size="sm"
            variant="secondary"
            color="default"
            onPress={() => router.push('/city-picker')}
            accessibilityRole="button"
          >
            <MapPin size={12} color={muted} />
            <Chip.Label>{city ?? t('location.cityPlaceholder')}</Chip.Label>
          </Chip>

          {radiusMeters ? (
            <Typography type="body-xs" color="muted">
              {t('shops.resultsIn', { distance: formatDistance(radiusMeters) })}
            </Typography>
          ) : null}
        </View>

        <View className="bg-default flex-row gap-1 rounded-2xl p-1">
          {(['list', 'map'] as const).map((option) => {
            const isActive = view === option;
            return (
              <Button
                key={option}
                variant={isActive ? 'primary' : 'ghost'}
                size="sm"
                className={cn('flex-1', !isActive && 'bg-transparent')}
                onPress={() => setView(option)}
                accessibilityState={{ selected: isActive }}
              >
                <Button.Label>
                  {option === 'list' ? t('shops.listTab') : t('shops.mapTab')}
                </Button.Label>
              </Button>
            );
          })}
        </View>

        {view === 'list' && shops.length > 0 ? (
          <View className="gap-2">
            <View className="flex-row flex-wrap gap-2">
              {SORT_MODES.map((mode) => {
                const isActive = sort === mode;
                return (
                  <Chip
                    key={mode}
                    size="sm"
                    variant={isActive ? 'primary' : 'tertiary'}
                    color={isActive ? 'accent' : 'default'}
                    onPress={() => setSort(mode)}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                  >
                    <Chip.Label>{t(`shops.sort.${mode}`)}</Chip.Label>
                  </Chip>
                );
              })}
            </View>

            {sort === 'recommended' ? (
              <Typography type="body-xs" color="muted">
                {t('shops.rankingNote')}
              </Typography>
            ) : null}
          </View>
        ) : null}
      </View>

      {shopsQuery.isPending ? (
        <View className="gap-3 px-5 pt-2">
          <Typography type="body-sm" color="muted">
            {t('shops.searching')}
          </Typography>
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-24 w-full rounded-2xl" />
          ))}
        </View>
      ) : errorMessage ? (
        <EmptyState
          icon={Store}
          title={t('common.somethingWentWrong')}
          description={errorMessage}
          actionLabel={t('common.retry')}
          onAction={() => void shopsQuery.refetch()}
        />
      ) : ordered.length === 0 ? (
        <EmptyState
          icon={Store}
          title={t('shops.emptyTitle')}
          description={t('shops.emptyBody')}
          actionLabel={t('location.chooseCity')}
          onAction={() => router.push('/city-picker')}
        />
      ) : view === 'list' ? (
        <FlatList
          data={listData}
          keyExtractor={(entry) => entry.shop.id}
          contentContainerClassName="gap-3 px-5 pb-8 pt-1"
          ListHeaderComponent={
            topPick ? (
              <View className="mb-3">
                <TopPickCard entry={topPick} onPress={() => openShop(topPick.shop)} />
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <ShopCard
              shop={item.shop}
              score={item.score}
              rank={item.rank}
              onPress={() => openShop(item.shop)}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={shopsQuery.isFetching}
              onRefresh={() => void shopsQuery.refetch()}
              tintColor={accent}
            />
          }
        />
      ) : (
        <MapView
          className="flex-1"
          showsUserLocation
          initialRegion={{
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.06,
            longitudeDelta: 0.06,
          }}
          markers={ranked.map((entry) => ({
            id: entry.shop.id,
            coordinate: { latitude: entry.shop.latitude, longitude: entry.shop.longitude },
            title: entry.rank === 1 ? `${t('shops.topPick')}: ${entry.shop.name}` : entry.shop.name,
            description: `${t('shops.scoreLabel', { score: entry.score.score })} · ${formatDistance(entry.shop.distanceMeters)}`,
            color: entry.rank === 1 ? 'green' : 'cyan',
            onPress: () => openShop(entry.shop),
            onCalloutPress: () => openShop(entry.shop),
          }))}
        />
      )}
    </View>
  );
}
