import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { navigationApi, NavigationStep } from '../services/navigationApi';
import { appointmentApi } from '../services/appointmentApi';
import { 
  ArrowLeft, 
  Building, 
  Layers, 
  DoorOpen, 
  MapPin, 
  Compass, 
  Zap, 
  CheckCircle2,
  Navigation as NavIcon,
  Footprints,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Appointment } from '../types';

export const NavigationView: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [directions, setDirections] = useState<NavigationStep[]>([]);
  const [activeDestIndex, setActiveDestIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!appointmentId) return;
      try {
        setLoading(true);
        const appt = await appointmentApi.getAppointmentById(appointmentId);
        setAppointment(appt);

        const routeData = await navigationApi.getNavigationDirections(appointmentId);
        setDirections(routeData);
      } catch (err: any) {
        setError(err.message || 'Unable to load navigation directions.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [appointmentId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm mt-3 font-semibold">Generating navigation route...</p>
      </div>
    );
  }

  if (error || !appointment || directions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-655 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Navigation Route Unavailable</h2>
        <p className="text-slate-505 text-sm">{error || "We couldn't compile the indoor wayfinding details for this appointment."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-205 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const currentDest = directions[activeDestIndex] || directions[0];

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
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Indoor Hospital Navigation
        </h1>
        <p className="text-slate-505 text-xs sm:text-sm mt-0.5">
          {appointment.hospitalName} · Step-by-step facility guide
        </p>
      </div>

      {/* Blue Highlight Destination Card */}
      <div className="bg-blue-600 text-white rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-100">
            Active Destination Target
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold mt-1 tracking-tight">
            {currentDest.name}
          </h2>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 border-t border-blue-500/40 text-center">
          <div className="bg-white/10 rounded-2xl py-3.5 px-2 backdrop-blur-xs">
            <Building className="w-4 h-4 mx-auto text-blue-200 mb-1" />
            <div className="text-[11px] text-blue-200 uppercase font-semibold">Building</div>
            <div className="text-sm sm:text-base font-bold mt-0.5">{currentDest.building}</div>
          </div>

          <div className="bg-white/10 rounded-2xl py-3.5 px-2 backdrop-blur-xs">
            <Layers className="w-4 h-4 mx-auto text-blue-200 mb-1" />
            <div className="text-[11px] text-blue-200 uppercase font-semibold">Floor</div>
            <div className="text-sm sm:text-base font-bold mt-0.5">{currentDest.floor}</div>
          </div>

          <div className="bg-white/10 rounded-2xl py-3.5 px-2 backdrop-blur-xs">
            <DoorOpen className="w-4 h-4 mx-auto text-blue-200 mb-1" />
            <div className="text-[11px] text-blue-200 uppercase font-semibold">Room</div>
            <div className="text-sm sm:text-base font-bold mt-0.5">{currentDest.room}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-blue-100 bg-white/10 px-4 py-3 rounded-2xl">
          <Footprints className="w-4 h-4 flex-shrink-0 animate-pulse" />
          <span>{currentDest.directions}</span>
        </div>
      </div>

      {/* All Destinations Card */}
      <div className="bg-white rounded-3xl border border-slate-205 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4">
          All Route Destinations
        </h3>

        <div className="space-y-3">
          {directions.map((dest, idx) => {
            const isSelected = activeDestIndex === idx;
            return (
              <div
                key={dest.step}
                onClick={() => setActiveDestIndex(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                  isSelected 
                    ? 'border-blue-500 bg-blue-50/20 shadow-xs' 
                    : 'border-slate-150 hover:border-blue-150'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${
                    isSelected ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {dest.step}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700">
                      {dest.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 mt-0.5">{dest.building} · {dest.floor} · {dest.room}</p>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default NavigationView;
