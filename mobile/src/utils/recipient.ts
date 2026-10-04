import type { RecipientSelection } from '@/types/payment';
import { colors } from '@/theme';
import { formatMobile } from './validation';

export interface RecipientDisplay {
  name: string;
  /** Secondary line: mobile number or UPI ID. */
  detail: string;
  color: string;
}

/** One place that decides how any recipient is labelled across the amount, confirm and result screens. */
export function describeRecipient(recipient: RecipientSelection): RecipientDisplay {
  switch (recipient.kind) {
    case 'contact':
      return { name: recipient.contact.name, detail: formatMobile(recipient.contact.mobile), color: recipient.contact.avatarColor };
    case 'mobile':
      return { name: recipient.name ?? `+91 ${formatMobile(recipient.mobile)}`, detail: recipient.name ? formatMobile(recipient.mobile) : 'Mobile number', color: colors.palette.teal600 };
    case 'upi':
      return { name: recipient.name ?? recipient.upiId.split('@')[0] ?? recipient.upiId, detail: recipient.upiId, color: colors.palette.teal600 };
  }
}
