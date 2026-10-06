import { api } from '@/services/api/client';
import type { Notification, UnreadNotificationCount } from '@/types/api';

export const notificationService = {
  list: () => api.get<Notification[]>('/notifications'),
  unreadCount: () => api.get<UnreadNotificationCount>('/notifications/unread-count'),
  markRead: (id: string) => api.patch<{ success: true }>(`/notifications/${id}/read`, {}),
  markAllRead: () => api.post<{ success: true }>('/notifications/read-all', {}),
};
