import { useCallback, useRef, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { router, useIsFocused } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { useCurrentUser } from '@/store/AuthContext';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import { useToast } from '@/store/ToastContext';
import { colors, radius, spacing } from '@/theme';
import { haptics } from '@/utils/haptics';
import { buildPaymentQr, parsePaymentQr } from '@/utils/qr';

const FRAME = 250;

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const focused = useIsFocused();
  const insets = useSafeAreaInsets();
  const flow = usePaymentFlow();
  const toast = useToast();
  const user = useCurrentUser();
  const [torch, setTorch] = useState(false);
  const locked = useRef(false);

  const handleCode = useCallback(
    (raw: string) => {
      if (locked.current) return;
      locked.current = true;

      const parsed = parsePaymentQr(raw);
      if (!parsed.ok) {
        haptics.error();
        toast.show(parsed.reason, 'error');
        setTimeout(() => (locked.current = false), 1800); // allow another attempt
        return;
      }
      if (parsed.payload.upiId === user.upiId) {
        haptics.warning();
        toast.show("That's your own QR code.", 'error');
        setTimeout(() => (locked.current = false), 1800);
        return;
      }

      haptics.success();
      flow.startTransfer({
        recipient: { kind: 'upi', upiId: parsed.payload.upiId, name: parsed.payload.name, source: 'qr' },
        prefillAmountPaise: parsed.payload.amountPaise,
        prefillNote: parsed.payload.note,
      });
      router.replace('/send/amount');
    },
    [flow, toast, user.upiId],
  );

  // Permission still loading
  if (!permission) return <Screen title="Scan & Pay" scroll={false}><View /></Screen>;

  // Permission not granted: explain, never crash.
  if (!permission.granted) {
    const blocked = !permission.canAskAgain;
    return (
      <Screen title="Scan & Pay">
        <EmptyState
          icon="camera-outline"
          title="Camera access needed"
          message={blocked ? 'Camera permission is turned off. Open Settings to allow it, or enter a mobile number or UPI ID instead.' : 'SuperPay uses the camera only to read payment QR codes. Nothing is recorded or saved.'}
          actionLabel={blocked ? 'Open Settings' : 'Allow camera'}
          onAction={() => (blocked ? void Linking.openSettings() : void requestPermission())}
        />
        <Button label="Pay by mobile number or UPI ID" variant="secondary" onPress={() => router.replace('/send/recipient')} />
      </Screen>
    );
  }

  return (
    <View style={styles.root}>
      {focused ? (
        <CameraView
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={({ data }) => handleCode(data)}
        />
      ) : null}

      <View style={[styles.top, { paddingTop: insets.top + spacing.sm }]}>
        <RoundButton icon="close" label="Close scanner" onPress={() => router.back()} />
        <AppText variant="title3" color="textOnBrand">Scan & Pay</AppText>
        <RoundButton icon={torch ? 'flashlight' : 'flashlight-outline'} label={torch ? 'Turn torch off' : 'Turn torch on'} onPress={() => setTorch((t) => !t)} />
      </View>

      <View style={styles.center} pointerEvents="none">
        <View style={styles.frame}>
          <Corner style={{ top: 0, left: 0, borderTopWidth: 4, borderLeftWidth: 4, borderTopLeftRadius: radius.md }} />
          <Corner style={{ top: 0, right: 0, borderTopWidth: 4, borderRightWidth: 4, borderTopRightRadius: radius.md }} />
          <Corner style={{ bottom: 0, left: 0, borderBottomWidth: 4, borderLeftWidth: 4, borderBottomLeftRadius: radius.md }} />
          <Corner style={{ bottom: 0, right: 0, borderBottomWidth: 4, borderRightWidth: 4, borderBottomRightRadius: radius.md }} />
        </View>
        <AppText color="textOnBrand" align="center" style={styles.hint}>Point at a SuperPay QR code</AppText>
      </View>

      <View style={[styles.bottom, { paddingBottom: insets.bottom + spacing.lg }]}>
        <Button
          label="Use a demo QR (no camera)"
          variant="secondary"
          size="md"
          onPress={() => handleCode(buildPaymentQr({ upiId: '9000000102@superpay', name: 'Priya Nair' }))}
        />
        <AppText variant="caption" color="textOnBrandMuted" align="center">Scanning only fills in a simulated payment.</AppText>
      </View>
    </View>
  );
}

function RoundButton({ icon, label, onPress }: { icon: 'close' | 'flashlight' | 'flashlight-outline'; label: string; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={styles.round} hitSlop={8}>
      <Icon name={icon} size={22} color={colors.textOnBrand} />
    </Pressable>
  );
}

function Corner({ style }: { style: object }) {
  return <View style={[styles.corner, style]} />;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.palette.teal950 },
  top: { position: 'absolute', top: 0, left: 0, right: 0, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  round: { width: 44, height: 44, borderRadius: radius.pill, backgroundColor: 'rgba(6,40,38,0.65)', alignItems: 'center', justifyContent: 'center' },
  center: { ...StyleSheet.flatten({ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }), alignItems: 'center', justifyContent: 'center', gap: spacing.xl },
  frame: { width: FRAME, height: FRAME },
  corner: { position: 'absolute', width: 44, height: 44, borderColor: colors.accent },
  hint: { backgroundColor: 'rgba(6,40,38,0.65)', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radius.pill, overflow: 'hidden' },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: spacing.lg, gap: spacing.sm, alignItems: 'stretch' },
});
