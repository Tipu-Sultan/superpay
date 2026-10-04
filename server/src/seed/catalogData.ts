import type { BillCategory } from '../models/constants';

/**
 * Billers are intentionally fictional so the demo never implies a live
 * integration with a real utility. Replace with your BBPS biller catalogue.
 */
interface BillerSeed {
  billerId: string;
  category: BillCategory;
  name: string;
  accountLabel: string;
  accountHint: string;
  minLength: number;
  maxLength: number;
  region?: string;
}

export const BILLERS: BillerSeed[] = [
  { billerId: 'elec-metro', category: 'electricity', name: 'Metro Electricity Board', accountLabel: 'Consumer number', accountHint: '10 digit number on your bill', minLength: 8, maxLength: 12, region: 'Delhi NCR' },
  { billerId: 'elec-urban', category: 'electricity', name: 'Urban Power Distribution', accountLabel: 'Consumer number', accountHint: 'Printed near your meter reading', minLength: 8, maxLength: 12, region: 'Maharashtra' },
  { billerId: 'elec-state', category: 'electricity', name: 'State Vidyut Nigam', accountLabel: 'Account ID', accountHint: '12 character account ID', minLength: 10, maxLength: 14, region: 'Uttar Pradesh' },
  { billerId: 'elec-south', category: 'electricity', name: 'Southern Power Utilities', accountLabel: 'Service connection number', accountHint: 'Starts with your area code', minLength: 9, maxLength: 13, region: 'Karnataka' },

  { billerId: 'post-jio', category: 'mobile_postpaid', name: 'Jio Postpaid', accountLabel: 'Mobile number', accountHint: '10 digit postpaid number', minLength: 10, maxLength: 10 },
  { billerId: 'post-airtel', category: 'mobile_postpaid', name: 'Airtel Postpaid', accountLabel: 'Mobile number', accountHint: '10 digit postpaid number', minLength: 10, maxLength: 10 },
  { billerId: 'post-vi', category: 'mobile_postpaid', name: 'Vi Postpaid', accountLabel: 'Mobile number', accountHint: '10 digit postpaid number', minLength: 10, maxLength: 10 },
  { billerId: 'post-bsnl', category: 'mobile_postpaid', name: 'BSNL Postpaid', accountLabel: 'Mobile number', accountHint: '10 digit postpaid number', minLength: 10, maxLength: 10 },

  { billerId: 'dth-sky', category: 'dth', name: 'SkyView DTH', accountLabel: 'Customer ID', accountHint: '10 digit ID on your set-top box', minLength: 10, maxLength: 11 },
  { billerId: 'dth-dish', category: 'dth', name: 'DishLink Direct', accountLabel: 'Viewing card number', accountHint: '11 digit card number', minLength: 11, maxLength: 11 },
  { billerId: 'dth-orbit', category: 'dth', name: 'Orbit TV', accountLabel: 'Subscriber ID', accountHint: '8 to 12 characters', minLength: 8, maxLength: 12 },

  { billerId: 'water-city', category: 'water', name: 'City Water Board', accountLabel: 'Connection ID', accountHint: 'On the top of your water bill', minLength: 8, maxLength: 12 },
  { billerId: 'water-metro', category: 'water', name: 'Metro Jal Sewerage', accountLabel: 'K number', accountHint: '10 digit K number', minLength: 10, maxLength: 10 },
  { billerId: 'water-rural', category: 'water', name: 'District Water Supply', accountLabel: 'Consumer ID', accountHint: '8 to 14 characters', minLength: 8, maxLength: 14 },

  { billerId: 'gas-city', category: 'gas', name: 'City Gas Distribution', accountLabel: 'Customer number', accountHint: '10 digit CRN', minLength: 10, maxLength: 10 },
  { billerId: 'gas-indo', category: 'gas', name: 'IndoGas Cylinder Booking', accountLabel: 'LPG consumer number', accountHint: '17 digit consumer number', minLength: 12, maxLength: 17 },
  { billerId: 'gas-pipe', category: 'gas', name: 'Greenline Piped Gas', accountLabel: 'BP number', accountHint: '9 to 12 digits', minLength: 9, maxLength: 12 },

  { billerId: 'bb-fibre', category: 'broadband', name: 'FibreNet Broadband', accountLabel: 'Account number', accountHint: 'Landline or account number', minLength: 8, maxLength: 14 },
  { billerId: 'bb-spark', category: 'broadband', name: 'SparkLink Internet', accountLabel: 'User ID', accountHint: 'Your registered user ID', minLength: 6, maxLength: 16 },
  { billerId: 'bb-cable', category: 'broadband', name: 'CableOne Broadband', accountLabel: 'Subscriber code', accountHint: 'Printed on your invoice', minLength: 8, maxLength: 12 },

  { billerId: 'ins-life', category: 'insurance', name: 'Lifeguard Life Insurance', accountLabel: 'Policy number', accountHint: '8 to 12 digit policy number', minLength: 8, maxLength: 12 },
  { billerId: 'ins-health', category: 'insurance', name: 'WellCare Health Insurance', accountLabel: 'Policy number', accountHint: 'Policy number from your card', minLength: 8, maxLength: 16 },
  { billerId: 'ins-motor', category: 'insurance', name: 'RoadSafe Motor Insurance', accountLabel: 'Policy number', accountHint: 'Printed on your policy document', minLength: 8, maxLength: 16 },
];

