import { useState } from 'react';
import { Image, View } from 'react-native';
import { Button, Card, Chip, Spinner, Typography, useThemeColor } from 'heroui-native';
import { Camera, ImagePlus, Trash2 } from 'lucide-react-native';

import { useLocale } from '@/hooks/useDirection';
import { capturePhoto, type PhotoSource } from '@/lib/photo';
import type { DamagePhoto } from '@/lib/types';

interface DamagePhotoCardProps {
  photo: DamagePhoto | null;
  onChange: (photo: DamagePhoto | null) => void;
}

const PREVIEW_HEIGHT = 200;

/**
 * Optional photo of the damage. Cracks, swelling and corrosion are far easier
 * to photograph than to describe, so the picture is sent to the model
 * alongside the written description rather than replacing it.
 */
export function DamagePhotoCard({ photo, onChange }: DamagePhotoCardProps) {
  const { t, textAlign } = useLocale();
  const [accent, muted, danger] = useThemeColor(['accent', 'muted', 'danger']);
  const [busySource, setBusySource] = useState<PhotoSource | null>(null);
  const [notice, setNotice] = useState<'denied' | 'failed' | null>(null);

  const pick = (source: PhotoSource) => {
    setNotice(null);
    setBusySource(source);
    void capturePhoto(source).then((outcome) => {
      setBusySource(null);
      if (outcome.status === 'ok') {
        onChange(outcome.photo);
        return;
      }
      if (outcome.status === 'denied' || outcome.status === 'failed') {
        setNotice(outcome.status);
      }
    });
  };

  return (
    <Card>
      <Card.Body className="gap-3">
        <View className="flex-row items-center gap-2">
          <Camera size={16} color={accent} />
          <Typography type="body-sm" weight="semibold" className="flex-1">
            {t('diagnose.photoTitle')}
          </Typography>
          <Chip size="sm" variant="tertiary" color="default">
            <Chip.Label>{t('common.optional')}</Chip.Label>
          </Chip>
        </View>

        <Typography type="body-xs" color="muted" className={textAlign}>
          {t('diagnose.photoBody')}
        </Typography>

        {photo ? (
          <View className="gap-3">
            <Image
              source={{ uri: photo.uri }}
              style={{ width: '100%', height: PREVIEW_HEIGHT, borderRadius: 16 }}
              resizeMode="cover"
              accessibilityIgnoresInvertColors
              accessibilityLabel={t('diagnose.photoPreviewA11y')}
            />
            <View className="flex-row gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="flex-1"
                isDisabled={busySource !== null}
                onPress={() => pick('camera')}
              >
                <Button.Label>{t('diagnose.photoRetake')}</Button.Label>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="flex-1"
                isDisabled={busySource !== null}
                onPress={() => {
                  setNotice(null);
                  onChange(null);
                }}
              >
                <Trash2 size={14} color={danger} />
                <Button.Label>{t('diagnose.photoRemove')}</Button.Label>
              </Button>
            </View>
          </View>
        ) : (
          <View className="flex-row gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              isDisabled={busySource !== null}
              onPress={() => pick('camera')}
            >
              <Camera size={14} color={accent} />
              <Button.Label>{t('diagnose.photoTake')}</Button.Label>
            </Button>
            <Button
              variant="tertiary"
              size="sm"
              className="flex-1"
              isDisabled={busySource !== null}
              onPress={() => pick('library')}
            >
              <ImagePlus size={14} color={muted} />
              <Button.Label>{t('diagnose.photoChoose')}</Button.Label>
            </Button>
          </View>
        )}

        {busySource ? (
          <View className="flex-row items-center gap-2">
            <Spinner size="sm" />
            <Typography type="body-xs" color="muted">
              {t('diagnose.photoPreparing')}
            </Typography>
          </View>
        ) : null}

        {notice ? (
          <Typography type="body-xs" color="muted" className={textAlign}>
            {notice === 'denied' ? t('diagnose.photoDenied') : t('diagnose.photoFailed')}
          </Typography>
        ) : null}
      </Card.Body>
    </Card>
  );
}
