import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import type { PendingTraveler, AgencyNotification } from '../types';
import {
  apiGetPendingTravelers, apiApprovePendingTraveler, apiRejectPendingTraveler,
  apiGetNotifications, apiMarkNotificationRead, apiSendNotificationEmail, openEventStream,
} from '../services/api';

const visaColors: Record<string, string> = {
  not_required: 'bg-gray-100 text-gray-500',
  processing:   'bg-blue-100 text-blue-700',
  accepted:     'bg-green-100 text-green-700',
};

interface Props {
  onCountChange?: (n: number) => void;
}

export default function NotificationPanel({ onCountChange }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<PendingTraveler[]>([]);
  const [notifs, setNotifs] = useState<AgencyNotification[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [emailingId, setEmailingId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const count = items.length + notifs.filter((n) => !n.read).length;

  const fetchAll = async () => {
    try {
      const [pending, notifications] = await Promise.all([apiGetPendingTravelers(), apiGetNotifications()]);
      setItems(pending);
      setNotifs(notifications);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchAll();
    const es = openEventStream();
    if (es) es.addEventListener('notification', () => fetchAll());
    const interval = setInterval(fetchAll, 20_000);
    window.addEventListener('notifications:refresh', fetchAll);
    return () => {
      es?.close();
      clearInterval(interval);
      window.removeEventListener('notifications:refresh', fetchAll);
    };
  }, []);

  useEffect(() => { onCountChange?.(count); }, [count]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleApprove = async (p: PendingTraveler) => {
    setLoadingId(p.id);
    try {
      await apiApprovePendingTraveler(p.id);
      setItems((prev) => prev.filter((x) => x.id !== p.id));
      window.dispatchEvent(new CustomEvent('travelers:refresh'));
      setOpen(false);
      navigate('/travelers');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (p: PendingTraveler) => {
    setLoadingId(p.id);
    try {
      await apiRejectPendingTraveler(p.id);
      setItems((prev) => prev.filter((x) => x.id !== p.id));
    } catch { /* silent */ } finally {
      setLoadingId(null);
    }
  };

  const handleSendEmail = async (n: AgencyNotification) => {
    setEmailingId(n.id);
    try {
      const { to } = await apiSendNotificationEmail(n.id);
      setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, emailSent: true, read: true } : x));
      alert(`Email sent to organizer (${to}).`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setEmailingId(null);
    }
  };

  const handleDismissNotif = async (n: AgencyNotification) => {
    try {
      await apiMarkNotificationRead(n.id);
      setNotifs((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x));
    } catch { /* silent */ }
  };

  const unreadNotifs = notifs.filter((n) => !n.read);

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-teal-50 text-teal-600 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
          <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 01-3.46 0"/>
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-10 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Notifications</p>
            <p className="text-xs text-gray-400">{count} item{count !== 1 ? 's' : ''}</p>
          </div>

          <div className="max-h-[26rem] overflow-y-auto divide-y divide-gray-50">
            {count === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">Nothing new</div>
            ) : (
              <>
                {/* Agency notifications (visa removal / ticket choice) */}
                {unreadNotifs.map((n) => {
                  const isChoose = n.type === 'choose_ticket';
                  return (
                    <div key={`n-${n.id}`} className={`px-4 py-3 transition-colors ${isChoose ? 'bg-teal-50/60 hover:bg-teal-50' : 'bg-red-50/60 hover:bg-red-50'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${isChoose ? 'bg-teal-100 text-teal-600' : 'bg-red-100 text-red-600'}`}>
                          {isChoose ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs font-semibold mb-0.5 ${isChoose ? 'text-teal-800' : 'text-red-800'}`}>
                            {isChoose ? 'Ticket choice needed' : 'Visa refused — replacement needed'}
                          </p>
                          <p className="text-xs text-gray-700 leading-relaxed">{n.message}</p>
                        </div>
                        <button onClick={() => handleDismissNotif(n)} className="text-gray-300 hover:text-gray-600 shrink-0 mt-0.5" title="Dismiss">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <button
                        onClick={() => handleSendEmail(n)}
                        disabled={emailingId === n.id || n.emailSent}
                        className="mt-2.5 w-full py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path d="M22 6l-10 7L2 6"/><rect x="2" y="4" width="20" height="16" rx="2"/></svg>
                        {n.emailSent ? '✓ Email sent' : emailingId === n.id ? 'Waiting to send email…' : isChoose ? 'Send options to organizer' : 'Send email to organizer'}
                      </button>
                    </div>
                  );
                })}

                {/* Incoming travelers (organizer submissions) */}
                {items.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                    Incoming Travelers
                  </div>
                )}
                {items.map((p) => {
                  const initials = p.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                  const isLoading = loadingId === p.id;
                  return (
                    <div key={p.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                          p.role === 'Speaker' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                              p.role === 'Speaker' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                            }`}>{p.role}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${visaColors[p.visa] || ''}`}>
                              Visa: {p.visa.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {p.departureAirport && <span>{p.departureAirport} → DXB · </span>}
                            {p.preferredDepartureDate && <span>{p.preferredDepartureDate} – {p.preferredReturnDate}</span>}
                          </p>
                          {p.email && <p className="text-xs text-gray-400">{p.email}</p>}
                          {p.notes && <p className="text-xs text-gray-400 italic mt-0.5">"{p.notes}"</p>}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2.5">
                        <button
                          onClick={() => handleApprove(p)}
                          disabled={isLoading}
                          className="flex-1 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-semibold hover:bg-teal-700 transition-colors disabled:opacity-50"
                        >
                          {isLoading ? '…' : 'Add to table'}
                        </button>
                        <button
                          onClick={() => handleReject(p)}
                          disabled={isLoading}
                          className="px-3 py-1.5 border border-gray-200 text-gray-500 rounded-lg text-xs font-medium hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
