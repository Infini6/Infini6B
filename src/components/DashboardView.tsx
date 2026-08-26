import React from 'react';
import { 
  Calendar, 
  Clock, 
  ArrowRight, 
  Zap, 
  Navigation as NavIcon, 
  CalendarDays, 
  Bell, 
  Plus,
  CheckCircle2,
  MapPin,
  ChevronRight,
  Activity,
  Heart,
  Timer
} from 'lucide-react';
import { Appointment, AppTab, NotificationItem, UserProfile } from '../types';
import { JOURNEY_STEP_DEFINITIONS } from '../data/mockData';

interface DashboardViewProps {
  user: UserProfile;
  activeAppointment: Appointment;
  notifications: NotificationItem[];
  setTab: (tab: AppTab) => void;
  onSelectAppointment: (appt: Appointment) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  activeAppointment,
  notifications,
  setTab,
}) => {
  return (
    <div className="space-y-6 pb-12">
      {/* Header Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Good day, {user.name}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Your patient overview and live queue status for today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">{user.name}</p>
            <p className="text-xs text-slate-500">ID: #4492-00</p>
          </div>
          <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-sm border border-blue-200">
            {user.name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* 4 Sleek Status Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm mb-1 font-medium">Queue Position</p>
          <h3 className="text-3xl font-bold text-slate-800">
            #{activeAppointment.position}{' '}
            <span className="text-sm font-normal text-slate-400">in line</span>
          </h3>
          <div className="mt-2 text-xs text-green-600 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
            Live Active Token
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm mb-1 font-medium">Estimated Wait</p>
          <h3 className="text-3xl font-bold text-slate-800">
            {activeAppointment.estimatedWait}
          </h3>
          <div className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1">
            <Timer className="w-3.5 h-3.5" />
            On Schedule
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm mb-1 font-medium">Currently Serving</p>
          <h3 className="text-3xl font-bold text-slate-800">
            #{activeAppointment.currentlyServing}
          </h3>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-medium">
            Room {activeAppointment.room}
          </div>
        </div>

        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
          <p className="text-slate-500 text-sm mb-1 font-medium">Journey Stage</p>
          <h3 className="text-3xl font-bold text-slate-800">
            {activeAppointment.journeyStep}{' '}
            <span className="text-base font-normal text-slate-400">/ 7</span>
          </h3>
          <div className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1">
            {JOURNEY_STEP_DEFINITIONS.find(s => s.id === activeAppointment.journeyStep)?.name || 'Check-in'}
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          id="quick-tile-book"
          onClick={() => setTab('book')}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-slate-800 font-semibold text-sm transition-all duration-150 shadow-sm hover:border-blue-300 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span>Book Visit</span>
        </button>

        <button
          id="quick-tile-appointments"
          onClick={() => setTab('appointments')}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-slate-800 font-semibold text-sm transition-all duration-150 shadow-sm hover:border-blue-300 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <CalendarDays className="w-5 h-5" />
          </div>
          <span>Appointments</span>
        </button>

        <button
          id="quick-tile-navigation"
          onClick={() => setTab('navigation')}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-slate-800 font-semibold text-sm transition-all duration-150 shadow-sm hover:border-blue-300 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <NavIcon className="w-5 h-5" />
          </div>
          <span>Navigation</span>
        </button>

        <button
          id="quick-tile-notifications"
          onClick={() => setTab('notifications')}
          className="bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-slate-800 font-semibold text-sm transition-all duration-150 shadow-sm hover:border-blue-300 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <Bell className="w-5 h-5" />
          </div>
          <span>Notifications</span>
        </button>
      </div>

      {/* Main 2-Column Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Next Appointment Card (Col 7) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Next Appointment</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                Upcoming
              </span>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-blue-50 border border-blue-100 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 text-blue-700">
                <span className="text-[10px] font-bold uppercase tracking-wider">AUG</span>
                <span className="text-xl font-bold leading-none">27</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  {activeAppointment.hospitalName}
                </h3>
                <p className="text-sm text-slate-600 font-medium mt-0.5">
                  {activeAppointment.doctor} · <span className="text-slate-500">{activeAppointment.department}</span>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {activeAppointment.service}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 my-5 py-3.5 px-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                  Expected consultation
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-800 mt-0.5">
                  {activeAppointment.time}
                </div>
              </div>
              <div>
                <div className="text-[11px] font-bold tracking-wider uppercase text-slate-400">
                  Recommended arrival
                </div>
                <div className="text-sm sm:text-base font-bold text-slate-800 mt-0.5">
                  {activeAppointment.arrival}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
              <span>Date: <strong className="text-slate-700 font-semibold">{activeAppointment.date}</strong></span>
              <span>Ref: <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{activeAppointment.ref}</span></span>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5 pt-4 border-t border-slate-100">
            <button
              id="dashboard-view-queue-btn"
              onClick={() => setTab('queue')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Live Queue
            </button>
            <button
              id="dashboard-journey-btn"
              onClick={() => setTab('journey')}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Journey
            </button>
            <button
              id="dashboard-navigate-btn"
              onClick={() => setTab('navigation')}
              className="ml-auto flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
            >
              <span>Navigate</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Queue Card (Col 5) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span>Live Queue Status</span>
              </div>
              <button
                onClick={() => setTab('queue')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5 cursor-pointer"
              >
                <span>Full screen</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Your position box */}
              <div className="bg-blue-600 text-white rounded-2xl p-5 shadow-sm">
                <div className="text-xs font-medium text-blue-100">
                  Your position
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold mt-1 tracking-tight">
                  #{activeAppointment.position}
                </div>
                <div className="text-[10px] text-blue-200 mt-2 font-medium">
                  Active in line
                </div>
              </div>

              {/* Currently serving box */}
              <div className="bg-slate-50 text-slate-900 rounded-2xl p-5 border border-slate-200">
                <div className="text-xs font-medium text-slate-500">
                  Currently serving
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold mt-1 text-slate-800 tracking-tight">
                  #{activeAppointment.currentlyServing}
                </div>
                <div className="text-[10px] text-slate-400 mt-2 font-medium">
                  Room {activeAppointment.room}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 px-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm">
              <span className="text-slate-500 font-medium">Estimated wait time</span>
              <span className="font-bold text-slate-800">{activeAppointment.estimatedWait}</span>
            </div>
          </div>

          <div className="pt-4 text-right">
            <button
              onClick={() => setTab('queue')}
              className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
            >
              Open live queue tracker →
            </button>
          </div>
        </div>

      </div>

      {/* Patient Journey Strip Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Patient Journey Timeline
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">7-checkpoint hospital navigation progress</p>
          </div>
          <button
            onClick={() => setTab('journey')}
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            View full journey →
          </button>
        </div>

        <div className="overflow-x-auto pt-2 pb-1">
          <div className="flex items-center justify-between min-w-[620px]">
            {JOURNEY_STEP_DEFINITIONS.map((step, idx) => {
              const isCurrent = step.id === activeAppointment.journeyStep;
              const isPassed = step.id < activeAppointment.journeyStep;
              
              return (
                <React.Fragment key={step.id}>
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setTab('journey')}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent 
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                        : isPassed
                        ? 'bg-green-600 text-white'
                        : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      {isPassed ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                    </div>
                    <span className={`text-xs font-semibold whitespace-nowrap ${
                      isCurrent ? 'text-blue-700 font-bold' : isPassed ? 'text-slate-800' : 'text-slate-500'
                    }`}>
                      {step.name}
                    </span>
                  </div>

                  {idx < JOURNEY_STEP_DEFINITIONS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 min-w-4 ${
                      step.id < activeAppointment.journeyStep ? 'bg-green-500' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Notifications Table/List Section */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Recent Updates & Alerts
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Real-time status updates regarding your booking</p>
          </div>
          <button
            onClick={() => setTab('notifications')}
            className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
          >
            All notifications →
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {notifications.slice(0, 3).map((notif) => (
            <div 
              key={notif.id}
              onClick={() => setTab('notifications')}
              className="py-4 hover:bg-slate-50 rounded-2xl px-3 transition-colors cursor-pointer flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-800">
                    {notif.title}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">{notif.time}</span>
                    {notif.unread && (
                      <span className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 leading-relaxed">
                  {notif.body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
