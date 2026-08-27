import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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
  Sparkles,
  CreditCard,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  MapPin
} from 'lucide-react';
import { Hospital, Department, Doctor, HospitalService, Appointment } from '../types';
import { hospitalApi } from '../services/hospitalApi';
import { doctorApi } from '../services/doctorApi';
import { appointmentApi } from '../services/appointmentApi';

export const BookingWizard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Load router state parameters for pre-selected entities
  const stateData = location.state as {
    preSelectedHospital?: Hospital;
    preSelectedDepartment?: Department;
    preSelectedDoctor?: Doctor;
  } | null;

  // Master lists
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  // Steps state
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedService, setSelectedService] = useState<HospitalService | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-27');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Payment simulation state
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success' | 'failed'>('pending');
  const [paymentAttempts, setPaymentAttempts] = useState(0);

  // Final booked appointment
  const [confirmedAppt, setConfirmedAppt] = useState<Appointment | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Load directories
  useEffect(() => {
    const fetchDirectories = async () => {
      try {
        setLoading(true);
        const hosps = await hospitalApi.getHospitals();
        setHospitals(hosps);

        const docs = await doctorApi.getDoctors();
        setDoctors(docs);

        // Wire pre-selections
        if (stateData?.preSelectedHospital) {
          const matchH = hosps.find(h => h.id === stateData.preSelectedHospital?.id);
          if (matchH) {
            setSelectedHospital(matchH);
            setCurrentStep(2); // Jump to department selection
          }
        }
        if (stateData?.preSelectedDepartment) {
          setSelectedDepartment(stateData.preSelectedDepartment);
          setCurrentStep(3); // Jump to doctor selection
        }
        if (stateData?.preSelectedDoctor) {
          const matchD = docs.find(d => d.id === stateData.preSelectedDoctor?.id);
          if (matchD) {
            setSelectedDoctor(matchD);
            setCurrentStep(4); // Jump to service selection
          }
        }
      } catch (e) {
        console.error('Failed to load directories in wizard:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchDirectories();
  }, [stateData]);

  // Load slots when Doctor + Date changes
  useEffect(() => {
    if (!selectedHospital || !selectedDepartment || !selectedDoctor || !selectedDate) return;
    const loadSlots = async () => {
      setSlotsLoading(true);
      try {
        const slots = await appointmentApi.getAvailableSlots(
          selectedHospital.id,
          selectedDepartment.name,
          selectedDoctor.id,
          selectedDate
        );
        setAvailableSlots(slots);
        if (slots.length > 0) {
          setSelectedSlot(slots[0]);
        } else {
          setSelectedSlot('');
        }
      } catch (e) {
        console.error(e);
      } finally {
        setSlotsLoading(false);
      }
    };
    loadSlots();
  }, [selectedDoctor, selectedDate]);

  // Calculations for arrival time and end times
  const getEndTime = (slot: string, durationMin: number) => {
    if (!slot) return '';
    const [timeStr, ampm] = slot.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes + durationMin;
    let newHours = Math.floor(totalMinutes / 60);
    let newMinutes = totalMinutes % 60;
    
    // Format AM/PM transitions
    let finalAmpm = ampm;
    if (newHours >= 12) {
      if (newHours > 12) newHours -= 12;
      if (ampm === 'AM') finalAmpm = 'PM';
    }
    const formattedMinutes = newMinutes < 10 ? `0${newMinutes}` : newMinutes;
    return `${newHours}:${formattedMinutes} ${finalAmpm}`;
  };

  const getArrivalTime = (slot: string) => {
    if (!slot) return '';
    const [timeStr, ampm] = slot.split(' ');
    const [hours, minutes] = timeStr.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes - 30; // 30 minutes prior
    if (totalMinutes < 0) totalMinutes += 12 * 60;
    let newHours = Math.floor(totalMinutes / 60);
    let newMinutes = totalMinutes % 60;
    
    let finalAmpm = ampm;
    if (hours === 12 && newHours === 11 && ampm === 'PM') finalAmpm = 'AM';
    const formattedMinutes = newMinutes < 10 ? `0${newMinutes}` : newMinutes;
    return `${newHours}:${formattedMinutes} ${finalAmpm}`;
  };

  const handleNext = () => {
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleBook = async (payOverride = false) => {
    if (!selectedHospital || !selectedDepartment || !selectedDoctor || !selectedService) return;
    
    setBookingLoading(true);
    try {
      const formattedEndTime = getEndTime(selectedSlot, selectedService.durationMinutes);
      const appt = await appointmentApi.bookAppointment({
        hospitalId: selectedHospital.id,
        hospitalName: selectedHospital.name,
        department: selectedDepartment.name,
        doctor: selectedDoctor.name,
        service: selectedService.name,
        date: selectedDate,
        time: `${selectedSlot} – ${formattedEndTime}`,
        arrival: getArrivalTime(selectedSlot),
        price: selectedService.price,
        requiresPayment: true,
      });

      setConfirmedAppt(appt);
      // Mark payment status based on transaction
      if (payOverride) {
        localStorage.setItem(`payment_${appt.id}`, 'paid');
      } else {
        localStorage.setItem(`payment_${appt.id}`, 'failed');
      }
      
      setCurrentStep(11);
    } catch (e) {
      console.error(e);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm mt-3 font-semibold">Loading booking wizard...</p>
      </div>
    );
  }

  // Filter lists based on selections
  const availableDepartments = selectedHospital ? selectedHospital.departments : [];
  const availableDoctors = doctors.filter((doc) => {
    if (!selectedHospital) return false;
    const matchHosp = doc.hospitalId === selectedHospital.id;
    const matchDept = selectedDepartment ? doc.department.toLowerCase() === selectedDepartment.name.toLowerCase() : true;
    return matchHosp && matchDept;
  });
  const availableServices = selectedHospital ? selectedHospital.services.filter(s => {
    if (!selectedDepartment) return true;
    return s.department.toLowerCase() === selectedDepartment.name.toLowerCase();
  }) : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Wizard Progress Steps Indicator */}
      {currentStep <= 10 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Step {currentStep} of 10</span>
            <span className="text-blue-600">
              {currentStep === 1 && 'Select Hospital'}
              {currentStep === 2 && 'Select Department'}
              {currentStep === 3 && 'Choose Doctor'}
              {currentStep === 4 && 'Choose Service'}
              {currentStep === 5 && 'Select Date'}
              {currentStep === 6 && 'Choose Slot'}
              {currentStep === 7 && 'Consultation window'}
              {currentStep === 8 && 'Check-in rules'}
              {currentStep === 9 && 'Review details'}
              {currentStep === 10 && 'Payment summary'}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
            {Array.from({ length: 10 }).map((_, idx) => (
              <div 
                key={idx}
                className={`flex-1 h-full border-r border-white last:border-0 transition-colors ${
                  idx + 1 <= currentStep ? 'bg-blue-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Back button */}
      {currentStep > 1 && currentStep <= 10 && (
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to previous step</span>
        </button>
      )}

      {/* STEP 1: Select Hospital */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Select Hospital</h2>
            <p className="text-slate-500 text-sm mt-0.5">Please choose a facility to book your medical visit.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {hospitals.map((hosp) => (
              <div
                key={hosp.id}
                onClick={() => {
                  setSelectedHospital(hosp);
                  setSelectedDepartment(null);
                  setSelectedDoctor(null);
                  setSelectedService(null);
                  handleNext();
                }}
                className={`p-5 rounded-2xl border transition-all cursor-pointer text-left flex items-start gap-4 ${
                  selectedHospital?.id === hosp.id
                    ? 'border-blue-600 bg-blue-50/20'
                    : 'border-slate-200 hover:border-blue-150 hover:bg-slate-50/30'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  selectedHospital?.id === hosp.id ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-600'
                }`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">{hosp.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{hosp.address}</p>
                  <div className="mt-3.5 flex items-center gap-3">
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {hosp.departments.length} Departments
                    </span>
                    <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
                      {hosp.status === 'open' ? '✓ Available Today' : hosp.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 2: Select Department */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Select Department</h2>
            <p className="text-slate-500 text-sm mt-0.5">Facilities listed at {selectedHospital?.name}.</p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {availableDepartments.map((dept) => (
              <div
                key={dept.id}
                onClick={() => {
                  setSelectedDepartment(dept);
                  setSelectedDoctor(null);
                  setSelectedService(null);
                  handleNext();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedDepartment?.id === dept.id
                    ? 'border-blue-600 bg-blue-50/20'
                    : 'border-slate-150 hover:border-blue-150'
                }`}
              >
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">{dept.name}</h3>
                  <p className="text-xs text-slate-550 mt-0.5">{dept.block} · {dept.floor} · Room {dept.room}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 3: Choose Doctor */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Choose Attending Physician</h2>
            <p className="text-slate-500 text-sm mt-0.5">Specialists on duty in {selectedDepartment?.name} department.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {availableDoctors.map((doc) => (
              <div
                key={doc.id}
                onClick={() => {
                  setSelectedDoctor(doc);
                  setSelectedService(null);
                  handleNext();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                  selectedDoctor?.id === doc.id
                    ? 'border-blue-600 bg-blue-50/20'
                    : 'border-slate-200 hover:border-blue-150 hover:bg-slate-50/30'
                }`}
              >
                <div className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-lg ${
                  selectedDoctor?.id === doc.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {doc.name.replace('Dr. ', '').charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">{doc.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{doc.role}</p>
                  <p className="text-xs text-slate-400 mt-1">Consultation Room {doc.room}</p>
                  <span className={`inline-block mt-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    doc.availability === 'available' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {doc.availability === 'available' ? '✓ Available' : doc.availability}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 4: Choose Service */}
      {currentStep === 4 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Choose Service</h2>
            <p className="text-slate-500 text-sm mt-0.5">Please select the type of healthcare visit required.</p>
          </div>

          <div className="grid grid-cols-1 gap-3.5">
            {availableServices.map((service) => (
              <div
                key={service.id}
                onClick={() => {
                  setSelectedService(service);
                  handleNext();
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedService?.id === service.id
                    ? 'border-blue-600 bg-blue-50/20'
                    : 'border-slate-150 hover:border-blue-150'
                }`}
              >
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base">{service.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{service.description}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-800 text-sm sm:text-base">{service.price}</p>
                  <span className="text-[10px] text-slate-400 font-semibold">{service.durationMinutes} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* STEP 5: Select Date */}
      {currentStep === 5 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Select Visit Date</h2>
            <p className="text-slate-500 text-sm mt-0.5">Choose an appointment day for your check-up.</p>
          </div>

          <div className="space-y-4">
            <input
              type="date"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />

            <div className="pt-2">
              <button
                onClick={handleNext}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
              >
                Continue to Slots
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 6: Select Slot */}
      {currentStep === 6 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Select Available Slot</h2>
            <p className="text-slate-500 text-sm mt-0.5">Consultation slots returned by the hospital scheduler network.</p>
          </div>

          <div>
            {slotsLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                {availableSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => {
                      setSelectedSlot(slot);
                      handleNext();
                    }}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                      selectedSlot === slot
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
                {availableSlots.length === 0 && (
                  <div className="col-span-4 text-center text-slate-400 text-xs py-4">No available scheduling slots on this date.</div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 7: Smart Consultation Window */}
      {currentStep === 7 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <Clock className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Expected Consultation Estimate</h2>
            <p className="text-slate-550 text-xs sm:text-sm max-w-md mx-auto">
              We present estimated consultation windows based on live department queue speeds.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-4">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Estimated Consultation Window</p>
              <h3 className="text-2xl font-extrabold text-slate-800 mt-1">
                {selectedSlot} – {selectedService ? getEndTime(selectedSlot, selectedService.durationMinutes) : ''}
              </h3>
            </div>
            
            <div className="border-t border-slate-200/60 pt-3 flex items-center justify-center gap-1.5 text-xs text-green-600 font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-ping inline-block" />
              <span>Queue Status: On Schedule</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              Understand & Continue
            </button>
          </div>
        </div>
      )}

      {/* STEP 8: Recommended Arrival */}
      {currentStep === 8 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto">
              <UserCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Recommended Arrival Time</h2>
            <p className="text-slate-500 text-xs sm:text-sm max-w-md mx-auto">
              Please check-in early to ensure smooth registration and queue placement.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-center space-y-2">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Recommended Check-in Arrival</p>
            <h3 className="text-3xl font-extrabold text-slate-800">
              {getArrivalTime(selectedSlot)}
            </h3>
            <p className="text-xs text-slate-450 mt-1.5">30 minutes prior to slot</p>
          </div>

          <div className="pt-2">
            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              Verify Arrival Time
            </button>
          </div>
        </div>
      )}

      {/* STEP 9: Confirmation / Fee Summary */}
      {currentStep === 9 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">Review Booking Details</h2>
            <p className="text-slate-500 text-sm mt-0.5">Please review your selections before confirming scheduling.</p>
          </div>

          <div className="divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="py-3 flex justify-between">
              <span className="text-slate-550 font-medium">Hospital</span>
              <span className="font-bold text-slate-800">{selectedHospital?.name}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-555 font-medium">Department</span>
              <span className="font-bold text-slate-850">{selectedDepartment?.name}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-555 font-medium">Attending Doctor</span>
              <span className="font-bold text-slate-850">{selectedDoctor?.name}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-555 font-medium">Service</span>
              <span className="font-bold text-slate-850">{selectedService?.name}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-555 font-medium">Date</span>
              <span className="font-bold text-slate-850">{selectedDate}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-555 font-medium">Consultation Slot</span>
              <span className="font-bold text-slate-850">{selectedSlot}</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-555 font-medium">Service Price Fee</span>
              <span className="font-bold text-blue-650">{selectedService?.price}</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleNext}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              Confirm and Proceed to Fee Payment
            </button>
          </div>
        </div>
      )}

      {/* STEP 10: Conditional Payment Screen */}
      {currentStep === 10 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <CreditCard className="w-6 h-6 text-blue-650" />
              <span>Service Fee Payment</span>
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">Please process the required consultation fee to complete your booking.</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-550 font-medium">{selectedService?.name} Consultation Fee</span>
              <span className="font-bold text-slate-800">{selectedService?.price}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-250 pt-2 font-bold text-slate-850">
              <span>Total Payable Amount</span>
              <span className="text-blue-700">{selectedService?.price}</span>
            </div>
          </div>

          {paymentStatus === 'failed' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex gap-3 text-xs sm:text-sm text-red-800 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Transaction Declined</span>
                <p className="text-red-700 mt-0.5">Payment failed. Please retry or contact card issuer.</p>
              </div>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {/* Simulation of payment options to allow the user to test both success and failure retries */}
            <div className="text-xs text-slate-400 font-semibold pb-1">Simulation Control options:</div>
            
            <button
              onClick={() => {
                setPaymentStatus('success');
                handleBook(true);
              }}
              disabled={bookingLoading}
              className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              Simulate Successful Payment
            </button>

            <button
              onClick={() => {
                setPaymentStatus('failed');
                setPaymentAttempts(prev => prev + 1);
              }}
              disabled={bookingLoading}
              className="w-full py-3 bg-red-50 text-red-750 border border-red-200 hover:bg-red-100 font-semibold text-sm rounded-2xl transition-colors cursor-pointer"
            >
              Simulate Declined Transaction (To Test Retry)
            </button>
          </div>
        </div>
      )}

      {/* STEP 11: Final Booking Confirmation */}
      {currentStep === 11 && confirmedAppt && (
        <div className="space-y-6">
          <div className="text-center space-y-2 py-4">
            <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto shadow-sm animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              Appointment Confirmed
            </h1>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Your scheduling is registered in the hospital network. Complete pre-registration below to skip arrival lines!
            </p>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm divide-y divide-slate-100 text-xs sm:text-sm">
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Reference Code</span>
              <span className="font-mono font-bold text-slate-850 bg-slate-100 px-2.5 py-1 rounded-xl text-base border border-slate-250">{confirmedAppt.ref}</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Hospital</span>
              <span className="font-semibold text-slate-800 text-right">{confirmedAppt.hospitalName}</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Attending Physician</span>
              <span className="font-semibold text-slate-800">{confirmedAppt.doctor}</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Service Fee Payment</span>
              <span className="font-bold text-green-600">Paid (Success)</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Consultation Estimated Time</span>
              <span className="font-semibold text-slate-800">{confirmedAppt.time}</span>
            </div>
            <div className="py-3 flex items-center justify-between">
              <span className="text-slate-500 font-medium">Arrival</span>
              <span className="font-semibold text-slate-800">{confirmedAppt.arrival}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-3xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-slate-800 text-sm">Pre-Registration Check-in</h4>
              <p className="text-slate-500 text-xs mt-0.5">Submit patient registration details online to bypass reception queues.</p>
            </div>
            <button
              onClick={() => navigate(`/appointments/${confirmedAppt.id}`)}
              className="px-4.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Start Online Check-in
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/queue/${confirmedAppt.id}`)}
              className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-sm transition-all cursor-pointer text-center"
            >
              Live Queue Tracker
            </button>
            <button
              onClick={() => navigate('/appointments')}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer text-center"
            >
              My Appointments
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default BookingWizard;
