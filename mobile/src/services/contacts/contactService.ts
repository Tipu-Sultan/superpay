import { api } from '@/services/api/client';
import type { Contact } from '@/types/api';

export const contactService = {
  list: (q?: string, signal?: AbortSignal) => api.get<Contact[]>('/contacts', { q: q?.trim() || undefined }, signal),
};
