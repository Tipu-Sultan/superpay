import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/components/ui/AppText';
import { Icon } from '@/components/ui/Icon';
import { useCopy } from '@/hooks/useCopy';
import { colors, spacing } from '@/theme';

interface DetailRowProps {
  label: string;
  value: string;
  copyable?: boolean;
}

export function DetailRow({ label, value, copyable }: DetailRowProps) {
  const copy = useCopy();
  const content = (
    <>
      <AppText variant="caption" color="textTertiary" style={styles.label}>{label}</AppText>
      <View style={styles.valueWrap}>
        <AppText variant="bodyStrong" align="right" style={styles.value} selectable={!copyable}>{value}</AppText>
        {copyable ? <Icon name="copy-outline" size={16} color={colors.textTertiary} /> : null}
      </View>
    </>
  );

  if (!copyable) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}. Tap to copy`}
      onPress={() => copy(value, `${label} copied`)}
      style={styles.row}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.lg, paddingVertical: spacing.md },
  label: { width: 110, paddingTop: 2 },
  valueWrap: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'flex-end', gap: spacing.sm },
  value: { flexShrink: 1 },
});
