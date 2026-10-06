import type { Request, Response } from 'express';
import {
  getTransaction,
  listTransactions,
  refreshPendingTransaction,
  serializeTransaction,
} from '../services/transaction.service';
import { getWallet } from '../services/wallet.service';
import { parseOrThrow } from '../utils/parse';
import { ok } from '../utils/respond';
import { transactionsQuerySchema } from '../validators/schemas';
import { userIdOf } from '../middleware/auth';
import { publishTransactionUpdate } from '../services/notification.service';

export async function listTransactionsHandler(req: Request, res: Response) {
  const userId = userIdOf(req);
  const query = parseOrThrow(transactionsQuerySchema, req.query);
  ok(res, await listTransactions({ userId, ...query }));
}

export async function getTransactionHandler(req: Request, res: Response) {
  const txn = await getTransaction(userIdOf(req), String(req.params.id));
  ok(res, serializeTransaction(txn));
}

export async function refreshTransactionHandler(req: Request, res: Response) {
  const userId = userIdOf(req);
  const txn = await refreshPendingTransaction(userId, String(req.params.id));
  const wallet = await getWallet(userId);
  const transaction = serializeTransaction(txn);
  await publishTransactionUpdate(userId, transaction, wallet);
  ok(res, { transaction, wallet });
}
