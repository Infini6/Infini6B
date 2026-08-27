import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Hospital } from '../types';
import { hospitalApi } from '../services/hospitalApi';
import { 
  Search, 
  MapPin, 
  Clock, 
  Phone, 
  ArrowRight, 
  Building2, 
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const HospitalsView: React.FC = () => {
  const navigate = useNavigate();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        setLoading(true);
        const data = await hospitalApi.getHospitals();
        setHospitals(data);
      } catch (err: any) {
        setError(err.message || 'Unable to retrieve hospitals.');
      } finally {
        setLoading(false);
      }
    };
    loadHospitals();
  }, []);

  // Filter hospitals based on search and filters
  const filteredHospitals = hospitals.filter((hosp) => {
    const q = searchQuery.toLowerCase().trim();
    const matchSearch = !q || 
      hosp.name.toLowerCase().includes(q) ||
      hosp.address.toLowerCase().includes(q) ||
      hosp.description.toLowerCase().includes(q) ||
      hosp.departments.some(d => d.name.toLowerCase().includes(q)) ||
      hosp.services.some(s => s.name.toLowerCase().includes(q));

    const matchDept = !selectedDept || 
      hosp.departments.some(d => d.name.toLowerCase() === selectedDept.toLowerCase());

    const matchService = !selectedService || 
      hosp.services.some(s => s.name.toLowerCase().includes(selectedService.toLowerCase()));

    const matchStatus = !selectedStatus || 
      hosp.status === selectedStatus;

    return matchSearch && matchDept && matchService && matchStatus;
  });

  // Extract unique departments and services for dropdown filters
  const uniqueDepts = Array.from(
    new Set(hospitals.flatMap(h => h.departments.map(d => d.name)))
  );
  const uniqueServices = Array.from(
    new Set(hospitals.flatMap(h => h.services.map(s => s.name.split(' ')[0]))) // pick base names
  );

  if (loading) {
    return (
      <div className="space-y-6 pb-12 animate-pulse">
        <div className="h-10 bg-slate-200 rounded-xl w-48" />
        <div className="h-12 bg-slate-200 rounded-xl w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-slate-200 h-48 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 selection:bg-blue-100 selection:text-blue-900">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Find a Hospital
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Search healthcare facilities, departments or clinical services
        </p>
      </div>

      {/* Filters Dashboard Panel */}
      <div className="bg-white rounded-3xl border border-slate-205 p-4 sm:p-5 shadow-sm space-y-4">
        {/* Search Bar Input */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            id="hospital-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hospitals by name, location, department..."
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-16 py-3 text-xs sm:text-sm text-slate-850 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-semibold"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>

        {/* Dropdown Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={e => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none font-semibold"
            >
              <option value="">All Departments</option>
              {uniqueDepts.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Service Type</label>
            <select
              value={selectedService}
              onChange={e => setSelectedService(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none font-semibold"
            >
              <option value="">All Services</option>
              {uniqueServices.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Availability Status</label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none font-semibold"
            >
              <option value="">All Statuses</option>
              <option value="open">Open Today</option>
              <option value="limited">Limited</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
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
                <h3 className="text-xl font-bold text-slate-850 tracking-tight">
                  {hospital.name}
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                  hospital.status === 'open'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-orange-50 text-orange-700 border border-orange-200'
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
                onClick={() => navigate(`/hospitals/${hospital.id}`)}
                className="text-xs sm:text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
              >
                <span>View details & clinics</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate('/appointments/book', { state: { preSelectedHospital: hospital } })}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Quick Book
              </button>
            </div>
          </div>
        ))}

        {filteredHospitals.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl border border-slate-200 p-12 text-center">
            <Search className="w-8 h-8 text-slate-305 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No facilities found</h4>
            <p className="text-xs text-slate-500 mt-1">Try refining your search terms or filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
export default HospitalsView;
