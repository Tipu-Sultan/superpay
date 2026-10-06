import type { Request, Response } from 'express';
import { fetchBill, listBillCategories, listBillers, payBill } from '../services/bill.service';
import { serializeTransaction } from '../services/transaction.service';
import { getWallet } from '../services/wallet.service';
import { parseOrThrow } from '../utils/parse';
import { ok } from '../utils/respond';
import { billFetchSchema, billPaySchema, billersQuerySchema } from '../validators/schemas';
import { userIdOf } from '../middleware/auth';
import { publishTransactionUpdate } from '../services/notification.service';

export function getCategories(_req: Request, res: Response) {
  ok(res, listBillCategories());
}

export async function getBillers(req: Request, res: Response) {
  const { category } = parseOrThrow(billersQuerySchema, req.query);
  ok(res, await listBillers(category));
}

export async function fetchBillHandler(req: Request, res: Response) {
  const { billerId, accountNumber } = parseOrThrow(billFetchSchema, req.body);
  ok(res, await fetchBill(billerId, accountNumber));
}

export async function payBillHandler(req: Request, res: Response) {
  const userId = userIdOf(req);
  const body = parseOrThrow(billPaySchema, req.body);
  const txn = await payBill({ userId, ...body });
  const wallet = await getWallet(userId);
  const transaction = serializeTransaction(txn);
  await publishTransactionUpdate(userId, transaction, wallet);
  ok(res, { transaction, wallet }, 201);
}
