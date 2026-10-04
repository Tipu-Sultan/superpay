import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SimulatedNotice } from '@/components/brand/SimulatedNotice';
import { OperatorPicker } from '@/components/recharge/OperatorPicker';
import { PlanCard } from '@/components/recharge/PlanCard';
import { AppText } from '@/components/ui/AppText';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Icon } from '@/components/ui/Icon';
import { Screen } from '@/components/ui/Screen';
import { SelectSheet } from '@/components/ui/SelectSheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { TextField } from '@/components/ui/TextField';
import { useRechargeOptions, useRechargePlans } from '@/hooks/useApiQueries';
import { errorMessage } from '@/services/api/errors';
import { useCurrentUser } from '@/store/AuthContext';
import { usePaymentFlow } from '@/store/PaymentFlowContext';
import { colors, radius, spacing } from '@/theme';
import type { PlanCategory, RechargePlan } from '@/types/api';
import type { RechargeDraft } from '@/types/payment';
import { newIdempotencyKey } from '@/utils/id';
import { formatINR } from '@/utils/money';
import { formatMobile, isValidMobile, sanitizeMobileInput } from '@/utils/validation';

const CATEGORIES: { value: PlanCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All plans' },
  { value: 'popular', label: 'Popular' },
  { value: 'data', label: 'Data' },
  { value: 'unlimited', label: 'Long validity' },
];

export default function RechargeScreen() {
  const user = useCurrentUser();
  const flow = usePaymentFlow();
  const options = useRechargeOptions();

  const [mobile, setMobile] = useState(user.mobile);
  const [operatorId, setOperatorId] = useState<string | undefined>();
  const [circleId, setCircleId] = useState<string | undefined>();
  const [category, setCategory] = useState<PlanCategory | 'all'>('all');
  const [planId, setPlanId] = useState<string | undefined>();
  const [circleSheet, setCircleSheet] = useState(false);

  const plans = useRechargePlans(operatorId, category === 'all' ? undefined : category);

  const operator = options.data?.operators.find((o) => o.id === operatorId);
  const circle = options.data?.circles.find((c) => c.id === circleId);
  const plan: RechargePlan | undefined = useMemo(() => plans.data?.find((p) => p.id === planId), [plans.data, planId]);

  const mobileValid = isValidMobile(mobile);
  const ready = mobileValid && Boolean(operator) && Boolean(circle) && Boolean(plan);

  const proceed = () => {
    if (!ready || !operator || !circle || !plan) return;
    const draft: RechargeDraft = {
      kind: 'recharge',
      mobile,
      operatorId: operator.id,
      circleId: circle.id,
      planId: plan.id,
      amountPaise: plan.pricePaise,
      idempotencyKey: newIdempotencyKey(),
      summary: {
        headline: `${operator.name} recharge`,
        subline: formatMobile(mobile),
        avatarName: operator.name,
        avatarColor: operator.color,
        rows: [
          { label: 'Mobile number', value: formatMobile(mobile) },
          { label: 'Operator', value: operator.name },
          { label: 'Circle', value: circle.name },
          { label: 'Plan', value: `${plan.data} · ${plan.validityDays} days` },
          { label: 'Payment method', value: 'SuperPay balance' },
        ],
      },
    };
    flow.setDraft(draft);
    router.push('/pay/confirm');
  };

  return (
    <Screen
      title="Mobile recharge"
      contentStyle={styles.content}
      footer={
        <>
          <Button label={plan ? `Proceed to pay ${formatINR(plan.pricePaise, { compact: true })}` : 'Choose a plan'} onPress={proceed} disabled={!ready} />
          <SimulatedNotice compact />
        </>
      }
    >
      <TextField
        label="Mobile number"
        prefix="+91"
        value={mobile}
        onChangeText={(t) => setMobile(sanitizeMobileInput(t))}
        keyboardType="number-pad"
        maxLength={10}
        error={mobile.length > 0 && !mobileValid ? 'Enter a valid 10 digit mobile number' : null}
        right={mobile !== user.mobile ? <AppText variant="label" color="link" onPress={() => setMobile(user.mobile)} accessibilityRole="button">My number</AppText> : undefined}
      />

      {options.isLoading ? (
        <Skeleton height={120} rounded={radius.md} />
      ) : options.isError ? (
        <ErrorState message={errorMessage(options.error)} onRetry={() => void options.refetch()} />
      ) : (
        <>
          <View style={styles.group}>
            <AppText variant="label" color="textSecondary">Operator</AppText>
            <OperatorPicker
              operators={options.data?.operators ?? []}
              selectedId={operatorId}
              onSelect={(id) => {
                setOperatorId(id);
                setPlanId(undefined);
              }}
            />
          </View>

          <View style={styles.group}>
            <AppText variant="label" color="textSecondary">Circle</AppText>
            <Pressable accessibilityRole="button" accessibilityLabel={`Circle: ${circle?.name ?? 'not selected'}`} onPress={() => setCircleSheet(true)} style={styles.select}>
              <AppText color={circle ? 'textPrimary' : 'textTertiary'} style={styles.selectText}>{circle?.name ?? 'Select your circle'}</AppText>
              <Icon name="chevron-down" size={20} color={colors.textTertiary} />
            </Pressable>
          </View>

          <View style={styles.group}>
            <AppText variant="label" color="textSecondary">Plan</AppText>
            {!operator ? (
              <AppText variant="caption" color="textTertiary">Choose an operator to see plans.</AppText>
            ) : (
              <>
                <View style={styles.chips}>
                  {CATEGORIES.map((c) => <Chip key={c.value} label={c.label} selected={category === c.value} onPress={() => { setCategory(c.value); setPlanId(undefined); }} />)}
                </View>
                {plans.isLoading ? (
                  <View style={styles.plans}><Skeleton height={110} rounded={radius.lg} /><Skeleton height={110} rounded={radius.lg} /></View>
                ) : plans.isError ? (
                  <ErrorState message={errorMessage(plans.error)} onRetry={() => void plans.refetch()} />
                ) : plans.data && plans.data.length > 0 ? (
                  <View style={styles.plans}>
                    {plans.data.map((p) => <PlanCard key={p.id} plan={p} selected={p.id === planId} onPress={(x) => setPlanId(x.id)} />)}
                  </View>
                ) : (
                  <EmptyState icon="pricetags-outline" title="No plans in this category" message="Try another category." />
                )}
              </>
            )}
          </View>
        </>
      )}

      <SelectSheet
        visible={circleSheet}
        title="Select circle"
        searchable
        options={(options.data?.circles ?? []).map((c) => ({ value: c.id, label: c.name }))}
        selected={circleId}
        onSelect={setCircleId}
        onClose={() => setCircleSheet(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { gap: spacing.xl, paddingTop: spacing.md },
  group: { gap: spacing.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  plans: { gap: spacing.md },
  select: { flexDirection: 'row', alignItems: 'center', minHeight: 54, paddingHorizontal: spacing.lg, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  selectText: { flex: 1 },
});
