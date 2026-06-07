import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import type { Traveler } from '../types';
import { apiGetTravelers, apiDeleteTraveler, apiAcceptVisa, apiRefuseVisa } from '../services/api';

import type { FlightInfo } from '../types';

// Fixed row height so the Pref. Dates and Flight Details columns line up leg-by-leg.
const LEG_ROW = 'min-h-[2.75rem] flex flex-col justify-center';

function FlightLeg({ flight, isReturn = false }: { flight: FlightInfo; isReturn?: boolean }) {
  return (
    <div className={LEG_ROW}>
      <div className="flex items-center gap-1.5">
        <svg className={`w-3.5 h-3.5 shrink-0 ${isReturn ? 'text-gray-400 rotate-180' : 'text-teal-500'}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
          <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
        </svg>
        <span className="font-semibold text-gray-800">{flight.airline}</span>
        <span className="text-gray-400">{flight.flightNumber}</span>
      </div>
      <p className="text-gray-400">
        {flight.departureTime} → {flight.arrivalTime}
        <span className="ml-1">· {flight.stops === 0 ? 'Direct' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}</span>
      </p>
    </div>
  );
}

const roleColors: Record<string, string> = {
  Scholar: 'bg-amber-100 text-amber-800',
  Speaker: 'bg-purple-100 text-purple-800',
};

const statusColors: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-gray-100 text-gray-600',
  waiting_organizer: 'bg-amber-100 text-amber-800',
};

const statusText: Record<string, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  waiting_organizer: 'Waiting for organizers',
};

// Visa: not_required & accepted show a green tick; processing is red.
const visaLabels: Record<string, string> = {
  not_required: 'Not Required',
  processing: 'Processing...',
  accepted: 'Accepted',
};

const visaColors: Record<string, string> = {
  not_required: 'bg-green-100 text-green-700',
  processing: 'bg-red-100 text-red-700',
  accepted: 'bg-green-100 text-green-700',
};

export default function Travelers() {
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [airportFilter, setAirportFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [kindFilter, setKindFilter] = useState<'all' | 'groups' | 'individuals'>('all');
  const [actionTraveler, setActionTraveler] = useState<Traveler | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');

  useEffect(() => {
    if (!highlightId) return;
    const el = document.getElementById(`traveler-${highlightId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [highlightId, travelers]);

  const fetchTravelers = () => {
    apiGetTravelers()
      .then(setTravelers)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTravelers();
    window.addEventListener('travelers:refresh', fetchTravelers);
    return () => window.removeEventListener('travelers:refresh', fetchTravelers);
  }, []);

  const airports = useMemo(() => [...new Set(travelers.map((t) => t.departureAirport))].sort(), [travelers]);
  const roles = useMemo(() => [...new Set(travelers.map((t) => t.role))].sort(), [travelers]);

  const travelerToTicketMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const t of travelers) {
      if (t.ticketId) map[t.id] = t.ticketId;
    }
    return map;
  }, [travelers]);

  const stats = useMemo(() => {
    const total = travelers.length;
    const inGroups = travelers.filter((t) => t.groupId).length;
    const individuals = total - inGroups;
    const groups = new Set(travelers.filter((t) => t.groupId).map((t) => t.groupId!));
    const airportCount = new Set(travelers.map((t) => t.departureAirport)).size;
    return { total, groupsCount: groups.size, inGroups, individuals, airportCount, totalGroupPersons: inGroups };
  }, [travelers]);

  const handleShow = (t: Traveler) => {
    if (t.groupId) {
      navigate(`/groups?highlight=${t.groupId}`);
    } else {
      const ticketId = travelerToTicketMap[t.id];
      navigate(`/tickets?highlight=${ticketId || t.id}`);
    }
  };

  const handleDelete = async (t: Traveler) => {
    setDeleting(true);
    try {
      await apiDeleteTraveler(t.id);
      setTravelers((prev) => prev.filter((x) => x.id !== t.id));
      setActionTraveler(null);
      // Groups/tickets/transactions may have changed → tell other views to refresh
      window.dispatchEvent(new CustomEvent('travelers:refresh'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete traveler');
    } finally {
      setDeleting(false);
    }
  };

  const handleAcceptVisa = async (t: Traveler) => {
    setDeleting(true);
    try {
      const updated = await apiAcceptVisa(t.id);
      setTravelers((prev) => prev.map((x) => x.id === t.id ? updated : x));
      setActionTraveler(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update visa');
    } finally {
      setDeleting(false);
    }
  };

  const handleRefuseVisa = async (t: Traveler) => {
    if (!confirm(`Visa refused for ${t.name}? They will be removed from the table, their group/ticket and transactions, and a notification will be raised.`)) return;
    setDeleting(true);
    try {
      await apiRefuseVisa(t.id);
      setTravelers((prev) => prev.filter((x) => x.id !== t.id));
      setActionTraveler(null);
      window.dispatchEvent(new CustomEvent('travelers:refresh'));
      window.dispatchEvent(new CustomEvent('notifications:refresh'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to process visa refusal');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = useMemo(() => {
    return travelers.filter((t) => {
      const q = search.toLowerCase();
      const matchesSearch = !search ||
        t.name.toLowerCase().includes(q) ||
        t.email.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q) ||
        t.role.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesAirport = airportFilter === 'all' || t.departureAirport === airportFilter;
      const matchesRole = roleFilter === 'all' || t.role === roleFilter;
      const matchesKind = kindFilter === 'all' || (kindFilter === 'groups' ? !!t.groupId : !t.groupId);
      return matchesSearch && matchesStatus && matchesAirport && matchesRole && matchesKind;
    });
  }, [travelers, search, statusFilter, airportFilter, roleFilter, kindFilter]);

  if (loading) {
    return <div className="p-6 text-gray-400">Loading travelers...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Travelers</h1>
        <p className="text-gray-500 text-sm mt-1">Manage travelers for your agency</p>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => setKindFilter('all')}
          className={`text-left bg-white rounded-lg border-l-4 border-l-gray-700 border p-4 transition-all hover:bg-gray-50 ${kindFilter === 'all' ? 'border-gray-400 ring-2 ring-gray-200' : 'border-gray-200'}`}
        >
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Total Travelers</p>
        </button>
        <button
          onClick={() => setKindFilter('groups')}
          className={`text-left bg-white rounded-lg border-l-4 border-l-blue-600 border p-4 transition-all hover:bg-blue-50 ${kindFilter === 'groups' ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-200'}`}
        >
          <p className="text-3xl font-bold text-blue-700">{stats.groupsCount} <span className="text-sm font-normal text-gray-500">({stats.totalGroupPersons} p)</span></p>
          <p className="text-xs text-gray-500 font-medium mt-1">Groups</p>
        </button>
        <button
          onClick={() => setKindFilter('individuals')}
          className={`text-left bg-white rounded-lg border-l-4 border-l-purple-600 border p-4 transition-all hover:bg-purple-50 ${kindFilter === 'individuals' ? 'border-purple-400 ring-2 ring-purple-200' : 'border-gray-200'}`}
        >
          <p className="text-3xl font-bold text-purple-700">{stats.individuals}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Individuals</p>
        </button>
        <div className="bg-white rounded-lg border-l-4 border-l-amber-500 border border-gray-200 p-4">
          <p className="text-3xl font-bold text-amber-700">{stats.airportCount}</p>
          <p className="text-xs text-gray-500 font-medium mt-1">Dep. Airports</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <input
            type="text"
            placeholder="Search travelers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="waiting_organizer">Waiting for organizers</option>
        </select>
        <select value={airportFilter} onChange={(e) => setAirportFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="all">All Airports</option>
          {airports.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="all">All Roles</option>
          {roles.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Traveler</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Route</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Pref. Dates</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Reservation</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Flight Details</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Cost</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Visa</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => (
              <tr
                key={t.id}
                id={`traveler-${t.id}`}
                className={`border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${highlightId === t.id ? 'bg-teal-50 ring-2 ring-inset ring-teal-300' : ''}`}
                onClick={() => setActionTraveler(t)}
              >
                <td className="px-4 py-3">
                  <p className="font-medium text-teal-700 hover:text-teal-800">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.email}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[t.role] || 'bg-gray-100 text-gray-700'}`}>
                    {t.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600">{t.departureAirport} → {t.arrivalAirport}</td>
                <td className="px-4 py-3 text-xs align-top">
                  <div className="min-h-[2.75rem] flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    <span className="text-gray-600 font-medium">{t.departureDate}</span>
                  </div>
                  <div className="min-h-[2.75rem] flex items-center gap-1.5">
                    <svg className="w-3 h-3 text-gray-400 rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                    <span className="text-gray-600 font-medium">{t.returnDate}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {t.groupId ? (
                    <div>
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Group</span>
                      {t.groupName && (
                        <p className="text-xs text-amber-600 mt-0.5 font-medium truncate max-w-[130px]">{t.groupName}</p>
                      )}
                    </div>
                  ) : (
                    <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">Individual</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[t.status] || 'bg-gray-100 text-gray-700'}`}>
                    {statusText[t.status] || t.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs align-top">
                  {t.outboundFlight ? (
                    <div>
                      <FlightLeg flight={t.outboundFlight} />
                      {t.returnFlight && <FlightLeg flight={t.returnFlight} isReturn />}
                    </div>
                  ) : (
                    <div className="min-h-[2.75rem] flex items-center">
                      <span className="text-gray-300 italic">Not booked yet</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {t.cost > 0 ? `$${t.cost.toLocaleString()}` : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${visaColors[t.visa]}`}>
                    {(t.visa === 'not_required' || t.visa === 'accepted') && (
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    )}
                    {visaLabels[t.visa]}
                  </span>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-gray-400">No travelers found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Traveler action modal */}
      {actionTraveler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={() => !deleting && setActionTraveler(null)}>
          <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-sm text-gray-500">Traveler</p>
              <p className="text-lg font-bold text-gray-900">{actionTraveler.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">
                {actionTraveler.groupId ? `Group · ${actionTraveler.groupName || ''}` : 'Individual'} · {actionTraveler.role}
              </p>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => { const t = actionTraveler; setActionTraveler(null); handleShow(t); }}
                disabled={deleting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-teal-50 hover:border-teal-300 transition-colors disabled:opacity-60"
              >
                <svg className="w-4 h-4 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                Show him
                <span className="ml-auto text-xs text-gray-400">{actionTraveler.groupId ? 'in Groups' : 'in Tickets'}</span>
              </button>

              {/* Visa decision — only while the visa is processing */}
              {actionTraveler.visa === 'processing' && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-2">Visa is processing — what's the outcome?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAcceptVisa(actionTraveler)}
                      disabled={deleting}
                      className="flex-1 px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
                    >
                      ✓ Visa accepted
                    </button>
                    <button
                      onClick={() => handleRefuseVisa(actionTraveler)}
                      disabled={deleting}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-60"
                    >
                      ✕ Visa refused
                    </button>
                  </div>
                  <p className="text-[11px] text-blue-500 mt-2">Refused → removed everywhere + organizer notified.</p>
                </div>
              )}

              <button
                onClick={() => handleDelete(actionTraveler)}
                disabled={deleting}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors disabled:opacity-60"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                {deleting ? 'Deleting…' : 'Delete him'}
                <span className="ml-auto text-xs text-red-300">removes everywhere</span>
              </button>
            </div>
            <div className="px-4 pb-4">
              <button onClick={() => setActionTraveler(null)} disabled={deleting}
                className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
