import React, { useState } from 'react';
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
  Footprints
} from 'lucide-react';
import { Appointment, AppTab } from '../types';

interface NavigationViewProps {
  appointment: Appointment;
  setTab: (tab: AppTab) => void;
}

export const NavigationView: React.FC<NavigationViewProps> = ({ appointment, setTab }) => {
  const [activeDestIndex, setActiveDestIndex] = useState(0);

  const destinations = appointment.destinations || [
    { step: 1, name: appointment.department, location: `${appointment.block} · ${appointment.floor} · ${appointment.room}`, isCurrent: true },
    { step: 2, name: 'Radiology / Scan Suite', location: 'Block A · Floor 1 · 108', isCurrent: false },
    { step: 3, name: 'Main Pharmacy', location: 'Block B · Ground Floor · 001', isCurrent: false },
  ];

  const currentDest = destinations[activeDestIndex] || destinations[0];

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
          Indoor Hospital Navigation
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
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
            <div className="text-sm sm:text-base font-bold mt-0.5">{appointment.block}</div>
          </div>

          <div className="bg-white/10 rounded-2xl py-3.5 px-2 backdrop-blur-xs">
            <Layers className="w-4 h-4 mx-auto text-blue-200 mb-1" />
            <div className="text-[11px] text-blue-200 uppercase font-semibold">Floor</div>
            <div className="text-sm sm:text-base font-bold mt-0.5">{appointment.floor}</div>
          </div>

          <div className="bg-white/10 rounded-2xl py-3.5 px-2 backdrop-blur-xs">
            <DoorOpen className="w-4 h-4 mx-auto text-blue-200 mb-1" />
            <div className="text-[11px] text-blue-200 uppercase font-semibold">Room</div>
            <div className="text-sm sm:text-base font-bold mt-0.5">{appointment.room}</div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-blue-100 bg-white/10 px-4 py-3 rounded-2xl">
          <Footprints className="w-4 h-4 flex-shrink-0" />
          <span>Follow the Blue Wayfinding Floor Line from the Main Lobby Elevator Bay A.</span>
        </div>
      </div>

      {/* All Destinations Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-4">
          All Route Destinations
        </h3>

        <div className="space-y-3">
          {destinations.map((dest, idx) => {
            const isSelected = activeDestIndex === idx;
            return (
              <div
                key={idx}
                onClick={() => setActiveDestIndex(idx)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                      {dest.name}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {dest.location}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <span className="text-xs font-semibold px-2.5 py-1 bg-blue-600 text-white rounded-xl">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => setTab('queue')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Live Queue</span>
          </button>

          <button
            onClick={() => setTab('journey')}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Journey Timeline</span>
          </button>
        </div>
      </div>
    </div>
  );
};
