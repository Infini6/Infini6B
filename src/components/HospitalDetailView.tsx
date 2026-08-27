import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { hospitalApi } from '../services/hospitalApi';
import { doctorApi } from '../services/doctorApi';
import { Hospital, Doctor } from '../types';
import { 
  ArrowLeft, 
  MapPin, 
  Clock, 
  Phone, 
  Building2, 
  Stethoscope, 
  ChevronRight, 
  Activity,
  Heart,
  Plus
} from 'lucide-react';

export const HospitalDetailView: React.FC = () => {
  const { hospitalId } = useParams<{ hospitalId: string }>();
  const navigate = useNavigate();
  
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!hospitalId) return;
      try {
        setLoading(true);
        const data = await hospitalApi.getHospitalById(hospitalId);
        setHospital(data);

        // Fetch doctors for this hospital
        const allDocs = await doctorApi.getDoctors();
        const hospDocs = allDocs.filter(d => d.hospitalId === hospitalId);
        setDoctors(hospDocs);
      } catch (err: any) {
        setError(err.message || 'Unable to load hospital details.');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [hospitalId]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm mt-3 font-semibold">Loading hospital details...</p>
      </div>
    );
  }

  if (error || !hospital) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <MapPin className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Hospital Not Found</h2>
        <p className="text-slate-500 text-sm">{error || "We couldn't find the hospital you are looking for."}</p>
        <button
          onClick={() => navigate('/hospitals')}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
        >
          Back to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Back Link */}
      <button
        onClick={() => navigate('/hospitals')}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to hospitals directory</span>
      </button>

      {/* Hospital Banner Info Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                {hospital.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                hospital.status === 'open' 
                  ? 'bg-green-105 text-green-700'
                  : 'bg-orange-105 text-orange-700'
              }`}>
                {hospital.status === 'open' ? 'Open' : hospital.status}
              </span>
            </div>
            
            <div className="mt-3 space-y-1.5 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{hospital.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{hospital.hours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span>{hospital.phone}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/appointments/book', { state: { preSelectedHospital: hospital } })}
            className="self-start md:self-center px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book Visit</span>
          </button>
        </div>

        <p className="text-sm text-slate-600 mt-6 pt-6 border-t border-slate-100 leading-relaxed">
          {hospital.description}
        </p>
      </div>

      {/* Departments Listing */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>Departments</span>
        </h2>

        <div className="grid grid-cols-1 gap-3.5">
          {hospital.departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => navigate(`/departments/${dept.id}`, { state: { dept, hospital } })}
              className="p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div>
                <h3 className="font-bold text-slate-800 text-sm sm:text-base group-hover:text-blue-700">
                  {dept.name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">{dept.block} · {dept.floor} · Room {dept.room}</p>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{dept.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      </div>

      {/* Attending Doctors Listing */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <span>Attending Physicians</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {doctors.map((doc) => (
            <div
              key={doc.id}
              onClick={() => navigate(`/doctors/${doc.id}`)}
              className="p-4 rounded-2xl border border-slate-150 hover:border-blue-150 transition-all cursor-pointer flex items-start gap-3 group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                {doc.name.replace('Dr. ', '').charAt(0)}
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-sm group-hover:text-blue-650 transition-colors">
                  {doc.name}
                </h3>
                <p className="text-xs text-slate-550 mt-0.5">{doc.role}</p>
                <p className="text-xs text-slate-500 mt-1">Room {doc.room} · {doc.department}</p>
                <span className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  doc.availability === 'available'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-orange-50 text-orange-700'
                }`}>
                  {doc.availability === 'available' ? '✓ Available' : doc.availability}
                </span>
              </div>
            </div>
          ))}
          {doctors.length === 0 && (
            <p className="text-xs text-slate-400 py-2">No attending physicians registered for this hospital.</p>
          )}
        </div>
      </div>
    </div>
  );
};
export default HospitalDetailView;
