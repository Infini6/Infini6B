import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { notificationApi } from '../services/notificationApi';
import { useState } from 'react';

export const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Poll/fetch notifications periodically or read from mock db
  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const list = await notificationApi.getNotifications();
        setUnreadCount(list.filter(n => n.unread).length);
      } catch (e) {
        console.error(e);
      }
    };
    fetchUnread();
    
    // Set a timer to check notification badges
    const timer = setInterval(fetchUnread, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col md:flex-row selection:bg-blue-100 selection:text-blue-900">
      {/* Left Sidebar on desktop, Top Header Bar on mobile */}
      <Navbar unreadCount={unreadCount} />

      {/* Main Page scroll wrapper container */}
      <div className="flex-1 md:h-screen md:overflow-y-auto flex flex-col">
        <main className="flex-1 w-full px-6 sm:px-8 md:px-10 py-6 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default MainLayout;
