import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import type { User } from '../types';
import { apiGetTravelers, apiGetGroups, apiGetTickets, apiSetOrganizerEmail } from '../services/api';
import NotificationPanel from './NotificationPanel';
import TaskPanel from './TaskPanel';

function SettingsModal({ user, onClose }: { user: User | null; onClose: () => void }) {
  const [email, setEmail] = useState(user?.organizerEmail ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true); setError('');
    try {
      const updated = await apiSetOrganizerEmail(email.trim());
      // keep the JWT, refresh the stored user with the new organizerEmail
      const current = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...current, organizerEmail: updated.organizerEmail }));
      setSaved(true);
      setTimeout(onClose, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Agency Settings</h2>
          <p className="text-xs text-gray-400 mt-0.5">{user?.agency}</p>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Organizer email</label>
          <p className="text-xs text-gray-400 mb-2">
            Used to auto-notify the organizer about fare reviews and traveler removals (visa refusals).
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="organizer@event.org"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
        </div>
        <div className="px-6 pb-6 flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-colors ${saved ? 'bg-green-600' : 'bg-teal-600 hover:bg-teal-700'} disabled:opacity-60`}>
            {saved ? '✓ Saved' : saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

interface ShareButtonProps {
  buttonLabel: string;
  title: string;
  description: string;
  link: string | null;
  tone: 'teal' | 'indigo';
}

function ShareButton({ buttonLabel, title, description, link, tone }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCopy = () => {
    if (!link) return;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  if (!link) return null;

  const tones = {
    teal:   { btn: 'text-teal-700 bg-teal-50 hover:bg-teal-100 border-teal-200',     copy: 'bg-teal-600 hover:bg-teal-700' },
    indigo: { btn: 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border-indigo-200', copy: 'bg-indigo-600 hover:bg-indigo-700' },
  }[tone];

  return (
    <div className="px-3 pb-2 relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${tones.btn}`}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
          <path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/>
          <polyline points="16 6 12 2 8 6"/>
          <line x1="12" y1="2" x2="12" y2="15"/>
        </svg>
        {buttonLabel}
      </button>

      {open && (
        <div className="absolute bottom-14 left-3 right-3 bg-white rounded-xl shadow-xl border border-gray-200 p-4 z-50">
          <p className="text-xs font-semibold text-gray-700 mb-1">{title}</p>
          <p className="text-xs text-gray-400 mb-3">{description}</p>
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3">
            <p className="text-xs text-gray-600 truncate flex-1 font-mono">{link}</p>
          </div>
          <button
            onClick={handleCopy}
            className={`w-full py-2 rounded-lg text-sm font-semibold text-white transition-colors ${copied ? 'bg-green-600' : tones.copy}`}
          >
            {copied ? '✓ Copied to clipboard!' : 'Copy Link'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ travelers: 0, groups: 0, tickets: 0 });
  const [pendingCount, setPendingCount] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const user: User | null = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();

  useEffect(() => {
    Promise.all([apiGetTravelers(), apiGetGroups(), apiGetTickets()])
      .then(([travelers, groups, tickets]) => {
        setCounts({ travelers: travelers.length, groups: groups.length, tickets: tickets.length });
      })
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navItems = [
    { to: '/travelers', label: 'Travelers',         icon: '👥', count: counts.travelers },
    { to: '/groups',    label: 'Group Proposals',   icon: '📋', count: counts.groups },
    { to: '/tickets',   label: 'Individual Tickets',icon: '🎫', count: counts.tickets },
    { to: '/transactions', label: 'Transactions',   icon: '💰', count: undefined as number | undefined },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-gray-700 text-xl">✈</span>
          <div>
            <p className="text-sm font-semibold text-gray-900">Travel Agency Portal</p>
            <p className="text-xs text-gray-400">MENA Summit 2026 · Flight Management</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <TaskPanel />
          <NotificationPanel onCountChange={setPendingCount} />
          {pendingCount > 0 && (
            <span className="text-xs text-teal-700 font-medium bg-teal-50 px-2 py-0.5 rounded-full">
              {pendingCount} awaiting approval
            </span>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
          {/* Banner */}
          <div className="p-3 pb-0">
            <div className="relative rounded-xl overflow-hidden h-28">
              <img src="/plane.jpg" alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-teal-900/70 to-transparent" />
              <p className="absolute bottom-2 left-3 text-white text-xs font-semibold drop-shadow">MENA Summit 2026</p>
            </div>
          </div>
          <nav className="flex-1 p-3 space-y-1 overflow-auto pt-3">
            {navItems.map((item) =>
              item.to === '/transactions' ? (
                <div key="separator" className="pt-4 mt-2 border-t border-gray-200">
                  <p className="px-3 pb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Finance</p>
                  <NavLink
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    <span>{item.icon}</span>
                    <span className="flex-1">{item.label}</span>
                  </NavLink>
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <span>{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.count !== undefined && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full font-medium">{item.count}</span>
                  )}
                </NavLink>
              )
            )}
          </nav>

          {/* Share links */}
          <div className="pt-2">
            <ShareButton
              buttonLabel="Share Submission Link"
              title="Organizer Submission Link"
              description="Share with organizers to submit traveler info — no account needed."
              link={user?.submissionToken ? `${window.location.origin}/submit?token=${user.submissionToken}` : null}
              tone="teal"
            />
          </div>

          <div className="p-3 border-t border-gray-200">
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                {user?.name?.charAt(0) ?? 'U'}
              </div>
              <div className="text-sm min-w-0 flex-1">
                <p className="font-medium text-gray-800 truncate">{user?.name ?? 'User'}</p>
                <p className="text-gray-500 text-xs truncate">{user?.agency ?? ''}</p>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-teal-50 text-teal-600 hover:text-teal-700 shrink-0"
                title="Agency settings"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                  <circle cx="12" cy="12" r="3"/>
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/>
                </svg>
              </button>
              <button
                onClick={handleLogout}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-teal-50 text-teal-600 hover:text-teal-700 shrink-0"
                title="Logout"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                  <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                  <polyline points="16 17 21 12 16 7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
              </button>
            </div>
          </div>
        </aside>

        {showSettings && <SettingsModal user={user} onClose={() => setShowSettings(false)} />}

        <div
          className="flex-1 flex flex-col overflow-auto"
          style={{
            backgroundImage:
              'linear-gradient(rgba(249,250,251,0.8), rgba(249,250,251,0.8)), url(/world.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
