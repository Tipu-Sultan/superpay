import type { Request, Response } from 'express';
import { createDemoSession } from '../services/auth.service';
import { getWallet } from '../services/wallet.service';
import { getUserOrThrow, resetDemoData, serializeUser, updateProfile } from '../services/user.service';
import { env } from '../config/env';
import { MIN_AMOUNT_PAISE } from '../utils/money';
import { parseOrThrow } from '../utils/parse';
import { ok } from '../utils/respond';
import { otpRequestSchema, otpVerifySchema, sessionSchema, updateProfileSchema } from '../validators/schemas';
import { userIdOf } from '../middleware/auth';
import { listFundingSources } from '../services/addMoney.service';
import { requestOtp, verifyOtp } from '../services/otp.service';
import { ApiError } from '../utils/ApiError';

export async function requestPhoneOtp(req: Request, res: Response) {
  const body = parseOrThrow(otpRequestSchema, req.body);
  ok(res, await requestOtp(body));
}

export async function verifyPhoneOtp(req: Request, res: Response) {
  const body = parseOrThrow(otpVerifySchema, req.body);
  const verified = await verifyOtp(body);
  const session = await createDemoSession(verified);
  const wallet = await getWallet(session.user.id);
  ok(res, { ...session, wallet }, session.isNew ? 201 : 200);
}

export async function createSession(req: Request, res: Response) {
  if (env.isProduction) throw ApiError.forbidden('Passwordless demo sign-in is disabled. Verify your mobile number with OTP.');
  const body = parseOrThrow(sessionSchema, req.body);
  const session = await createDemoSession(body);
  const wallet = await getWallet(session.user.id);
  ok(res, { ...session, wallet }, session.isNew ? 201 : 200);
}

export async function getMe(req: Request, res: Response) {
  const userId = userIdOf(req);
  const [user, wallet] = await Promise.all([getUserOrThrow(userId), getWallet(userId)]);
  ok(res, { user: serializeUser(user), wallet });
}

export async function patchMe(req: Request, res: Response) {
  const userId = userIdOf(req);
  const patch = parseOrThrow(updateProfileSchema, req.body);
  const user = await updateProfile(userId, patch);
  ok(res, { user: serializeUser(user) });
}

export async function resetDemo(req: Request, res: Response) {
  const userId = userIdOf(req);
  await resetDemoData(userId);
  const [user, wallet] = await Promise.all([getUserOrThrow(userId), getWallet(userId)]);
  ok(res, { user: serializeUser(user), wallet });
}

/** Limits and funding sources the app needs to render forms correctly. */
export function getPaymentConfig(_req: Request, res: Response) {
  ok(res, {
    minAmountPaise: MIN_AMOUNT_PAISE,
    maxAmountPaise: env.txnLimitPaise,
    simulated: true,
    fundingSources: listFundingSources(),
  });
}
