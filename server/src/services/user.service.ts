import { User, type UserDoc } from '../models';
import type { UserDTO } from '../types/dto';
import { ApiError } from '../utils/ApiError';
import { seedDemoData } from '../seed/demoData';

export function serializeUser(u: UserDoc): UserDTO {
  return {
    id: String(u._id),
    name: u.name,
    mobile: u.mobile,
    email: u.email ?? undefined,
    upiId: u.upiId,
    avatarColor: u.avatarColor,
    createdAt: new Date(u.createdAt).toISOString(),
  };
}

export async function getUserOrThrow(userId: string): Promise<UserDoc> {
  const user = await User.findById(userId);
  if (!user) throw ApiError.unauthorized('Account not found. Please sign in again.');
  return user;
}

export async function updateProfile(userId: string, patch: { name?: string; email?: string | null }): Promise<UserDoc> {
  const user = await getUserOrThrow(userId);
  if (patch.name !== undefined) user.name = patch.name.trim();
  if (patch.email !== undefined) user.email = patch.email ? patch.email.trim().toLowerCase() : undefined;
  await user.save();
  return user;
}

/** Restores the starter balance, contacts and sample history. Handy while demoing. */
export async function resetDemoData(userId: string): Promise<void> {
  const user = await getUserOrThrow(userId);
  await seedDemoData(user);
}
