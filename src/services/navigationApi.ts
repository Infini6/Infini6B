import { apiClient, isMockMode } from './apiClient';
import { mockDb } from './mockDb';

export interface NavigationStep {
  step: number;
  name: string;
  location: string;
  building: string;
  floor: string;
  room: string;
  directions: string;
  isCurrent: boolean;
  isCompleted: boolean;
}

export const navigationApi = {
  getNavigationDirections: async (appointmentId: string): Promise<NavigationStep[]> => {
    if (isMockMode()) {
      const appointments = mockDb.getAppointments();
      const appt = appointments.find(a => a.id === appointmentId);
      if (!appt) {
        throw new Error('Appointment not found');
      }

      // Default destinations list
      const destinations = appt.destinations || [];
      const currentJourneyStep = appt.journeyStep;

      // Map destinations to structured steps with custom indoor directions text
      return destinations.map((dest, idx) => {
        const isCurrent = idx === 0; // For simulation, assume the first destination is current
        const isCompleted = idx < 0;

        let directions = 'Follow the Blue Wayfinding Floor Line from the Main Lobby Elevator Bay A.';
        if (dest.name.toLowerCase().includes('pharmacy')) {
          directions = 'Take elevator to Ground Floor, exit left, proceed straight to Pharmacy counter.';
        } else if (dest.name.toLowerCase().includes('radiology') || dest.name.toLowerCase().includes('scan')) {
          directions = 'Take Block A elevators to Floor 1, proceed to the Radiology desk on the right.';
        }

        const locationParts = dest.location.split(' · ');
        const building = locationParts[0] || appt.block || 'Block A';
        const floor = locationParts[1] || appt.floor || 'Floor 1';
        const room = locationParts[2] || appt.room || '101';

        return {
          step: dest.step,
          name: dest.name,
          location: dest.location,
          building,
          floor,
          room,
          directions,
          isCurrent,
          isCompleted,
        };
      });
    }

    return apiClient.get<NavigationStep[]>(`/navigation/${appointmentId}`);
  }
};
