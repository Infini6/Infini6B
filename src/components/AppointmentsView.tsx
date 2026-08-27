import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { appointmentApi } from '../services/appointmentApi';
import { Appointment } from '../types';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Plus,
  RefreshCw,
  ChevronRight
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'upcoming' | 'completed' | 'rescheduled' | 'no_show' | 'cancelled'>('upcoming');

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await appointmentApi.getAppointments();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch your appointments list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = appointments.filter((a) => {
    // Treat 'cancelled' explicitly
    if (activeFilter === 'cancelled') {
      return a.status as string === 'cancelled';
    }
    return a.status === activeFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="flex justify-between items-center animate-pulse">
          <div className="h-10 bg-slate-200 rounded-xl w-48" />
          <div className="h-10 bg-slate-200 rounded-xl w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-slate-200 h-32 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-650 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Error Loading Appointments</h2>
        <p className="text-slate-500 text-sm">{error}</p>
        <button
          onClick={fetchAppointments}
          className="flex items-center gap-1.5 px-4.5 py-2.5 bg-blue-650 text-white font-semibold rounded-xl mx-auto cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 selection:bg-blue-100 selection:text-blue-900">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            My Appointments
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage your scheduled hospital consultations and queue status
          </p>
        </div>

        <Link
          to="/appointments/book"
          className="self-start sm:self-center flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Appointment</span>
        </Link>
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
          Completed ({appointments.filter(a => a.status === 'completed').length})
        </button>

        <button
          onClick={() => setActiveFilter('rescheduled')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'rescheduled'
              ? 'bg-blue-50 text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          Rescheduled ({appointments.filter(a => a.status === 'rescheduled').length})
        </button>

        <button
          onClick={() => setActiveFilter('cancelled')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'cancelled'
              ? 'bg-blue-50 text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          Cancelled ({appointments.filter(a => a.status as string === 'cancelled').length})
        </button>

        <button
          onClick={() => setActiveFilter('no_show')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
            activeFilter === 'no_show'
              ? 'bg-blue-50 text-blue-700 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white'
          }`}
        >
          No Show ({appointments.filter(a => a.status === 'no_show').length})
        </button>
      </div>

      {/* Appointment Cards */}
      <div className="grid grid-cols-1 gap-4">
        {filteredAppointments.map((appt) => (
          <div
            key={appt.id}
            onClick={() => navigate(`/appointments/${appt.id}`)}
            className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-sm hover:border-blue-150 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group text-left"
          >
            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                  {appt.ref}
                </span>
                <h3 className="font-extrabold text-slate-800 text-base sm:text-lg mt-2 group-hover:text-blue-650 transition-colors">
                  {appt.service}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">{appt.hospitalName} · {appt.department}</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{appt.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{appt.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span>Room {appt.room}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                appt.status === 'upcoming'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : appt.status === 'rescheduled'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : appt.status === 'completed'
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {appt.status}
              </span>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        ))}

        {filteredAppointments.length === 0 && (
          <div className="bg-white rounded-3xl border border-slate-205 p-8 sm:p-12 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-800">No Appointments Found</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">
              There are no appointments listed under the {activeFilter} status filter.
            </p>
          </div>
        )}
      </div>

    </div>
  );
};
export default AppointmentsView;
