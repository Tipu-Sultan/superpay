import type { Request, Response } from 'express';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  unreadNotificationCount,
} from '../services/notification.service';
import { userIdOf } from '../middleware/auth';
import { parseOrThrow } from '../utils/parse';
import { ok } from '../utils/respond';
import { notificationIdSchema } from '../validators/schemas';

export async function listNotificationsHandler(req: Request, res: Response) {
  const userId = userIdOf(req);
  ok(res, await listNotifications(userId));
}

export async function unreadCountHandler(req: Request, res: Response) {
  ok(res, { count: await unreadNotificationCount(userIdOf(req)) });
}

export async function markReadHandler(req: Request, res: Response) {
  const { id } = parseOrThrow(notificationIdSchema, req.params);
  await markNotificationRead(userIdOf(req), id);
  ok(res, { success: true });
}

export async function markAllReadHandler(req: Request, res: Response) {
  await markAllNotificationsRead(userIdOf(req));
  ok(res, { success: true });
}
