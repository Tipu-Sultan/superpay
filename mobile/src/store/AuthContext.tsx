import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { authService, type SessionInput } from '@/services/auth/authService';
import { tokenStorage } from '@/services/auth/tokenStorage';
import { setAuthToken, setUnauthorizedHandler } from '@/services/api/client';
import { connectRealtime, disconnectRealtime } from '@/services/realtimeService';
import type { SessionResponse } from '@/types/api';
import { isApiError } from '@/services/api/errors';
import { loadServerUrlOverride } from '@/services/api/serverConfig';
import { queryKeys } from '@/hooks/queryKeys';
import type { User } from '@/types/api';

type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'unreachable'; message: string }
  | { status: 'signedIn'; user: User };

interface AuthContextValue {
  state: AuthState;
  user: User | null;
  signIn: (input: SessionInput) => Promise<void>;
  signInWithSession: (session: SessionResponse) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User) => void;
  /** Re-run the startup check (used by the "Try again" button on the connection error screen). */
  retryBootstrap: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>({ status: 'loading' });
  const [bootstrapRun, setBootstrapRun] = useState(0);

  const clearSession = useCallback(async () => {
    disconnectRealtime();
    setAuthToken(null);
    await tokenStorage.clear();
    queryClient.clear();
  }, [queryClient]);

  // Restore a saved session at startup.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setState({ status: 'loading' });
      await loadServerUrlOverride();
      const token = await tokenStorage.get();
      if (!token) {
        if (!cancelled) setState({ status: 'signedOut' });
        return;
      }
      setAuthToken(token);
      try {
        const { user, wallet } = await authService.getMe();
        if (cancelled) return;
        queryClient.setQueryData(queryKeys.wallet, wallet);
        connectRealtime(token, {
          onNotification: () => {
            void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
            void queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications });
          },
          onTransaction: (payload) => {
            queryClient.setQueryData(queryKeys.wallet, payload.wallet);
            queryClient.setQueryData(queryKeys.transaction(payload.transaction.id), payload.transaction);
            void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
          },
        });
        setState({ status: 'signedIn', user });
      } catch (error) {
        if (cancelled) return;
        if (isApiError(error) && error.status === 401) {
          await clearSession();
          setState({ status: 'signedOut' });
        } else {
          setState({
            status: 'unreachable',
            message: isApiError(error) ? error.message : 'We could not reach SuperPay right now.',
          });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bootstrapRun, clearSession, queryClient]);

  // A 401 from any request means the token is no longer valid.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void clearSession().then(() => setState({ status: 'signedOut' }));
    });
    return () => setUnauthorizedHandler(null);
  }, [clearSession]);

  const signInWithSession = useCallback(
    async (session: SessionResponse) => {
      await tokenStorage.set(session.token);
      setAuthToken(session.token);
      queryClient.clear();
      queryClient.setQueryData(queryKeys.wallet, session.wallet);
      connectRealtime(session.token, {
        onNotification: () => {
          void queryClient.invalidateQueries({ queryKey: queryKeys.notifications });
          void queryClient.invalidateQueries({ queryKey: queryKeys.unreadNotifications });
        },
        onTransaction: (payload) => {
          queryClient.setQueryData(queryKeys.wallet, payload.wallet);
          queryClient.setQueryData(queryKeys.transaction(payload.transaction.id), payload.transaction);
          void queryClient.invalidateQueries({ queryKey: queryKeys.transactions });
        },
      });
      setState({ status: 'signedIn', user: session.user });
    },
    [queryClient],
  );

  const signIn = useCallback(
    async (input: SessionInput) => {
      await signInWithSession(await authService.createSession(input));
    },
    [signInWithSession],
  );

  const signOut = useCallback(async () => {
    await clearSession();
    setState({ status: 'signedOut' });
  }, [clearSession]);

  const setUser = useCallback((user: User) => setState({ status: 'signedIn', user }), []);
  const retryBootstrap = useCallback(() => setBootstrapRun((n) => n + 1), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      user: state.status === 'signedIn' ? state.user : null,
      signIn,
      signInWithSession,
      signOut,
      setUser,
      retryBootstrap,
    }),
    [state, signIn, signInWithSession, signOut, setUser, retryBootstrap],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

/** For screens that only render when signed in. */
export function useCurrentUser(): User {
  const { user } = useAuth();
  if (!user) throw new Error('useCurrentUser called while signed out');
  return user;
}
