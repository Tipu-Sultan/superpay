import * as SecureStore from 'expo-secure-store';
import { getDefaultApiUrl } from '@/config/env';

const KEY = 'superpay.apiUrl';
let override: string | null = null;

/** Call once at startup so the API client knows about a user-set server address. */
export async function loadServerUrlOverride(): Promise<void> {
  try {
    override = (await SecureStore.getItemAsync(KEY)) || null;
  } catch {
    override = null;
  }
}

export function getApiBaseUrl(): string {
  return (override ?? getDefaultApiUrl()).replace(/\/+$/, '');
}

export function hasServerUrlOverride(): boolean {
  return override !== null;
}

/** Persists a custom API URL (useful on a physical device). Pass an empty string to reset to the default. */
export async function setServerUrlOverride(url: string): Promise<void> {
  const trimmed = url.trim().replace(/\/+$/, '');
  if (!trimmed) {
    override = null;
    await SecureStore.deleteItemAsync(KEY).catch(() => undefined);
    return;
  }
  override = trimmed;
  await SecureStore.setItemAsync(KEY, trimmed);
}

export function isValidServerUrl(url: string): boolean {
  return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(url.trim());
}
