import { useState, useMemo, useEffect } from 'react';
import type { Traveler, GroupProposal } from '../types';
import { apiGetTravelers, apiGetGroups, apiCreateGroup, apiAddTravelersToGroup } from '../services/api';
import CalendarPicker from './CalendarPicker';

interface Props {
  preselectedTraveler?: Traveler;
  onClose: () => void;
  onCreated: (group: GroupProposal) => void;
}

type Mode = 'create' | 'add';

const PALETTE = [
  'bg-teal-100 text-teal-700', 'bg-purple-100 text-purple-700',
  'bg-amber-100 text-amber-700', 'bg-blue-100 text-blue-700',
  'bg-rose-100 text-rose-700', 'bg-emerald-100 text-emerald-700',
];

function initials(name: string) {
  return name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

export default function GenerateGroupModal({ preselectedTraveler, onClose, onCreated }: Props) {
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [groups,    setGroups]    = useState<GroupProposal[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  const [mode,          setMode]          = useState<Mode>('create');
  const [airportFilter, setAirportFilter] = useState('All airports');
  const [selected,      setSelected]      = useState<Set<string>>(
    preselectedTraveler ? new Set([preselectedTraveler.id]) : new Set()
  );
  const [groupName,     setGroupName]     = useState('');
  const [targetGroupId, setTargetGroupId] = useState('');
  const [depDate,       setDepDate]       = useState(preselectedTraveler?.departureDate || '');
  const [retDate,       setRetDate]       = useState(preselectedTraveler?.returnDate    || '');
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState('');

  useEffect(() => {
    Promise.all([apiGetTravelers(), apiGetGroups()])
      .then(([t, g]) => { setTravelers(t); setGroups(g); })
      .catch(() => {})
      .finally(() => setDataLoading(false));
  }, []);

  const scholars = useMemo(() => travelers.filter((t) => t.role === 'Scholar'), [travelers]);
  const airports = useMemo(() => ['All airports', ...new Set(scholars.map((t) => t.departureAirport))], [scholars]);

  const filtered = useMemo(() => {
    const list = scholars.filter((t) => {
      if (airportFilter !== 'All airports' && t.departureAirport !== airportFilter) return false;
      return true;
    });
    // Pin the preselected traveler to the top so the agency sees them immediately
    if (preselectedTraveler) {
      list.sort((a, b) =>
        a.id === preselectedTraveler.id ? -1 : b.id === preselectedTraveler.id ? 1 : 0
      );
    }
    return list;
  }, [scholars, airportFilter, preselectedTraveler]);

  const toggle = (id: string, inGroup: boolean) => {
    if (mode === 'create' && inGroup) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () =>
    setSelected(new Set(filtered.filter((t) => mode === 'add' || !t.groupId).map((t) => t.id)));
  const clearAll = () => setSelected(new Set());

  const switchMode = (m: Mode) => {
    setMode(m);
    setAirportFilter('All airports');
    setSelected(preselectedTraveler ? new Set([preselectedTraveler.id]) : new Set());
    setError('');
  };

  const handleSubmit = async () => {
    if (selected.size === 0) { setError('Select at least one traveler'); return; }

    if (mode === 'create') {
      if (!groupName.trim()) { setError('Group name is required'); return; }
      if (!depDate || !retDate) { setError('Please set departure and return dates'); return; }
      const anyT = travelers.find((t) => selected.has(t.id));

      setLoading(true); setError('');
      try {
        const group = await apiCreateGroup({
          name: groupName.trim(), departureDate: depDate, returnDate: retDate,
          departureAirport: airportFilter !== 'All airports' ? airportFilter : (anyT?.departureAirport || 'TBD'),
          arrivalAirport: 'DXB', destination: 'Dubai, UAE',
          travelerIds: Array.from(selected),
        });
        window.dispatchEvent(new CustomEvent('travelers:refresh'));
        onCreated(group);
      } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
      finally { setLoading(false); }
    } else {
      if (!targetGroupId) { setError('Select an existing group'); return; }
      setLoading(true); setError('');
      try {
        const group = await apiAddTravelersToGroup(targetGroupId, Array.from(selected));
        window.dispatchEvent(new CustomEvent('travelers:refresh'));
        onCreated(group);
      } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); }
      finally { setLoading(false); }
    }
  };

  const modalTitle = preselectedTraveler
    ? `Generate Group for ${preselectedTraveler.name}`
    : 'Generate Group';

  const modalSubtitle = preselectedTraveler
    ? 'Pre-selected. Add more scholars or proceed.'
    : 'Select travelers by departure and arrival, then name your group';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="bg-teal-600 px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-white font-bold text-lg">{modalTitle}</h2>
            <p className="text-teal-100 text-sm">{modalSubtitle}</p>
          </div>
          <button onClick={onClose} className="text-teal-200 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-gray-200 shrink-0">
          {([['create', 'Create New Group'], ['add', 'Add to Existing Group']] as [Mode, string][]).map(([m, label]) => (
            <button key={m} onClick={() => switchMode(m)}
              className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                mode === m
                  ? 'text-teal-700 border-b-2 border-teal-600 bg-teal-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="px-6 pt-4 pb-3 border-b border-gray-100 space-y-2.5 shrink-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 w-16">FROM:</span>
            {airports.map((a) => (
              <button key={a} onClick={() => setAirportFilter(a)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  airportFilter === a ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                }`}>{a}</button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 w-16">TO:</span>
            <button className="px-3 py-1 rounded-full text-xs font-medium bg-teal-600 text-white border border-teal-600">All</button>
            <button className="px-3 py-1 rounded-full text-xs font-medium bg-white text-gray-600 border border-gray-300">DXB — Dubai</button>
          </div>
        </div>

        {/* Count + select all */}
        <div className="px-6 py-2 border-b border-gray-100 flex items-center justify-between shrink-0">
          <p className="text-sm text-gray-500">
            <span className="font-medium text-gray-800">{filtered.length} travelers shown</span> · {selected.size} selected
            {mode === 'add' && <span className="text-teal-600 ml-1">(all selectable in this mode)</span>}
          </p>
          <div className="flex gap-3">
            <button onClick={selectAll} className="text-sm font-medium text-teal-600 hover:underline">Select all</button>
            <button onClick={clearAll}  className="text-sm font-medium text-gray-400 hover:underline">Clear</button>
          </div>
        </div>

        {/* Traveler list */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
          {dataLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin"/>
            </div>
          ) : filtered.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-400 text-sm">No scholars match the current filters</div>
          ) : (
            filtered.map((t, i) => {
              const inGroup   = !!t.groupId;
              const disabled  = mode === 'create' && inGroup;
              const isChecked = selected.has(t.id);
              const isPreselectd = preselectedTraveler?.id === t.id;
              const palette   = PALETTE[i % PALETTE.length];
              return (
                <label key={t.id}
                  className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                    disabled ? 'opacity-60 cursor-default' : 'cursor-pointer hover:bg-gray-50'
                  } ${isChecked ? 'bg-teal-50' : ''} ${isPreselectd ? 'border-l-2 border-l-teal-500' : ''}`}>
                  <input type="checkbox" checked={isChecked} disabled={disabled}
                    onChange={() => toggle(t.id, inGroup)}
                    className="w-4 h-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500 shrink-0" />
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${palette}`}>
                    {initials(t.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-sm font-semibold ${isPreselectd ? 'text-teal-700' : 'text-gray-900'}`}>{t.name}</span>
                      {isPreselectd && <span className="text-xs px-1.5 py-0.5 rounded bg-teal-100 text-teal-700 font-medium">preselected</span>}
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">Scholar</span>
                      {inGroup && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          mode === 'add' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
                        }`}>
                          {mode === 'add' ? `in: ${t.groupName || 'a group'}` : 'already in a group'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {t.departureAirport} → {t.arrivalAirport} · Pref: {t.departureDate} – {t.returnDate}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{t.departureAirport} → DXB</span>
                </label>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

          {mode === 'create' ? (
            <div className="flex items-end gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1">
                  Group name <span className="text-red-500">*</span>
                </label>
                <input value={groupName} onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Gulf Scholars Batch 2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <CalendarPicker label="Departure" value={depDate} onChange={setDepDate} placeholder="Pick date" className="w-40" />
              <CalendarPicker label="Return"    value={retDate} onChange={setRetDate} placeholder="Pick date" className="w-40" />
            </div>
          ) : (
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Add selected travelers to <span className="text-red-500">*</span>
              </label>
              <select value={targetGroupId} onChange={(e) => setTargetGroupId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">— Select an existing group —</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.groupName} ({g.size} members · {g.departureAirport} → {g.arrivalAirport})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={onClose}
              className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/>
              </svg>
              {loading ? 'Processing…' : mode === 'create'
                ? `Create group (${selected.size} traveler${selected.size !== 1 ? 's' : ''})`
                : `Add to group (${selected.size} traveler${selected.size !== 1 ? 's' : ''})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
