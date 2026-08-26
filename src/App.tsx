import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { HospitalsView } from './components/HospitalsView';
import { BookingWizard } from './components/BookingWizard';
import { AppointmentsView } from './components/AppointmentsView';
import { QueueView } from './components/QueueView';
import { JourneyView } from './components/JourneyView';
import { NavigationView } from './components/NavigationView';
import { NotificationsView } from './components/NotificationsView';
import { ProfileView } from './components/ProfileView';

import { 
  AppTab, 
  Hospital, 
  Department, 
  Doctor, 
  Appointment, 
  NotificationItem, 
  UserProfile 
} from './types';

import { 
  INITIAL_USER, 
  INITIAL_APPOINTMENTS, 
  INITIAL_NOTIFICATIONS 
} from './data/mockData';

export default function App() {
  // State
  const [currentTab, setCurrentTab] = useState<AppTab>('dashboard');
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('caresync_user');
    return saved ? JSON.parse(saved) : INITIAL_USER;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('caresync_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [activeAppointment, setActiveAppointment] = useState<Appointment>(() => {
    return appointments[0] || INITIAL_APPOINTMENTS[0];
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('caresync_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // Pre-selected state for booking wizard
  const [bookingIntent, setBookingIntent] = useState<{
    hospital: Hospital | null;
    department: Department | null;
    doctor: Doctor | null;
  }>({
    hospital: null,
    department: null,
    doctor: null,
  });

  // Persist state changes
  useEffect(() => {
    localStorage.setItem('caresync_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('caresync_appointments', JSON.stringify(appointments));
    if (!activeAppointment && appointments.length > 0) {
      setActiveAppointment(appointments[0]);
    }
  }, [appointments, activeAppointment]);

  useEffect(() => {
    localStorage.setItem('caresync_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Tab switcher with window scroll
  const handleSetTab = (tab: AppTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Start booking from hospital or department view
  const handleStartBooking = (hosp: Hospital, dept?: Department, doc?: Doctor) => {
    setBookingIntent({
      hospital: hosp,
      department: dept || null,
      doctor: doc || null,
    });
    handleSetTab('book');
  };

  // New booking confirmed
  const handleBookingConfirmed = (newAppt: Appointment) => {
    setAppointments((prev) => [newAppt, ...prev]);
    setActiveAppointment(newAppt);

    // Create confirmation notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Appointment confirmed',
      body: `Your ${newAppt.service} at ${newAppt.hospitalName} on ${newAppt.date} is confirmed. Reference ${newAppt.ref}.`,
      time: 'Just now',
      unread: true,
      ref: newAppt.ref,
      date: newAppt.date,
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  // Advance journey step
  const handleAdvanceStep = (appointmentId: string, nextStep: number) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, journeyStep: nextStep } : a))
    );
    if (activeAppointment.id === appointmentId) {
      setActiveAppointment((prev) => ({ ...prev, journeyStep: nextStep }));
    }
  };

  // Mark all notifications as read
  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  // Notification click handler
  const handleSelectNotification = (ref?: string) => {
    if (ref) {
      const match = appointments.find((a) => a.ref === ref);
      if (match) {
        setActiveAppointment(match);
      }
    }
    handleSetTab('appointments');
  };

  // Cancel appointment
  const handleCancelAppointment = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: 'completed' as const } : a))
      );
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col selection:bg-blue-100 selection:text-blue-900">
      {/* Top and Mobile Navigation */}
      <Navbar
        currentTab={currentTab}
        setTab={handleSetTab}
        unreadCount={unreadNotificationsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            user={user}
            activeAppointment={activeAppointment}
            notifications={notifications}
            setTab={handleSetTab}
            onSelectAppointment={(appt) => {
              setActiveAppointment(appt);
            }}
          />
        )}

        {currentTab === 'hospitals' && (
          <HospitalsView
            onStartBooking={handleStartBooking}
            setTab={handleSetTab}
          />
        )}

        {currentTab === 'book' && (
          <BookingWizard
            initialHospital={bookingIntent.hospital}
            initialDepartment={bookingIntent.department}
            initialDoctor={bookingIntent.doctor}
            onBookingConfirmed={handleBookingConfirmed}
            setTab={handleSetTab}
          />
        )}

        {currentTab === 'appointments' && (
          <AppointmentsView
            appointments={appointments}
            onSelectAppointment={(appt) => {
              setActiveAppointment(appt);
            }}
            onCancelAppointment={handleCancelAppointment}
            setTab={handleSetTab}
          />
        )}

        {currentTab === 'queue' && (
          <QueueView
            appointment={activeAppointment}
            setTab={handleSetTab}
          />
        )}

        {currentTab === 'journey' && (
          <JourneyView
            appointment={activeAppointment}
            setTab={handleSetTab}
            onAdvanceStep={handleAdvanceStep}
          />
        )}

        {currentTab === 'navigation' && (
          <NavigationView
            appointment={activeAppointment}
            setTab={handleSetTab}
          />
        )}

        {currentTab === 'notifications' && (
          <NotificationsView
            notifications={notifications}
            onMarkAllAsRead={handleMarkAllNotificationsAsRead}
            onSelectNotification={handleSelectNotification}
            setTab={handleSetTab}
          />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={user}
            onUpdateProfile={(updated) => setUser(updated)}
            setTab={handleSetTab}
          />
        )}
      </main>
    </div>
  );
}
