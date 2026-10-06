import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { verifyToken } from './auth.service';
import { env } from '../config/env';

let io: Server | null = null;
let redisClients: ReturnType<typeof createClient>[] = [];

export async function initRealtime(server: HttpServer): Promise<Server> {
  io = new Server(server, {
    cors: {
      origin: env.corsOrigins === '*' ? true : env.corsOrigins,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.use((socket, next) => {
    try {
      const token = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : '';
      const userId = verifyToken(token);
      socket.data.userId = userId;
      next();
    } catch {
      next(new Error('Authentication required.'));
    }
  });

  if (env.redisUrl) {
    const pubClient = createClient({ url: env.redisUrl });
    const subClient = pubClient.duplicate();
    await Promise.all([pubClient.connect(), subClient.connect()]);
    redisClients = [pubClient, subClient];
    io.adapter(createAdapter(pubClient, subClient));
  }

  io.on('connection', (socket) => {
    const userId = String(socket.data.userId);
    socket.join(userRoom(userId));
    socket.emit('realtime:ready', { connectedAt: new Date().toISOString() });

    const token = typeof socket.handshake.auth?.token === 'string' ? socket.handshake.auth.token : '';
    const payload = jwt.decode(token) as { exp?: number } | null;
    if (payload?.exp) {
      const delay = Math.max(0, payload.exp * 1000 - Date.now());
      setTimeout(() => socket.disconnect(true), delay).unref();
    }
  });

  return io;
}

export function emitToUser<T>(userId: string, event: string, data: T): void {
  io?.to(userRoom(userId)).emit(event, data);
}

function userRoom(userId: string): string {
  return `user:${userId}`;
}


export async function closeRealtime(): Promise<void> {
  io?.close();
  io = null;
  await Promise.all(redisClients.map((client) => client.quit().catch(() => undefined)));
  redisClients = [];
}
