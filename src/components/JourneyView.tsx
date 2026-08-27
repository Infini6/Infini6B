import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { journeyApi, JourneyStep } from '../services/journeyApi';
import { appointmentApi } from '../services/appointmentApi';
import { wsClient } from '../websocket/socket';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Zap, 
  MapPin, 
  ChevronRight,
  ShieldAlert,
  AlertCircle
} from 'lucide-react';
import { Appointment } from '../types';

export const JourneyView: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [journeySteps, setJourneySteps] = useState<JourneyStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!appointmentId) return;
    try {
      setLoading(true);
      const appt = await appointmentApi.getAppointmentById(appointmentId);
      setAppointment(appt);

      const timeline = await journeyApi.getJourneyTimeline(appointmentId);
      setJourneySteps(timeline);
    } catch (err: any) {
      setError(err.message || 'Unable to fetch patient journey timeline.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Subscribe to live journey socket events
    const unsubJourney = wsClient.subscribe('journey_update', (_, data) => {
      if (data.appointmentId === appointmentId) {
        // Refetch timeline to get accurate status mappings
        journeyApi.getJourneyTimeline(appointmentId).then(timeline => {
          setJourneySteps(timeline);
        });
      }
    });

    return () => unsubJourney();
  }, [appointmentId]);

  // Handle manual clicks in mock mode to advance journey step for testing!
  const handleStepClick = async (stepId: number) => {
    if (!appointment) return;
    try {
      // Direct local storage override to let the user test advancing steps
      const appointments = JSON.parse(localStorage.getItem('caresync_appointments') || '[]');
      const idx = appointments.findIndex((a: any) => a.id === appointment.id);
      if (idx !== -1) {
        appointments[idx].journeyStep = stepId;
        localStorage.setItem('caresync_appointments', JSON.stringify(appointments));
        
        // Trigger socket trigger locally
        wsClient.trigger('journey_update', {
          appointmentId: appointment.id,
          journeyStep: stepId
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm mt-3 font-semibold">Loading journey timeline...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-650 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Timeline Unavailable</h2>
        <p className="text-slate-505 text-sm">{error || 'Unable to connect to the patient journey tracker.'}</p>
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

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Patient Journey Timeline
        </h1>
        <p className="text-slate-505 text-xs sm:text-sm mt-0.5">
          {appointment.service} · {appointment.hospitalName}
        </p>
      </div>

      {/* Timeline Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        <div className="text-xs text-slate-400 font-semibold pb-4">
          Simulation TIP: Click any step bubble below to manually progress your journey stages for testing.
        </div>

        <div className="space-y-0">
          {journeySteps.map((step, idx) => {
            const isCompleted = step.status === 'completed';
            const isCurrent = step.status === 'current';
            const isUpcoming = step.status === 'upcoming';

            return (
              <div 
                key={step.id} 
                className="relative flex items-start gap-4 pb-7 last:pb-0 group cursor-pointer"
                onClick={() => handleStepClick(step.id)}
              >
                {/* Connecting vertical line */}
                {idx < journeySteps.length - 1 && (
                  <div 
                    className={`absolute left-[15px] top-9 w-0.5 bottom-0 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-205'
                    }`} 
                  />
                )}

                {/* Step Circle Indicator */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 transition-all ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                    : 'bg-slate-100 text-slate-450 border border-slate-200'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-sm sm:text-base ${
                      isCurrent ? 'text-blue-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-450'
                    }`}>
                      {step.name}
                    </h3>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      isCompleted
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : isCurrent
                        ? 'bg-blue-50 text-blue-700 border border-blue-200 animate-pulse'
                        : 'bg-slate-50 text-slate-450 border border-slate-200'
                    }`}>
                      {step.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default JourneyView;
