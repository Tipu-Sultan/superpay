import { StyleSheet, View } from 'react-native';
import { ErrorState } from '@/components/ui/ErrorState';
import { Screen } from '@/components/ui/Screen';
import { ServerAddressField } from '@/components/ServerAddressField';
import { spacing } from '@/theme';

/** Shown at startup when a saved session exists but the server cannot be reached. */
export function ConnectionError({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Screen noHeader>
      <ErrorState title="Can't reach SuperPay" message={message} onRetry={onRetry} retryLabel="Try again" />
      <View style={styles.field}>
        <ServerAddressField onSaved={onRetry} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({ field: { paddingTop: spacing.lg } });
