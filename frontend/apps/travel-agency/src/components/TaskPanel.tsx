import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { Traveler, AgencyTask } from '../types';
import { apiGetTravelers, apiGetAgencyTasks, apiDismissTask, openEventStream, apiSendGroupBooking, apiSendTicketBooking, apiSendTaskEmail } from '../services/api';
import GenerateGroupModal from './GenerateGroupModal';

interface Props {
  onCountChange?: (n: number) => void;
}

export default function TaskPanel({ onCountChange }: Props) {
  const [open, setOpen]                 = useState(false);
  const [scholars, setScholars]         = useState<Traveler[]>([]);
  const [agencyTasks, setAgencyTasks]   = useState<AgencyTask[]>([]);
  const [modalTraveler, setModalTraveler] = useState<Traveler | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchAll = async () => {
    try {
      const [all, tasks] = await Promise.all([apiGetTravelers(), apiGetAgencyTasks()]);
      const unassigned = all.filter((t) => t.role === 'Scholar' && !t.groupId);
      setScholars(unassigned);
      setAgencyTasks(tasks);
      onCountChange?.(unassigned.length + tasks.length);
    } catch { /* silent */ }
  };

  useEffect(() => {
    fetchAll();
    // Real-time push: refetch the moment a task is created (e.g. organizer responds)
    const es = openEventStream();
    if (es) es.addEventListener('task', () => fetchAll());
    // Polling fallback in case the SSE connection drops
    const interval = setInterval(fetchAll, 20_000);
    window.addEventListener('travelers:refresh', fetchAll);
    return () => {
      es?.close();
      clearInterval(interval);
      window.removeEventListener('travelers:refresh', fetchAll);
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleDismiss = async (task: AgencyTask) => {
    try {
      await apiDismissTask(task.id);
      setAgencyTasks((prev) => prev.filter((t) => t.id !== task.id));
      onCountChange?.(scholars.length + agencyTasks.length - 1);
    } catch { /* silent */ }
  };

  const handleCheck = async (task: AgencyTask) => {
    await handleDismiss(task);
    setOpen(false);
    if (task.refType === 'group') navigate(`/groups?highlight=${task.refId}`);
    else if (task.refType === 'ticket') navigate(`/tickets?highlight=${task.refId}`);
  };

  const [sendingId, setSendingId] = useState<string | null>(null);

  const handleSendTaskEmail = async (task: AgencyTask) => {
    setSendingId(task.id);
    try {
      const { to } = await apiSendTaskEmail(task.id);
      setAgencyTasks((prev) => prev.filter((t) => t.id !== task.id));
      alert(`Update emailed to organizer (${to}).`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send update');
    } finally {
      setSendingId(null);
    }
  };

  const handleSendBooking = async (task: AgencyTask) => {
    if (!task.refId) return;
    setSendingId(task.id);
    try {
      const { to } = task.refType === 'group'
        ? await apiSendGroupBooking(task.refId)
        : await apiSendTicketBooking(task.refId);
      setAgencyTasks((prev) => prev.filter((t) => t.id !== task.id));
      alert(`Booking details emailed to organizer (${to}).`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send booking');
    } finally {
      setSendingId(null);
    }
  };

  const count = scholars.length + agencyTasks.length;

  const initials = (name: string) =>
    name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <>
      <div className="relative" ref={panelRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="relative w-8 h-8 flex items-center justify-center rounded-lg hover:bg-teal-50 text-teal-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}>
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
            <rect x="9" y="3" width="6" height="4" rx="1"/>
            <line x1="9" y1="12" x2="15" y2="12"/>
            <line x1="9" y1="16" x2="12" y2="16"/>
          </svg>
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>

        {open && (
          <div
            className="absolute right-0 top-10 w-96 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-semibold text-gray-900">Pending Tasks</p>
              <p className="text-xs text-gray-400">{count} item{count !== 1 ? 's' : ''} need attention</p>
            </div>

            <div className="max-h-[420px] overflow-y-auto divide-y divide-gray-50">
              {count === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">
                  All tasks completed ✓
                </div>
              ) : (
                <>
                  {agencyTasks.map((task) => task.type === 'send_booking' ? (
                    <div key={task.id} className="px-4 py-3 bg-green-50 hover:bg-green-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-100 text-green-700 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-green-800 mb-0.5">Booking confirmed</p>
                          <p className="text-xs text-green-700 leading-relaxed">{task.message}</p>
                        </div>
                        <button onClick={() => handleDismiss(task)} className="text-green-400 hover:text-green-600 shrink-0 mt-0.5" title="Dismiss">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <button
                        onClick={() => handleSendBooking(task)}
                        disabled={sendingId === task.id}
                        className="mt-2.5 w-full py-1.5 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
                        {sendingId === task.id ? 'Waiting to send email…' : 'Send booking'}
                      </button>
                    </div>
                  ) : task.type === 'ai_ready' ? (
                    <div key={task.id} className="px-4 py-3 bg-violet-50 hover:bg-violet-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                            <path d="M5 3v4M3 5h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5L13 3z"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-violet-800 mb-0.5">AI Response Ready</p>
                          <p className="text-xs text-violet-700 leading-relaxed">{task.message}</p>
                        </div>
                        <button onClick={() => handleDismiss(task)} className="text-violet-400 hover:text-violet-600 shrink-0 mt-0.5" title="Dismiss">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <button
                        onClick={() => handleCheck(task)}
                        className="mt-2.5 w-full py-1.5 bg-violet-600 text-white rounded-lg text-xs font-semibold hover:bg-violet-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path d="M5 12h14M13 6l6 6-6 6"/></svg>
                        Check
                      </button>
                    </div>
                  ) : task.type === 'organizer_responded' ? (
                    <div key={task.id} className="px-4 py-3 bg-indigo-50 hover:bg-indigo-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path d="M9 12l2 2 4-4"/><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-indigo-800 mb-0.5">Organizer Responded</p>
                          <p className="text-xs text-indigo-700 leading-relaxed">{task.message}</p>
                        </div>
                        <button onClick={() => handleDismiss(task)} className="text-indigo-400 hover:text-indigo-600 shrink-0 mt-0.5" title="Dismiss">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                      </div>
                      <button
                        onClick={() => handleCheck(task)}
                        className="mt-2.5 w-full py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path d="M1 4v6h6M23 20v-6h-6"/><path d="M20.49 9A9 9 0 005.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 013.51 15"/></svg>
                        Recheck choice
                      </button>
                    </div>
                  ) : (
                    <div key={task.id} className="px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-blue-800 mb-0.5">Date Update</p>
                          <p className="text-xs text-blue-700 leading-relaxed">{task.message}</p>
                          <p className="text-[10px] text-blue-400 mt-1">{task.createdAt.slice(0, 10)}</p>
                        </div>
                        <button
                          onClick={() => handleDismiss(task)}
                          className="text-blue-400 hover:text-blue-600 transition-colors shrink-0 mt-0.5"
                          title="Dismiss"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                          </svg>
                        </button>
                      </div>
                      <button
                        onClick={() => handleSendTaskEmail(task)}
                        disabled={sendingId === task.id}
                        className="mt-2.5 w-full py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
                        {sendingId === task.id ? 'Waiting to send email…' : 'Update organizer'}
                      </button>
                    </div>
                  ))}

                  {/* Scholars without groups */}
                  {scholars.map((s) => (
                    <div key={s.id} className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0">
                          {initials(s.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{s.name}</p>
                          <p className="text-xs text-amber-600 font-medium">must join a group</p>
                          <p className="text-xs text-gray-400">
                            {s.departureAirport} → {s.arrivalAirport} · {s.departureDate}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setModalTraveler(s); setOpen(false); }}
                        className="mt-2.5 w-full py-1.5 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-1.5"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                          strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
                        </svg>
                        Join Group
                      </button>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {modalTraveler && createPortal(
        <GenerateGroupModal
          preselectedTraveler={modalTraveler}
          onClose={() => setModalTraveler(null)}
          onCreated={() => {
            setModalTraveler(null);
            fetchAll();
            window.dispatchEvent(new CustomEvent('travelers:refresh'));
          }}
        />,
        document.body
      )}
    </>
  );
}
