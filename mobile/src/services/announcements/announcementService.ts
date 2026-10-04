import { api } from '@/services/api/client';
import type { Announcement } from '@/types/api';

export const announcementService = {
  list: () => api.get<Announcement[]>('/announcements'),
};
