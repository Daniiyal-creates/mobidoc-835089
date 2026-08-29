import { useMemo, useState } from 'react';
import { FlatList, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Chip, Typography, useThemeColor } from 'heroui-native';
import { Clock, Trash2 } from 'lucide-react-native';
import { format, isToday, isYesterday, parseISO } from 'date-fns';

import { EmptyState } from '@/components/EmptyState';
import { SeverityBadge } from '@/components/SeverityBadge';
import { useLocale } from '@/hooks/useDirection';
import { useHistoryStore } from '@/lib/store/history';
import type { HistoryEntry } from '@/lib/types';
import { formatPkrRange } from '@/lib/utils';

type Row =
  | { kind: 'header'; key: string; label: string }
  | { kind: 'entry'; key: string; entry: HistoryEntry };

/** Groups saved diagnoses under Today / Yesterday / date headings. */
function buildRows(entries: HistoryEntry[], labels: { today: string; yesterday: string }): Row[] {
  const rows: Row[] = [];
  let currentLabel: string | null = null;

  for (const entry of entries) {
    const savedAt = parseISO(entry.savedAt);
    const label = isToday(savedAt)
      ? labels.today
      : isYesterday(savedAt)
        ? labels.yesterday
        : format(savedAt, 'd MMM yyyy');

    if (label !== currentLabel) {
      currentLabel = label;
      rows.push({ kind: 'header', key: `header-${label}`, label });
    }
    rows.push({ kind: 'entry', key: entry.id, entry });
  }

  return rows;
}

export default function HistoryScreen() {
  const { t, textAlign } = useLocale();
  const entries = useHistoryStore((state) => state.entries);
  const remove = useHistoryStore((state) => state.remove);
  const clear = useHistoryStore((state) => state.clear);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const [danger, muted] = useThemeColor(['danger', 'muted']);

  const rows = useMemo(
    () => buildRows(entries, { today: t('history.today'), yesterday: t('history.yesterday') }),
    [entries, t],
  );

  if (entries.length === 0) {
    return (
      <View className="flex-1 justify-center">
        <EmptyState
          icon={Clock}
          title={t('history.emptyTitle')}
          description={t('history.emptyBody')}
          actionLabel={t('diagnose.start')}
          onAction={() => router.replace('/')}
        />
      </View>
    );
  }

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => row.key}
      contentContainerClassName="gap-3 px-5 pt-3 pb-10"
      ListFooterComponent={
        <View className="pt-4">
          {isConfirmingClear ? (
            <Card>
              <Card.Body className="gap-3">
                <Typography type="body-sm" weight="semibold" className={textAlign}>
                  {t('history.clearConfirmTitle')}
                </Typography>
                <Typography type="body-sm" color="muted" className={textAlign}>
                  {t('history.clearConfirmBody')}
                </Typography>
                <View className="flex-row gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1"
                    onPress={() => setIsConfirmingClear(false)}
                  >
                    <Button.Label>{t('common.cancel')}</Button.Label>
                  </Button>
                  <Button
                    variant="danger"
                    className="flex-1"
                    onPress={() => {
                      clear();
                      setIsConfirmingClear(false);
                    }}
                  >
                    <Button.Label>{t('history.delete')}</Button.Label>
                  </Button>
                </View>
              </Card.Body>
            </Card>
          ) : (
            <Button variant="ghost" onPress={() => setIsConfirmingClear(true)}>
              <Trash2 size={16} color={danger} />
              <Button.Label>{t('history.clear')}</Button.Label>
            </Button>
          )}
        </View>
      }
      renderItem={({ item }) => {
        if (item.kind === 'header') {
          return (
            <Typography type="body-xs" color="muted" weight="medium" className={textAlign}>
              {item.label}
            </Typography>
          );
        }

        const { entry } = item;
        const { diagnosis } = entry;

        return (
          <Card>
            <Card.Body className="gap-3">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 gap-1">
                  <Typography type="body" weight="semibold" numberOfLines={2}>
                    {diagnosis.issueTitle}
                  </Typography>
                  <Typography type="body-xs" color="muted">
                    {diagnosis.device.brand} {diagnosis.device.model} ·{' '}
                    {format(parseISO(entry.savedAt), 'HH:mm')}
                  </Typography>
                </View>
                <SeverityBadge severity={diagnosis.severity} />
              </View>

              <View className="flex-row items-center justify-between gap-3">
                <Chip size="sm" variant="secondary" color="default">
                  <Chip.Label>{formatPkrRange(diagnosis.cost.min, diagnosis.cost.max)}</Chip.Label>
                </Chip>

                <View className="flex-row items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    isIconOnly
                    onPress={() => remove(entry.id)}
                    accessibilityLabel={t('history.delete')}
                  >
                    <Trash2 size={16} color={muted} />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onPress={() =>
                      router.push({
                        pathname: '/diagnosis/[id]',
                        params: { id: diagnosis.id },
                      })
                    }
                  >
                    <Button.Label>{t('result.title')}</Button.Label>
                  </Button>
                </View>
              </View>
            </Card.Body>
          </Card>
        );
      }}
    />
  );
}
