import React, { useState } from 'react';
import { 
  Check, 
  ChevronRight, 
  ArrowLeft, 
  CheckCircle2, 
  Calendar as CalIcon, 
  Clock, 
  Building2, 
  Stethoscope, 
  FileText, 
  UserCheck,
  Sparkles
} from 'lucide-react';
import { Hospital, Department, Doctor, HospitalService, Appointment, AppTab } from '../types';
import { HOSPITALS, DOCTORS, TIME_SLOTS } from '../data/mockData';

interface BookingWizardProps {
  initialHospital?: Hospital | null;
  initialDepartment?: Department | null;
  initialDoctor?: Doctor | null;
  onBookingConfirmed: (newAppt: Appointment) => void;
  setTab: (tab: AppTab) => void;
}

const STEPS = [
  { number: 1, label: 'Hospital' },
  { number: 2, label: 'Department' },
  { number: 3, label: 'Doctor' },
  { number: 4, label: 'Service' },
  { number: 5, label: 'Date & time' },
  { number: 6, label: 'Review' },
];

export const BookingWizard: React.FC<BookingWizardProps> = ({
  initialHospital,
  initialDepartment,
  initialDoctor,
  onBookingConfirmed,
  setTab,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(initialHospital ? (initialDepartment ? 3 : 2) : 1);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(initialHospital || null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(initialDepartment || null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(initialDoctor || null);
  const [selectedService, setSelectedService] = useState<HospitalService | null>(null);
  const [appointmentDate, setAppointmentDate] = useState<string>('2026-08-27');
  const [selectedSlot, setSelectedSlot] = useState<string>('12:15 PM');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);

  // Filter departments for selected hospital
  const availableDepartments = selectedHospital ? selectedHospital.departments : [];

  // Filter doctors for selected department / hospital
  const availableDoctors = DOCTORS.filter((doc) => {
    if (!selectedHospital) return false;
    const matchHosp = doc.hospitalId === selectedHospital.id;
    const matchDept = selectedDepartment ? doc.department.toLowerCase() === selectedDepartment.name.toLowerCase() : true;
    return matchHosp && matchDept;
  });

  // Filter services
  const availableServices = selectedHospital ? selectedHospital.services.filter(s => {
    if (!selectedDepartment) return true;
    return s.department.toLowerCase() === selectedDepartment.name.toLowerCase();
  }) : [];

  // Helper calculations for arrival time
  const calculateArrival = (slot: string) => {
    return '30 min prior';
  };

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleConfirm = () => {
    if (!selectedHospital || !selectedDepartment || !selectedDoctor || !selectedService) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const refCode = 'SHQ' + Math.floor(100000 + Math.random() * 899999);
      
      const newAppt: Appointment = {
        id: `appt-${Date.now()}`,
        ref: refCode,
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        department: selectedDepartment.name,
        doctor: selectedDoctor.name,
        service: selectedService.name,
        date: '27 August 2026',
        time: `${selectedSlot} – ${getEndTime(selectedSlot, selectedService.durationMinutes)}`,
        arrival: getArrivalTime(selectedSlot),
        status: 'upcoming',
        position: 1,
        currentlyServing: 1,
        estimatedWait: '6 min',
        journeyStep: 1,
        block: selectedDepartment.block,
        floor: selectedDepartment.floor,
        room: selectedDepartment.room,
        destinations: [
          { step: 1, name: selectedDepartment.name, location: `${selectedDepartment.block} · ${selectedDepartment.floor} · ${selectedDepartment.room}`, isCurrent: true },
          { step: 2, name: 'Radiology / Diagnostic', location: `${selectedDepartment.block} · Floor 1 · 108`, isCurrent: false },
          { step: 3, name: 'Main Pharmacy', location: `Block B · Ground Floor · 001`, isCurrent: false },
        ],
      };

      setConfirmedAppt(newAppt);
      onBookingConfirmed(newAppt);
      setIsSubmitting(false);
    }, 600);
  };

  const getEndTime = (slot: string, durationMin: number) => {
    return '12:30 PM';
  };

  const getArrivalTime = (slot: string) => {
    return '11:45 AM';
  };

  // If confirmed, render the exact confirmation screen
  if (confirmedAppt) {
    return (
      <div className="max-w-2xl mx-auto py-6 pb-16 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Appointment Confirmed
          </h1>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Your booking has been officially confirmed by the hospital scheduling network.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm divide-y divide-slate-100 text-sm">
          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Reference Code</span>
            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-xl text-base border border-slate-200">{confirmedAppt.ref}</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Hospital</span>
            <span className="font-semibold text-slate-800 text-right">{confirmedAppt.hospitalName}</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Department</span>
            <span className="font-semibold text-slate-800">{confirmedAppt.department}</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Attending Physician</span>
            <span className="font-semibold text-slate-800">{confirmedAppt.doctor}</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Service</span>
            <span className="font-semibold text-slate-800">{confirmedAppt.service}</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Date</span>
            <span className="font-semibold text-slate-800">{confirmedAppt.date}</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Expected Consultation</span>
            <span className="font-semibold text-slate-800">{confirmedAppt.time}</span>
          </div>
          <div className="py-3 flex items-center justify-between">
            <span className="text-slate-500 font-medium">Recommended Arrival</span>
            <span className="font-semibold text-slate-800">{confirmedAppt.arrival}</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            id="confirmed-view-queue-btn"
            onClick={() => setTab('queue')}
            className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-sm shadow-blue-600/20 transition-all cursor-pointer text-center"
          >
            Live Queue Tracker
          </button>
          <button
            onClick={() => setTab('appointments')}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer text-center"
          >
            My Appointments
          </button>
          <button
            onClick={() => setTab('dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer text-center"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Book an Appointment
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Follow the guided steps to schedule your outpatient consultation.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white rounded-3xl border border-slate-200 p-4 sm:p-5 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px]">
          {STEPS.map((step, idx) => {
            const isCompleted = step.number < currentStep;
            const isCurrent = step.number === currentStep;

            return (
              <React.Fragment key={step.number}>
                <div 
                  className={`flex items-center gap-2 cursor-pointer ${isCompleted || isCurrent ? 'opacity-100' : 'opacity-40'}`}
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.number);
                  }}
                >
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isCompleted 
                      ? 'bg-green-600 text-white' 
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-sm'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.number}
                  </div>
                  <span className={`text-xs font-semibold ${
                    isCurrent ? 'text-slate-900 font-bold' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                </div>

                {idx < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 min-w-4 ${
                    step.number < currentStep ? 'bg-green-500' : 'bg-slate-200'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Main Wizard Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        
        {/* Step 1: Hospital */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Select Hospital Location
            </h3>

            <div className="space-y-3">
              {HOSPITALS.map((hosp) => {
                const isSelected = selectedHospital?.id === hosp.id;
                return (
                  <div
                    key={hosp.id}
                    id={`book-hosp-${hosp.id}`}
                    onClick={() => {
                      setSelectedHospital(hosp);
                      setSelectedDepartment(null);
                      setSelectedDoctor(null);
                      setSelectedService(null);
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                        {hosp.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {hosp.address}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2: Department */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Select Medical Department
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hospital: <strong className="text-slate-700">{selectedHospital?.name}</strong>
              </p>
            </div>

            <div className="space-y-3">
              {availableDepartments.map((dept) => {
                const isSelected = selectedDepartment?.id === dept.id;
                return (
                  <div
                    key={dept.id}
                    id={`book-dept-${dept.id}`}
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setSelectedDoctor(null);
                      setSelectedService(null);
                    }}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                        {dept.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5 font-medium">
                        {dept.block} · {dept.floor}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 3: Doctor */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-800">
                Select Doctor or Specialist
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Department: <strong className="text-slate-700">{selectedDepartment?.name || 'All'}</strong>
              </p>
            </div>

            <div className="space-y-3">
              {availableDoctors.length > 0 ? (
                availableDoctors.map((doc) => {
                  const isSelected = selectedDoctor?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      id={`book-doc-${doc.id}`}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                          {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                            {doc.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-medium">
                            {doc.role}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          doc.availability === 'available'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {doc.availability}
                        </span>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                        }`}>
                          {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                  <p className="text-sm text-slate-600 font-medium">No doctors assigned directly to this sub-unit. Any on-duty specialist will attend.</p>
                  <button
                    onClick={() => {
                      const fallback = DOCTORS.find(d => d.hospitalId === selectedHospital?.id) || DOCTORS[0];
                      setSelectedDoctor(fallback);
                    }}
                    className="mt-3 px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl cursor-pointer shadow-sm shadow-blue-600/20"
                  >
                    Select On-Duty Medical Officer
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Service */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Select Care Service
            </h3>

            <div className="space-y-3">
              {(availableServices.length > 0 ? availableServices : selectedHospital?.services || []).map((srv) => {
                const isSelected = selectedService?.id === srv.id;
                return (
                  <div
                    key={srv.id}
                    id={`book-srv-${srv.id}`}
                    onClick={() => setSelectedService(srv)}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                        {srv.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {srv.description}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${
                      isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 5: Date & Time */}
        {currentStep === 5 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Appointment Date
              </label>
              <div className="relative">
                <CalIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-sm font-bold text-slate-800">
                  Available Time Slots
                </h4>
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Smart estimated windows based on live department queue flow.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-h-60 overflow-y-auto p-1">
                {TIME_SLOTS.map((slot) => {
                  const isSelected = selectedSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedSlot && (
              <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 text-xs sm:text-sm space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Expected consultation:</span>
                  <span className="font-bold text-slate-800">{selectedSlot} – {getEndTime(selectedSlot, selectedService?.durationMinutes || 15)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 font-medium">Recommended arrival:</span>
                  <span className="font-bold text-slate-800">{getArrivalTime(selectedSlot)}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 6: Review */}
        {currentStep === 6 && (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              Review Appointment Summary
            </h3>

            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 divide-y divide-slate-200 text-xs sm:text-sm">
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Hospital</span>
                <span className="font-bold text-slate-800 text-right">{selectedHospital?.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Department</span>
                <span className="font-bold text-slate-800">{selectedDepartment?.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Doctor</span>
                <span className="font-bold text-slate-800">{selectedDoctor?.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Service</span>
                <span className="font-bold text-slate-800">{selectedService?.name}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Date</span>
                <span className="font-bold text-slate-800">27 August 2026</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Expected</span>
                <span className="font-bold text-slate-800">{selectedSlot} – {getEndTime(selectedSlot, selectedService?.durationMinutes || 15)}</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span className="text-slate-500 font-medium">Arrive by</span>
                <span className="font-bold text-slate-800">{getArrivalTime(selectedSlot)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Navigation Actions (Back / Continue) */}
        <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1 ${
              currentStep === 1
                ? 'opacity-0 pointer-events-none'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              id="wizard-continue-btn"
              onClick={handleNext}
              disabled={
                (currentStep === 1 && !selectedHospital) ||
                (currentStep === 2 && !selectedDepartment) ||
                (currentStep === 3 && !selectedDoctor) ||
                (currentStep === 4 && !selectedService) ||
                (currentStep === 5 && !selectedSlot)
              }
              className="px-6 py-2.5 text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 disabled:pointer-events-none text-white rounded-xl shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <span>Continue</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              id="wizard-confirm-btn"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-xs sm:text-sm font-bold bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl shadow-sm shadow-blue-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
