import { HOSPITALS, DOCTORS, INITIAL_APPOINTMENTS, INITIAL_NOTIFICATIONS, INITIAL_USER } from '../data/mockData';
import { Hospital, Doctor, Appointment, NotificationItem, UserProfile } from '../types';

export const initMockDb = () => {
  if (!localStorage.getItem('caresync_hospitals')) {
    localStorage.setItem('caresync_hospitals', JSON.stringify(HOSPITALS));
  }
  if (!localStorage.getItem('caresync_doctors')) {
    localStorage.setItem('caresync_doctors', JSON.stringify(DOCTORS));
  }
  if (!localStorage.getItem('caresync_appointments')) {
    localStorage.setItem('caresync_appointments', JSON.stringify(INITIAL_APPOINTMENTS));
  }
  if (!localStorage.getItem('caresync_notifications')) {
    localStorage.setItem('caresync_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
  }
  if (!localStorage.getItem('caresync_user')) {
    localStorage.setItem('caresync_user', JSON.stringify(INITIAL_USER));
  }
  if (!localStorage.getItem('caresync_users')) {
    // List of registered accounts for auth simulation
    localStorage.setItem('caresync_users', JSON.stringify([
      {
        email: INITIAL_USER.email,
        password: 'password123',
        profile: INITIAL_USER
      }
    ]));
  }
};

export const mockDb = {
  getHospitals: (): Hospital[] => {
    initMockDb();
    return JSON.parse(localStorage.getItem('caresync_hospitals') || '[]');
  },
  getDoctors: (): Doctor[] => {
    initMockDb();
    return JSON.parse(localStorage.getItem('caresync_doctors') || '[]');
  },
  getAppointments: (): Appointment[] => {
    initMockDb();
    return JSON.parse(localStorage.getItem('caresync_appointments') || '[]');
  },
  saveAppointments: (appts: Appointment[]) => {
    localStorage.setItem('caresync_appointments', JSON.stringify(appts));
  },
  getNotifications: (): NotificationItem[] => {
    initMockDb();
    return JSON.parse(localStorage.getItem('caresync_notifications') || '[]');
  },
  saveNotifications: (notifs: NotificationItem[]) => {
    localStorage.setItem('caresync_notifications', JSON.stringify(notifs));
  },
  getUser: (): UserProfile => {
    initMockDb();
    return JSON.parse(localStorage.getItem('caresync_user') || 'null');
  },
  saveUser: (user: UserProfile) => {
    localStorage.setItem('caresync_user', JSON.stringify(user));
  },
  getUsers: () => {
    initMockDb();
    return JSON.parse(localStorage.getItem('caresync_users') || '[]');
  },
  saveUsers: (users: any[]) => {
    localStorage.setItem('caresync_users', JSON.stringify(users));
  }
};
