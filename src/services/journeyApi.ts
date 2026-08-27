import { apiClient, isMockMode } from './apiClient';
import { mockDb } from './mockDb';
import { JOURNEY_STEP_DEFINITIONS } from '../data/mockData';

export interface JourneyStep {
  id: number;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
}

export const journeyApi = {
  getJourneyTimeline: async (appointmentId: string): Promise<JourneyStep[]> => {
    if (isMockMode()) {
      const appointments = mockDb.getAppointments();
      const appt = appointments.find(a => a.id === appointmentId);
      if (!appt) {
        throw new Error('Appointment not found');
      }

      const activeStep = appt.journeyStep;
      
      // Determine what steps apply to this appointment based on service type
      // A consultation + scan service includes radiology scan, while standard consultations skip step 4 and 5
      const isScanRequired = appt.service.toLowerCase().includes('scan') || appt.service.toLowerCase().includes('mri');
      
      return JOURNEY_STEP_DEFINITIONS.filter(step => {
        if (!isScanRequired && (step.id === 4 || step.id === 5)) {
          return false; // Skip scan steps for plain consultations
        }
        return true;
      }).map((step, idx, arr) => {
        let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
        
        // Find if this step is current
        // If activeStep matches or if activeStep is between steps
        if (step.id < activeStep) {
          status = 'completed';
        } else if (step.id === activeStep) {
          status = 'current';
        }

        return {
          id: step.id,
          name: step.name,
          description: step.description,
          status,
        };
      });
    }

    return apiClient.get<JourneyStep[]>(`/journey/${appointmentId}`);
  }
};
