import { api } from '@/services/api/client';
import type { SessionResponse, User, Wallet } from '@/types/api';

export interface OtpRequestResponse {
  expiresInSeconds: number;
  demo: boolean;
  devCode?: string;
}

export interface SessionInput {
  name: string;
  mobile: string;
  email?: string;
}

export const authService = {
  requestOtp: (input: SessionInput) => api.post<OtpRequestResponse>('/auth/otp/request', input, { auth: false }),

  verifyOtp: (input: { mobile: string; code: string }) =>
    api.post<SessionResponse>('/auth/otp/verify', input, { auth: false }),

  createSession: (input: SessionInput) => api.post<SessionResponse>('/auth/session', input, { auth: false }),

  getMe: () => api.get<{ user: User; wallet: Wallet }>('/me'),

  updateProfile: (patch: { name?: string; email?: string | null }) => api.patch<{ user: User }>('/me', patch),

  resetDemoData: () => api.post<{ user: User; wallet: Wallet }>('/me/reset-demo'),
};
