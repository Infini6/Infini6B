import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Zap, 
  MapPin, 
  ChevronRight,
  ShieldAlert
} from 'lucide-react';
import { Appointment, AppTab } from '../types';
import { JOURNEY_STEP_DEFINITIONS } from '../data/mockData';

interface JourneyViewProps {
  appointment: Appointment;
  setTab: (tab: AppTab) => void;
  onAdvanceStep?: (appointmentId: string, step: number) => void;
}

export const JourneyView: React.FC<JourneyViewProps> = ({
  appointment,
  setTab,
  onAdvanceStep,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(appointment.journeyStep);

  const handleStepClick = (stepId: number) => {
    setCurrentStep(stepId);
    if (onAdvanceStep) {
      onAdvanceStep(appointment.id, stepId);
    }
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

      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Patient Journey Timeline
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          {appointment.service} · {appointment.hospitalName}
        </p>
      </div>

      {/* Timeline Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="space-y-0">
          {JOURNEY_STEP_DEFINITIONS.map((step, idx) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;
            const isUpcoming = step.id > currentStep;

            return (
              <div 
                key={step.id} 
                className="relative flex items-start gap-4 pb-7 last:pb-0 group cursor-pointer"
                onClick={() => handleStepClick(step.id)}
              >
                {/* Connecting vertical line */}
                {idx < JOURNEY_STEP_DEFINITIONS.length - 1 && (
                  <div 
                    className={`absolute left-[15px] top-9 w-0.5 bottom-0 transition-colors ${
                      isCompleted ? 'bg-green-500' : 'bg-slate-200'
                    }`} 
                  />
                )}

                {/* Step Circle Indicator */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 z-10 transition-all ${
                  isCompleted
                    ? 'bg-green-600 text-white'
                    : isCurrent
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                    : 'bg-slate-100 text-slate-400 border border-slate-200'
                }`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                </div>

                {/* Step Info */}
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-bold text-sm sm:text-base ${
                      isCurrent ? 'text-blue-900 font-bold' : isCompleted ? 'text-slate-800' : 'text-slate-500'
                    }`}>
                      {step.name}
                    </h3>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      isCompleted
                        ? 'bg-green-100 text-green-700'
                        : isCurrent
                        ? 'bg-blue-50 text-blue-700 font-bold animate-pulse'
                        : 'bg-slate-100 text-slate-400'
                    }`}>
                      {isCompleted ? 'Completed' : isCurrent ? 'In progress' : 'Upcoming'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    {step.description}
                  </p>

                  {isCurrent && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-2xl border border-blue-100 flex items-center justify-between text-xs text-blue-900">
                      <span className="font-medium">Currently at this checkpoint</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (currentStep < 7) handleStepClick(currentStep + 1);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs cursor-pointer shadow-sm shadow-blue-600/20"
                      >
                        Advance checkpoint →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={() => setTab('queue')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer"
          >
            Live Queue Tracker
          </button>
          
          <button
            onClick={() => setTab('navigation')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>Navigate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
