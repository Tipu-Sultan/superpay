import jwt from 'jsonwebtoken';
import { User, Wallet, type UserDoc } from '../models';
import { AVATAR_COLORS } from '../models/constants';
import { env } from '../config/env';
import { seedDemoData } from '../seed/demoData';
import { ApiError } from '../utils/ApiError';
import { fnv1a } from '../utils/hash';
import { normalizeMobile, upiIdForMobile } from '../utils/validation';
import { serializeUser } from './user.service';

export function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn as jwt.SignOptions['expiresIn'] });
}

export function verifyToken(token: string): string {
  try {
    const payload = jwt.verify(token, env.jwtSecret);
    if (typeof payload === 'string' || !payload.sub) throw new Error('bad payload');
    return String(payload.sub);
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.');
  }
}

export interface DemoSessionInput {
  name: string;
  mobile: string;
  email?: string;
}

/**
 * Prototype sign-in: creates (or reuses) a demo profile for a mobile number.
 *
 * There is deliberately NO password, OTP, PIN or banking credential here. When
 * a real identity provider is added (phone OTP via a licensed vendor, etc.)
 * replace this function only; the rest of the API relies on the JWT it returns.
 */
export async function createDemoSession(input: DemoSessionInput) {
  const mobile = normalizeMobile(input.mobile);
  let user: UserDoc | null = await User.findOne({ mobile });
  let isNew = false;

  if (!user) {
    isNew = true;
    user = await User.create({
      name: input.name.trim(),
      mobile,
      email: input.email?.trim() || undefined,
      upiId: upiIdForMobile(mobile),
      avatarColor: AVATAR_COLORS[fnv1a(mobile) % AVATAR_COLORS.length]!,
    });
    await seedDemoData(user);
  } else if (!(await Wallet.exists({ user: user._id }))) {
    await seedDemoData(user);
  }

  return { token: signToken(String(user._id)), user: serializeUser(user), isNew };
}
