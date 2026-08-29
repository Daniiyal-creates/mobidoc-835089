import { View } from 'react-native';
import { Chip, Typography } from 'heroui-native';

import { useLocale } from '@/hooks/useDirection';
import { DEMO_SAMPLES } from '@/lib/demo/seed';
import { useDiagnoseDraftStore } from '@/lib/store/diagnoseDraft';
import { useDemoMode } from '@/lib/store/demo';

/**
 * One-tap sample problems, only while demo mode is on. They fill the form and
 * jump to the issue step, which keeps a live demo from turning into typing —
 * and the samples are deliberately in English, Roman Urdu and Urdu so language
 * detection is visible on stage.
 */
export function DemoSampleCases() {
  const isDemo = useDemoMode();
  const { t, textAlign } = useLocale();
  const setBrand = useDiagnoseDraftStore((state) => state.setBrand);
  const setModel = useDiagnoseDraftStore((state) => state.setModel);
  const setDescription = useDiagnoseDraftStore((state) => state.setDescription);
  const setPhoto = useDiagnoseDraftStore((state) => state.setPhoto);
  const goToStep = useDiagnoseDraftStore((state) => state.goToStep);

  if (!isDemo) return null;

  return (
    <View className="gap-2">
      <Typography type="body-sm" color="muted" weight="medium" className={textAlign}>
        {t('demo.samplesTitle')}
      </Typography>

      <View className="flex-row flex-wrap gap-2">
        {DEMO_SAMPLES.map((sample) => (
          <Chip
            key={sample.key}
            size="sm"
            variant="tertiary"
            color="default"
            accessibilityRole="button"
            onPress={() => {
              setBrand(sample.brand);
              setModel(sample.model);
              setDescription(sample.description);
              setPhoto(null);
              goToStep(2);
            }}
          >
            <Chip.Label>{`${t(`demo.sample.${sample.key}`)} · ${sample.brand}`}</Chip.Label>
          </Chip>
        ))}
      </View>

      <Typography type="body-xs" color="muted" className={textAlign}>
        {t('demo.samplesHint')}
      </Typography>
    </View>
  );
}
