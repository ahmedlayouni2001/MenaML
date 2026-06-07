import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { GroupProposal, ProposeFareInput } from '../types';
import { apiGetGroups, apiAcceptAIFare, apiJustifyFare, apiProposeGroupFare, apiFinalizeAgencyFare, apiBookGroup } from '../services/api';
import FareComparison from '../components/FareComparison';
import ProposeFareForm from '../components/ProposeFareForm';
import GenerateGroupModal from '../components/GenerateGroupModal';

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  ai_reviewing: { label: 'AI Reviewing...', color: 'bg-blue-100 text-blue-800' },
  ai_ready: { label: 'AI Reviewed', color: 'bg-purple-100 text-purple-800' },
  waiting_organizer: { label: 'Waiting for organizers', color: 'bg-amber-100 text-amber-800' },
  organizer_responded: { label: 'Organizer responded', color: 'bg-indigo-100 text-indigo-800' },
  approved_ai: { label: 'Approved (AI)', color: 'bg-teal-100 text-teal-800' },
  approved_agency: { label: 'Approved (Agency)', color: 'bg-green-100 text-green-800' },
  justified: { label: 'Justified', color: 'bg-orange-100 text-orange-800' },
};

export default function Groups() {
  const [groups, setGroups] = useState<GroupProposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGenerate, setShowGenerate] = useState(false);
  const [justifyInputs, setJustifyInputs] = useState<Record<string, string>>({});
  const [proposingFor, setProposingFor] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  useEffect(() => {
    apiGetGroups()
      .then(setGroups)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (highlightId) setExpanded((prev) => new Set(prev).add(highlightId));
  }, [highlightId]);

  const toggleExpand = (id: string) => {
    navigate(`/groups?highlight=${id}`, { replace: true });
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleProposeFare = async (group: GroupProposal, fare: ProposeFareInput) => {
    const { group: updated } = await apiProposeGroupFare(group.id, fare);
    setGroups((prev) => prev.map((g) => g.id === updated.id ? updated : g));
    setProposingFor(null);
  };

  const handleAcceptAI = async (group: GroupProposal) => {
    if (!group.aiFare) return;
    try {
      const { group: updated } = await apiAcceptAIFare(group.id);
      setGroups((prev) => prev.map((g) => g.id === updated.id ? updated : g));
      window.dispatchEvent(new CustomEvent('travelers:refresh'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to accept AI fare');
    }
  };

  const handleJustify = async (group: GroupProposal) => {
    const justification = justifyInputs[group.id] || '';
    if (!group.agencyFare) return;
    if (justification.trim().length < 20) {
      alert('Justification must be at least 20 characters');
      return;
    }
    try {
      const { group: updated } = await apiJustifyFare(group.id, justification);
      setGroups((prev) => prev.map((g) => g.id === updated.id ? updated : g));
      setJustifyInputs((prev) => { const n = { ...prev }; delete n[group.id]; return n; });
      window.dispatchEvent(new CustomEvent('travelers:refresh'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit justification');
    }
  };

  const handleFinalizeAgency = async (group: GroupProposal) => {
    try {
      const { group: updated } = await apiFinalizeAgencyFare(group.id);
      setGroups((prev) => prev.map((g) => g.id === updated.id ? updated : g));
      window.dispatchEvent(new CustomEvent('travelers:refresh'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to confirm agency fare');
    }
  };

  const handleBook = async (group: GroupProposal) => {
    try {
      const { group: updated } = await apiBookGroup(group.id);
      setGroups((prev) => prev.map((g) => g.id === updated.id ? updated : g));
      window.dispatchEvent(new CustomEvent('travelers:refresh'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as booked');
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading groups...</div>;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Group Proposals</h1>
          <p className="text-gray-500 text-sm mt-1">Manage group travel bookings and AI fare comparisons</p>
        </div>
        <button
          onClick={() => setShowGenerate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0"/></svg>
          Generate Group
        </button>
      </div>

      {showGenerate && (
        <GenerateGroupModal
          onClose={() => setShowGenerate(false)}
          onCreated={(group) => {
            setGroups((prev) => {
              const exists = prev.find((g) => g.id === group.id);
              return exists ? prev.map((g) => g.id === group.id ? group : g) : [group, ...prev];
            });
            setShowGenerate(false);
          }}
        />
      )}

      <div className="space-y-3">
        {groups.map((group) => {
          const isOpen = expanded.has(group.id);
          const isHighlighted = highlightId === group.id;

          return (
            <div
              key={group.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                isHighlighted ? 'border-teal-400 ring-2 ring-teal-100' : 'border-gray-200'
              }`}
            >
              <div
                className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(group.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900">{group.groupName}</h3>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[group.status]?.color}`}>
                        {statusLabels[group.status]?.label}
                      </span>
                      {group.booked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                          Booked
                        </span>
                      ) : (group.status === 'approved_ai' || group.status === 'approved_agency') ? (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleBook(group); }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path d="M5 13l4 4L19 7"/></svg>
                          Mark as booked
                        </button>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{group.size} travelers · {group.destination}</p>
                    <div className="mt-1.5 space-y-1">
                      {/* Outbound */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                          <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                          {group.departureAirport} → {group.arrivalAirport}
                        </span>
                        <span className="text-xs text-gray-400">{group.departureDate}</span>
                      </div>
                      {/* Return */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                          <svg className="w-3 h-3 text-gray-400 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                          {group.arrivalAirport} → {group.departureAirport}
                        </span>
                        <span className="text-xs text-gray-400">{group.returnDate}</span>
                      </div>
                      {(() => {
                        const chosen = group.aiFare?.selected ? group.aiFare : group.agencyFare?.selected ? group.agencyFare : null;
                        return chosen ? (
                          <span className="text-xs font-semibold text-teal-700">Total: ${(chosen.price * group.size).toLocaleString()}</span>
                        ) : null;
                      })()}
                    </div>
                  </div>
                </div>
                <span className="text-gray-300 text-xs shrink-0">{isOpen ? '▲' : '▼'}</span>
              </div>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-100">

                  {/* ── Group Members ── */}
                  {group.members.length > 0 && (
                    <div className="mb-5">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
                        Group Members · {group.members.length}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {group.members.map((m, i) => {
                          const initials = m.name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();
                          const palettes = [
                            'bg-teal-100 text-teal-700',
                            'bg-purple-100 text-purple-700',
                            'bg-amber-100 text-amber-700',
                            'bg-blue-100 text-blue-700',
                            'bg-rose-100 text-rose-700',
                            'bg-emerald-100 text-emerald-700',
                          ];
                          const palette = palettes[i % palettes.length];
                          return (
                            <button
                              key={m.id}
                              onClick={() => navigate(`/travelers?highlight=${m.id}`)}
                              title="View in Travelers"
                              className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md hover:border-teal-300 transition-all"
                            >
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${palette}`}>
                                {initials}
                              </div>
                              <span className="text-sm text-gray-700 font-medium whitespace-nowrap">{m.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* No fare yet — show Propose Fare button or the form */}
                  {group.status === 'pending' && (
                    proposingFor === group.id ? (
                      <ProposeFareForm
                        title="Propose a Group Fare"
                        variant="group"
                        outboundRoute={{ from: group.departureAirport, to: group.arrivalAirport }}
                        returnRoute={{ from: group.arrivalAirport, to: group.departureAirport }}
                        onCancel={() => setProposingFor(null)}
                        onSubmit={(fare) => handleProposeFare(group, fare)}
                      />
                    ) : (
                      <button
                        onClick={() => setProposingFor(group.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                          <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                        Propose Fare
                      </button>
                    )
                  )}

                  {/* Fare comparison once proposed */}
                  {(group.agencyFare || group.aiFare) && (
                    <FareComparison agencyFare={group.agencyFare} aiFare={group.aiFare} paxCount={group.size} />
                  )}

                  {/* Agency decision */}
                  {group.status === 'ai_ready' && (
                    <div className="mt-4">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Agency Decision</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptAI(group)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-teal-50 hover:border-teal-300 transition-colors"
                        >
                          👍 Accept AI fare
                        </button>
                        <button
                          onClick={() => setJustifyInputs((p) => ({ ...p, [group.id]: p[group.id] ?? '' }))}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          👎 Keep original + justify
                        </button>
                      </div>
                      {group.id in justifyInputs && (
                        <div className="flex gap-2 mt-3">
                          <textarea
                            value={justifyInputs[group.id]}
                            onChange={(e) => setJustifyInputs((p) => ({ ...p, [group.id]: e.target.value }))}
                            placeholder="Why keep the agency fare? (min. 20 characters)..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            rows={2}
                          />
                          <button
                            onClick={() => handleJustify(group)}
                            className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors self-end"
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Waiting for organizer */}
                  {group.status === 'waiting_organizer' && (
                    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                        <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        Waiting for organizers
                      </p>
                      <p className="text-xs text-amber-700 mt-1">The agency kept its own fare. The justification and AI alternative link were sent to the organizer for a final review.</p>
                      {group.justification && (
                        <p className="text-xs text-gray-600 mt-2 italic bg-white border border-amber-100 rounded p-2">"{group.justification}"</p>
                      )}
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700/80 mb-2">Organizer replied? Apply their choice</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleAcceptAI(group)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-violet-300 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-50 transition-colors">
                            👍 Accept AI fare
                          </button>
                          <button onClick={() => handleFinalizeAgency(group)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-teal-300 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors">
                            ✓ Keep agency fare
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Organizer responded → agency finalizes */}
                  {group.status === 'organizer_responded' && (
                    <div className="mt-4">
                      <div className={`rounded-lg border p-3 mb-3 ${group.organizerRecommendation === 'ai' ? 'border-violet-200 bg-violet-50' : 'border-teal-200 bg-teal-50'}`}>
                        <p className="text-sm font-semibold text-gray-800">
                          🧑‍💼 Organizer recommends the <span className={group.organizerRecommendation === 'ai' ? 'text-violet-700' : 'text-teal-700'}>{group.organizerRecommendation === 'ai' ? 'AI fare' : 'agency fare'}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Make the final choice below.</p>
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Final Decision</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptAI(group)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-violet-50 hover:border-violet-300 transition-colors">
                          👍 Accept AI fare
                        </button>
                        <button onClick={() => handleFinalizeAgency(group)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-teal-50 hover:border-teal-300 transition-colors">
                          ✓ Confirm agency fare
                        </button>
                      </div>
                    </div>
                  )}

                  {(group.status === 'approved_ai' || group.status === 'approved_agency') && (
                    <span className="inline-block mt-4 text-sm text-green-600 font-medium">✓ Approved</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {groups.length === 0 && (
          <div className="text-center text-gray-400 py-12">No group proposals found</div>
        )}
      </div>
    </div>
  );
}
