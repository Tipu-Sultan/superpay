import type { BillCategory } from '../models/constants';

/**
 * Static reference data served to the app. Operators and circles are used for
 * mock recharges; replace with your recharge aggregator's catalogue later.
 */
export const OPERATORS = [
  { id: 'jio', name: 'Jio', color: '#0B63CE' },
  { id: 'airtel', name: 'Airtel', color: '#D32F2F' },
  { id: 'vi', name: 'Vi', color: '#B1166B' },
  { id: 'bsnl', name: 'BSNL', color: '#1B7F3B' },
] as const;

export const CIRCLES = [
  { id: 'delhi', name: 'Delhi NCR' },
  { id: 'mumbai', name: 'Mumbai' },
  { id: 'kolkata', name: 'Kolkata' },
  { id: 'chennai', name: 'Chennai' },
  { id: 'karnataka', name: 'Karnataka' },
  { id: 'andhra', name: 'Andhra Pradesh & Telangana' },
  { id: 'kerala', name: 'Kerala' },
  { id: 'gujarat', name: 'Gujarat' },
  { id: 'maharashtra', name: 'Maharashtra & Goa' },
  { id: 'up-east', name: 'Uttar Pradesh (East)' },
  { id: 'up-west', name: 'Uttar Pradesh (West)' },
  { id: 'rajasthan', name: 'Rajasthan' },
  { id: 'punjab', name: 'Punjab' },
  { id: 'haryana', name: 'Haryana' },
  { id: 'bihar', name: 'Bihar & Jharkhand' },
  { id: 'mp', name: 'Madhya Pradesh & Chhattisgarh' },
  { id: 'tamilnadu', name: 'Tamil Nadu' },
  { id: 'wb', name: 'West Bengal' },
] as const;

export interface BillCategoryMeta {
  id: BillCategory;
  label: string;
  /** Ionicons glyph name used by the app. */
  icon: string;
  description: string;
}

export const BILL_CATEGORY_META: BillCategoryMeta[] = [
  { id: 'electricity', label: 'Electricity', icon: 'flash-outline', description: 'Power distribution companies' },
  { id: 'mobile_postpaid', label: 'Mobile postpaid', icon: 'phone-portrait-outline', description: 'Monthly mobile bills' },
  { id: 'dth', label: 'DTH', icon: 'tv-outline', description: 'Set-top box recharge' },
  { id: 'water', label: 'Water', icon: 'water-outline', description: 'Municipal water boards' },
  { id: 'gas', label: 'Gas', icon: 'flame-outline', description: 'Piped and cylinder gas' },
  { id: 'broadband', label: 'Broadband', icon: 'wifi-outline', description: 'Internet and fibre plans' },
  { id: 'insurance', label: 'Insurance', icon: 'shield-checkmark-outline', description: 'Premium payments' },
];

/**
 * Simulated funding sources for "Add money". No real bank is contacted and no
 * card / UPI PIN / OTP is ever collected.
 */
export const FUNDING_SOURCES = [
  { id: 'src_savings_4321', name: 'Demo Savings Account', masked: '\u2022\u2022\u2022\u2022 4321', kind: 'bank_account' },
  { id: 'src_current_7788', name: 'Demo Current Account', masked: '\u2022\u2022\u2022\u2022 7788', kind: 'bank_account' },
] as const;
