import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { UserProfile, AppTab } from '../types';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateProfile: (updated: UserProfile) => void;
  setTab: (tab: AppTab) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateProfile,
  setTab,
}) => {
  const [formData, setFormData] = useState<UserProfile>(user);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showModal, setShowModal] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
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
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
              required
            />
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
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
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
              placeholder="Home address"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
              Emergency Contact
            </label>
            <input
              type="text"
              value={formData.emergencyContact}
              onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
              placeholder="Name and phone number"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              id="save-profile-btn"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              {savedSuccess ? <Check className="w-4 h-4 stroke-[3]" /> : null}
              <span>{savedSuccess ? 'Changes saved!' : 'Save changes'}</span>
            </button>
            {savedSuccess && (
              <span className="text-xs text-green-600 font-semibold">
                Profile updated successfully.
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Menu / Settings list Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-2 sm:p-3 shadow-sm divide-y divide-slate-100">
        <button
          onClick={() => setTab('appointments')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer text-slate-800 text-sm font-semibold text-left"
        >
          <div className="flex items-center gap-3">
            <CalendarDays className="w-4 h-4 text-slate-500" />
            <span>My appointments</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowModal('Notification Settings')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer text-slate-800 text-sm font-semibold text-left"
        >
          <div className="flex items-center gap-3">
            <Bell className="w-4 h-4 text-slate-500" />
            <span>Notification settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowModal('Security & Privacy')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer text-slate-800 text-sm font-semibold text-left"
        >
          <div className="flex items-center gap-3">
            <Shield className="w-4 h-4 text-slate-500" />
            <span>Security & privacy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowModal('App Preferences')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer text-slate-800 text-sm font-semibold text-left"
        >
          <div className="flex items-center gap-3">
            <Settings className="w-4 h-4 text-slate-500" />
            <span>App settings</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => {
            alert('Logged out securely. Session cleared.');
          }}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-red-50 rounded-2xl transition-colors cursor-pointer text-red-600 text-sm font-semibold text-left"
        >
          <div className="flex items-center gap-3">
            <LogOut className="w-4 h-4 text-red-500" />
            <span>Log out</span>
          </div>
          <ChevronRight className="w-4 h-4 text-red-400" />
        </button>
      </div>

      {/* Simple Settings Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-xl space-y-4 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800">{showModal}</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              All settings for {showModal.toLowerCase()} are synced and active for patient <strong className="text-slate-800">{formData.name}</strong>.
            </p>
            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowModal(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm shadow-blue-600/20"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
