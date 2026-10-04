import { useMemo, useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, screenPadding, spacing } from '@/theme';
import { AppText } from './AppText';
import { Divider } from './Divider';
import { Icon } from './Icon';
import { TextField } from './TextField';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectSheetProps {
  visible: boolean;
  title: string;
  options: SelectOption[];
  selected?: string;
  onSelect: (value: string) => void;
  onClose: () => void;
  searchable?: boolean;
}

/** Bottom sheet picker used for long lists such as telecom circles. */
export function SelectSheet({ visible, title, options, selected, onSelect, onClose, searchable }: SelectSheetProps) {
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options;
  }, [options, query]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" accessibilityRole="button" />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
          <View style={styles.handle} />
          <View style={styles.titleRow}>
            <AppText variant="title2">{title}</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" hitSlop={10} onPress={onClose}>
              <Icon name="close" size={24} />
            </Pressable>
          </View>
          {searchable ? (
            <View style={styles.search}>
              <TextField placeholder="Search" icon="search-outline" value={query} onChangeText={setQuery} autoCorrect={false} />
            </View>
          ) : null}
          <FlatList
            data={filtered}
            keyExtractor={(o) => o.value}
            ItemSeparatorComponent={Divider}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<AppText color="textTertiary" align="center" style={styles.empty}>No matches</AppText>}
            renderItem={({ item }) => {
              const isSelected = item.value === selected;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onSelect(item.value);
                    setQuery('');
                    onClose();
                  }}
                  style={({ pressed }) => [styles.option, pressed && { backgroundColor: colors.primaryTint }]}
                >
                  <AppText variant={isSelected ? 'bodyStrong' : 'body'} style={styles.optionText}>{item.label}</AppText>
                  {isSelected ? <Icon name="checkmark" size={20} color={colors.primary} /> : null}
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: colors.overlay },
  sheet: { backgroundColor: colors.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, maxHeight: '75%', paddingTop: spacing.sm },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.borderStrong, marginBottom: spacing.sm },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: screenPadding, paddingVertical: spacing.sm },
  search: { paddingHorizontal: screenPadding, paddingBottom: spacing.sm },
  option: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: screenPadding },
  optionText: { flex: 1 },
  empty: { padding: spacing.xxl },
});
