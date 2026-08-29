import { useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Button, Chip, Skeleton, Typography, useThemeColor } from 'heroui-native';
import { MapPin, Store } from 'lucide-react-native';

import { EmptyState } from '@/components/EmptyState';
import MapView from '@/components/MapView';
import { PermissionPrimer } from '@/components/PermissionPrimer';
import { ShopCard } from '@/components/ShopCard';
import { useLocale } from '@/hooks/useDirection';
import { ApiError, fetchNearbyShops } from '@/lib/api';
import { useEffectiveCity, useLocationStore, useSearchCoords } from '@/lib/store/location';
import type { RepairShop } from '@/lib/types';
import { cn, formatDistance } from '@/lib/utils';

type ShopsView = 'list' | 'map';

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

  const shops = shopsQuery.data?.shops ?? [];
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
      ) : shops.length === 0 ? (
        <EmptyState
          icon={Store}
          title={t('shops.emptyTitle')}
          description={t('shops.emptyBody')}
          actionLabel={t('location.chooseCity')}
          onAction={() => router.push('/city-picker')}
        />
      ) : view === 'list' ? (
        <FlatList
          data={shops}
          keyExtractor={(shop) => shop.id}
          contentContainerClassName="gap-3 px-5 pb-8 pt-1"
          renderItem={({ item }) => <ShopCard shop={item} onPress={() => openShop(item)} />}
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
          markers={shops.map((shop) => ({
            id: shop.id,
            coordinate: { latitude: shop.latitude, longitude: shop.longitude },
            title: shop.name,
            description: formatDistance(shop.distanceMeters),
            color: 'cyan',
            onPress: () => openShop(shop),
            onCalloutPress: () => openShop(shop),
          }))}
        />
      )}
    </View>
  );
}