interface PlanSeed {
  price: number; // rupees
  data: string;
  validityDays: number;
  calls?: string;
  sms?: string;
  description: string;
  category: 'popular' | 'data' | 'unlimited' | 'topup';
  tag?: string;
}

const PLAN_TEMPLATES: PlanSeed[] = [
  { price: 19, data: '1 GB', validityDays: 1, calls: 'Existing plan', sms: '', description: 'Day pass for heavy data days', category: 'data' },
  { price: 99, data: '6 GB', validityDays: 14, calls: 'Unlimited calls', sms: '100 SMS/day', description: 'Light use, two weeks', category: 'popular' },
  { price: 199, data: '1.5 GB/day', validityDays: 28, calls: 'Unlimited calls', sms: '100 SMS/day', description: 'Everyday browsing and video', category: 'popular', tag: 'Popular' },
  { price: 299, data: '2 GB/day', validityDays: 28, calls: 'Unlimited calls', sms: '100 SMS/day', description: 'Streaming and hotspot friendly', category: 'popular', tag: 'Best value' },
  { price: 399, data: '2.5 GB/day', validityDays: 28, calls: 'Unlimited calls', sms: '100 SMS/day', description: 'Extra data for work and play', category: 'data' },
  { price: 599, data: '2 GB/day', validityDays: 56, calls: 'Unlimited calls', sms: '100 SMS/day', description: 'Two months in one recharge', category: 'unlimited' },
  { price: 799, data: '1.5 GB/day', validityDays: 84, calls: 'Unlimited calls', sms: '100 SMS/day', description: 'Three months, no worries', category: 'unlimited' },
  { price: 2999, data: '2.5 GB/day', validityDays: 365, calls: 'Unlimited calls', sms: '100 SMS/day', description: 'A full year of connectivity', category: 'unlimited', tag: 'Annual' },
];

/** Slightly different price ladders per operator so plans feel operator specific. */
const OPERATOR_PRICE_ADJUST: Record<string, number> = { jio: 0, airtel: 20, vi: 10, bsnl: -30 };

export function buildPlans() {
  const plans: Array<{
    planId: string; operatorId: string; pricePaise: number; data: string; validityDays: number;
    calls: string; sms: string; description: string; category: PlanSeed['category']; tag?: string;
  }> = [];
  for (const [operatorId, adjust] of Object.entries(OPERATOR_PRICE_ADJUST)) {
    for (const t of PLAN_TEMPLATES) {
      // Keep the headline "Rs 199 / Rs 299" plans identical on every operator for predictable demos.
      const price = t.price === 199 || t.price === 299 || t.price <= 19 ? t.price : Math.max(49, t.price + adjust);
      plans.push({
        planId: `${operatorId}-${price}-${t.validityDays}`,
        operatorId,
        pricePaise: price * 100,
        data: t.data,
        validityDays: t.validityDays,
        calls: t.calls ?? 'Unlimited calls',
        sms: t.sms ?? '',
        description: t.description,
        category: t.category,
        tag: t.tag,
      });
    }
  }
  return plans;
}

interface AnnouncementSeed {
  key: string;
  title: string;
  body: string;
  ctaLabel?: string;
  ctaRoute?: string;
  tone: 'brand' | 'accent' | 'info';
  priority: number;
}

export const ANNOUNCEMENTS: AnnouncementSeed[] = [
  {
    key: 'welcome-recharge',
    title: 'Recharge in under a minute',
    body: 'Pick your operator, choose a plan, done. Try a mock recharge of \u20B9199 or \u20B9299.',
    ctaLabel: 'Recharge now',
    ctaRoute: '/recharge',
    tone: 'brand',
    priority: 3,
  },
  {
    key: 'bills-all-in-one',
    title: 'All your bills, one place',
    body: 'Electricity, DTH, water, gas, broadband and insurance. This build uses simulated billers.',
    ctaLabel: 'Pay a bill',
    ctaRoute: '/bills',
    tone: 'accent',
    priority: 2,
  },
  {
    key: 'prototype-notice',
    title: 'Prototype mode',
    body: 'SuperPay is a demo. No real money moves and no banking details are collected.',
    tone: 'info',
    priority: 1,
  },
];
