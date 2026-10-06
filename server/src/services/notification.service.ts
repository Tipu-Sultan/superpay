import { Types } from 'mongoose';
import { Notification } from '../models';
import type { NotificationDTO } from '../types/dto';
import { emitToUser } from './realtime.service';
import type { TransactionDTO } from '../types/dto';
import { logger } from '../utils/logger';

export function serializeNotification(n: {
  _id: unknown;
  type: NotificationDTO['type'];
  title: string;
  body: string;
  data?: unknown;
  readAt?: Date | null;
  createdAt: Date;
}): NotificationDTO {
  return {
    id: String(n._id),
    type: n.type,
    title: n.title,
    body: n.body,
    data: (n.data as Record<string, unknown> | undefined) ?? undefined,
    readAt: n.readAt ? new Date(n.readAt).toISOString() : undefined,
    createdAt: new Date(n.createdAt).toISOString(),
  };
}

export async function createNotification(input: {
  userId: string;
  type: NotificationDTO['type'];
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<NotificationDTO> {
  const notification = await Notification.create({
    user: new Types.ObjectId(input.userId),
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data,
  });
  const dto = serializeNotification(notification);
  emitToUser(input.userId, 'notification:new', dto);
  return dto;
}

export async function listNotifications(userId: string, limit = 50): Promise<NotificationDTO[]> {
  const docs = await Notification.find({ user: userId }).sort({ createdAt: -1 }).limit(limit).lean();
  return docs.map((n) => serializeNotification(n as never));
}

export async function unreadNotificationCount(userId: string): Promise<number> {
  return Notification.countDocuments({ user: userId, readAt: { $exists: false } });
}

export async function markNotificationRead(userId: string, notificationId: string): Promise<void> {
  await Notification.updateOne(
    { _id: notificationId, user: userId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } },
  );
}

export async function markAllNotificationsRead(userId: string): Promise<void> {
  await Notification.updateMany(
    { user: userId, readAt: { $exists: false } },
    { $set: { readAt: new Date() } },
  );
}

export async function publishTransactionUpdate(userId: string, transaction: TransactionDTO, wallet: { balancePaise: number; currency: 'INR' }) {
  emitToUser(userId, 'transaction:updated', { transaction, wallet });

  const title =
    transaction.status === 'success'
      ? transaction.type === 'add_money' ? 'Money added' : 'Payment successful'
      : transaction.status === 'pending'
        ? 'Payment pending'
        : 'Payment failed';
  const body =
    transaction.status === 'success'
      ? `${formatNotificationAmount(transaction.amountPaise)} ${transaction.type === 'add_money' ? 'was added to your balance.' : `was processed for ${transaction.counterparty.name}.`}`
      : transaction.status === 'pending'
        ? `${formatNotificationAmount(transaction.amountPaise)} is still being processed.`
        : `${formatNotificationAmount(transaction.amountPaise)} was not processed. ${transaction.failureReason ?? ''}`.trim();

  try {
    const existing = await Notification.findOne({
      user: userId,
      type: 'transaction',
      'data.transactionId': transaction.id,
      'data.status': transaction.status,
    }).lean();

    if (!existing) {
      await createNotification({
        userId,
        type: 'transaction',
        title,
        body,
        data: { transactionId: transaction.id, txnId: transaction.txnId, status: transaction.status },
      });
    }
  } catch (error) {
    // Notifications are secondary to the payment ledger and must never turn a successful payment into a 500.
    logger.error('Could not persist transaction notification', error);
  }
}

function formatNotificationAmount(amountPaise: number): string {
  return `₹${(amountPaise / 100).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
