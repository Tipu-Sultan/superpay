import { FlatList, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import { spacing } from '@/theme';
import type { Contact } from '@/types/api';
import { firstName } from '@/utils/format';
import { haptics } from '@/utils/haptics';

/** Horizontal strip of favourite contacts: one tap to start paying. */
export function QuickContacts({ contacts }: { contacts: Contact[] }) {
  const flow = usePaymentFlow();
  return (
    <FlatList
      horizontal
      data={contacts}
      keyExtractor={(c) => c.id}
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Pay ${item.name}`}
          style={styles.item}
          onPress={() => {
            haptics.tap();
            flow.startTransfer({ recipient: { kind: 'contact', contact: item } });
            router.push('/send/amount');
          }}
        >
          <Avatar name={item.name} color={item.avatarColor} size={56} />
          <AppText variant="caption" numberOfLines={1} align="center">{firstName(item.name)}</AppText>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.lg, paddingRight: spacing.lg },
  item: { alignItems: 'center', gap: spacing.sm, width: 64 },
});
