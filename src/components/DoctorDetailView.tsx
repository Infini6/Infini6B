import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorApi } from '../services/doctorApi';
import { hospitalApi } from '../services/hospitalApi';
import { Doctor, Hospital } from '../types';
import { ArrowLeft, User, Stethoscope, Building2, MapPin, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

export const DoctorDetailView: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!doctorId) return;
      try {
        setLoading(true);
        const doc = await doctorApi.getDoctorById(doctorId);
        setDoctor(doc);

        const hosp = await hospitalApi.getHospitalById(doc.hospitalId);
        setHospital(hosp);
      } catch (err: any) {
        setError(err.message || 'Unable to load physician details.');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [doctorId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm mt-3 font-semibold">Loading doctor profile...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Stethoscope className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Doctor Profile Not Found</h2>
        <p className="text-slate-500 text-sm">{error || "We couldn't find the doctor details you're looking for."}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Doctor Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-2xl sm:text-3xl border border-blue-200">
              {doctor.name.replace('Dr. ', '').charAt(0)}
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
                {doctor.name}
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-0.5">{doctor.role} · {doctor.department}</p>
              
              <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                doctor.availability === 'available'
                  ? 'bg-green-50 text-green-700'
                  : 'bg-orange-50 text-orange-700'
              }`}>
                {doctor.availability === 'available' ? '✓ Available' : doctor.availability}
              </span>
            </div>
          </div>

          <button
            onClick={() => navigate('/appointments/book', { state: { preSelectedDoctor: doctor, preSelectedHospital: hospital } })}
            className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book Visit</span>
          </button>
        </div>

        {/* Clinical Placement Locations */}
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Practice Location</h2>
          
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-800">{hospital ? hospital.name : 'Registered Hospital'}</p>
                <p className="text-xs text-slate-500 mt-0.5">{hospital ? hospital.address : ''}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-bold text-slate-800">{doctor.department} Department</p>
                <p className="text-xs text-slate-500 mt-0.5">Consultation Room {doctor.room}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services / Consultation Details */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Services Offered</h2>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-650">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Standard Clinical Consultations (OPD)</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Follow-up reviews and diagnosis reports</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
              <span>Referral letters and prescriptions dispensation</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
export default DoctorDetailView;
