import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Logo } from '@/components/brand/Logo';
import { SimulatedNotice } from '@/components/brand/SimulatedNotice';
import { ServerAddressField } from '@/components/ServerAddressField';
import { AppText } from '@/components/ui/AppText';
import { Banner } from '@/components/ui/Banner';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { TextField } from '@/components/ui/TextField';
import { errorMessage } from '@/services/api/errors';
import { useAuth } from '@/store/AuthContext';
import { colors, spacing } from '@/theme';
import { haptics } from '@/utils/haptics';
import { isValidEmail, isValidMobile, normalizeMobile, sanitizeMobileInput } from '@/utils/validation';

interface Errors {
  name?: string;
  mobile?: string;
  email?: string;
}

export default function OnboardingScreen() {
  const { signIn } = useAuth();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showServer, setShowServer] = useState(false);

  const validate = (): boolean => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Enter your name';
    if (!isValidMobile(normalizeMobile(mobile))) next.mobile = 'Enter a valid 10 digit mobile number';
    if (email.trim() && !isValidEmail(email)) next.email = 'Enter a valid email address';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async () => {
    setSubmitError(null);
    if (!validate()) {
      haptics.warning();
      return;
    }
    setLoading(true);
    try {
      await signIn({ name: name.trim(), mobile: normalizeMobile(mobile), email: email.trim() || undefined });
      haptics.success();
    } catch (error) {
      haptics.error();
      setSubmitError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      noHeader
      background={colors.surface}
      contentStyle={styles.content}
      footer={
        <>
          <Button label="Continue" onPress={submit} loading={loading} />
          <SimulatedNotice compact />
        </>
      }
    >
      <View style={styles.hero}>
        <Logo />
        <AppText variant="title1">Pay, recharge and split bills in a tap</AppText>
        <AppText color="textSecondary">Create a demo profile to explore SuperPay. We never ask for an OTP, PIN or bank password.</AppText>
      </View>

      <View style={styles.form}>
        <TextField label="Full name" value={name} onChangeText={setName} error={errors.name} placeholder="e.g. Tipu Sharma" autoCapitalize="words" autoComplete="name" textContentType="name" returnKeyType="next" />
        <TextField label="Mobile number" prefix="+91" value={mobile} onChangeText={(t) => setMobile(sanitizeMobileInput(t))} error={errors.mobile} placeholder="98765 43210" keyboardType="number-pad" maxLength={10} autoComplete="tel" returnKeyType="next" />
        <TextField label="Email (optional)" value={email} onChangeText={setEmail} error={errors.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="done" onSubmitEditing={submit} />
        {submitError ? <Banner tone="error" title="Couldn't continue" message={submitError} /> : null}
      </View>

      <Pressable accessibilityRole="button" onPress={() => setShowServer((s) => !s)} hitSlop={8}>
        <AppText variant="label" color="link">{showServer ? 'Hide server settings' : 'Server settings'}</AppText>
      </Pressable>
      {showServer ? <ServerAddressField /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingTop: spacing.xxl, gap: spacing.xxl },
  hero: { gap: spacing.md },
  form: { gap: spacing.lg },
});
