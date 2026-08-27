import { apiClient, isMockMode } from './apiClient';
import { mockDb } from './mockDb';
import { UserProfile } from '../types';

export const authApi = {
  login: async (email: string, password: string): Promise<{ token: string; user: UserProfile }> => {
    if (isMockMode()) {
      // Simulate network latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      const users = mockDb.getUsers();
      const match = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
      
      if (!match) {
        throw new Error('Invalid email or password.');
      }

      const token = `mock-token-${Date.now()}`;
      localStorage.setItem('caresync_token', token);
      mockDb.saveUser(match.profile);

      return { token, user: match.profile };
    }

    return apiClient.post<{ token: string; user: UserProfile }>('/auth/login', { email, password });
  },

  register: async (name: string, email: string, phone: string, password: string): Promise<{ token: string; user: UserProfile }> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 800));

      const users = mockDb.getUsers();
      const exists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());

      if (exists) {
        throw new Error('An account with this email already exists.');
      }

      const newUserProfile: UserProfile = {
        name,
        email,
        phone,
        address: 'Edit your profile to add residential address.',
        emergencyContact: 'Not provided',
        bloodGroup: 'Not set',
        age: 25,
      };

      users.push({
        email,
        password,
        profile: newUserProfile,
      });

      mockDb.saveUsers(users);

      const token = `mock-token-${Date.now()}`;
      localStorage.setItem('caresync_token', token);
      mockDb.saveUser(newUserProfile);

      return { token, user: newUserProfile };
    }

    return apiClient.post<{ token: string; user: UserProfile }>('/auth/register', { name, email, phone, password });
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const users = mockDb.getUsers();
      const exists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!exists) {
        throw new Error('Email address not found.');
      }
      return { message: 'Password reset link sent to your email.' };
    }

    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  },

  getCurrentUser: async (): Promise<UserProfile | null> => {
    const token = localStorage.getItem('caresync_token');
    if (!token) return null;

    if (isMockMode()) {
      return mockDb.getUser();
    }

    return apiClient.get<UserProfile>('/auth/me');
  },

  logout: () => {
    localStorage.removeItem('caresync_token');
    localStorage.removeItem('caresync_user');
    window.dispatchEvent(new CustomEvent('caresync-logout'));
  }
};
