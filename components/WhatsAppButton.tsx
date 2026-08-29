import { useState } from 'react';
import { View } from 'react-native';
import { Button, Typography, useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react-native';

import { sendToWhatsApp } from '@/lib/whatsapp';

interface WhatsAppButtonProps {
  /** Ready-to-send text, already in the user's language. */
  message: string;
  /** Shop number, when the message is aimed at one shop. */
  phone?: string | null;
  label: string;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Hands a prepared message to WhatsApp, falling back to the share sheet when
 * WhatsApp is not installed and saying so plainly if nothing can open it.
 */
export function WhatsAppButton({
  message,
  phone,
  label,
  variant = 'secondary',
  size = 'md',
  className,
}: WhatsAppButtonProps) {
  const { t } = useTranslation();
  const [accent, accentForeground] = useThemeColor(['accent', 'accent-foreground']);
  const [isFailed, setIsFailed] = useState(false);

  const iconColor = variant === 'primary' ? accentForeground : accent;

  const handlePress = () => {
    setIsFailed(false);
    void sendToWhatsApp(message, phone).then((outcome) => {
      setIsFailed(outcome === 'failed');
    });
  };

  return (
    <View className="gap-1.5">
      <Button variant={variant} size={size} className={className} onPress={handlePress}>
        <MessageCircle size={16} color={iconColor} />
        <Button.Label>{label}</Button.Label>
      </Button>
      {isFailed ? (
        <Typography type="body-xs" color="muted" align="center">
          {t('whatsapp.unavailable')}
        </Typography>
      ) : null}
    </View>
  );
}
