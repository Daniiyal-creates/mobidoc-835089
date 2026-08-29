import { useState } from 'react';
import { FlatList, View } from 'react-native';
import { Button, Label, ListGroup, SearchField, Typography, useThemeColor } from 'heroui-native';
import { Check } from 'lucide-react-native';

import { useLocale } from '@/hooks/useDirection';
import { PAKISTAN_CITIES } from '@/lib/cities';
import { goBackOrReplace } from '@/lib/navigation';
import { useLocationStore } from '@/lib/store/location';

/**
 * Manual city fallback. Reachable from Shops and Settings, and used whenever
 * location permission is unavailable, so pricing still has a city to work from.
 */
export default function CityPickerScreen() {
  const { t, textAlign } = useLocale();
  const [query, setQuery] = useState('');
  const manualCity = useLocationStore((state) => state.manualCity);
  const setManualCity = useLocationStore((state) => state.setManualCity);
  const success = useThemeColor('success');

  const needle = query.trim().toLowerCase();
  const cities = needle
    ? PAKISTAN_CITIES.filter((city) => city.name.toLowerCase().includes(needle))
    : PAKISTAN_CITIES;

  const selectCity = (name: string) => {
    setManualCity(name);
    goBackOrReplace('/shops');
  };

  return (
    <View className="flex-1 gap-4 px-5 pt-4">
      <View className="gap-3">
        <Typography type="body-sm" color="muted" className={textAlign}>
          {t('cityPicker.subtitle')}
        </Typography>

        <SearchField value={query} onChange={setQuery}>
          <Label>{t('location.cityLabel')}</Label>
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder={t('cityPicker.search')} autoFocus />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
      </View>

      {cities.length === 0 ? (
        <Typography type="body-sm" color="muted" className={textAlign}>
          {t('cityPicker.empty')}
        </Typography>
      ) : (
        <FlatList
          data={cities}
          keyExtractor={(city) => city.name}
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="pb-10"
          renderItem={({ item }) => (
            <ListGroup className="mb-2">
              <ListGroup.Item onPress={() => selectCity(item.name)}>
                <ListGroup.ItemContent>
                  <ListGroup.ItemTitle>{item.name}</ListGroup.ItemTitle>
                </ListGroup.ItemContent>
                {manualCity?.name === item.name ? (
                  <ListGroup.ItemSuffix>
                    <Check size={18} color={success} />
                  </ListGroup.ItemSuffix>
                ) : null}
              </ListGroup.Item>
            </ListGroup>
          )}
        />
      )}

      <View className="pb-safe-offset-2">
        <Button variant="ghost" onPress={() => goBackOrReplace('/shops')}>
          <Button.Label>{t('common.close')}</Button.Label>
        </Button>
      </View>
    </View>
  );
}
