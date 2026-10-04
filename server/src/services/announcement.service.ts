import { Announcement } from '../models';

export async function listAnnouncements() {
  const docs = await Announcement.find({ isActive: true }).sort({ priority: -1, createdAt: -1 }).limit(5).lean();
  return docs.map((a) => ({
    id: a.key,
    title: a.title,
    body: a.body,
    ctaLabel: a.ctaLabel ?? undefined,
    ctaRoute: a.ctaRoute ?? undefined,
    tone: a.tone,
  }));
}
