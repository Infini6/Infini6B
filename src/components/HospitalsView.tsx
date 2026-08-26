import React, { useState } from 'react';
import { 
  Search, 
  MapPin, 
  Clock, 
  Phone, 
  ArrowLeft, 
  ArrowRight, 
  Building2, 
  Stethoscope, 
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Hospital, Department, Doctor, AppTab } from '../types';
import { HOSPITALS, DOCTORS } from '../data/mockData';

interface HospitalsViewProps {
  onStartBooking: (hospital: Hospital, department?: Department, doctor?: Doctor) => void;
  setTab: (tab: AppTab) => void;
}

export const HospitalsView: React.FC<HospitalsViewProps> = ({ onStartBooking }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

  // Filter hospitals based on search
  const filteredHospitals = HOSPITALS.filter((hosp) => {
    const q = searchQuery.toLowerCase();
    const matchName = hosp.name.toLowerCase().includes(q);
    const matchAddr = hosp.address.toLowerCase().includes(q);
    const matchDesc = hosp.description.toLowerCase().includes(q);
    const matchDept = hosp.departments.some(d => d.name.toLowerCase().includes(q));
    const matchServ = hosp.services.some(s => s.name.toLowerCase().includes(q));
    return matchName || matchAddr || matchDesc || matchDept || matchServ;
  });

  // If a hospital is clicked to view full profile & departments
  if (selectedHospital) {
    const hospDoctors = DOCTORS.filter(doc => doc.hospitalId === selectedHospital.id);

    return (
      <div className="space-y-6 pb-12">
        {/* Back Link */}
        <button
          onClick={() => setSelectedHospital(null)}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to hospitals directory</span>
        </button>

        {/* Hospital Profile Banner */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
                  {selectedHospital.name}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  selectedHospital.status === 'open' 
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {selectedHospital.status === 'open' ? 'Open Today' : selectedHospital.status}
                </span>
              </div>
              
              <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{selectedHospital.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{selectedHospital.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{selectedHospital.phone}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartBooking(selectedHospital)}
              className="self-start md:self-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-600/20 cursor-pointer transition-all"
            >
              Book appointment
            </button>
          </div>

          <p className="text-sm text-slate-600 mt-6 pt-6 border-t border-slate-100 leading-relaxed">
            {selectedHospital.description}
          </p>
        </div>

        {/* Departments Section */}
        <div>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <span>Departments & Clinics</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedHospital.departments.map((dept) => (
              <div 
                key={dept.id}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-slate-800 text-base">
                      {dept.name}
                    </h3>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                      {dept.block} · {dept.floor}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                    {dept.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium">Room {dept.room}</span>
                  <button
                    onClick={() => onStartBooking(selectedHospital, dept)}
                    className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
                  >
                    <span>Book department</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Doctors Section */}
        {hospDoctors.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-blue-600" />
              <span>On-Duty Specialists</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {hospDoctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-base border border-blue-100">
                      {doc.name.replace('Dr. ', '').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm sm:text-base">
                        {doc.name}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {doc.role} · {doc.department}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-slate-400">Room {doc.room}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      doc.availability === 'available'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {doc.availability}
                    </span>
                    <button
                      onClick={() => onStartBooking(selectedHospital, undefined, doc)}
                      className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm cursor-pointer"
                    >
                      Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Hospital List View
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Find a Hospital
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Search healthcare facilities, departments or clinical services
        </p>
      </div>

      {/* Search Bar Input */}
      <div className="relative">
        <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id="hospital-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search hospitals, departments, or specialized treatments..."
          className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-16 py-3.5 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Hospitals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredHospitals.map((hospital) => (
          <div
            key={hospital.id}
            className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                  {hospital.name}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                  hospital.status === 'open'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}>
                  {hospital.status === 'open' ? 'Open' : hospital.status}
                </span>
              </div>

              <div className="mt-3 space-y-1 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <span>{hospital.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span>{hospital.hours}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-slate-500 mt-4 line-clamp-2 leading-relaxed">
                {hospital.description}
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
              <button
                id={`hosp-details-${hospital.id}`}
                onClick={() => setSelectedHospital(hospital)}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View details & departments</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onStartBooking(hospital)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Quick Book
              </button>
            </div>
          </div>
        ))}

        {filteredHospitals.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No hospitals found</h4>
            <p className="text-xs text-slate-500 mt-1">Try searching with a different hospital name, department, or keyword.</p>
          </div>
        )}
      </div>
    </div>
  );
};
