import { Clock, Settings, Stethoscope, Store } from 'lucide-react-native';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useThemeColor } from 'heroui-native';
import { useTranslation } from 'react-i18next';
import { useUniwind } from 'uniwind';

export default function TabLayout() {
  const { theme } = useUniwind();
  const { t } = useTranslation();
  const [background, foreground, border, accent, muted] = useThemeColor([
    'background',
    'foreground',
    'border',
    'accent',
    'muted',
  ]);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: background },
          headerTintColor: foreground,
          headerTitleStyle: { color: foreground },
          headerShadowVisible: false,
          sceneStyle: { backgroundColor: background },
          tabBarStyle: {
            backgroundColor: background,
            borderTopColor: border,
          },
          tabBarActiveTintColor: accent,
          tabBarInactiveTintColor: muted,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t('common.appName'),
            tabBarLabel: t('tabs.diagnose'),
            tabBarIcon: ({ color, size }) => <Stethoscope color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="shops"
          options={{
            title: t('shops.title'),
            tabBarLabel: t('tabs.shops'),
            tabBarIcon: ({ color, size }) => <Store color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: t('history.title'),
            tabBarLabel: t('tabs.history'),
            tabBarIcon: ({ color, size }) => <Clock color={color} size={size ?? 24} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: t('settings.title'),
            tabBarLabel: t('tabs.settings'),
            tabBarIcon: ({ color, size }) => <Settings color={color} size={size ?? 24} />,
          }}
        />
      </Tabs>
    </>
  );
}
