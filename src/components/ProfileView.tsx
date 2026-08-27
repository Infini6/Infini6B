import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Check, 
  HeartHandshake, 
  CalendarDays,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { UserProfile } from '../types';

export const ProfileView: React.FC = () => {
  const { user, updateUserProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<UserProfile>(() => {
    return user || {
      name: '',
      email: '',
      phone: '',
      address: '',
      emergencyContact: '',
      bloodGroup: '',
      age: 25
    };
  });
  
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16 selection:bg-blue-100 selection:text-blue-900">
      
      {/* Top Back Link */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {/* Profile Header Card */}
      <div className="flex items-center gap-4 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-sm">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-2xl sm:text-3xl flex-shrink-0 border border-blue-200">
          {formData.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight truncate">
            {formData.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 truncate mt-0.5">
            {formData.email}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-[11px] font-semibold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
              Verified Patient ID #4492
            </span>
          </div>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2.5 text-green-800 text-sm font-semibold">
          <Check className="w-5 h-5 text-green-600" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Personal Information Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-4">
          Personal Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Full name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-205 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Age
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-white border border-slate-205 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                Blood Group
              </label>
              <input
                type="text"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-slate-205 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Phone number
            </label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+91 ..."
              className="w-full px-4 py-3 bg-white border border-slate-205 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Residential Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 bg-white border border-slate-205 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Emergency Contact Details
            </label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="e.g. Suresh Kumar - +91 98402 34567"
              className="w-full px-4 py-3 bg-white border border-slate-205 rounded-2xl text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {/* Account Settings Menu */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 mb-2">
          Account Operations
        </h2>

        <div className="space-y-2">
          <button 
            onClick={() => navigate('/settings')}
            className="w-full flex items-center justify-between p-3.5 hover:bg-slate-50 rounded-2xl text-left text-slate-700 text-sm font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <Settings className="w-5 h-5 text-slate-450" />
              <span>Configure Notification Preferences</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <button 
            onClick={logout}
            className="w-full flex items-center justify-between p-3.5 hover:bg-red-50 text-red-650 rounded-2xl text-left text-sm font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="w-5 h-5 text-red-500" />
              <span>Sign out of portal session</span>
            </div>
            <ChevronRight className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ProfileView;
