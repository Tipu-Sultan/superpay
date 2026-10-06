import { io, type Socket } from 'socket.io-client';
import { getApiBaseUrl } from './api/serverConfig';
import type { Notification, PaymentResponse } from '@/types/api';

let socket: Socket | null = null;

function socketUrl(): string {
  return getApiBaseUrl().replace(/\/api\/?$/, '');
}

export function connectRealtime(
  token: string,
  handlers: {
    onNotification?: (notification: Notification) => void;
    onTransaction?: (payload: PaymentResponse) => void;
  } = {},
): void {
  disconnectRealtime();

  socket = io(socketUrl(), {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    timeout: 10_000,
  });

  socket.on('connect_error', () => {
    // HTTP remains the source of truth; React Query retries when the socket is unavailable.
  });

  socket.on('notification:new', handlers.onNotification ?? (() => undefined));
  socket.on('transaction:updated', handlers.onTransaction ?? (() => undefined));
}

export function disconnectRealtime(): void {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}

export function isRealtimeConnected(): boolean {
  return socket?.connected ?? false;
}
