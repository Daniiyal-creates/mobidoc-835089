import type { ConfigContext, ExpoConfig } from '@expo/config';

type ExpoPlugins = NonNullable<ExpoConfig['plugins']>;

export default ({ config }: ConfigContext): ExpoConfig => {
  const nativePlugins: ExpoPlugins =
    process.env.EXPO_PLATFORM === 'native'
      ? [['expo-dev-client', { launchMode: 'most-recent' }]]
      : [];

  return {
    ...config,
    name: 'MobiDoc',
    slug: 'mobidoc',
    newArchEnabled: true,
    version: process.env.BILT_APP_VERSION ?? '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'automatic',
    scheme: 'mobidoc',
    runtimeVersion: {
      policy: 'appVersion',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      infoPlist: {
        ITSAppUsesNonExemptEncryption: false,
        // Needed for the WhatsApp handoff: iOS blocks whatsapp:// checks from
        // apps that have not declared the scheme.
        LSApplicationQueriesSchemes: ['whatsapp'],
      },
      supportsTablet: true,
      bundleIdentifier: process.env.BILT_IOS_BUNDLE_ID ?? 'com.yourcompany.yourapp',
    },
    android: {
      package: process.env.BILT_ANDROID_PACKAGE ?? 'com.yourcompany.yourapp',
    },
    web: {
      bundler: 'metro',
      // 'single' = SPA export: one index.html + client routing, so edge serving
      // needs only a single 404→index.html fallback rule.
      output: 'single',
      favicon: './public/icons/icon-192.png',
    },
    extra: {
      appStoreAppId: process.env.BILT_APP_STORE_APP_ID,
    },
    plugins: [
      'expo-router',
      'expo-font',
      'expo-localization',
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'MobiDoc uses your location to find phone repair shops near you and to price repairs for your city.',
          locationWhenInUsePermission:
            'MobiDoc uses your location to find phone repair shops near you and to price repairs for your city.',
        },
      ],
      [
        'expo-image-picker',
        {
          cameraPermission:
            'MobiDoc uses your camera so you can photograph the damage and get a more accurate diagnosis.',
          photosPermission:
            'MobiDoc needs access to your photos so you can attach a picture of the damage.',
        },
      ],
      ...nativePlugins,
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  };
};
