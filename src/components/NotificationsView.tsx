import React from 'react';
import { 
  Bell, 
  Calendar, 
  CheckCheck, 
  Trash2, 
  ArrowRight,
  Info
} from 'lucide-react';
import { NotificationItem, AppTab } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (ref?: string) => void;
  setTab: (tab: AppTab) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllAsRead,
  onSelectNotification,
  setTab,
}) => {
  const unreadCount = notifications.filter(n => n.unread).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
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
            onClick={onMarkAllAsRead}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
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
            onClick={() => {
              if (notif.ref) {
                onSelectNotification(notif.ref);
              }
            }}
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
                    <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" />
                  )}
                </h4>
                <span className="text-xs text-slate-400 font-medium whitespace-nowrap">
                  {notif.time}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                {notif.body}
              </p>

              {notif.ref && (
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
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
          <div className="py-16 text-center text-slate-400 space-y-2">
            <Bell className="w-10 h-10 mx-auto text-slate-300" />
            <p className="text-sm font-semibold text-slate-700">No notifications</p>
            <p className="text-xs text-slate-400">You will receive live queue & appointment updates here.</p>
          </div>
        )}
      </div>
    </div>
  );
};
