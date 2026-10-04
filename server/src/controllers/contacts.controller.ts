import type { Request, Response } from 'express';
import { listContacts } from '../services/contact.service';
import { parseOrThrow } from '../utils/parse';
import { ok } from '../utils/respond';
import { contactsQuerySchema } from '../validators/schemas';
import { userIdOf } from '../middleware/auth';

export async function listContactsHandler(req: Request, res: Response) {
  const { q, limit } = parseOrThrow(contactsQuerySchema, req.query);
  ok(res, await listContacts(userIdOf(req), q, limit));
}
