import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import {
  Button,
  Chip,
  FieldError,
  Input,
  Label,
  SearchField,
  Skeleton,
  Spinner,
  TextArea,
  TextField,
  Typography,
  useThemeColor,
} from 'heroui-native';
import { ArrowRight, MapPin, Stethoscope } from 'lucide-react-native';

import { StepHeader } from '@/components/StepHeader';
import { useLocale } from '@/hooks/useDirection';
import { ApiError, requestDiagnosis } from '@/lib/api';
import { findBrand, searchBrands, SYMPTOM_KEYS } from '@/lib/brands';
import {
  DIAGNOSE_STEPS,
  useDiagnoseDraftStore,
  useDraftIsDeviceValid,
  useDraftIsIssueValid,
} from '@/lib/store/diagnoseDraft';
import { useEffectiveCity } from '@/lib/store/location';
import { useResultStore } from '@/lib/store/result';
import { cn } from '@/lib/utils';

export default function DiagnoseScreen() {
  const { t, textAlign } = useLocale();
  const [accent, muted, accentForeground] = useThemeColor(['accent', 'muted', 'accent-foreground']);

  const step = useDiagnoseDraftStore((state) => state.step);
  const brand = useDiagnoseDraftStore((state) => state.brand);
  const model = useDiagnoseDraftStore((state) => state.model);
  const description = useDiagnoseDraftStore((state) => state.description);
  const languageOverride = useDiagnoseDraftStore((state) => state.languageOverride);
  const setBrand = useDiagnoseDraftStore((state) => state.setBrand);
  const setModel = useDiagnoseDraftStore((state) => state.setModel);
  const setDescription = useDiagnoseDraftStore((state) => state.setDescription);
  const appendSymptom = useDiagnoseDraftStore((state) => state.appendSymptom);
  const goToStep = useDiagnoseDraftStore((state) => state.goToStep);

  const isDeviceValid = useDraftIsDeviceValid();
  const isIssueValid = useDraftIsIssueValid();
  const city = useEffectiveCity();
  const setResult = useResultStore((state) => state.setResult);

  const [brandQuery, setBrandQuery] = useState('');
  const [attempted, setAttempted] = useState(false);

  const diagnose = useMutation({
    mutationFn: requestDiagnosis,
    onSuccess: (diagnosis) => {
      setResult(diagnosis);
      router.push({ pathname: '/diagnosis/[id]', params: { id: diagnosis.id } });
    },
  });

  const brands = searchBrands(brandQuery);
  const modelSuggestions = findBrand(brand)?.models ?? [];

  const errorMessage = diagnose.error
    ? t(diagnose.error instanceof ApiError ? diagnose.error.messageKey : 'errors.unexpected')
    : null;

  const handleContinue = () => {
    if (!isDeviceValid) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    goToStep(2);
  };

  const handleSubmit = () => {
    if (!isIssueValid) {
      setAttempted(true);
      return;
    }
    setAttempted(false);
    diagnose.mutate({
      brand,
      model: model.trim(),
      description: description.trim(),
      ...(city ? { city } : {}),
      ...(languageOverride ? { languageOverride } : {}),
    });
  };

  if (diagnose.isPending) {
    return <AnalysingState />;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pt-4 pb-12"
        keyboardShouldPersistTaps="handled"
      >
        <View className="gap-2">
          <View className="bg-accent-soft size-11 items-center justify-center rounded-2xl">
            <Stethoscope size={22} color={accent} />
          </View>
          <Typography type="h3" weight="bold" className={textAlign}>
            {t('diagnose.heroTitle')}
          </Typography>
          <Typography type="body-sm" color="muted" className={textAlign}>
            {t('diagnose.heroBody')}
          </Typography>
          {city ? (
            <Chip size="sm" variant="secondary" color="default" className="self-start">
              <MapPin size={12} color={muted} />
              <Chip.Label>{city}</Chip.Label>
            </Chip>
          ) : null}
        </View>

        <StepHeader
          step={step}
          totalSteps={DIAGNOSE_STEPS}
          title={step === 1 ? t('diagnose.deviceTitle') : t('diagnose.issueTitle')}
          subtitle={step === 1 ? t('diagnose.deviceSubtitle') : t('diagnose.issueSubtitle')}
        />

        {step === 1 ? (
          <View className="gap-6">
            <View className="gap-3">
              <SearchField value={brandQuery} onChange={setBrandQuery}>
                <Label>{t('diagnose.brandLabel')}</Label>
                <SearchField.Group>
                  <SearchField.SearchIcon />
                  <SearchField.Input placeholder={t('diagnose.brandSearchPlaceholder')} />
                  <SearchField.ClearButton />
                </SearchField.Group>
              </SearchField>

              <View className="flex-row flex-wrap gap-2">
                {brands.map((item) => {
                  const isSelected = item.name === brand;
                  return (
                    <Chip
                      key={item.name}
                      size="md"
                      variant={isSelected ? 'primary' : 'secondary'}
                      color={isSelected ? 'accent' : 'default'}
                      onPress={() => setBrand(item.name)}
                      accessibilityRole="button"
                      accessibilityState={{ selected: isSelected }}
                    >
                      <Chip.Label>{item.name}</Chip.Label>
                    </Chip>
                  );
                })}
                <Chip
                  size="md"
                  variant={brand === 'Other' ? 'primary' : 'tertiary'}
                  color={brand === 'Other' ? 'accent' : 'default'}
                  onPress={() => setBrand('Other')}
                  accessibilityRole="button"
                  accessibilityState={{ selected: brand === 'Other' }}
                >
                  <Chip.Label>{t('diagnose.otherBrand')}</Chip.Label>
                </Chip>
              </View>
              {attempted && brand.length === 0 ? (
                <FieldError>{t('diagnose.needBrand')}</FieldError>
              ) : null}
            </View>

            <View className="gap-3">
              <TextField isInvalid={attempted && brand.length > 0 && !isDeviceValid}>
                <Label>{t('diagnose.modelLabel')}</Label>
                <Input
                  value={model}
                  onChangeText={setModel}
                  placeholder={t('diagnose.modelPlaceholder')}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  className={textAlign}
                  onSubmitEditing={handleContinue}
                />
                {attempted && brand.length > 0 && !isDeviceValid ? (
                  <FieldError>{t('diagnose.needModel')}</FieldError>
                ) : null}
              </TextField>

              {modelSuggestions.length > 0 ? (
                <View className="flex-row flex-wrap gap-2">
                  {modelSuggestions.map((suggestion) => (
                    <Chip
                      key={suggestion}
                      size="sm"
                      variant="tertiary"
                      color="default"
                      onPress={() => setModel(suggestion)}
                      accessibilityRole="button"
                    >
                      <Chip.Label>{suggestion}</Chip.Label>
                    </Chip>
                  ))}
                </View>
              ) : null}
            </View>

            <Button onPress={handleContinue}>
              <Button.Label>{t('common.next')}</Button.Label>
              <ArrowRight size={18} color={accentForeground} />
            </Button>
          </View>
        ) : (
          <View className="gap-6">
            <TextField isInvalid={attempted && !isIssueValid}>
              <Label>{t('diagnose.issueTitle')}</Label>
              <TextArea
                value={description}
                onChangeText={setDescription}
                placeholder={t('diagnose.issuePlaceholder')}
                numberOfLines={5}
                className={cn('min-h-28', textAlign)}
              />
              {attempted && !isIssueValid ? (
                <FieldError>{t('diagnose.needDescription')}</FieldError>
              ) : null}
            </TextField>

            <View className="gap-3">
              <Typography type="body-sm" color="muted" weight="medium" className={textAlign}>
                {t('diagnose.quickSymptoms')}
              </Typography>
              <View className="flex-row flex-wrap gap-2">
                {SYMPTOM_KEYS.map((key) => (
                  <Chip
                    key={key}
                    size="sm"
                    variant="secondary"
                    color="default"
                    onPress={() => appendSymptom(t(`symptoms.${key}`))}
                    accessibilityRole="button"
                  >
                    <Chip.Label>{t(`symptoms.${key}`)}</Chip.Label>
                  </Chip>
                ))}
              </View>
            </View>

            {errorMessage ? (
              <View className="bg-severity-danger-soft border-severity-danger rounded-2xl border p-4">
                <Typography type="body-sm" weight="semibold">
                  {t('diagnose.failedTitle')}
                </Typography>
                <Typography type="body-sm" color="muted">
                  {errorMessage}
                </Typography>
              </View>
            ) : null}

            <View className="gap-2">
              <Button onPress={handleSubmit}>
                <Button.Label>{t('diagnose.submit')}</Button.Label>
              </Button>
              <Button variant="ghost" onPress={() => goToStep(1)}>
                <Button.Label>{t('common.back')}</Button.Label>
              </Button>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/** Skeleton stand-in shaped like the result screen, so the wait feels short. */
function AnalysingState() {
  const { t } = useLocale();

  return (
    <View className="flex-1 gap-6 px-5 pt-8">
      <View className="items-center gap-3">
        <Spinner size="lg" />
        <Typography type="body" weight="semibold" align="center">
          {t('diagnose.analysing')}
        </Typography>
        <Typography type="body-sm" color="muted" align="center">
          {t('diagnose.analysingBody')}
        </Typography>
      </View>

      <View className="gap-3">
        <Skeleton className="h-6 w-2/3 rounded-xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-16 w-full rounded-2xl" />
      </View>
    </View>
  );
}
