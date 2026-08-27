import { apiClient, isMockMode } from './apiClient';
import { mockDb } from './mockDb';
import { Appointment } from '../types';
import { TIME_SLOTS } from '../data/mockData';

export const appointmentApi = {
  getAppointments: async (): Promise<Appointment[]> => {
    if (isMockMode()) {
      return mockDb.getAppointments();
    }
    return apiClient.get<Appointment[]>('/appointments');
  },

  getAppointmentById: async (id: string): Promise<Appointment> => {
    if (isMockMode()) {
      const match = mockDb.getAppointments().find(a => a.id === id);
      if (!match) {
        throw new Error('Appointment not found');
      }
      return match;
    }
    return apiClient.get<Appointment>(`/appointments/${id}`);
  },

  getAvailableSlots: async (hospitalId: string, department: string, doctorId: string, date: string): Promise<string[]> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 300));
      // Return slots, but simulate some unavailable slots by hashing doctorId + date
      const hash = (doctorId + date).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return TIME_SLOTS.filter((_, idx) => (idx + hash) % 3 !== 0);
    }
    const params = new URLSearchParams({ hospitalId, department, doctorId, date });
    return apiClient.get<string[]>(`/appointments/slots?${params.toString()}`);
  },

  bookAppointment: async (data: {
    hospitalId: string;
    hospitalName: string;
    department: string;
    doctor: string;
    service: string;
    date: string;
    time: string;
    arrival: string;
    price: string;
    requiresPayment: boolean;
  }): Promise<Appointment> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const appointments = mockDb.getAppointments();
      const refCode = 'SHQ' + Math.floor(100000 + Math.random() * 899999);
      
      const newAppt: Appointment = {
        id: `appt-${Date.now()}`,
        ref: refCode,
        hospitalId: data.hospitalId,
        hospitalName: data.hospitalName,
        department: data.department,
        doctor: data.doctor,
        service: data.service,
        date: data.date,
        time: data.time,
        arrival: data.arrival,
        status: 'upcoming',
        position: Math.floor(Math.random() * 5) + 2,
        currentlyServing: 1,
        estimatedWait: `${(Math.floor(Math.random() * 15) + 5)} min`,
        journeyStep: 1,
        block: 'Block A',
        floor: 'Floor 1',
        room: '101',
        destinations: [
          { step: 1, name: 'Check-in Desk', location: 'Main Lobby · Counter 1', isCurrent: true },
          { step: 2, name: `${data.department} waiting area`, location: 'Block A · Floor 1 · 101', isCurrent: false },
          { step: 3, name: 'Pharmacy counter', location: 'Block B · Ground Floor · 001', isCurrent: false },
        ],
      };

      appointments.unshift(newAppt);
      mockDb.saveAppointments(appointments);

      // Create booking notification
      const notifications = mockDb.getNotifications();
      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Appointment booked',
        body: `Your ${data.service} at ${data.hospitalName} is scheduled for ${data.date}. Ref: ${refCode}.`,
        time: 'Just now',
        unread: true,
        ref: refCode,
        date: data.date,
      });
      mockDb.saveNotifications(notifications);

      return newAppt;
    }

    return apiClient.post<Appointment>('/appointments', data);
  },

  cancelAppointment: async (id: string): Promise<Appointment> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const appointments = mockDb.getAppointments();
      const idx = appointments.findIndex(a => a.id === id);
      if (idx === -1) {
        throw new Error('Appointment not found');
      }

      // Check if cancellation permitted (simulation: let's allow it unless completed/cancelled)
      if (appointments[idx].status === 'completed' || appointments[idx].status as string === 'cancelled') {
        throw new Error('This appointment can no longer be cancelled.');
      }

      // Set status to cancelled (and keep it in list, DO NOT delete it!)
      // Cast the status to any to support 'cancelled' string if not explicitly in types.ts (wait, let's verify if 'cancelled' is in types.ts. In types.ts, status was 'upcoming' | 'completed' | 'rescheduled' | 'no_show'. We will use type casting or adjust types.ts if needed, but the user specifies: "Correctly display: CANCELLED. Do NOT accidentally represent a cancelled appointment as COMPLETED.")
      const updatedAppt = {
        ...appointments[idx],
        status: 'cancelled' as any
      };
      
      appointments[idx] = updatedAppt;
      mockDb.saveAppointments(appointments);

      // Create cancellation notification
      const notifications = mockDb.getNotifications();
      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Appointment cancelled',
        body: `Your appointment ${updatedAppt.ref} has been cancelled successfully.`,
        time: 'Just now',
        unread: true,
        ref: updatedAppt.ref,
        date: updatedAppt.date,
      });
      mockDb.saveNotifications(notifications);

      return updatedAppt;
    }

    return apiClient.put<Appointment>(`/appointments/${id}/cancel`, {});
  },

  rescheduleAppointment: async (id: string, date: string, time: string, arrival: string): Promise<Appointment> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const appointments = mockDb.getAppointments();
      const idx = appointments.findIndex(a => a.id === id);
      if (idx === -1) {
        throw new Error('Appointment not found');
      }

      const updatedAppt = {
        ...appointments[idx],
        date,
        time,
        arrival,
        status: 'rescheduled' as const,
      };

      appointments[idx] = updatedAppt;
      mockDb.saveAppointments(appointments);

      // Create reschedule notification
      const notifications = mockDb.getNotifications();
      notifications.unshift({
        id: `notif-${Date.now()}`,
        title: 'Appointment rescheduled',
        body: `Your appointment ${updatedAppt.ref} is rescheduled to ${date} at ${time}.`,
        time: 'Just now',
        unread: true,
        ref: updatedAppt.ref,
        date: updatedAppt.date,
      });
      mockDb.saveNotifications(notifications);

      return updatedAppt;
    }

    return apiClient.put<Appointment>(`/appointments/${id}/reschedule`, { date, time, arrival });
  },

  completeOnlineRegistration: async (id: string, registrationData: {
    fullName: string;
    dob: string;
    govId: string;
    emergencyName: string;
    emergencyPhone: string;
    consentSigned: boolean;
  }): Promise<{ success: boolean }> => {
    if (isMockMode()) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      // Persist in local storage attached to appointment
      localStorage.setItem(`registration_${id}`, JSON.stringify(registrationData));
      return { success: true };
    }

    return apiClient.post<{ success: boolean }>(`/appointments/${id}/register`, registrationData);
  },

  getOnlineRegistrationStatus: async (id: string): Promise<boolean> => {
    if (isMockMode()) {
      const data = localStorage.getItem(`registration_${id}`);
      return data !== null;
    }
    return apiClient.get<{ registered: boolean }>(`/appointments/${id}/registration-status`).then(r => r.registered);
  }
};
