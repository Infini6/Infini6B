import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationApi } from '../services/notificationApi';
import { appointmentApi } from '../services/appointmentApi';
import { NotificationItem } from '../types';
import { 
  Bell, 
  Calendar, 
  CheckCheck, 
  Trash2, 
  ArrowRight,
  Info,
  AlertCircle
} from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationApi.getNotifications();
      setNotifications(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load notifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
    } catch (e) {
      console.error(e);
    }
  };

  const handleNotificationClick = async (notif: NotificationItem) => {
    try {
      if (notif.unread) {
        await notificationApi.markAsRead(notif.id);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, unread: false } : n));
      }
      
      // Redirect to appointment detail view if ref exists
      if (notif.ref) {
        // Find if this appointment exists
        const appointments = await appointmentApi.getAppointments();
        const match = appointments.find(a => a.ref === notif.ref);
        if (match) {
          navigate(`/appointments/${match.id}`);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-12 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-10 bg-slate-200 rounded-xl w-48" />
          <div className="h-10 bg-slate-200 rounded-xl w-32" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-slate-200 h-24 rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 selection:bg-blue-100 selection:text-blue-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 tracking-tight">
            Notification Center
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All alerts and notifications are read'}
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-202 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 text-blue-600" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-3 sm:p-4 shadow-sm divide-y divide-slate-100">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => handleNotificationClick(notif)}
            className={`p-4 sm:p-5 rounded-2xl transition-all cursor-pointer flex items-start gap-4 ${
              notif.unread ? 'bg-blue-50/50 hover:bg-blue-50/80' : 'hover:bg-slate-50'
            }`}
          >
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
              notif.unread ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500'
            }`}>
              <Calendar className="w-5 h-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>{notif.title}</span>
                  {notif.unread && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block animate-pulse" />
                  )}
                </h4>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  {notif.time}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-650 mt-1 leading-relaxed">
                {notif.body}
              </p>

              {notif.ref && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-205">
                    Ref: {notif.ref}
                  </span>
                  <span className="text-xs text-blue-600 font-semibold hover:underline flex items-center gap-0.5">
                    View appointment <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-xs sm:text-sm">
            No notifications available.
          </div>
        )}
      </div>
    </div>
  );
};
export default NotificationsView;
