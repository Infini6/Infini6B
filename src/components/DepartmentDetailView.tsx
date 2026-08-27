import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doctorApi } from '../services/doctorApi';
import { hospitalApi } from '../services/hospitalApi';
import { Department, Doctor, Hospital } from '../types';
import { ArrowLeft, Building2, MapPin, Stethoscope, ChevronRight, Plus } from 'lucide-react';

export const DepartmentDetailView: React.FC = () => {
  const { departmentId } = useParams<{ departmentId: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [department, setDepartment] = useState<Department | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetails = async () => {
      if (!departmentId) return;
      try {
        setLoading(true);
        
        // Try getting pre-passed data from router state first
        const stateData = location.state as { dept: Department; hospital: Hospital } | null;
        let dept = stateData?.dept || null;
        let hosp = stateData?.hospital || null;

        if (!dept) {
          // Fallback fetch: search hospitals to find this department ID
          const hospitals = await hospitalApi.getHospitals();
          for (const h of hospitals) {
            const match = h.departments.find(d => d.id === departmentId);
            if (match) {
              dept = match;
              hosp = h;
              break;
            }
          }
        }

        if (!dept || !hosp) {
          throw new Error('Department not found in directory');
        }

        setDepartment(dept);
        setHospital(hosp);

        // Fetch doctors in this department
        const allDocs = await doctorApi.getDoctors();
        const deptDocs = allDocs.filter(d => d.hospitalId === hosp.id && d.department.toLowerCase() === dept.name.toLowerCase());
        setDoctors(deptDocs);

      } catch (err: any) {
        setError(err.message || 'Unable to load department details.');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [departmentId, location.state]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-12 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-sm mt-3 font-semibold">Loading department...</p>
      </div>
    );
  }

  if (error || !department || !hospital) {
    return (
      <div className="max-w-2xl mx-auto py-12 text-center space-y-4">
        <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
          <Building2 className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Department Not Found</h2>
        <p className="text-slate-500 text-sm">{error || "We couldn't find the department details you're looking for."}</p>
        <button
          onClick={() => navigate('/hospitals')}
          className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors"
        >
          Go to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Back Link */}
      <button
        onClick={() => navigate(`/hospitals/${hospital.id}`)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {hospital.name}</span>
      </button>

      {/* Department Summary Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
              {department.name}
            </h1>
            <p className="text-sm text-blue-600 font-semibold mt-1">{hospital.name}</p>
            
            <div className="mt-3.5 space-y-1.5 text-xs sm:text-sm text-slate-650">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{department.block} · {department.floor} · Room {department.room}</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/appointments/book', { state: { preSelectedHospital: hospital, preSelectedDepartment: department } })}
            className="self-start sm:self-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Book Visit</span>
          </button>
        </div>

        <p className="text-sm text-slate-600 mt-6 pt-6 border-t border-slate-100 leading-relaxed">
          {department.description}
        </p>
      </div>

      {/* Attending Physicians Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-blue-600" />
          <span>Physicians in this Department</span>
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
                <p className="text-xs text-slate-500 mt-1">Room {doc.room}</p>
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
            <p className="text-xs text-slate-400 py-2">No attending physicians registered in this department.</p>
          )}
        </div>
      </div>

    </div>
  );
};
export default DepartmentDetailView;
