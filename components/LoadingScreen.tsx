import { useEffect } from 'react';
import { View } from 'react-native';
import { Typography, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { Stethoscope } from 'lucide-react-native';
import {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { AnimatedView } from '@/components/ui/primitives/AnimatedView';

interface LoadingScreenProps {
  /** How long the progress bar takes to fill, matched to the boot delay. */
  durationMs: number;
}

/**
 * Branded boot screen shown after the native splash and before the app shell.
 * The progress bar fills over `durationMs` so the wait reads as deliberate
 * rather than as a stall.
 */
export function LoadingScreen({ durationMs }: LoadingScreenProps) {
  const { t } = useTranslation();
  const accentForeground = useThemeColor('accent-foreground');

  const markOpacity = useSharedValue(0);
  const markScale = useSharedValue(0.9);
  const haloScale = useSharedValue(1);
  const haloOpacity = useSharedValue(0.35);
  const textOpacity = useSharedValue(0);
  const progress = useSharedValue(0);

  useEffect(() => {
    markOpacity.value = withTiming(1, { duration: 320, easing: Easing.out(Easing.cubic) });
    markScale.value = withTiming(1, { duration: 420, easing: Easing.out(Easing.back(1.4)) });
    textOpacity.value = withDelay(160, withTiming(1, { duration: 320 }));

    haloScale.value = withRepeat(
      withSequence(
        withTiming(1.28, { duration: 900, easing: Easing.out(Easing.quad) }),
        withTiming(1, { duration: 900, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      false,
    );
    haloOpacity.value = withRepeat(
      withSequence(
        withTiming(0.12, { duration: 900, easing: Easing.out(Easing.quad) }),
        withTiming(0.35, { duration: 900, easing: Easing.in(Easing.quad) }),
      ),
      -1,
      false,
    );

    progress.value = withTiming(1, { duration: durationMs, easing: Easing.inOut(Easing.quad) });
  }, [durationMs, haloOpacity, haloScale, markOpacity, markScale, progress, textOpacity]);

  const markStyle = useAnimatedStyle(() => ({
    opacity: markOpacity.value,
    transform: [{ scale: markScale.value }],
  }));

  const haloStyle = useAnimatedStyle(() => ({
    opacity: haloOpacity.value,
    transform: [{ scale: haloScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({ opacity: textOpacity.value }));

  const barStyle = useAnimatedStyle(() => ({ width: `${progress.value * 100}%` }));

  return (
    <View className="bg-background flex-1 items-center justify-center px-10">
      <View className="items-center justify-center">
        <AnimatedView
          className="bg-brand absolute size-28 rounded-[32px]"
          style={haloStyle}
          pointerEvents="none"
        />
        <AnimatedView
          className="bg-brand size-24 items-center justify-center rounded-[28px]"
          style={markStyle}
        >
          <Stethoscope size={44} color={accentForeground} strokeWidth={2} />
        </AnimatedView>
      </View>

      <AnimatedView className="mt-7 items-center gap-1.5" style={textStyle}>
        <Typography type="h3" weight="bold">
          {t('common.appName')}
        </Typography>
        <Typography type="body-sm" color="muted" className="text-center">
          {t('splash.tagline')}
        </Typography>
      </AnimatedView>

      <View
        className="bg-default mt-9 h-1 w-40 overflow-hidden rounded-full"
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={t('splash.loading')}
      >
        <AnimatedView className="bg-accent h-full rounded-full" style={barStyle} />
      </View>
    </View>
  );
}
