/** Product-level constants shared by screens. */
export const BRAND_NAME = 'SuperPay';

export const SIMULATION_NOTICE =
  'SuperPay is a prototype. Payments are simulated: no real money moves and no banking details are collected.';

/** Quick-pick amounts in rupees. */
export const QUICK_AMOUNTS_RUPEES = [100, 500, 1000, 2000] as const;

export const NOTE_MAX_LENGTH = 140;

/** Fallbacks used until /payments/config loads. The server remains the source of truth. */
export const DEFAULT_MIN_AMOUNT_PAISE = 100;
export const DEFAULT_MAX_AMOUNT_PAISE = 10_000_000;
