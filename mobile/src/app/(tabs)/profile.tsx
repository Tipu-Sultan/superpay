import { Alert, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SimulatedNotice } from '@/components/brand/SimulatedNotice';
import { ServerAddressField } from '@/components/ServerAddressField';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { IconCircle } from '@/components/ui/IconCircle';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { APP_VERSION } from '@/config/env';
import { useResetDemoData } from '@/hooks/useApiMutations';
import { useAmountLimits } from '@/hooks/useApiQueries';
import { useCopy } from '@/hooks/useCopy';
import { errorMessage } from '@/services/api/errors';
import { useAuth, useCurrentUser } from '@/store/AuthContext';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import { useToast } from '@/store/ToastContext';
import { spacing } from '@/theme';
import { formatDate } from '@/utils/date';
import { formatINR } from '@/utils/money';
import { formatMobile } from '@/utils/validation';

export default function ProfileScreen() {
  const user = useCurrentUser();
  const { signOut } = useAuth();
  const flow = usePaymentFlow();
  const copy = useCopy();
  const toast = useToast();
  const reset = useResetDemoData();
  const { maxPaise } = useAmountLimits();

  const confirmReset = () =>
    Alert.alert('Reset demo data?', 'This restores your starting balance, contacts and sample transactions. Anything you did in the app will be removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () =>
          reset.mutate(undefined, {
            onSuccess: () => toast.show('Demo data restored', 'success'),
            onError: (e) => toast.show(errorMessage(e), 'error'),
          }),
      },
    ]);

  const confirmSignOut = () =>
    Alert.alert('Sign out?', 'You can sign back in with the same mobile number to get your demo data back.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: () => {
          flow.reset();
          void signOut();
        },
      },
    ]);

  return (
    <Screen noHeader contentStyle={styles.content}>
      <View style={styles.head}>
        <Avatar name={user.name} color={user.avatarColor} size={84} />
        <AppText variant="title1" align="center">{user.name}</AppText>
        <AppText color="textTertiary">+91 {formatMobile(user.mobile)}</AppText>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Account" />
        <Card padded={false}>
          <ListRow leading={<IconCircle icon="person-outline" />} title="Edit profile" subtitle={user.email ?? 'Add your email'} chevron onPress={() => router.push('/edit-profile')} />
          <Divider inset={72} />
          <ListRow leading={<IconCircle icon="at-outline" />} title="SuperPay ID" subtitle={user.upiId} trailing={<AppText variant="label" color="link">Copy</AppText>} onPress={() => void copy(user.upiId, 'Payment ID copied')} />
          <Divider inset={72} />
          <ListRow leading={<IconCircle icon="qr-code-outline" />} title="My QR code" subtitle="Show it to get paid" chevron onPress={() => router.push('/receive')} />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Limits & info" />
        <Card padded={false}>
          <ListRow leading={<IconCircle icon="speedometer-outline" tone="neutral" />} title="Per-payment limit" subtitle={formatINR(maxPaise, { compact: true })} />
          <Divider inset={72} />
          <ListRow leading={<IconCircle icon="calendar-outline" tone="neutral" />} title="Member since" subtitle={formatDate(user.createdAt)} />
          <Divider inset={72} />
          <ListRow leading={<IconCircle icon="information-circle-outline" tone="neutral" />} title="App version" subtitle={APP_VERSION} />
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Developer" />
        <Card>
          <ServerAddressField />
        </Card>
        <Card padded={false}>
          <ListRow leading={<IconCircle icon="refresh-outline" tone="accent" />} title="Reset demo data" subtitle="Restore balance, contacts and history" onPress={confirmReset} />
        </Card>
      </View>

      <Card padded={false}>
        <ListRow leading={<IconCircle icon="log-out-outline" tone="danger" />} title="Sign out" destructive onPress={confirmSignOut} />
      </Card>

      <SimulatedNotice />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingTop: spacing.xl },
  head: { alignItems: 'center', gap: spacing.xs },
  section: { gap: spacing.md },
});
