'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Clock } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { formatDate } from '@/utils/format';
import { toDate } from '@/utils/helpers';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, loading } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-[#8899AA] hover:text-white hover:bg-white/5 transition-colors"
        title="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-4 min-w-[16px] flex items-center justify-center text-[10px] font-bold text-white bg-[#FF5A6E] rounded-full px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-[420px] overflow-y-auto bg-[#141822] border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 z-50">
          <div className="sticky top-0 bg-[#141822] z-10 flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
            <span className="text-sm font-bold text-white">Notifications</span>
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="flex items-center gap-1 text-xs font-semibold text-[#8B6FFF] hover:underline">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />)}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center py-10 px-4 text-center">
              <Bell className="h-8 w-8 text-white/10 mb-2" />
              <p className="text-sm font-medium text-[#8899AA]">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer group ${!n.isRead ? 'bg-[#8B6FFF]/5' : ''}`}
                  onClick={() => markAsRead(n.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm ${!n.isRead ? 'font-bold text-white' : 'font-medium text-[#D0D8E0]'}`}>{n.title}</p>
                    <p className="text-xs text-[#8899AA] mt-0.5 line-clamp-2">{n.message}</p>
                    <div className="flex items-center gap-1 mt-1.5">
                      <Clock className="h-3 w-3 text-[#5A6B7D]" />
                      <span className="text-[10px] font-medium text-[#5A6B7D]">{formatDate(toDate(n.createdAt))}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                    className="p-1 rounded-lg hover:bg-[#FF5A6E]/10 shrink-0 opacity-0 group-hover:opacity-100 transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-[#FF5A6E]/60" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
