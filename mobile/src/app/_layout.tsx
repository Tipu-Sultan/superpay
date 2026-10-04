import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Sora_600SemiBold, Sora_700Bold } from '@expo-google-fonts/sora';
import { DMSans_400Regular, DMSans_500Medium, DMSans_700Bold } from '@expo-google-fonts/dm-sans';
import { ConnectionError } from '@/components/ConnectionError';
import { queryClient, wireQueryFocus } from '@/lib/queryClient';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { PaymentFlowProvider } from '@/store/PaymentFlowContext';
import { ToastProvider } from '@/store/ToastContext';
import { colors } from '@/theme';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Sora_600SemiBold,
    Sora_700Bold,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => wireQueryFocus(), []);

  // If fonts fail to load we still start (system font fallback) rather than blocking the app.
  const ready = fontsLoaded || Boolean(fontError);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <ToastProvider>
              <PaymentFlowProvider>
                <RootNavigator fontsReady={ready} />
              </PaymentFlowProvider>
            </ToastProvider>
          </AuthProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function RootNavigator({ fontsReady }: { fontsReady: boolean }) {
  const { state, retryBootstrap } = useAuth();
  const booting = !fontsReady || state.status === 'loading';

  useEffect(() => {
    if (!booting) void SplashScreen.hideAsync();
  }, [booting]);

  if (booting) return null;
  if (state.status === 'unreachable') return <ConnectionError message={state.message} onRetry={retryBootstrap} />;

  const signedIn = state.status === 'signedIn';

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background }, animation: 'slide_from_right' }}>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(tabs)" options={{ animation: 'fade' }} />
        <Stack.Screen name="send/recipient" />
        <Stack.Screen name="send/amount" />
        <Stack.Screen name="pay/confirm" />
        <Stack.Screen name="pay/result" options={{ gestureEnabled: false, animation: 'fade' }} />
        <Stack.Screen name="receive" />
        <Stack.Screen name="scan" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="add-money" />
        <Stack.Screen name="recharge/index" />
        <Stack.Screen name="bills/index" />
        <Stack.Screen name="bills/[category]" />
        <Stack.Screen name="transaction/[id]" />
        <Stack.Screen name="edit-profile" />
      </Stack.Protected>
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}
