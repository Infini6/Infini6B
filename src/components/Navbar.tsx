import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  CalendarDays, 
  Bell, 
  User, 
  Plus,
  Activity,
  LogOut,
  Settings,
  Menu,
  X
} from 'lucide-react';

interface NavbarProps {
  unreadCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ unreadCount }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/hospitals', label: 'Hospitals', icon: Building2 },
    { path: '/appointments', label: 'Appointments', icon: CalendarDays },
    { path: '/notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const handleMobileNavClick = (path: string) => {
    setMobileMenuOpen(false);
    navigate(path);
  };

  const handleLogoutClick = () => {
    setMobileMenuOpen(false);
    logout();
  };

  return (
    <>
      {/* 1. DESKTOP STICKY LEFT SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 flex-shrink-0 bg-white border-r border-slate-200 py-6 px-4 justify-between shadow-xs select-none">
        
        <div className="space-y-6">
          {/* Brand Logo & Title */}
          <Link 
            to="/dashboard"
            className="flex items-center gap-3 group cursor-pointer text-slate-800 hover:text-slate-900"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <Activity className="w-5.5 h-5.5 stroke-[2.5]" />
            </div>
            <div>
              <div className="font-bold text-slate-800 text-base leading-tight tracking-tight">
                MedFlow <span className="text-blue-600 font-semibold text-[10px] tracking-normal ml-0.5">CareSync</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">
                Smart Patient Portal
              </div>
            </div>
          </Link>

          {/* Primary Navigation list */}
          <nav className="space-y-1.5 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  id={`sidebar-link-${item.label.toLowerCase()}`}
                  to={item.path}
                  className={({ isActive }) => `flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 shadow-xs'
                      : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {({ isActive }) => (
                    <>
                      <div className="flex items-center gap-3">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-655'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full min-w-5 text-center leading-tight ${
                          isActive ? 'bg-blue-600 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {item.badge}
                        </span>
                      ) : null}
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <hr className="border-slate-100 my-4" />

          {/* Secondary Navigation items */}
          <div className="space-y-1.5">
            <NavLink
              id="sidebar-link-settings"
              to="/settings"
              className={({ isActive }) => `flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-xs'
                  : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {({ isActive }) => (
                <>
                  <Settings className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>Settings</span>
                </>
              )}
            </NavLink>

            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold text-slate-655 hover:text-red-650 hover:bg-red-50/50 transition-all duration-150 cursor-pointer"
            >
              <LogOut className="w-5 h-5 text-slate-400 hover:text-red-550" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Primary CTA button at the bottom */}
        <div className="pt-6">
          <Link
            id="sidebar-book-btn"
            to="/appointments/book"
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 rounded-xl text-sm font-semibold shadow-sm hover:shadow-md shadow-blue-600/20 transition-all duration-150 cursor-pointer text-center"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Book Visit</span>
          </Link>
        </div>
      </aside>

      {/* 2. MOBILE TOP HEADER */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-205 px-4 h-15 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3.5">
          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-slate-600 hover:text-slate-900 active:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Branding */}
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs">
              <Activity className="w-4.5 h-4.5 stroke-[2.5]" />
            </div>
            <span className="font-bold text-slate-800 text-sm tracking-tight leading-none">
              MedFlow <span className="text-blue-600 font-semibold text-[8px] tracking-normal ml-0.5">CareSync</span>
            </span>
          </Link>
        </div>

        {/* Right Action Icons */}
        <div className="flex items-center gap-2">
          <Link
            to="/notifications"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </Link>

          <Link
            to="/profile"
            className="p-2 text-slate-505 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-all"
            aria-label="View profile"
          >
            <User className="w-5 h-5" />
          </Link>
        </div>
      </header>

      {/* 3. MOBILE COLLAPSIBLE LEFT DRAWER (SLIDE OVERLAY) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop mask */}
          <div 
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Slide-out drawer menu */}
          <aside className="relative flex flex-col w-64 max-w-xs h-full bg-white shadow-xl py-6 px-4 justify-between transition-transform duration-300 ease-in-out z-10">
            <div className="space-y-6">
              
              {/* Drawer header branding & close button */}
              <div className="flex items-center justify-between">
                <Link 
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-xs">
                    <Activity className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <span className="font-bold text-slate-850 text-sm leading-tight tracking-tight">
                    MedFlow <span className="text-blue-600 font-semibold text-[9px] tracking-normal ml-0.5">CareSync</span>
                  </span>
                </Link>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation list */}
              <nav className="space-y-1 pt-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleMobileNavClick(item.path)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                        window.location.pathname === item.path
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4.5 h-4.5 ${window.location.pathname === item.path ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && item.badge > 0 ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold bg-red-500 text-white rounded-full min-w-5 text-center">
                          {item.badge}
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </nav>

              <hr className="border-slate-100 my-3" />

              {/* Secondary operations */}
              <div className="space-y-1">
                <button
                  onClick={() => handleMobileNavClick('/settings')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    window.location.pathname === '/settings'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-655 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className={`w-4.5 h-4.5 ${window.location.pathname === '/settings' ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>Settings</span>
                </button>

                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-655 hover:text-red-650 hover:bg-red-50/50 transition-colors cursor-pointer text-left"
                >
                  <LogOut className="w-4.5 h-4.5 text-slate-400" />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            {/* CTA action button at bottom of drawer */}
            <div className="pt-4">
              <button
                onClick={() => handleMobileNavClick('/appointments/book')}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-sm font-semibold shadow-xs cursor-pointer text-center"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>Book Visit</span>
              </button>
            </div>
          </aside>
        </div>
      )}
    </>
  );
};
export default Navbar;
