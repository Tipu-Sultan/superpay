import { Contact, type ContactDoc } from '../models';
import type { ContactDTO } from '../types/dto';
import { ApiError } from '../utils/ApiError';
import { escapeRegex } from '../utils/regex';

export function serializeContact(c: Pick<ContactDoc, 'name' | 'mobile' | 'upiId' | 'avatarColor' | 'isFavorite'> & { _id: unknown }): ContactDTO {
  return {
    id: String(c._id),
    name: c.name,
    mobile: c.mobile,
    upiId: c.upiId,
    avatarColor: c.avatarColor,
    isFavorite: Boolean(c.isFavorite),
  };
}

export async function listContacts(userId: string, q?: string, limit = 100): Promise<ContactDTO[]> {
  const filter: Record<string, unknown> = { owner: userId };
  if (q && q.trim()) {
    const rx = new RegExp(escapeRegex(q.trim()), 'i');
    filter.$or = [{ name: rx }, { mobile: rx }, { upiId: rx }];
  }
  const docs = await Contact.find(filter).sort({ isFavorite: -1, name: 1 }).limit(limit).lean();
  return docs.map((d) => serializeContact(d as never));
}

export async function getContactOrThrow(userId: string, contactId: string): Promise<ContactDoc> {
  const doc = await Contact.findOne({ _id: contactId, owner: userId });
  if (!doc) throw ApiError.notFound('Contact not found.');
  return doc;
}

export async function findContactByMobile(userId: string, mobile: string): Promise<ContactDoc | null> {
  return Contact.findOne({ owner: userId, mobile });
}
