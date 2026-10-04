import { useState } from 'react';
import { Share, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { SimulatedNotice } from '@/components/brand/SimulatedNotice';
import { AppText } from '@/components/ui/AppText';
import { AmountInput } from '@/components/ui/AmountInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { TextField } from '@/components/ui/TextField';
import { NOTE_MAX_LENGTH } from '@/config/constants';
import { useAmountLimits } from '@/hooks/useApiQueries';
import { useCopy } from '@/hooks/useCopy';
import { useCurrentUser } from '@/store/AuthContext';
import { colors, spacing } from '@/theme';
import { formatINR, parseAmountToPaise } from '@/utils/money';
import { buildPaymentQr } from '@/utils/qr';

type Mode = 'receive' | 'request';

/** Receive money (static QR) and request a specific amount (QR carrying the amount + note). */
export default function ReceiveScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const user = useCurrentUser();
  const copy = useCopy();
  const { maxPaise } = useAmountLimits();

  const [mode, setMode] = useState<Mode>(params.mode === 'request' ? 'request' : 'receive');
  const [amountText, setAmountText] = useState('');
  const [note, setNote] = useState('');

  const amountPaise = mode === 'request' ? parseAmountToPaise(amountText) : null;
  const amountError =
    mode === 'request' && amountText && (amountPaise === null || amountPaise > maxPaise) ? `Enter an amount up to ${formatINR(maxPaise, { compact: true })}` : null;
  const validAmount = amountPaise !== null && !amountError;

  const qrValue = buildPaymentQr({
    upiId: user.upiId,
    name: user.name,
    amountPaise: validAmount ? amountPaise : undefined,
    note: mode === 'request' && note.trim() ? note.trim() : undefined,
  });

  const share = () => {
    const ask = validAmount ? ` Please pay ${formatINR(amountPaise, { compact: true })}${note.trim() ? ` for ${note.trim()}` : ''}.` : '';
    void Share.share({ message: `Pay ${user.name} on SuperPay (prototype). UPI ID: ${user.upiId}.${ask}` });
  };

  return (
    <Screen title={mode === 'request' ? 'Request money' : 'Receive money'} contentStyle={styles.content}>
      <SegmentedControl<Mode>
        value={mode}
        onChange={setMode}
        options={[
          { value: 'receive', label: 'My QR' },
          { value: 'request', label: 'Request amount' },
        ]}
      />

      {mode === 'request' ? (
        <View style={styles.request}>
          <AmountInput value={amountText} onChangeText={setAmountText} error={amountError} />
          <TextField placeholder="What is it for? (optional)" icon="create-outline" value={note} onChangeText={setNote} maxLength={NOTE_MAX_LENGTH} />
        </View>
      ) : null}

      <Card style={styles.qrCard}>
        <View style={styles.qrBox} accessible accessibilityLabel={`QR code for ${user.name}, ${user.upiId}`}>
          <QRCode value={qrValue} size={220} color={colors.primary} backgroundColor={colors.surface} ecl="M" quietZone={4} />
        </View>
        <AppText variant="title3" align="center">{user.name}</AppText>
        {validAmount ? <AppText variant="title2" color="link">{formatINR(amountPaise)}</AppText> : null}
        <AppText variant="caption" color="textTertiary" align="center">Scan with SuperPay to pay</AppText>
      </Card>

      <Card padded={false}>
        <View style={styles.idRow}>
          <View style={styles.idText}>
            <AppText variant="caption" color="textTertiary">Your SuperPay ID</AppText>
            <AppText variant="bodyStrong" selectable>{user.upiId}</AppText>
          </View>
          <Button label="Copy" icon="copy-outline" variant="secondary" size="md" onPress={() => void copy(user.upiId, 'Payment ID copied')} />
        </View>
      </Card>

      <Button label="Share" icon="share-social-outline" onPress={share} disabled={mode === 'request' && !validAmount} />
      <SimulatedNotice />
      <AppText variant="caption" color="textTertiary" align="center">
        This QR only works inside SuperPay. It is not a registered UPI handle, so other UPI apps cannot pay it.
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.lg },
  request: { gap: spacing.lg, paddingVertical: spacing.sm },
  qrCard: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xl },
  qrBox: { padding: spacing.sm },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.lg },
  idText: { flex: 1, gap: 2 },
});
