import { Linking, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import {
  Button,
  Card,
  Chip,
  Label,
  Radio,
  RadioGroup,
  Separator,
  Switch,
  Typography,
  useThemeColor,
} from 'heroui-native';
import { MapPin } from 'lucide-react-native';

import { useLocale } from '@/hooks/useDirection';
import { useDemoStore } from '@/lib/store/demo';
import { useLocationStore } from '@/lib/store/location';
import { useSettingsStore } from '@/lib/store/settings';
import type { UiLanguage } from '@/lib/types';

type LanguageChoice = 'device' | UiLanguage;

function isUiLanguage(value: string): value is UiLanguage {
  return value === 'en' || value === 'ur';
}

export default function SettingsScreen() {
  const { t, textAlign } = useLocale();

  const language = useSettingsStore((state) => state.language);
  const followDeviceLanguage = useSettingsStore((state) => state.followDeviceLanguage);
  const setLanguage = useSettingsStore((state) => state.setLanguage);
  const followDevice = useSettingsStore((state) => state.followDevice);

  const permission = useLocationStore((state) => state.permission);
  const isLocating = useLocationStore((state) => state.isLocating);
  const city = useLocationStore((state) => state.city);
  const manualCity = useLocationStore((state) => state.manualCity);
  const requestLocation = useLocationStore((state) => state.requestLocation);

  const isDemo = useDemoStore((state) => state.enabled);
  const setDemoEnabled = useDemoStore((state) => state.setEnabled);

  const muted = useThemeColor('muted');

  const choice: LanguageChoice = followDeviceLanguage ? 'device' : language;

  const handleLanguageChange = (value: string) => {
    if (value === 'device') {
      followDevice();
      return;
    }
    if (isUiLanguage(value)) {
      setLanguage(value);
    }
  };

  const permissionLabel =
    permission === 'granted'
      ? t('location.statusGranted')
      : permission === 'denied'
        ? t('location.statusDenied')
        : t('location.statusUnknown');

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-6 px-5 pt-4 pb-12">
      <View className="gap-3">
        <Typography type="body-sm" color="muted" weight="medium" className={textAlign}>
          {t('settings.languageSection')}
        </Typography>

        <Card>
          <Card.Body>
            <RadioGroup value={choice} onValueChange={handleLanguageChange}>
              <RadioGroup.Item value="en">
                <Label className="flex-1">{t('languages.en')}</Label>
                <Radio />
              </RadioGroup.Item>
              <Separator className="my-1" />
              <RadioGroup.Item value="ur">
                <Label className="flex-1">{t('languages.ur')}</Label>
                <Radio />
              </RadioGroup.Item>
              <Separator className="my-1" />
              <RadioGroup.Item value="device">
                <Label className="flex-1">{t('settings.followDevice')}</Label>
                <Radio />
              </RadioGroup.Item>
            </RadioGroup>
          </Card.Body>
        </Card>

        <Typography type="body-xs" color="muted" className={textAlign}>
          {t('settings.languageHint')}
        </Typography>
      </View>

      <View className="gap-3">
        <Typography type="body-sm" color="muted" weight="medium" className={textAlign}>
          {t('settings.locationSection')}
        </Typography>

        <Card>
          <Card.Body className="gap-4">
            <View className="flex-row items-center justify-between gap-3">
              <Typography type="body-sm">{t('location.status')}</Typography>
              <Chip
                size="sm"
                variant="soft"
                color={permission === 'granted' ? 'success' : 'default'}
              >
                <Chip.Label>{permissionLabel}</Chip.Label>
              </Chip>
            </View>

            <Separator />

            <View className="flex-row items-center justify-between gap-3">
              <Typography type="body-sm">{t('location.cityLabel')}</Typography>
              <Chip
                size="sm"
                variant="secondary"
                color="default"
                onPress={() => router.push('/city-picker')}
                accessibilityRole="button"
              >
                <MapPin size={12} color={muted} />
                <Chip.Label>{city ?? manualCity?.name ?? t('location.cityPlaceholder')}</Chip.Label>
              </Chip>
            </View>

            {permission === 'granted' ? null : (
              <Button
                variant="secondary"
                isDisabled={isLocating}
                onPress={() => {
                  if (permission === 'denied') {
                    void Linking.openSettings();
                    return;
                  }
                  void requestLocation();
                }}
              >
                <Button.Label>
                  {permission === 'denied' ? t('location.openSettings') : t('location.allow')}
                </Button.Label>
              </Button>
            )}
          </Card.Body>
        </Card>
      </View>

      <View className="gap-3">
        <Typography type="body-sm" color="muted" weight="medium" className={textAlign}>
          {t('settings.demoSection')}
        </Typography>

        <Card>
          <Card.Body className="gap-3">
            <View className="flex-row items-start justify-between gap-4">
              <View className="flex-1 gap-1">
                <Typography type="body-sm" weight="semibold" className={textAlign}>
                  {t('demo.toggleTitle')}
                </Typography>
                <Typography type="body-xs" color="muted" className={textAlign}>
                  {t('demo.toggleBody')}
                </Typography>
              </View>
              <Switch
                isSelected={isDemo}
                onSelectedChange={setDemoEnabled}
                accessibilityLabel={t('demo.toggleTitle')}
              />
            </View>

            <Separator />

            <Typography type="body-xs" color="muted" className={textAlign}>
              {isDemo ? t('demo.activeHint') : t('demo.historyNote')}
            </Typography>
          </Card.Body>
        </Card>
      </View>

      <View className="gap-3">
        <Typography type="body-sm" color="muted" weight="medium" className={textAlign}>
          {t('settings.aboutSection')}
        </Typography>
        <Card>
          <Card.Body className="gap-3">
            <Typography type="body-sm" color="muted" className={textAlign}>
              {t('settings.aboutBody')}
            </Typography>
            <Separator />
            <View className="flex-row items-center justify-between gap-3">
              <Typography type="body-sm">{t('settings.version')}</Typography>
              <Typography type="body-sm" color="muted">
                {Constants.expoConfig?.version ?? '1.0.0'}
              </Typography>
            </View>
          </Card.Body>
        </Card>
      </View>
    </ScrollView>
  );
}
