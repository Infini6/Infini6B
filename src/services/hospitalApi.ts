import { apiClient, isMockMode } from './apiClient';
import { mockDb } from './mockDb';
import { Hospital } from '../types';

export const hospitalApi = {
  getHospitals: async (): Promise<Hospital[]> => {
    if (isMockMode()) {
      return mockDb.getHospitals();
    }
    return apiClient.get<Hospital[]>('/hospitals');
  },

  getHospitalById: async (id: string): Promise<Hospital> => {
    if (isMockMode()) {
      const match = mockDb.getHospitals().find(h => h.id === id);
      if (!match) {
        throw new Error('Hospital not found');
      }
      return match;
    }
    return apiClient.get<Hospital>(`/hospitals/${id}`);
  },

  searchHospitals: async (query: string): Promise<Hospital[]> => {
    if (isMockMode()) {
      const hospitals = mockDb.getHospitals();
      const q = query.toLowerCase().trim();
      if (!q) return hospitals;

      return hospitals.filter((h) => {
        const matchName = h.name.toLowerCase().includes(q);
        const matchAddr = h.address.toLowerCase().includes(q);
        const matchDesc = h.description.toLowerCase().includes(q);
        const matchDept = h.departments.some(d => d.name.toLowerCase().includes(q));
        const matchServ = h.services.some(s => s.name.toLowerCase().includes(q));
        return matchName || matchAddr || matchDesc || matchDept || matchServ;
      });
    }
    return apiClient.get<Hospital[]>(`/hospitals/search?q=${encodeURIComponent(query)}`);
  }
};
