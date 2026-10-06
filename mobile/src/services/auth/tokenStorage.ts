import * as SecureStore from 'expo-secure-store';

const KEY = 'superpay.session';

/** The JWT lives in the platform keystore (Android Keystore), never in plain storage. */
export const tokenStorage = {
  async get(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(KEY);
    } catch {
      return null;
    }
  },
  async set(token: string): Promise<void> {
    await SecureStore.setItemAsync(KEY, token);
  },
  async clear(): Promise<void> {
    await SecureStore.deleteItemAsync(KEY).catch(() => undefined);
  },
};
