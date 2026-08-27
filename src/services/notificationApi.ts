import { apiClient, isMockMode } from './apiClient';
import { mockDb } from './mockDb';
import { NotificationItem } from '../types';

export const notificationApi = {
  getNotifications: async (): Promise<NotificationItem[]> => {
    if (isMockMode()) {
      return mockDb.getNotifications();
    }
    return apiClient.get<NotificationItem[]>('/notifications');
  },

  markAllAsRead: async (): Promise<{ success: boolean }> => {
    if (isMockMode()) {
      const notifications = mockDb.getNotifications();
      const updated = notifications.map(n => ({ ...n, unread: false }));
      mockDb.saveNotifications(updated);
      return { success: true };
    }
    return apiClient.put<{ success: boolean }>('/notifications/mark-all-read', {});
  },

  markAsRead: async (id: string): Promise<{ success: boolean }> => {
    if (isMockMode()) {
      const notifications = mockDb.getNotifications();
      const updated = notifications.map(n => n.id === id ? { ...n, unread: false } : n);
      mockDb.saveNotifications(updated);
      return { success: true };
    }
    return apiClient.put<{ success: boolean }>(`/notifications/${id}/read`, {});
  }
};
