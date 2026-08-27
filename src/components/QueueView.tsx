import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { queueApi, QueueStatus } from '../services/queueApi';
import { appointmentApi } from '../services/appointmentApi';
import { wsClient } from '../websocket/socket';
import { 
  ArrowLeft, 
  Clock, 
  Zap, 
  Calendar, 
  RotateCw, 
  ArrowRight, 
  Compass, 
  ShieldCheck,
  BellRing,
  CheckCircle2,
  AlertCircle,
  WifiOff
} from 'lucide-react';
import { Appointment } from '../types';

export const QueueView: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // WebSocket status
  const [wsStatus, setWsStatus] = useState(() => wsClient.getConnectivity());

  const loadData = async (silent = false) => {
    if (!appointmentId) return;
    if (!silent) setLoading(true);
    try {
      const appt = await appointmentApi.getAppointmentById(appointmentId);
      setAppointment(appt);

      const status = await queueApi.getQueueStatus(appointmentId);
      setQueueStatus(status);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch queue status.');
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to WebSocket status
    const unsubStatus = wsClient.subscribe('connection_status', (_, data) => {
      setWsStatus(data);
    });

    // Subscribe to live queue updates for this appointment
    const unsubQueue = wsClient.subscribe('queue_update', (_, data) => {
      if (data.appointmentId === appointmentId) {
        setQueueStatus(prev => prev ? {
          ...prev,
          position: data.position,
          patientsAhead: Math.max(0, data.position - 1),
          estimatedWaitMinutes: parseInt(data.estimatedWait) || 12,
          currentlyServing: `A-${100 + data.currentlyServing}`,
          lastUpdated: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        } : null);
      }
    });

    return () => {
      unsubStatus();
      unsubQueue();
    };
  }, [appointmentId]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm mt-3 font-semibold">Connecting to queue channel...</p>
      </div>
    );
  }

  if (error || !appointment || !queueStatus) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-650 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Queue Data Unavailable</h2>
        <p className="text-slate-505 text-sm">{error || 'Unable to connect to the hospital live queue tracking database.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-205 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Back Link */}
      <button
        onClick={() => navigate(`/appointments/${appointment.id}`)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to appointment details</span>
      </button>

      {/* Screen Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Live Queue Tracker
          </h1>
          <p className="text-slate-505 text-xs sm:text-sm mt-0.5">
            {appointment.hospitalName} · {appointment.department}
          </p>
        </div>

        {/* WebSocket Connection Warning */}
        {!wsStatus.connected && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl px-3.5 py-2 flex items-center gap-2 text-orange-700 text-xs shadow-xs max-w-fit">
            <WifiOff className="w-4 h-4 text-orange-500" />
            <span>Live updates temporarily offline (Last sync: {wsStatus.lastUpdated})</span>
          </div>
        )}
      </div>

      {/* Main Queue Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* KPI Position & Serving Cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-600 text-white rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between">
            <span className="text-xs sm:text-sm font-medium text-blue-100">
              Your position
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold mt-2 tracking-tight">
              #{queueStatus.position}
            </div>
            <span className="text-[11px] text-blue-100 mt-3 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" />
              Live token active
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-505">
              Currently serving
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold mt-2 text-slate-800 tracking-tight">
              {queueStatus.currentlyServing}
            </div>
            <span className="text-[11px] text-slate-500 mt-3 font-medium">
              Room {appointment.room}
            </span>
          </div>
        </div>

        {/* Metric Rows */}
        <div className="divide-y divide-slate-100 text-xs sm:text-sm">
          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Estimated wait time</span>
            </div>
            <span className="font-bold text-slate-800">{queueStatus.estimatedWaitMinutes} minutes</span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Zap className="w-4 h-4 text-slate-400" />
              <span>Patients ahead of you</span>
            </div>
            <span className="font-bold text-slate-800">{queueStatus.patientsAhead} patients</span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Queue Status</span>
            </div>
            <span className={`font-bold px-2 py-0.5 rounded text-xs ${
              queueStatus.status === 'In consultation' 
                ? 'bg-blue-50 text-blue-700'
                : queueStatus.status === 'Completed'
                ? 'bg-green-50 text-green-700'
                : queueStatus.status === 'Called'
                ? 'bg-amber-50 text-amber-700 animate-pulse'
                : 'bg-slate-50 text-slate-600'
            }`}>
              {queueStatus.status}
            </span>
          </div>
        </div>

        {/* Bottom refresh bar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <span className="text-xs text-slate-400">
            Last updated: {queueStatus.lastUpdated}
          </span>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-205 rounded-lg text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Warning instruction callout */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 sm:p-6 flex items-start gap-3 text-xs sm:text-sm">
        <BellRing className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-blue-900">Push Alerts Active</span>
          <p className="text-blue-800 leading-relaxed">
            Please make sure you have checked-in at the reception kiosk. We will send you SMS push alerts when your token is called. Keep this page open to watch real-time updates.
          </p>
        </div>
      </div>
    </div>
  );
};
export default QueueView;
