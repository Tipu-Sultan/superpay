import type { Request, Response } from 'express';
import { processPayment } from '../services/payment/payment.service';
import { resolveRecipient } from '../services/payment/recipientResolver';
import { serializeTransaction } from '../services/transaction.service';
import { getWallet } from '../services/wallet.service';
import { getUserOrThrow } from '../services/user.service';
import { addMoney } from '../services/addMoney.service';
import { parseOrThrow } from '../utils/parse';
import { ok } from '../utils/respond';
import { addMoneySchema, sendMoneySchema } from '../validators/schemas';
import { userIdOf } from '../middleware/auth';

export async function sendMoney(req: Request, res: Response) {
  const userId = userIdOf(req);
  const body = parseOrThrow(sendMoneySchema, req.body);
  const user = await getUserOrThrow(userId);

  const counterparty = await resolveRecipient(userId, { mobile: user.mobile, upiId: user.upiId }, body.recipient);
  const txn = await processPayment({
    userId,
    type: 'sent',
    direction: 'debit',
    amountPaise: body.amountPaise,
    counterparty,
    note: body.note,
    paymentMethod: 'wallet',
    idempotencyKey: body.idempotencyKey,
  });

  ok(res, { transaction: serializeTransaction(txn), wallet: await getWallet(userId) }, 201);
}

export async function addMoneyHandler(req: Request, res: Response) {
  const userId = userIdOf(req);
  const body = parseOrThrow(addMoneySchema, req.body);
  const txn = await addMoney({ userId, ...body });
  ok(res, { transaction: serializeTransaction(txn), wallet: await getWallet(userId) }, 201);
}
