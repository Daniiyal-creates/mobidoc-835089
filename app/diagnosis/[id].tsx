import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import { Button, Card, Chip, Separator, Spinner, Typography, useThemeColor } from 'heroui-native';
import { FadeInDown } from 'react-native-reanimated';
import { Check, Clock, FileQuestion, Store, Wrench } from 'lucide-react-native';

import { CostRangeCard } from '@/components/CostRangeCard';
import { EmptyState } from '@/components/EmptyState';
import { SafetyCallout } from '@/components/SafetyCallout';
import { SeverityBadge } from '@/components/SeverityBadge';
import { AnimatedView } from '@/components/ui/primitives/AnimatedView';
import { useLocale } from '@/hooks/useDirection';
import { ApiError, requestDiagnosis } from '@/lib/api';
import { useHistoryStore } from '@/lib/store/history';
import { useEffectiveCity } from '@/lib/store/location';
import { useDiagnosisById, useResultStore } from '@/lib/store/result';
import type { Diagnosis, InputLanguage } from '@/lib/types';

const INPUT_LANGUAGES: readonly InputLanguage[] = ['en', 'ur', 'ur-roman'];

export default function DiagnosisScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, textAlign } = useLocale();
  const diagnosis = useDiagnosisById(id);

  const save = useHistoryStore((state) => state.save);
  const isSaved = useHistoryStore((state) =>
    state.entries.some((entry) => entry.diagnosis.id === id),
  );

  const [accent, muted, success, accentForeground] = useThemeColor([
    'accent',
    'muted',
    'success',
    'accent-foreground',
  ]);

  if (!diagnosis) {
    return (
      <View className="flex-1 justify-center">
        <EmptyState
          icon={FileQuestion}
          title={t('result.notFoundTitle')}
          description={t('result.notFoundBody')}
          actionLabel={t('diagnose.start')}
          onAction={() => router.replace('/')}
        />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerClassName="gap-5 px-5 pt-4 pb-12">
      <AnimatedView entering={FadeInDown.duration(250)} className="gap-3">
        <View className="flex-row flex-wrap items-center gap-2">
          <SeverityBadge severity={diagnosis.severity} size="md" />
          <Chip size="md" variant="tertiary" color="default">
            <Chip.Label>
              {t('result.confidence', { percent: Math.round(diagnosis.confidence * 100) })}
            </Chip.Label>
          </Chip>
        </View>

        <Typography type="h3" weight="bold" className={textAlign}>
          {diagnosis.issueTitle}
        </Typography>
        <Typography type="body-sm" color="muted" className={textAlign}>
          {diagnosis.device.brand} {diagnosis.device.model}
        </Typography>
        <Typography type="body" className={textAlign}>
          {diagnosis.summary}
        </Typography>

        <LanguageCorrection diagnosis={diagnosis} />
      </AnimatedView>

      <SafetyCallout flags={diagnosis.safetyFlags} />

      <Card>
        <Card.Body className="gap-1.5">
          <Typography type="body-xs" color="muted" weight="medium" className={textAlign}>
            {t('result.yourWords')}
          </Typography>
          <Typography type="body-sm" className={textAlign}>
            {diagnosis.description}
          </Typography>
        </Card.Body>
      </Card>

      <View className="gap-3">
        <Typography type="h5" weight="bold" className={textAlign}>
          {t('result.likelyCauses')}
        </Typography>
        <Card>
          <Card.Body className="gap-4">
            {diagnosis.likelyCauses.map((cause, index) => (
              <View key={cause.title} className="gap-2">
                {index > 0 ? <Separator className="mb-2" /> : null}
                <View className="flex-row items-center justify-between gap-3">
                  <Typography type="body-sm" weight="semibold" className="flex-1">
                    {cause.title}
                  </Typography>
                  <Typography type="body-xs" color="muted">
                    {Math.round(cause.likelihood * 100)}%
                  </Typography>
                </View>
                <Typography type="body-sm" color="muted">
                  {cause.explanation}
                </Typography>
              </View>
            ))}
          </Card.Body>
        </Card>
      </View>

      <CostRangeCard cost={diagnosis.cost} />

      <View className="flex-row gap-3">
        <Card className="flex-1">
          <Card.Body className="gap-1.5">
            <View className="flex-row items-center gap-1.5">
              <Clock size={14} color={muted} />
              <Typography type="body-xs" color="muted">
                {t('result.repairTime')}
              </Typography>
            </View>
            <Typography type="body-sm" weight="semibold">
              {diagnosis.repairTime}
            </Typography>
          </Card.Body>
        </Card>

        <Card className="flex-1">
          <Card.Body className="gap-1.5">
            <View className="flex-row items-center gap-1.5">
              <Wrench size={14} color={muted} />
              <Typography type="body-xs" color="muted">
                {t('result.diyTitle')}
              </Typography>
            </View>
            <Typography type="body-sm" weight="semibold">
              {diagnosis.diyFeasible ? t('result.diyYes') : t('result.diyNo')}
            </Typography>
            {diagnosis.diyNote ? (
              <Typography type="body-xs" color="muted">
                {diagnosis.diyNote}
              </Typography>
            ) : null}
          </Card.Body>
        </Card>
      </View>

      <View className="gap-3">
        <Typography type="h5" weight="bold" className={textAlign}>
          {t('result.questions')}
        </Typography>
        <Card>
          <Card.Body className="gap-3">
            {diagnosis.questionsForShop.map((question) => (
              <View key={question} className="flex-row items-start gap-2">
                <Check size={16} color={accent} />
                <Typography type="body-sm" className="flex-1">
                  {question}
                </Typography>
              </View>
            ))}
          </Card.Body>
        </Card>
      </View>

      <View className="gap-2">
        <Button onPress={() => router.push('/shops')}>
          <Button.Label>{t('result.findShops')}</Button.Label>
          <Store size={18} color={accentForeground} />
        </Button>

        {isSaved ? (
          <View className="flex-row items-center justify-center gap-2 py-2">
            <Check size={16} color={success} />
            <Typography type="body-sm" color="muted">
              {t('result.saved')}
            </Typography>
          </View>
        ) : (
          <Button variant="secondary" onPress={() => save(diagnosis)}>
            <Button.Label>{t('result.save')}</Button.Label>
          </Button>
        )}
      </View>
    </ScrollView>
  );
}

