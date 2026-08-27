import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { appointmentApi } from '../services/appointmentApi';
import { doctorApi } from '../services/doctorApi';
import { Appointment, Doctor } from '../types';
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  MapPin, 
  AlertCircle, 
  UserCheck, 
  Compass, 
  Zap, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  DollarSign, 
  User, 
  Info,
  ShieldCheck,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

export const AppointmentDetailView: React.FC = () => {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Custom states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Reschedule UI states
  const [showReschedule, setShowReschedule] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState('2026-08-27');
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState('');
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [rescheduleSuccess, setRescheduleSuccess] = useState(false);

  // Registration UI states
  const [showRegistration, setShowRegistration] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [regFormData, setRegFormData] = useState({
    fullName: '',
    dob: '',
    govId: '',
    emergencyName: '',
    emergencyPhone: '',
    consentSigned: false,
  });
  const [isRegistered, setIsRegistered] = useState(false);

  // Doctor Unavailable UI states
  const [doctorUnavailable, setDoctorUnavailable] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [alternativeDoctors, setAlternativeDoctors] = useState<Doctor[]>([]);
  const [reassignedDoc, setReassignedDoc] = useState<string | null>(null);

  // Load appointment details
  useEffect(() => {
    const fetchDetails = async () => {
      if (!appointmentId) return;
      try {
        setLoading(true);
        const data = await appointmentApi.getAppointmentById(appointmentId);
        setAppointment(data);
        
        // Load registration check status
        const regStatus = await appointmentApi.getOnlineRegistrationStatus(appointmentId);
        setIsRegistered(regStatus);
        
        // Mock doctor unavailable status (e.g. if doctor is "Dr. Arjun Nair")
        if (data.doctor.includes('Arjun')) {
          setDoctorUnavailable(true);
          const docs = await doctorApi.getDoctors();
          // Find alternatives in same hospital/department
          const alts = docs.filter(d => d.hospitalId === data.hospitalId && d.id !== 'dr_arjun');
          setAlternativeDoctors(alts);
        }

      } catch (err: any) {
        setError(err.message || 'Unable to load appointment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [appointmentId]);

  // Load slots when reschedule date is chosen
  useEffect(() => {
    if (!showReschedule || !appointment) return;
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const slots = await appointmentApi.getAvailableSlots(
          appointment.hospitalId,
          appointment.department,
          appointment.doctor, // mapping doc name/id
          rescheduleDate
        );
        setAvailableSlots(slots);
        if (slots.length > 0) {
          setSelectedSlot(slots[0]);
        }
      } catch (err) {
        console.error('Failed to fetch reschedule slots:', err);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [showReschedule, rescheduleDate, appointment]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm mt-3 font-semibold">Loading appointment details...</p>
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Error Loading Details</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">{error || "We couldn't find the appointment details you're looking for."}</p>
        <button
          onClick={() => navigate('/appointments')}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleCancel = async () => {
    setCancelError(null);
    try {
      const updated = await appointmentApi.cancelAppointment(appointment.id);
      setAppointment(updated);
      setShowCancelModal(false);
    } catch (err: any) {
      setCancelError(err.message || 'Cannot cancel this appointment.');
    }
  };

  const handleReschedule = async () => {
    try {
      const updated = await appointmentApi.rescheduleAppointment(
        appointment.id,
        rescheduleDate,
        selectedSlot,
        '30 min prior'
      );
      setAppointment(updated);
      setShowReschedule(false);
      setRescheduleSuccess(true);
      setTimeout(() => setRescheduleSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to reschedule:', err);
    }
  };

  const handleRegistrationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (regStep < 3) {
      setRegStep(prev => prev + 1);
      return;
    }
    try {
      await appointmentApi.completeOnlineRegistration(appointment.id, regFormData);
      setIsRegistered(true);
      setShowRegistration(false);
    } catch (err) {
      console.error('Failed online registration:', err);
    }
  };

  const handleReassignDoctor = (docName: string) => {
    setReassignedDoc(docName);
    setAppointment(prev => prev ? { ...prev, doctor: docName } : null);
    setDoctorUnavailable(false);
    setShowAlternatives(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/appointments')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>My appointments</span>
        </button>

        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          appointment.status === 'upcoming' 
            ? 'bg-blue-100 text-blue-700'
            : appointment.status === 'rescheduled'
            ? 'bg-purple-100 text-purple-700'
            : appointment.status === 'completed'
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {appointment.status}
        </span>
      </div>

      {rescheduleSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2.5 text-green-800 text-sm font-semibold">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>Appointment rescheduled successfully!</span>
        </div>
      )}

      {/* Doctor Unavailable Callout */}
      {doctorUnavailable && (
        <div className="p-5 bg-amber-50 border border-amber-200 rounded-3xl space-y-4">
          <div className="flex gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-slate-800 text-sm sm:text-base">Doctor Unavailable</h3>
              <p className="text-slate-650 text-xs sm:text-sm mt-1">
                {appointment.doctor} is unavailable for your scheduled consultation. Please choose one of the options below to update your visit.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2.5 pt-1">
            <button
              onClick={() => setShowAlternatives(true)}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              Alternative Doctor
            </button>
            <button
              onClick={() => {
                setShowReschedule(true);
              }}
              className="px-3.5 py-2 bg-white border border-amber-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-amber-100/50 transition-all cursor-pointer"
            >
              Different Date / Time
            </button>
            <button
              onClick={() => setShowCancelModal(true)}
              className="px-3.5 py-2 bg-red-50 text-red-650 text-xs font-bold rounded-xl hover:bg-red-100/50 transition-colors cursor-pointer"
            >
              Cancel Appointment
            </button>
          </div>

          {showAlternatives && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3 mt-3">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Available Doctors:</h4>
              <div className="divide-y divide-slate-100">
                {alternativeDoctors.map(doc => (
                  <div key={doc.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{doc.name}</p>
                      <p className="text-xs text-slate-500">{doc.role} · Room {doc.room}</p>
                    </div>
                    <button
                      onClick={() => handleReassignDoctor(doc.name)}
                      className="px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-xl hover:bg-blue-100 transition-colors cursor-pointer"
                    >
                      Assign
                    </button>
                  </div>
                ))}
                {alternativeDoctors.length === 0 && (
                  <p className="text-xs text-slate-400 py-2">No other specialists available at this department today.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Main Appointment Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono bg-slate-150 px-2 py-0.5 rounded-lg border border-slate-200">
            Ref: {appointment.ref}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 mt-2.5 tracking-tight leading-tight">
            {appointment.service}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{appointment.hospitalName}</p>
        </div>

        {/* Time and Arrival metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Expected Consultation (Estimate)</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{appointment.time}</p>
              <span className="text-[10px] text-slate-400 font-medium leading-none mt-1 inline-block">Estimated window; not a guarantee.</span>
            </div>
          </div>

          <div className="flex items-start gap-3 bg-slate-50 rounded-2xl p-4">
            <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs text-slate-500 font-medium">Appointment Date</p>
              <p className="font-bold text-slate-800 text-sm mt-0.5">{appointment.date}</p>
              <p className="text-[10px] text-blue-600 font-semibold mt-1">Arrival: {appointment.arrival}</p>
            </div>
          </div>
        </div>

        {/* Doctor and Location Details */}
        <div className="space-y-3.5 pt-2 text-xs sm:text-sm">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Attending Doctor</span>
            <span className="font-semibold text-slate-850 flex items-center gap-1.5">
              <User className="w-4 h-4 text-slate-400" />
              <span>{appointment.doctor}</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Department</span>
            <span className="font-semibold text-slate-850">{appointment.department}</span>
          </div>

          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Consultation Room</span>
            <span className="font-semibold text-slate-850 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{appointment.block} · {appointment.floor} · Room {appointment.room}</span>
            </span>
          </div>

          {/* Registration Check Status */}
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-slate-500 font-medium">Online Registration</span>
            <span className={`font-bold flex items-center gap-1 text-xs ${
              isRegistered ? 'text-green-600' : 'text-slate-400'
            }`}>
              {isRegistered ? (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>✓ Completed</span>
                </>
              ) : (
                <span>Not Completed</span>
              )}
            </span>
          </div>
        </div>

        {/* Quick Route Tracking Buttons */}
        {appointment.status === 'upcoming' && (
          <div className="grid grid-cols-3 gap-2.5 pt-4">
            <Link
              to={`/queue/${appointment.id}`}
              className="flex flex-col items-center justify-center p-3.5 bg-blue-50 hover:bg-blue-100/80 rounded-2xl text-center transition-colors cursor-pointer group"
            >
              <Zap className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] sm:text-xs font-bold text-blue-700 mt-1.5">Live Queue</span>
            </Link>

            <Link
              to={`/journey/${appointment.id}`}
              className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-center transition-colors cursor-pointer group"
            >
              <UserCheck className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 mt-1.5">Timeline</span>
            </Link>

            <Link
              to={`/navigation/${appointment.id}`}
              className="flex flex-col items-center justify-center p-3.5 bg-slate-50 hover:bg-slate-100 rounded-2xl text-center transition-colors cursor-pointer group"
            >
              <Compass className="w-5 h-5 text-slate-600 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] sm:text-xs font-bold text-slate-700 mt-1.5">Wayfinding</span>
            </Link>
          </div>
        )}
      </div>

      {/* Online Registration form block */}
      {!isRegistered && appointment.status === 'upcoming' && (
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-3xl p-6 shadow-sm">
          {!showRegistration ? (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Complete Pre-Registration</h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5">Submit details online now to skip reception queues at arrival.</p>
              </div>
              <button
                onClick={() => setShowRegistration(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs cursor-pointer transition-all"
              >
                Start Registration
              </button>
            </div>
          ) : (
            <form onSubmit={handleRegistrationSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-blue-200/60 pb-3">
                <h3 className="font-bold text-slate-800 text-sm">Online Registration (Step {regStep} of 3)</h3>
                <button
                  type="button"
                  onClick={() => setShowRegistration(false)}
                  className="text-xs text-slate-500 font-semibold hover:underline cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {regStep === 1 && (
                <div className="space-y-3.5">
                  <p className="text-xs text-slate-500 font-medium">Verify your registration details:</p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={regFormData.fullName}
                      onChange={e => setRegFormData({ ...regFormData, fullName: e.target.value })}
                      placeholder="Your legal name"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Date of Birth</label>
                    <input
                      type="date"
                      required
                      value={regFormData.dob}
                      onChange={e => setRegFormData({ ...regFormData, dob: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {regStep === 2 && (
                <div className="space-y-3.5">
                  <p className="text-xs text-slate-500 font-medium">Submit required information:</p>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">National/Government ID Number</label>
                    <input
                      type="text"
                      required
                      value={regFormData.govId}
                      onChange={e => setRegFormData({ ...regFormData, govId: e.target.value })}
                      placeholder="e.g. ID Card Number"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Emergency Contact Name</label>
                      <input
                        type="text"
                        required
                        value={regFormData.emergencyName}
                        onChange={e => setRegFormData({ ...regFormData, emergencyName: e.target.value })}
                        placeholder="Name"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Phone</label>
                      <input
                        type="tel"
                        required
                        value={regFormData.emergencyPhone}
                        onChange={e => setRegFormData({ ...regFormData, emergencyPhone: e.target.value })}
                        placeholder="Phone"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {regStep === 3 && (
                <div className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium">Finalize check-in consent:</p>
                  <label className="flex items-start gap-2.5 bg-white p-3 rounded-2xl border border-blue-200 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={regFormData.consentSigned}
                      onChange={e => setRegFormData({ ...regFormData, consentSigned: e.target.checked })}
                      className="mt-0.5 flex-shrink-0"
                    />
                    <span className="text-[11px] text-slate-650 leading-relaxed">
                      I hereby authorize MedFlow CareSync to securely transmit these registration details to the hospital database for check-in preparation.
                    </span>
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                {regStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setRegStep(prev => prev - 1)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer"
                  >
                    Back
                  </button>
                )}
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                >
                  {regStep === 3 ? 'Submit Registration' : 'Continue'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Reschedule appointment block */}
      {showReschedule && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 text-base sm:text-lg">Reschedule Appointment</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Select New Date</label>
              <input
                type="date"
                value={rescheduleDate}
                onChange={e => setRescheduleDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Available Slots</label>
              {slotsLoading ? (
                <div className="text-xs text-slate-400 py-2">Fetching open slots...</div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {availableSlots.map(slot => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        selectedSlot === slot
                          ? 'bg-blue-50 border-blue-600 text-blue-700'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                  {availableSlots.length === 0 && (
                    <div className="col-span-4 text-xs text-slate-400 py-2">No available consultation slots for this date.</div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              onClick={() => setShowReschedule(false)}
              className="px-4 py-2.5 bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleReschedule}
              disabled={slotsLoading || !selectedSlot}
              className="px-4 py-2.5 bg-blue-600 text-white font-semibold text-xs sm:text-sm rounded-xl hover:bg-blue-700 cursor-pointer disabled:opacity-50"
            >
              Confirm Reschedule
            </button>
          </div>
        </div>
      )}

      {/* Bottom Main Actions */}
      {!showReschedule && appointment.status === 'upcoming' && (
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
          <button
            onClick={() => setShowReschedule(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-150 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-slate-655" />
            <span>Reschedule Visit</span>
          </button>

          <button
            onClick={() => setShowCancelModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-red-50 hover:bg-red-100 text-red-650 text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer text-center flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Cancel Appointment</span>
          </button>
        </div>
      )}

      {/* Custom Double-Confirmation Cancellation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-800">Cancel Appointment?</h3>
              <p className="text-slate-500 text-xs sm:text-sm">
                Are you absolutely sure you want to cancel this visit? This action cannot be undone.
              </p>
            </div>

            {/* Display appointment details in confirmation */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Hospital</span>
                <span>{appointment.hospitalName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Doctor</span>
                <span>{appointment.doctor}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-slate-700">Date / Time</span>
                <span>{appointment.date} · {appointment.time}</span>
              </div>
            </div>

            {cancelError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                {cancelError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors"
              >
                Keep Appointment
              </button>
              <button
                onClick={handleCancel}
                className="w-full py-2.5 bg-red-650 hover:bg-red-750 text-white font-semibold text-xs sm:text-sm rounded-xl cursor-pointer transition-colors"
              >
                Cancel Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AppointmentDetailView;
