import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  CalendarDays, 
  Bell, 
  User, 
  Plus,
  Activity
} from 'lucide-react';
import { AppTab } from '../types';

interface NavbarProps {
  currentTab: AppTab;
  setTab: (tab: AppTab) => void;
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setTab, unreadCount }) => {
  const navItems = [
    { id: 'dashboard' as AppTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hospitals' as AppTab, label: 'Hospitals', icon: Building2 },
    { id: 'appointments' as AppTab, label: 'Appointments', icon: CalendarDays },
    { id: 'notifications' as AppTab, label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile' as AppTab, label: 'Profile', icon: User },
  ];

  return (
    <>
      {/* Desktop & Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div 
            id="brand-logo"
            onClick={() => setTab('dashboard')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-lg leading-tight tracking-tight">
                MedFlow <span className="text-blue-600 font-semibold text-xs tracking-normal ml-1">CareSync</span>
              </div>
              <div className="text-xs text-slate-500 font-medium">
                Smart Hospital Queue & Portal
              </div>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || 
                (item.id === 'appointments' && (currentTab === 'queue' || currentTab === 'journey' || currentTab === 'navigation')) ||
                (item.id === 'book' && currentTab === 'confirmation');
              
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setTab(item.id)}
                  className={`relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <span className="ml-0.5 px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-4 text-center leading-tight">
                      {item.badge}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </nav>

          {/* Action Button: Book & Quick Patient Indicator */}
          <div className="flex items-center gap-3">
            <button
              id="header-book-btn"
              onClick={() => setTab('book')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md shadow-blue-600/20 transition-all duration-150 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Book Visit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 py-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] shadow-lg">
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id || 
              (item.id === 'appointments' && (currentTab === 'queue' || currentTab === 'journey' || currentTab === 'navigation'));

            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => setTab(item.id)}
                className={`relative flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl text-xs transition-colors cursor-pointer ${
                  isActive ? 'text-blue-600 font-semibold bg-blue-50' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white" />
                  ) : null}
                </div>
                <span className="text-[11px]">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
