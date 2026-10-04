import { Types } from 'mongoose';
import { Wallet } from '../models';
import type { WalletDTO } from '../types/dto';

type Id = string | Types.ObjectId;

/**
 * Wallet balance operations.
 *
 * Money movement uses single-document atomic updates so it is safe under
 * concurrency without needing multi-document transactions (which require a
 * replica set). `debit` only matches when the balance is sufficient, so the
 * balance can never go negative and two parallel payments cannot both spend
 * the same funds.
 */
export async function getWallet(userId: Id): Promise<WalletDTO> {
  const wallet = await Wallet.findOne({ user: userId }).lean();
  return { balancePaise: wallet?.balancePaise ?? 0, currency: 'INR' };
}

export async function createWallet(userId: Id, balancePaise: number): Promise<void> {
  await Wallet.create({ user: userId, balancePaise });
}

export async function resetWallet(userId: Id, balancePaise: number): Promise<void> {
  await Wallet.updateOne({ user: userId }, { $set: { balancePaise } }, { upsert: true });
}

/** Adds money. Returns the new balance in paise. */
export async function credit(userId: Id, amountPaise: number): Promise<number> {
  assertPositiveInteger(amountPaise);
  const wallet = await Wallet.findOneAndUpdate(
    { user: userId },
    { $inc: { balancePaise: amountPaise } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );
  return wallet.balancePaise;
}

/** Removes money if (and only if) enough is available. Returns the new balance, or null if insufficient. */
export async function debit(userId: Id, amountPaise: number): Promise<number | null> {
  assertPositiveInteger(amountPaise);
  const wallet = await Wallet.findOneAndUpdate(
    { user: userId, balancePaise: { $gte: amountPaise } },
    { $inc: { balancePaise: -amountPaise } },
    { new: true },
  );
  return wallet ? wallet.balancePaise : null;
}

export async function hasSufficientBalance(userId: Id, amountPaise: number): Promise<boolean> {
  const wallet = await Wallet.findOne({ user: userId }, { balancePaise: 1 }).lean();
  return (wallet?.balancePaise ?? 0) >= amountPaise;
}

function assertPositiveInteger(value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Amount must be a positive integer number of paise, got ${value}`);
  }
}