/**
 * Gemini answers in whichever language it detected. If it guessed wrong, the
 * user picks the right one and the diagnosis is redone in that language.
 */
function LanguageCorrection({ diagnosis }: { diagnosis: Diagnosis }) {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const city = useEffectiveCity();
  const setResult = useResultStore((state) => state.setResult);

  const redo = useMutation({
    mutationFn: requestDiagnosis,
    onSuccess: (next) => {
      setResult(next);
      setIsOpen(false);
      router.replace({ pathname: '/diagnosis/[id]', params: { id: next.id } });
    },
  });

  const errorMessage = redo.error
    ? t(redo.error instanceof ApiError ? redo.error.messageKey : 'errors.unexpected')
    : null;

  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap items-center gap-2">
        <Chip size="sm" variant="soft" color="accent">
          <Chip.Label>
            {t('diagnose.detectedLanguage', {
              language: t(`languages.${diagnosis.detectedLanguage}`),
            })}
          </Chip.Label>
        </Chip>
        {redo.isPending ? (
          <Spinner size="sm" />
        ) : (
          <Chip
            size="sm"
            variant="tertiary"
            color="default"
            onPress={() => setIsOpen((open) => !open)}
            accessibilityRole="button"
          >
            <Chip.Label>{t('diagnose.wrongLanguage')}</Chip.Label>
          </Chip>
        )}
      </View>

      {isOpen && !redo.isPending ? (
        <View className="flex-row flex-wrap gap-2">
          {INPUT_LANGUAGES.filter((language) => language !== diagnosis.detectedLanguage).map(
            (language) => (
              <Chip
                key={language}
                size="sm"
                variant="secondary"
                color="default"
                onPress={() =>
                  redo.mutate({
                    brand: diagnosis.device.brand,
                    model: diagnosis.device.model,
                    description: diagnosis.description,
                    languageOverride: language,
                    ...(city ? { city } : {}),
                  })
                }
                accessibilityRole="button"
              >
                <Chip.Label>{t(`languages.${language}`)}</Chip.Label>
              </Chip>
            ),
          )}
        </View>
      ) : null}

      {errorMessage ? (
        <Typography type="body-xs" color="muted">
          {errorMessage}
        </Typography>
      ) : null}
    </View>
  );
}
