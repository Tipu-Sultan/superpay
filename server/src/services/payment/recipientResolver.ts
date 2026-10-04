import { ApiError } from '../../utils/ApiError';
import { isValidMobile, isValidUpiId, normalizeMobile, upiIdForMobile } from '../../utils/validation';
import { findContactByMobile, getContactOrThrow } from '../contact.service';

export type RecipientInput =
  | { kind: 'contact'; contactId: string }
  | { kind: 'mobile'; mobile: string; name?: string }
  | { kind: 'upi'; upiId: string; name?: string };

export interface Counterparty {
  name: string;
  mobile?: string;
  upiId?: string;
  contactId?: string;
}

/**
 * Turns whatever the user picked (contact / mobile number / UPI id / scanned QR)
 * into a normalised counterparty, and blocks paying yourself.
 */
export async function resolveRecipient(
  userId: string,
  self: { mobile: string; upiId: string },
  input: RecipientInput,
): Promise<Counterparty> {
  let result: Counterparty;

  if (input.kind === 'contact') {
    const contact = await getContactOrThrow(userId, input.contactId);
    result = { name: contact.name, mobile: contact.mobile, upiId: contact.upiId, contactId: String(contact._id) };
  } else if (input.kind === 'mobile') {
    const mobile = normalizeMobile(input.mobile);
    if (!isValidMobile(mobile)) throw ApiError.validation('Enter a valid 10 digit mobile number.');
    const known = await findContactByMobile(userId, mobile);
    result = known
      ? { name: known.name, mobile, upiId: known.upiId, contactId: String(known._id) }
      : { name: input.name?.trim() || `+91 ${mobile}`, mobile, upiId: upiIdForMobile(mobile) };
  } else {
    const upiId = input.upiId.trim().toLowerCase();
    if (!isValidUpiId(upiId)) throw ApiError.validation('Enter a valid UPI ID, like name@bank.');
    result = { name: input.name?.trim() || upiId.split('@')[0]!, upiId };
  }

  if (result.mobile === self.mobile || result.upiId === self.upiId) {
    throw ApiError.badRequest('You cannot send money to yourself.');
  }
  return result;
}
