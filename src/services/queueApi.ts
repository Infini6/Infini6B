import { apiClient, isMockMode } from './apiClient';
import { mockDb } from './mockDb';

export interface QueueStatus {
  token: string;
  position: number;
  patientsAhead: number;
  estimatedWaitMinutes: number;
  currentlyServing: string;
  status: 'Waiting' | 'Called' | 'In consultation' | 'Completed' | 'Stale' | 'Cancelled';
  lastUpdated: string;
}

export const queueApi = {
  getQueueStatus: async (appointmentId: string): Promise<QueueStatus> => {
    if (isMockMode()) {
      const appointments = mockDb.getAppointments();
      const appt = appointments.find(a => a.id === appointmentId);
      if (!appt) {
        throw new Error('Appointment not found');
      }

      // Convert appt status to queue status
      let qStatus: QueueStatus['status'] = 'Waiting';
      if (appt.status === 'completed') qStatus = 'Completed';
      else if (appt.status === 'rescheduled') qStatus = 'Waiting';
      else if (appt.status as string === 'cancelled') qStatus = 'Cancelled';
      else {
        // Mock journey step conversion
        if (appt.journeyStep === 1) qStatus = 'Waiting';
        else if (appt.journeyStep === 2) qStatus = 'Waiting';
        else if (appt.journeyStep === 3) qStatus = 'Called';
        else if (appt.journeyStep >= 4 && appt.journeyStep <= 6) qStatus = 'In consultation';
        else if (appt.journeyStep === 7) qStatus = 'Completed';
      }

      const minutesWait = parseInt(appt.estimatedWait) || 15;

      return {
        token: appt.ref,
        position: appt.position,
        patientsAhead: Math.max(0, appt.position - 1),
        estimatedWaitMinutes: minutesWait,
        currentlyServing: `A-${100 + appt.currentlyServing}`,
        status: qStatus,
        lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
    }

    return apiClient.get<QueueStatus>(`/queue/${appointmentId}`);
  }
};
