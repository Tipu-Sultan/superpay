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
import { authService } from '@/services/auth/authService';
import { useAuth } from '@/store/AuthContext';
import { colors, spacing } from '@/theme';
import { haptics } from '@/utils/haptics';
import { isValidEmail, isValidMobile, normalizeMobile, sanitizeMobileInput } from '@/utils/validation';

interface Errors {
  name?: string;
  mobile?: string;
  email?: string;
  otp?: string;
}

export default function OnboardingScreen() {
  const { signInWithSession } = useAuth();
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showServer, setShowServer] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [demoCode, setDemoCode] = useState<string | null>(null);

  const validate = (): boolean => {
    const next: Errors = {};
    if (name.trim().length < 2) next.name = 'Enter your name';
    if (!isValidMobile(normalizeMobile(mobile))) next.mobile = 'Enter a valid 10 digit mobile number';
    if (email.trim() && !isValidEmail(email)) next.email = 'Enter a valid email address';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const sendOtp = async () => {
    setSubmitError(null);
    if (!validate()) {
      haptics.warning();
      return;
    }
    setLoading(true);
    try {
      const response = await authService.requestOtp({
        name: name.trim(),
        mobile: normalizeMobile(mobile),
        email: email.trim() || undefined,
      });
      setDemoCode(response.devCode ?? null);
      setOtpSent(true);
      haptics.success();
    } catch (error) {
      haptics.error();
      setSubmitError(errorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setSubmitError(null);
    const next: Errors = {};
    if (!/^\d{6}$/.test(otp)) next.otp = 'Enter the 6 digit OTP';
    setErrors(next);
    if (Object.keys(next).length > 0) {
      haptics.warning();
      return;
    }

    setLoading(true);
    try {
      const session = await authService.verifyOtp({ mobile: normalizeMobile(mobile), code: otp });
      await signInWithSession(session);
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
          <Button
            label={otpSent ? 'Verify OTP' : 'Send OTP'}
            onPress={otpSent ? verify : sendOtp}
            loading={loading}
          />
          {otpSent ? (
            <Button
              label="Change number"
              onPress={() => {
                setOtpSent(false);
                setOtp('');
                setDemoCode(null);
                setSubmitError(null);
              }}
              variant="ghost"
            />
          ) : null}
          <SimulatedNotice compact />
        </>
      }
    >
      <View style={styles.hero}>
        <Logo />
        <AppText variant="title1">{otpSent ? 'Verify your mobile number' : 'Pay, recharge and split bills in a tap'}</AppText>
        <AppText color="textSecondary">
          {otpSent
            ? `We sent a 6 digit OTP to +91 ${normalizeMobile(mobile)}.`
            : 'Create your SuperPay profile and verify your mobile number with OTP.'}
        </AppText>
      </View>

      <View style={styles.form}>
        {!otpSent ? (
          <>
            <TextField label="Full name" value={name} onChangeText={setName} error={errors.name} placeholder="e.g. Amit Sharma" autoCapitalize="words" autoComplete="name" textContentType="name" returnKeyType="next" />
            <TextField label="Mobile number" prefix="+91" value={mobile} onChangeText={(t) => setMobile(sanitizeMobileInput(t))} error={errors.mobile} placeholder="98765 43210" keyboardType="number-pad" maxLength={10} autoComplete="tel" returnKeyType="next" />
            <TextField label="Email (optional)" value={email} onChangeText={setEmail} error={errors.email} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" returnKeyType="done" onSubmitEditing={sendOtp} />
          </>
        ) : (
          <>
            <TextField
              label="6 digit OTP"
              value={otp}
              onChangeText={(value) => setOtp(value.replace(/\D/g, '').slice(0, 6))}
              error={errors.otp}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              textContentType="oneTimeCode"
              returnKeyType="done"
              onSubmitEditing={verify}
            />
            {demoCode ? <Banner tone="info" title="Development OTP" message={`Use ${demoCode}. Twilio is not configured for this server.`} /> : null}
            <Pressable accessibilityRole="button" onPress={sendOtp} disabled={loading} hitSlop={8}>
              <AppText variant="label" color="link" align="center">Resend OTP</AppText>
            </Pressable>
          </>
        )}
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
