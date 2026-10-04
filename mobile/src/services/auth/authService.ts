import { api } from '@/services/api/client';
import type { SessionResponse, User, Wallet } from '@/types/api';

export interface SessionInput {
  name: string;
  mobile: string;
  email?: string;
}

export const authService = {
  /** Prototype sign-in: no OTP / PIN / password. Replace with a real identity provider later. */
  createSession: (input: SessionInput) => api.post<SessionResponse>('/auth/session', input, { auth: false }),

  getMe: () => api.get<{ user: User; wallet: Wallet }>('/me'),

  updateProfile: (patch: { name?: string; email?: string | null }) => api.patch<{ user: User }>('/me', patch),

  resetDemoData: () => api.post<{ user: User; wallet: Wallet }>('/me/reset-demo'),
};
