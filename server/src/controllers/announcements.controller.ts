import type { Request, Response } from 'express';
import { listAnnouncements } from '../services/announcement.service';
import { ok } from '../utils/respond';

export async function listAnnouncementsHandler(_req: Request, res: Response) {
  ok(res, await listAnnouncements());
}
