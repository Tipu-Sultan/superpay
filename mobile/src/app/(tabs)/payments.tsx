import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { ServiceGrid, SERVICES } from '@/components/home/ServiceGrid';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Icon, type IconName } from '@/components/ui/Icon';
import { IconCircle } from '@/components/ui/IconCircle';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useContacts } from '@/hooks/useApiQueries';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import { colors, radius, spacing } from '@/theme';
import { formatMobile } from '@/utils/validation';

interface Option {
  key: string;
  title: string;
  subtitle: string;
  icon: IconName;
  onPress: () => void;
}

const TRANSFERS: Option[] = [
  { key: 'contact', title: 'To contact', subtitle: 'Pay someone in your contacts', icon: 'people-outline', onPress: () => router.push('/send/recipient') },
  { key: 'mobile', title: 'To mobile number', subtitle: 'Pay any 10 digit number', icon: 'call-outline', onPress: () => router.push({ pathname: '/send/recipient', params: { mode: 'mobile' } }) },
  { key: 'upi', title: 'To UPI ID', subtitle: 'name@bank', icon: 'at-outline', onPress: () => router.push({ pathname: '/send/recipient', params: { mode: 'upi' } }) },
  { key: 'scan', title: 'Scan a QR code', subtitle: 'Point your camera and pay', icon: 'qr-code-outline', onPress: () => router.push('/scan') },
];

export default function PaymentsScreen() {
  const contacts = useContacts('');
  const flow = usePaymentFlow();
  const people = (contacts.data ?? []).slice(0, 5);

  return (
    <Screen noHeader contentStyle={styles.content}>
      <AppText variant="title1" accessibilityRole="header" style={styles.title}>Payments</AppText>

      <Pressable
        accessibilityRole="search"
        accessibilityLabel="Search contacts, numbers or UPI IDs"
        onPress={() => router.push('/send/recipient')}
        style={styles.search}
      >
        <Icon name="search-outline" size={20} color={colors.textTertiary} />
        <AppText color="textTertiary">Pay a name, number or UPI ID</AppText>
      </Pressable>

      <View style={styles.section}>
        <SectionHeader title="Send money" />
        <Card padded={false}>
          {TRANSFERS.map((o, i) => (
            <View key={o.key}>
              {i > 0 ? <Divider inset={72} /> : null}
              <ListRow leading={<IconCircle icon={o.icon} tone={o.key === 'scan' ? 'accent' : 'brand'} />} title={o.title} subtitle={o.subtitle} chevron onPress={o.onPress} />
            </View>
          ))}
        </Card>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Receive" />
        <View style={styles.twoCol}>
          <Pressable accessibilityRole="button" style={styles.tile} onPress={() => router.push('/receive')}>
            <IconCircle icon="qr-code-outline" tone="brand" />
            <AppText variant="bodyStrong">My QR code</AppText>
          </Pressable>
          <Pressable accessibilityRole="button" style={styles.tile} onPress={() => router.push({ pathname: '/receive', params: { mode: 'request' } })}>
            <IconCircle icon="hand-left-outline" tone="brand" />
            <AppText variant="bodyStrong">Request money</AppText>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader title="Recharge & bills" actionLabel="All bills" onAction={() => router.push('/bills')} />
        <ServiceGrid services={SERVICES} />
      </View>

      {people.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title="People" actionLabel="See all" onAction={() => router.push('/send/recipient')} />
          <Card padded={false}>
            {people.map((c, i) => (
              <View key={c.id}>
                {i > 0 ? <Divider inset={72} /> : null}
                <ListRow
                  leading={<Avatar name={c.name} color={c.avatarColor} />}
                  title={c.name}
                  subtitle={formatMobile(c.mobile)}
                  onPress={() => {
                    flow.startTransfer({ recipient: { kind: 'contact', contact: c } });
                    router.push('/send/amount');
                  }}
                />
              </View>
            ))}
          </Card>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingTop: spacing.md },
  title: { paddingTop: spacing.sm },
  section: { gap: spacing.md },
  search: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 54, paddingHorizontal: spacing.lg, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  twoCol: { flexDirection: 'row', gap: spacing.md },
  tile: { flex: 1, gap: spacing.md, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
