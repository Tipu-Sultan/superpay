import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/ui/Button';
import { TextField } from '@/components/ui/TextField';
import { getApiBaseUrl, hasServerUrlOverride, isValidServerUrl, setServerUrlOverride } from '@/services/api/serverConfig';
import { useToast } from '@/store/ToastContext';
import { spacing } from '@/theme';

/**
 * Lets you point the app at a different API server (e.g. your computer's LAN
 * address when testing on a real phone) without rebuilding.
 */
export function ServerAddressField({ onSaved }: { onSaved?: () => void }) {
  const toast = useToast();
  const [value, setValue] = useState(getApiBaseUrl());
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!isValidServerUrl(value)) {
      setError('Enter a full address like http://192.168.1.20:4000/api');
      return;
    }
    setError(null);
    await setServerUrlOverride(value);
    toast.show('Server address saved', 'success');
    onSaved?.();
  };

  const reset = async () => {
    await setServerUrlOverride('');
    setValue(getApiBaseUrl());
    setError(null);
    toast.show('Using the default server address', 'neutral');
    onSaved?.();
  };

  return (
    <View style={styles.wrap}>
      <TextField
        label="Server address"
        value={value}
        onChangeText={(t) => {
          setValue(t);
          setError(null);
        }}
        error={error}
        helper="Emulator: http://10.0.2.2:4000/api. Real phone: your computer's IP."
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="url"
        icon="server-outline"
      />
      <View style={styles.buttons}>
        <Button label="Save address" onPress={save} variant="secondary" size="md" style={styles.flex} />
        {hasServerUrlOverride() ? <Button label="Use default" onPress={reset} variant="ghost" size="md" /> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.md },
  buttons: { flexDirection: 'row', gap: spacing.sm },
  flex: { flex: 1 },
});
