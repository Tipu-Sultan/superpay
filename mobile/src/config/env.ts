import Constants from 'expo-constants';
import { Platform } from 'react-native';

/** Android emulators reach the host machine at 10.0.2.2. */
const DEFAULT_ANDROID_API = 'http://10.0.2.2:4000/api';
const DEFAULT_OTHER_API = 'http://localhost:4000/api';

export function getDefaultApiUrl(): string {
  const fromExtra = (Constants.expoConfig?.extra as { apiUrl?: string } | undefined)?.apiUrl;
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  const configured = (fromEnv || fromExtra || '').trim();
  if (configured) return configured.replace(/\/+$/, '');
  return Platform.OS === 'android' ? DEFAULT_ANDROID_API : DEFAULT_OTHER_API;
}

export const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';
export const REQUEST_TIMEOUT_MS = 15_000;
