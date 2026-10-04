import { useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { FlatList, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AppText } from '@/components/ui/AppText';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { IconCircle } from '@/components/ui/IconCircle';
import { ListRow } from '@/components/ui/ListRow';
import { Screen } from '@/components/ui/Screen';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { RowSkeletonList } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { useContacts } from '@/hooks/useApiQueries';
import { errorMessage } from '@/services/api/errors';
import { useCurrentUser } from '@/store/AuthContext';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import { screenPadding, spacing } from '@/theme';
import type { Contact } from '@/types/api';
import type { RecipientSelection } from '@/types/payment';
import { classifyRecipientQuery, formatMobile, isValidMobile, isValidUpiId, normalizeMobile, sanitizeMobileInput } from '@/utils/validation';

type Mode = 'contacts' | 'mobile' | 'upi';

export default function RecipientScreen() {
  const params = useLocalSearchParams<{ mode?: string }>();
  const initial: Mode = params.mode === 'mobile' || params.mode === 'upi' ? params.mode : 'contacts';
  const [mode, setMode] = useState<Mode>(initial);

  return (
    <Screen title="Send money" scroll={false} flush keyboardAvoiding>
      <View style={styles.segment}>
        <SegmentedControl<Mode>
          value={mode}
          onChange={setMode}
          options={[
            { value: 'contacts', label: 'Contacts' },
            { value: 'mobile', label: 'Mobile number' },
            { value: 'upi', label: 'UPI ID' },
          ]}
        />
      </View>
      {mode === 'contacts' ? <ContactsPane /> : mode === 'mobile' ? <MobilePane /> : <UpiPane />}
    </Screen>
  );
}

function useChooseRecipient() {
  const flow = usePaymentFlow();
  return (recipient: RecipientSelection) => {
    flow.startTransfer({ recipient });
    router.push('/send/amount');
  };
}

function ContactsPane() {
  const choose = useChooseRecipient();
  const user = useCurrentUser();
  const [query, setQuery] = useState('');
  const contacts = useContacts(useDebouncedValue(query, 250));
  const kind = useMemo(() => classifyRecipientQuery(query), [query]);
  const typedMobile = normalizeMobile(query);
  const isSelf = (kind === 'mobile' && typedMobile === user.mobile) || (kind === 'upi' && query.trim().toLowerCase() === user.upiId);

  const header = (
    <View style={styles.paneHeader}>
      <TextField
        placeholder="Search name, number or UPI ID"
        icon="search-outline"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        right={query ? <AppText variant="label" color="link" onPress={() => setQuery('')} accessibilityRole="button">Clear</AppText> : undefined}
      />
      {kind !== 'text' && !isSelf ? (
        <ListRow
          leading={<IconCircle icon={kind === 'mobile' ? 'call-outline' : 'at-outline'} tone="accent" shape="circle" />}
          title={kind === 'mobile' ? `Pay ${formatMobile(typedMobile)}` : `Pay ${query.trim()}`}
          subtitle={kind === 'mobile' ? 'New mobile number' : 'New UPI ID'}
          chevron
          onPress={() => choose(kind === 'mobile' ? { kind: 'mobile', mobile: typedMobile } : { kind: 'upi', upiId: query.trim().toLowerCase(), source: 'typed' })}
        />
      ) : null}
      {isSelf ? <AppText variant="caption" color="danger">{"That's your own number. Choose someone else."}</AppText> : null}
    </View>
  );

  if (contacts.isLoading) return <>{header}<RowSkeletonList count={6} /></>;
  if (contacts.isError) return <ErrorState message={errorMessage(contacts.error)} onRetry={() => void contacts.refetch()} />;

  const data = contacts.data ?? [];
  return (
    <FlatList<Contact>
      data={data}
      keyExtractor={(c) => c.id}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      ItemSeparatorComponent={() => <Divider inset={72} />}
      ListEmptyComponent={
        kind === 'text' ? (
          <EmptyState icon="people-outline" title={query ? 'No matching contacts' : 'No contacts yet'} message="Enter a 10 digit mobile number or a UPI ID to pay someone new." />
        ) : null
      }
      renderItem={({ item }) => (
        <ListRow
          leading={<Avatar name={item.name} color={item.avatarColor} />}
          title={item.name}
          subtitle={formatMobile(item.mobile)}
          onPress={() => choose({ kind: 'contact', contact: item })}
        />
      )}
    />
  );
}

function MobilePane() {
  const choose = useChooseRecipient();
  const user = useCurrentUser();
  const [mobile, setMobile] = useState('');
  const [touched, setTouched] = useState(false);
  const valid = isValidMobile(mobile);
  const self = mobile === user.mobile;
  const error = touched && mobile.length > 0 && !valid ? 'Enter a valid 10 digit mobile number' : self ? "That's your own number" : null;

  return (
    <View style={styles.pane}>
      <TextField label="Mobile number" prefix="+91" placeholder="98765 43210" value={mobile} onChangeText={(t) => { setMobile(sanitizeMobileInput(t)); setTouched(true); }} keyboardType="number-pad" maxLength={10} error={error} autoFocus />
      <Button label="Continue" disabled={!valid || self} onPress={() => choose({ kind: 'mobile', mobile })} />
    </View>
  );
}

function UpiPane() {
  const choose = useChooseRecipient();
  const user = useCurrentUser();
  const [upi, setUpi] = useState('');
  const [touched, setTouched] = useState(false);
  const trimmed = upi.trim().toLowerCase();
  const valid = isValidUpiId(trimmed);
  const self = trimmed === user.upiId;
  const error = touched && trimmed.length > 0 && !valid ? 'Enter a valid UPI ID, like name@bank' : self ? "That's your own UPI ID" : null;

  return (
    <View style={styles.pane}>
      <TextField label="UPI ID" placeholder="name@bank" value={upi} onChangeText={(t) => { setUpi(t); setTouched(true); }} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" error={error} helper="Try pending@superpay or fail@superpay to see those states." autoFocus />
      <Button label="Continue" disabled={!valid || self} onPress={() => choose({ kind: 'upi', upiId: trimmed, source: 'typed' })} />
    </View>
  );
}

const styles = StyleSheet.create({
  segment: { paddingHorizontal: screenPadding, paddingBottom: spacing.md },
  paneHeader: { paddingHorizontal: screenPadding, paddingBottom: spacing.sm, gap: spacing.sm },
  pane: { paddingHorizontal: screenPadding, gap: spacing.xl, paddingTop: spacing.sm },
});
