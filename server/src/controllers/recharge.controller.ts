import type { Request, Response } from 'express';
import { getRechargeOptions, listPlans, payRecharge } from '../services/recharge.service';
import { serializeTransaction } from '../services/transaction.service';
import { getWallet } from '../services/wallet.service';
import { parseOrThrow } from '../utils/parse';
import { ok } from '../utils/respond';
import { plansQuerySchema, rechargePaySchema } from '../validators/schemas';
import { userIdOf } from '../middleware/auth';

export function getOptions(_req: Request, res: Response) {
  ok(res, getRechargeOptions());
}

export async function getPlans(req: Request, res: Response) {
  const { operatorId, category } = parseOrThrow(plansQuerySchema, req.query);
  ok(res, await listPlans(operatorId, category));
}

export async function pay(req: Request, res: Response) {
  const userId = userIdOf(req);
  const body = parseOrThrow(rechargePaySchema, req.body);
  const txn = await payRecharge({ userId, ...body });
  ok(res, { transaction: serializeTransaction(txn), wallet: await getWallet(userId) }, 201);
}
