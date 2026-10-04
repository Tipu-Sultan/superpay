import type { ConfigContext, ExpoConfig } from 'expo/config';

/**
 * Dynamic config so the API address can be supplied per environment:
 *   EXPO_PUBLIC_API_URL=http://192.168.1.20:4000/api npx expo start
 * Plain `http://` is only allowed on Android when the API URL is http (local dev).
 * Use an https URL for staging/production builds and cleartext is switched off automatically.
 */
const apiUrl = process.env.EXPO_PUBLIC_API_URL ?? '';
const allowCleartext = apiUrl === '' || apiUrl.startsWith('http://');

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'SuperPay',
  slug: 'superpay',
  scheme: 'superpay',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light',
  backgroundColor: '#F2F5F4',
  android: {
    package: 'com.superpay.app',
    versionCode: 1,
    adaptiveIcon: {
      backgroundColor: '#0A3D3A',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    permissions: ['android.permission.CAMERA'],
    predictiveBackGestureEnabled: false,
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#0A3D3A',
        image: './assets/images/splash-icon.png',
        imageWidth: 160,
      },
    ],
    [
      'expo-camera',
      {
        cameraPermission: 'SuperPay uses the camera to scan payment QR codes.',
        recordAudioAndroid: false,
      },
    ],
    'expo-secure-store',
    ['expo-build-properties', { android: { usesCleartextTraffic: allowCleartext } }],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    apiUrl,
  },
});
