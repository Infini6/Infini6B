export type AppTab = 
  | 'dashboard'
  | 'hospitals'
  | 'book'
  | 'appointments'
  | 'queue'
  | 'journey'
  | 'navigation'
  | 'notifications'
  | 'profile'
  | 'confirmation';

export interface Doctor {
  id: string;
  name: string;
  role: string;
  department: string;
  hospitalId: string;
  availability: 'available' | 'limited' | 'busy';
  room: string;
  rating?: number;
}

export interface Department {
  id: string;
  name: string;
  block: string;
  floor: string;
  room: string;
  description: string;
  hospitalId: string;
}

export interface HospitalService {
  id: string;
  name: string;
  department: string;
  durationMinutes: number;
  price: string;
  description: string;
}

export interface Hospital {
  id: string;
  name: string;
  status: 'open' | 'limited' | 'closed';
  address: string;
  phone: string;
  hours: string;
  description: string;
  departments: Department[];
  services: HospitalService[];
}

export interface Appointment {
  id: string;
  ref: string;
  hospitalId: string;
  hospitalName: string;
  department: string;
  doctor: string;
  service: string;
  date: string;
  time: string;
  arrival: string;
  status: 'upcoming' | 'completed' | 'rescheduled' | 'no_show';
  position: number;
  currentlyServing: number;
  estimatedWait: string;
  journeyStep: number;
  block: string;
  floor: string;
  room: string;
  destinations: {
    step: number;
    name: string;
    location: string;
    isCurrent: boolean;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
  ref?: string;
  date?: string;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  emergencyContact: string;
  bloodGroup: string;
  age: number;
}

export interface BookingState {
  hospital: Hospital | null;
  department: Department | null;
  doctor: Doctor | null;
  service: HospitalService | null;
  date: string;
  slot: string;
  step: number;
}
