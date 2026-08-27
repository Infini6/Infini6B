import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bell, 
  Languages, 
  Accessibility, 
  UserCheck, 
  ShieldAlert, 
  Check, 
  ArrowLeft,
  ToggleLeft,
  ToggleRight,
  Database
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Settings state
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [queueReminders, setQueueReminders] = useState(true);
  const [language, setLanguage] = useState('en');
  const [highContrast, setHighContrast] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [mockMode, setMockMode] = useState(() => {
    return localStorage.getItem('caresync_use_mock') !== 'false';
  });
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    localStorage.setItem('caresync_use_mock', mockMode ? 'true' : 'false');
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

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

      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
          Portal Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Manage your notification alerts and accessibility preferences.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-2xl flex items-center gap-2.5 text-green-800 text-sm">
          <Check className="w-5 h-5 text-green-600" />
          <span className="font-semibold">Preferences saved successfully!</span>
        </div>
      )}

      {/* Notification Preferences */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          <Bell className="w-5 h-5 text-blue-600" />
          <span>Notification Alerts</span>
        </h2>

        <div className="space-y-4 pt-1 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Email Status Updates</h3>
              <p className="text-xs text-slate-500 mt-0.5">Receive confirmations and scheduling details via email.</p>
            </div>
            <button 
              onClick={() => setEmailAlerts(!emailAlerts)}
              className="text-blue-600 hover:opacity-85 transition-opacity cursor-pointer"
            >
              {emailAlerts ? <ToggleRight className="w-12 h-8 stroke-[1.5]" /> : <ToggleLeft className="w-12 h-8 stroke-[1.5] text-slate-400" />}
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">SMS Text Reminders</h3>
              <p className="text-xs text-slate-500 mt-0.5">Get immediate texts when your token is near serving status.</p>
            </div>
            <button 
              onClick={() => setSmsAlerts(!smsAlerts)}
              className="text-blue-600 hover:opacity-85 transition-opacity cursor-pointer"
            >
              {smsAlerts ? <ToggleRight className="w-12 h-8 stroke-[1.5]" /> : <ToggleLeft className="w-12 h-8 stroke-[1.5] text-slate-400" />}
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Queue Position Alerts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Receive instant alerts when your position changes.</p>
            </div>
            <button 
              onClick={() => setQueueReminders(!queueReminders)}
              className="text-blue-600 hover:opacity-85 transition-opacity cursor-pointer"
            >
              {queueReminders ? <ToggleRight className="w-12 h-8 stroke-[1.5]" /> : <ToggleLeft className="w-12 h-8 stroke-[1.5] text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Language Preferences */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-600" />
          <span>Language Preferences</span>
        </h2>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Portal Display Language
          </label>
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold text-slate-850 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          >
            <option value="en">English (US)</option>
            <option value="es">Español</option>
            <option value="ta">தமிழ் (Tamil)</option>
            <option value="hi">हिन्दी (Hindi)</option>
          </select>
        </div>
      </div>

      {/* Accessibility Preferences */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
          <Accessibility className="w-5 h-5 text-blue-600" />
          <span>Accessibility Preferences</span>
        </h2>

        <div className="space-y-4 divide-y divide-slate-100">
          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">High Contrast Mode</h3>
              <p className="text-xs text-slate-500 mt-0.5">Increases visual readability by raising colors contrast.</p>
            </div>
            <button 
              onClick={() => setHighContrast(!highContrast)}
              className="text-blue-600 hover:opacity-85 transition-opacity cursor-pointer"
            >
              {highContrast ? <ToggleRight className="w-12 h-8 stroke-[1.5]" /> : <ToggleLeft className="w-12 h-8 stroke-[1.5] text-slate-400" />}
            </button>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <h3 className="font-semibold text-slate-800 text-sm">Large Text / Typography</h3>
              <p className="text-xs text-slate-500 mt-0.5">Scales text size across the application for readability.</p>
            </div>
            <button 
              onClick={() => setLargeText(!largeText)}
              className="text-blue-600 hover:opacity-85 transition-opacity cursor-pointer"
            >
              {largeText ? <ToggleRight className="w-12 h-8 stroke-[1.5]" /> : <ToggleLeft className="w-12 h-8 stroke-[1.5] text-slate-400" />}
            </button>
          </div>
        </div>
      </div>

      {/* Developer Toggles */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-slate-850 flex items-center gap-2">
          <Database className="w-5 h-5 text-slate-650" />
          <span>Developer Configuration</span>
        </h2>

        <div className="flex items-center justify-between py-3 border-t border-slate-200">
          <div>
            <h3 className="font-semibold text-slate-800 text-sm">Standalone Mock Mode</h3>
            <p className="text-xs text-slate-500 mt-0.5">Uses localStorage adapter database instead of fetching backend.</p>
          </div>
          <button 
            onClick={() => setMockMode(!mockMode)}
            className="text-slate-600 hover:opacity-85 transition-opacity cursor-pointer"
          >
            {mockMode ? <ToggleRight className="w-12 h-8 stroke-[1.5] text-blue-650" /> : <ToggleLeft className="w-12 h-8 stroke-[1.5] text-slate-400" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={handleSave}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};
export default SettingsView;
