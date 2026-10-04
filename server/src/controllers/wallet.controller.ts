import type { Request, Response } from 'express';
import { getWallet } from '../services/wallet.service';
import { ok } from '../utils/respond';
import { userIdOf } from '../middleware/auth';

export async function getWalletHandler(req: Request, res: Response) {
  ok(res, await getWallet(userIdOf(req)));
}
