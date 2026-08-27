import { apiClient, isMockMode } from './apiClient';
import { mockDb } from './mockDb';
import { Doctor } from '../types';

export const doctorApi = {
  getDoctors: async (): Promise<Doctor[]> => {
    if (isMockMode()) {
      return mockDb.getDoctors();
    }
    return apiClient.get<Doctor[]>('/doctors');
  },

  getDoctorById: async (id: string): Promise<Doctor> => {
    if (isMockMode()) {
      const match = mockDb.getDoctors().find(d => d.id === id);
      if (!match) {
        throw new Error('Doctor not found');
      }
      return match;
    }
    return apiClient.get<Doctor>(`/doctors/${id}`);
  },

  searchDoctors: async (hospitalId?: string, departmentName?: string): Promise<Doctor[]> => {
    if (isMockMode()) {
      let docs = mockDb.getDoctors();
      if (hospitalId) {
        docs = docs.filter(d => d.hospitalId === hospitalId);
      }
      if (departmentName) {
        docs = docs.filter(d => d.department.toLowerCase() === departmentName.toLowerCase());
      }
      return docs;
    }
    const params = new URLSearchParams();
    if (hospitalId) params.append('hospitalId', hospitalId);
    if (departmentName) params.append('department', departmentName);
    return apiClient.get<Doctor[]>(`/doctors?${params.toString()}`);
  }
};
