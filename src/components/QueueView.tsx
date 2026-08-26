import React, { useState, useEffect } from 'react';
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
  CheckCircle2
} from 'lucide-react';
import { Appointment, AppTab } from '../types';

interface QueueViewProps {
  appointment: Appointment;
  setTab: (tab: AppTab) => void;
}

export const QueueView: React.FC<QueueViewProps> = ({ appointment, setTab }) => {
  const [lastUpdatedTime, setLastUpdatedTime] = useState('5:38 PM');
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      setLastUpdatedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateCurrentTime();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      setLastUpdatedTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setIsRefreshing(false);
    }, 500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      {/* Top Back Link */}
      <button
        onClick={() => setTab('appointments')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to appointments</span>
      </button>

      {/* Screen Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Live Queue Tracker
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {appointment.hospitalName} · {appointment.department}
        </p>
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
              #{appointment.position}
            </div>
            <span className="text-[11px] text-blue-100 mt-3 flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-ping inline-block" />
              Live token active
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 text-slate-900 rounded-2xl p-5 sm:p-6 flex flex-col justify-between">
            <span className="text-xs sm:text-sm font-medium text-slate-500">
              Currently serving
            </span>
            <div className="text-4xl sm:text-5xl font-extrabold mt-2 text-slate-800 tracking-tight">
              #{appointment.currentlyServing}
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
            <span className="font-bold text-slate-800 text-base">{appointment.estimatedWait}</span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Your reference token</span>
            </div>
            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md">{appointment.ref}</span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span>Expected consultation</span>
            </div>
            <span className="font-semibold text-slate-800">{appointment.time}</span>
          </div>

          <div className="py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <RotateCw className={`w-4 h-4 text-slate-400 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Last updated</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-600">{lastUpdatedTime}</span>
              <button
                onClick={handleRefresh}
                className="text-xs text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Navigation / Journey Action Buttons */}
        <div className="pt-2 flex items-center gap-3">
          <button
            onClick={() => setTab('journey')}
            className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-blue-600" />
            <span>Journey Timeline</span>
          </button>

          <button
            onClick={() => setTab('navigation')}
            className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Navigate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* Real-time disclaimer footer */}
      <p className="text-center text-xs text-slate-400 px-4 leading-relaxed">
        Queue updates live as hospital staff call patients. Times are estimates and may change with hospital conditions.
      </p>
    </div>
  );
};
