import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  Zap, 
  Compass, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus
} from 'lucide-react';
import { Appointment, AppTab } from '../types';

interface AppointmentsViewProps {
  appointments: Appointment[];
  onSelectAppointment: (appt: Appointment) => void;
  onCancelAppointment: (id: string) => void;
  setTab: (tab: AppTab) => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({
  appointments,
  onSelectAppointment,
  onCancelAppointment,
  setTab,
}) => {
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'completed' | 'rescheduled' | 'no_show'>('upcoming');

  const filteredAppointments = appointments.filter((a) => a.status === activeFilter);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            My Appointments
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage your scheduled hospital consultations and queue status
          </p>
        </div>

        <button
          onClick={() => setTab('book')}
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Appointment</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200 max-w-fit overflow-x-auto">
        <button
          onClick={() => setActiveFilter('upcoming')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'upcoming'
              ? 'bg-blue-50 text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          Upcoming ({appointments.filter(a => a.status === 'upcoming').length})
        </button>

        <button
          onClick={() => setActiveFilter('completed')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'completed'
              ? 'bg-blue-50 text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          Completed
        </button>

        <button
          onClick={() => setActiveFilter('rescheduled')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'rescheduled'
              ? 'bg-blue-50 text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          Rescheduled
        </button>

        <button
          onClick={() => setActiveFilter('no_show')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'no_show'
              ? 'bg-blue-50 text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          No Show
        </button>
      </div>

      {/* Appointment Cards List */}
      <div className="space-y-4">
        {filteredAppointments.map((appt) => (
          <div
            key={appt.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                    {appt.hospitalName}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5 font-medium">
                    {appt.doctor} · <span className="text-slate-500">{appt.department}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {appt.service}
                  </p>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider flex-shrink-0 ${
                  appt.status === 'upcoming' 
                    ? 'bg-blue-50 text-blue-700'
                    : appt.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {appt.status}
                </span>
              </div>

              {/* Detail row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-5 py-3.5 px-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs sm:text-sm">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Date
                  </span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{appt.date}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Expected consultation
                  </span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{appt.time}</span>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Recommended arrival
                  </span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{appt.arrival}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 mb-4 px-1">
                <span>Ref: <strong className="font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded">{appt.ref}</strong></span>
                <span>Room: <strong className="text-slate-700 font-semibold">{appt.room} ({appt.block})</strong></span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  onSelectAppointment(appt);
                  setTab('queue');
                }}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Live Queue</span>
              </button>

              <button
                onClick={() => {
                  onSelectAppointment(appt);
                  setTab('journey');
                }}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Compass className="w-3.5 h-3.5 text-blue-600" />
                <span>Journey</span>
              </button>

              <button
                onClick={() => {
                  onSelectAppointment(appt);
                  setTab('navigation');
                }}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm shadow-blue-600/20"
              >
                <span>Navigate</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onCancelAppointment(appt.id)}
                className="ml-auto px-3.5 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No {activeFilter} appointments</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
              You don't have any appointments currently categorized as {activeFilter}.
            </p>
            {activeFilter !== 'upcoming' && (
              <button
                onClick={() => setActiveFilter('upcoming')}
                className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold cursor-pointer"
              >
                View upcoming appointments
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
