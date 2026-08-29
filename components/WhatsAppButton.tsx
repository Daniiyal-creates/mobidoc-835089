import { useState } from 'react';
import { View } from 'react-native';
import { Button, Typography, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react-native';

import { type SendOutcome, sendToWhatsApp } from '@/lib/whatsapp';

interface WhatsAppButtonProps {
  /** Ready-to-send text, already in the user's language. */
  message: string;
  /**
   * WhatsApp-capable number in E.164 digits, from `resolveWhatsAppTarget`.
   * Leave it out to open WhatsApp with the text ready and let the user choose
   * the chat. Never pass a raw listing string: an unusable number makes
   * WhatsApp reject the link.
   */
  number?: string | null;
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Hands a prepared message to WhatsApp, and says what happened when WhatsApp
 * could not be opened — the message is copied to the clipboard rather than
 * lost, so the note has to tell the user that.
 */
export function WhatsAppButton({
  message,
  number,
  label,
  variant = 'secondary',
  size = 'md',
  className,
}: WhatsAppButtonProps) {
  const { t } = useTranslation();
  const [accent, accentForeground] = useThemeColor(['accent', 'accent-foreground']);
  const [outcome, setOutcome] = useState<SendOutcome | null>(null);

  const iconColor = variant === 'primary' ? accentForeground : accent;

  const handlePress = () => {
    setOutcome(null);
    void sendToWhatsApp(message, number).then(setOutcome);
  };

  const note =
    outcome === 'copied'
      ? t('whatsapp.copied')
      : outcome === 'failed'
        ? t('whatsapp.unavailable')
        : null;

  return (
    <View className="gap-1.5">
      <Button variant={variant} size={size} className={className} onPress={handlePress}>
        <MessageCircle size={16} color={iconColor} />
        <Button.Label>{label}</Button.Label>
      </Button>
      {note ? (
        <Typography type="body-xs" color="muted" align="center">
          {note}
        </Typography>
      ) : null}
    </View>
  );
}
