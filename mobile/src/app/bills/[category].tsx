import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { SimulatedNotice } from '@/components/brand/SimulatedNotice';
import { BillCard } from '@/components/bills/BillCard';
import { Banner } from '@/components/ui/Banner';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { RowSkeletonList } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { useFetchBill } from '@/hooks/useApiMutations';
import { useBillCategories, useBillers } from '@/hooks/useApiQueries';
import { errorMessage } from '@/services/api/errors';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import { colors, spacing } from '@/theme';
import type { BillCategoryId, Biller, FetchedBill } from '@/types/api';
import type { BillDraft } from '@/types/payment';
import { haptics } from '@/utils/haptics';
import { newIdempotencyKey } from '@/utils/id';
import { formatINR } from '@/utils/money';

const VALID: BillCategoryId[] = ['electricity', 'mobile_postpaid', 'dth', 'water', 'gas', 'broadband', 'insurance'];

export default function BillCategoryScreen() {
  const { category } = useLocalSearchParams<{ category: string }>();
  if (!VALID.includes(category as BillCategoryId)) return <Redirect href="/bills" />;
  return <BillFlow category={category as BillCategoryId} />;
}

function BillFlow({ category }: { category: BillCategoryId }) {
  const flow = usePaymentFlow();
  const categories = useBillCategories();
  const billers = useBillers(category);
  const fetchBill = useFetchBill();

  const [biller, setBiller] = useState<Biller | undefined>();
  const [account, setAccount] = useState('');
  const [bill, setBill] = useState<FetchedBill | null>(null);

  const label = categories.data?.find((c) => c.id === category)?.label ?? 'Bill payment';
  const accountClean = account.trim().toUpperCase();
  const accountValid = biller ? accountClean.length >= biller.minLength && accountClean.length <= biller.maxLength && /^[A-Z0-9-]+$/.test(accountClean) : false;

  const reset = () => {
    setBill(null);
    fetchBill.reset();
  };

  const lookup = async () => {
    if (!biller || !accountValid) return;
    try {
      setBill(await fetchBill.mutateAsync({ billerId: biller.id, accountNumber: accountClean }));
      haptics.success();
    } catch {
      haptics.warning();
      setBill(null);
    }
  };

  const pay = () => {
    if (!bill || !biller) return;
    const draft: BillDraft = {
      kind: 'bill',
      category,
      billerId: biller.id,
      accountNumber: bill.accountNumber,
      amountPaise: bill.amountPaise,
      idempotencyKey: newIdempotencyKey(),
      summary: {
        headline: bill.billerName,
        subline: bill.customerName,
        avatarName: bill.billerName,
        rows: [
          { label: biller.accountLabel, value: bill.accountNumber },
          { label: 'Customer', value: bill.customerName },
          { label: 'Bill number', value: bill.billNumber },
          { label: 'Payment method', value: 'SuperPay balance' },
        ],
      },
    };
    flow.setDraft(draft);
    router.push('/pay/confirm');
  };

  return (
    <Screen
      title={label}
      contentStyle={styles.content}
      footer={
        bill ? (
          <>
            <Button label={`Pay ${formatINR(bill.amountPaise, { compact: true })}`} onPress={pay} />
            <SimulatedNotice compact />
          </>
        ) : undefined
      }
    >
      <View style={styles.group}>
        <AppText variant="title3">1. Choose provider</AppText>
        {billers.isLoading ? (
          <RowSkeletonList count={3} />
        ) : billers.isError ? (
          <ErrorState message={errorMessage(billers.error)} onRetry={() => void billers.refetch()} />
        ) : billers.data && billers.data.length > 0 ? (
          <Card padded={false}>
            {billers.data.map((b, i) => {
              const selected = b.id === biller?.id;
              return (
                <View key={b.id}>
                  {i > 0 ? <Divider /> : null}
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    onPress={() => {
                      haptics.tap();
                      setBiller(b);
                      setAccount('');
                      reset();
                    }}
                    style={styles.biller}
                  >
                    <AppText variant={selected ? 'bodyStrong' : 'body'} style={styles.billerName}>{b.name}</AppText>
                    <Icon name={selected ? 'radio-button-on' : 'radio-button-off'} size={22} color={selected ? colors.primary : colors.borderStrong} />
                  </Pressable>
                </View>
              );
            })}
          </Card>
        ) : (
          <EmptyState icon="business-outline" title="No providers yet" message="Providers for this category will appear here." />
        )}
      </View>

      {biller ? (
        <View style={styles.group}>
          <AppText variant="title3">2. Enter your details</AppText>
          <TextField
            label={biller.accountLabel}
            helper={biller.accountHint}
            value={account}
            onChangeText={(t) => {
              setAccount(t.replace(/[^A-Za-z0-9-]/g, '').slice(0, biller.maxLength));
              if (bill) reset();
            }}
            autoCapitalize="characters"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={lookup}
          />
          <Button label="Fetch bill" variant="secondary" onPress={lookup} disabled={!accountValid} loading={fetchBill.isPending} />
          {fetchBill.isError ? <Banner tone="warning" title="No bill to show" message={errorMessage(fetchBill.error)} /> : null}
        </View>
      ) : null}

      {bill ? (
        <View style={styles.group}>
          <AppText variant="title3">3. Review bill</AppText>
          <BillCard bill={bill} />
        </View>
      ) : null}

      {biller && !bill ? <AppText variant="caption" color="textTertiary">Tip: an account number ending in 000 shows the “no pending bill” state.</AppText> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingTop: spacing.md },
  group: { gap: spacing.md },
  biller: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 56, paddingHorizontal: spacing.lg },
  billerName: { flex: 1 },
});
