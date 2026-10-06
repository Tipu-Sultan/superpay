import { OtpChallenge } from '../models';
import { env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { isValidMobile, normalizeMobile } from '../utils/validation';
import { fnv1a } from '../utils/hash';

const OTP_LENGTH = 6;
const OTP_TTL_MS = 5 * 60_000;
const MAX_ATTEMPTS = 5;

export async function requestOtp(input: { name: string; mobile: string; email?: string }) {
  const mobile = normalizeMobile(input.mobile);
  if (!isValidMobile(mobile)) throw ApiError.validation('Enter a valid 10 digit mobile number.');
  const name = input.name.trim();
  const email = input.email?.trim() || undefined;

  await OtpChallenge.deleteMany({ mobile, verifiedAt: { $exists: false } });

  if (env.twilio.enabled) {
    await twilioRequest(mobile);
    await OtpChallenge.create({
      mobile,
      name,
      email,
      provider: 'twilio',
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    });
    return { expiresInSeconds: OTP_TTL_MS / 1000, demo: false };
  }

  if (env.isProduction) {
    throw ApiError.serviceUnavailable('Phone verification is not configured. Please try again later.');
  }

  const code = String(100000 + (fnv1a(`${mobile}:${Date.now()}`) % 900000)).padStart(OTP_LENGTH, '0');
  await OtpChallenge.create({
    mobile,
    codeHash: hashCode(code),
    name,
    email,
    provider: 'demo',
    expiresAt: new Date(Date.now() + OTP_TTL_MS),
  });

  return { expiresInSeconds: OTP_TTL_MS / 1000, demo: true, devCode: code };
}

export async function verifyOtp(input: { mobile: string; code: string }) {
  const mobile = normalizeMobile(input.mobile);
  if (!isValidMobile(mobile)) throw ApiError.validation('Enter a valid 10 digit mobile number.');
  const challenge = await OtpChallenge.findOne({ mobile, verifiedAt: { $exists: false } }).sort({ createdAt: -1 });
  if (!challenge || challenge.expiresAt.getTime() <= Date.now()) {
    throw ApiError.badRequest('This OTP has expired. Please request a new OTP.');
  }
  if (challenge.attempts >= MAX_ATTEMPTS) {
    throw ApiError.rateLimited('Too many incorrect OTP attempts. Please request a new OTP.');
  }

  if (challenge.provider === 'twilio') {
    await twilioCheck(mobile, input.code);
  } else if (challenge.codeHash !== hashCode(input.code)) {
    challenge.attempts += 1;
    await challenge.save();
    throw ApiError.badRequest('The OTP you entered is incorrect.');
  }

  challenge.verifiedAt = new Date();
  await challenge.save();
  return {
    name: challenge.name,
    mobile,
    email: challenge.email ?? undefined,
  };
}

async function twilioRequest(mobile: string): Promise<void> {
  const response = await twilioFetch(`/Verifications`, { To: `+91${mobile}`, Channel: 'sms' });
  if (!response.ok) {
    throw ApiError.serviceUnavailable('We could not send the OTP right now. Please try again.');
  }
}

async function twilioCheck(mobile: string, code: string): Promise<void> {
  const response = await twilioFetch(`/VerificationCheck`, { To: `+91${mobile}`, Code: code });
  if (!response.ok) {
    throw ApiError.badRequest('The OTP you entered is incorrect or has expired.');
  }
  const body = (await response.json().catch(() => ({}))) as { status?: string };
  if (body.status !== 'approved') throw ApiError.badRequest('The OTP you entered is incorrect or has expired.');
}

async function twilioFetch(path: string, params: Record<string, string>) {
  const body = new URLSearchParams(params);
  return fetch(`https://verify.twilio.com/v2/Services/${env.twilio.verifyServiceSid}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${env.twilio.accountSid}:${env.twilio.authToken}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });
}

function hashCode(code: string): string {
  return fnv1a(`${env.jwtSecret}:${code}`).toString(16);
}
