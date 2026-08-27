import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { appointmentApi } from '../services/appointmentApi';
import { notificationApi } from '../services/notificationApi';
import { wsClient } from '../websocket/socket';
import { Appointment, NotificationItem } from '../types';
import { JOURNEY_STEP_DEFINITIONS } from '../data/mockData';
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
  Timer,
  AlertCircle,
  WifiOff,
  UserCheck
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [activeAppointment, setActiveAppointment] = useState<Appointment | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // WebSocket status
  const [wsStatus, setWsStatus] = useState(() => wsClient.getConnectivity());

  useEffect(() => {
    // Load dashboard stats
    const fetchStats = async () => {
      try {
        setLoading(true);
        const appts = await appointmentApi.getAppointments();
        const activeAppts = appts.filter(a => a.status === 'upcoming' || a.status === 'rescheduled');
        setAppointments(appts);
        
        if (activeAppts.length > 0) {
          // Pick the first upcoming appointment
          setActiveAppointment(activeAppts[0]);
        } else if (appts.length > 0) {
          setActiveAppointment(appts[0]);
        }

        const notifs = await notificationApi.getNotifications();
        setNotifications(notifs);

      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    // Subscribe to WebSocket status changes
    const unsubStatus = wsClient.subscribe('connection_status', (_, data) => {
      setWsStatus(data);
    });

    // Subscribe to live queue/journey updates for current active appointment
    const unsubQueue = wsClient.subscribe('queue_update', (_, data) => {
      setActiveAppointment(prev => {
        if (prev && prev.id === data.appointmentId) {
          return {
            ...prev,
            position: data.position,
            currentlyServing: data.currentlyServing,
            estimatedWait: data.estimatedWait
          };
        }
        return prev;
      });
    });

    const unsubJourney = wsClient.subscribe('journey_update', (_, data) => {
      setActiveAppointment(prev => {
        if (prev && prev.id === data.appointmentId) {
          return {
            ...prev,
            journeyStep: data.journeyStep
          };
        }
        return prev;
      });
    });

    return () => {
      unsubStatus();
      unsubQueue();
      unsubJourney();
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 pb-12">
        <div className="h-10 bg-slate-200 rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-200 h-28 rounded-3xl" />
          ))}
        </div>
        <div className="bg-slate-200 h-64 rounded-3xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Header Greeting Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Good day, {user?.name}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Your patient overview and live queue status for today
          </p>
        </div>
        
        {/* WebSocket Connection Warning */}
        {!wsStatus.connected && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-orange-700 text-xs sm:text-sm shadow-xs max-w-fit">
            <WifiOff className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span>Live updates temporarily unavailable (Last checked: {wsStatus.lastUpdated})</span>
          </div>
        )}
      </div>

      {activeAppointment ? (
        <>
          {/* Active Status KPI Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs sm:text-sm mb-1 font-medium">Queue Position</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-850">
                #{activeAppointment.position}{' '}
                <span className="text-xs sm:text-sm font-normal text-slate-400">in line</span>
              </h3>
              <div className="mt-2 text-xs text-green-600 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-ping" />
                Live Active Token
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs sm:text-sm mb-1 font-medium">Estimated Wait</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-850">
                {activeAppointment.estimatedWait}
              </h3>
              <div className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1">
                <Timer className="w-3.5 h-3.5" />
                On Schedule
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs sm:text-sm mb-1 font-medium">Currently Serving</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-850">
                #{activeAppointment.currentlyServing}
              </h3>
              <div className="mt-2 text-xs text-slate-500 flex items-center gap-1 font-medium">
                Room {activeAppointment.room}
              </div>
            </div>

            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm">
              <p className="text-slate-500 text-xs sm:text-sm mb-1 font-medium">Journey Stage</p>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-855">
                {activeAppointment.journeyStep}{' '}
                <span className="text-xs sm:text-sm font-normal text-slate-400">/ 7</span>
              </h3>
              <div className="mt-2 text-xs text-blue-600 font-semibold flex items-center gap-1">
                {JOURNEY_STEP_DEFINITIONS.find(s => s.id === activeAppointment.journeyStep)?.name || 'Check-in'}
              </div>
            </div>
          </div>

          {/* Next Scheduled Appointment Widget */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-650 uppercase tracking-widest bg-blue-50 px-2.5 py-1 rounded-lg">
                    Next Active Visit
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-2.5 tracking-tight leading-tight">
                    {activeAppointment.service}
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{activeAppointment.hospitalName}</p>
                </div>
                <Link
                  to={`/appointments/${activeAppointment.id}`}
                  className="self-start sm:self-center flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <span>Manage Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                <div className="flex items-start gap-2.5">
                  <Clock className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Consultation Window</p>
                    <p className="font-bold text-slate-800 text-sm mt-1">{activeAppointment.time}</p>
                    <span className="text-[10px] text-slate-450 mt-1 inline-block">Estimated window; not a guarantee.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Scheduled Date</p>
                    <p className="font-bold text-slate-800 text-sm mt-1">{activeAppointment.date}</p>
                    <p className="text-[10px] text-blue-600 font-semibold mt-1">Recommended Arrival: {activeAppointment.arrival}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Consultation Room</p>
                    <p className="font-bold text-slate-800 text-sm mt-1">Room {activeAppointment.room}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{activeAppointment.block} · {activeAppointment.floor}</p>
                  </div>
                </div>
              </div>

              {/* Direct links to routing pages */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <Link
                  to={`/queue/${activeAppointment.id}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm shadow-blue-500/10 transition-all cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Track Live Queue</span>
                </Link>

                <Link
                  to={`/journey/${activeAppointment.id}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl border border-slate-205 transition-colors cursor-pointer"
                >
                  <UserCheck className="w-4 h-4 text-slate-500" />
                  <span>Patient Journey</span>
                </Link>

                <Link
                  to={`/navigation/${activeAppointment.id}`}
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold rounded-2xl border border-slate-205 transition-colors cursor-pointer"
                >
                  <NavIcon className="w-4 h-4 text-slate-500" />
                  <span>Indoor Navigation</span>
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Empty Dashboard State */
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <CalendarDays className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">No Upcoming Visits</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            You don't have any appointments booked for today. Search for available hospitals and schedule a consultation now.
          </p>
          <div className="pt-2">
            <Link
              to="/appointments/book"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl text-sm font-semibold shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </div>
      )}

      {/* Dynamic Alerts and Announcements Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Health Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Heart className="w-5 h-5 text-red-500 fill-red-500" />
              <h3 className="font-bold text-slate-800 text-base">Digital Health Card</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Show this barcode at hospital kiosks to quickly scan and verify your arrival check-in.
            </p>
          </div>

          {/* Simple Mock Barcode */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center mt-6">
            <div className="font-mono text-sm tracking-widest text-slate-400 font-bold bg-white border border-slate-200 py-3.5 rounded-xl">
              ||| | |||| || ||| | |||
            </div>
            <p className="text-[10px] text-slate-550 font-bold mt-2">PATIENT_ID: 4492-00</p>
          </div>
        </div>

        {/* Notifications and Alerts Brief Panel */}
        <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span>Recent Alerts</span>
            </h3>
            <Link
              to="/notifications"
              className="text-xs font-bold text-blue-600 hover:text-blue-750 hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="space-y-3">
            {notifications.slice(0, 3).map((notif) => (
              <div
                key={notif.id}
                onClick={() => {
                  if (notif.ref) navigate(`/appointments/${notif.ref}`);
                }}
                className={`p-3 rounded-2xl flex items-start gap-3 transition-colors cursor-pointer ${
                  notif.unread ? 'bg-blue-50/40 hover:bg-blue-50/70' : 'hover:bg-slate-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  notif.unread ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate">{notif.title}</h4>
                  <p className="text-[11px] sm:text-xs text-slate-550 mt-0.5 line-clamp-1">{notif.body}</p>
                </div>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap mt-1">{notif.time}</span>
              </div>
            ))}
            {notifications.length === 0 && (
              <p className="text-xs text-slate-400 py-2">No recent alerts or notifications.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default DashboardView;
