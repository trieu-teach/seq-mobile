import { apiRequest } from './client';
import type { NotificationPage } from './types';

const idPath = (id: string) => encodeURIComponent(id);

export const notificationsApi = {
  list: (page = 0, size = 20, unreadOnly = false) =>
    apiRequest<NotificationPage>(`/api/notifications?page=${page}&size=${size}&unreadOnly=${unreadOnly}`, { authenticated: true }),
  unreadCount: () => apiRequest<{ unreadCount: number }>('/api/notifications/unread-count', { authenticated: true }),
  markRead: (id: string) => apiRequest<{ id: string; read: boolean; readAt: string }>(`/api/notifications/${idPath(id)}/read`, { authenticated: true, method: 'PATCH' }),
  markAllRead: () => apiRequest<{ updatedCount: number; unreadCount: number }>('/api/notifications/read-all', { authenticated: true, method: 'PATCH' }),
};
