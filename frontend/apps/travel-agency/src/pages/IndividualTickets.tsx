import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type { IndividualTicket, ProposeFareInput, FareOption } from '../types';
import {
  apiGetTickets, apiProposeTicketFare, apiAcceptTicketAIFare, apiJustifyTicketFare, apiFinalizeTicketAgencyFare, apiBookTicket, apiSendTicketChoice,
} from '../services/api';
import FareComparison from '../components/FareComparison';
import ProposeFareForm from '../components/ProposeFareForm';

const roleColors: Record<string, string> = {
  Scholar: 'bg-amber-100 text-amber-800',
  Speaker: 'bg-purple-100 text-purple-800',
};

type TicketType = 'non_refund' | 'tax_refund' | 'full_refund';
const typeLabel: Record<TicketType, string> = { non_refund: 'Non-Refund', tax_refund: 'Tax-Refund', full_refund: 'Full-Refund' };

function selectedFare(t: IndividualTicket): FareOption | null {
  if (t.aiFare?.selected) return t.aiFare;
  if (t.agencyFare?.selected) return t.agencyFare;
  return t.agencyFare || t.aiFare;
}
function availableTypes(t: IndividualTicket): { value: TicketType; price: number }[] {
  const f = selectedFare(t);
  if (!f) return [];
  const list: { value: TicketType; price: number }[] = [{ value: 'non_refund', price: f.price }];
  if (f.priceRefundableTaxes != null) list.push({ value: 'tax_refund', price: f.priceRefundableTaxes });
  if (f.priceRefundableTicket != null) list.push({ value: 'full_refund', price: f.priceRefundableTicket });
  return list;
}
function bookedPrice(t: IndividualTicket): number | null {
  const f = selectedFare(t);
  if (!f || !t.bookedType) return null;
  if (t.bookedType === 'non_refund') return f.price;
  if (t.bookedType === 'tax_refund') return f.priceRefundableTaxes ?? null;
  return f.priceRefundableTicket ?? null;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  ai_reviewing: { label: 'AI Reviewing...', color: 'bg-blue-100 text-blue-800' },
  ai_ready: { label: 'AI Reviewed', color: 'bg-purple-100 text-purple-800' },
  waiting_organizer: { label: 'Waiting for organizers', color: 'bg-amber-100 text-amber-800' },
  organizer_responded: { label: 'Organizer responded', color: 'bg-indigo-100 text-indigo-800' },
  proposed: { label: 'Proposed', color: 'bg-teal-100 text-teal-800' },
  approved: { label: 'Approved (AI)', color: 'bg-teal-100 text-teal-800' },
  approved_agency: { label: 'Approved (Agency)', color: 'bg-green-100 text-green-800' },
  justified: { label: 'Justified', color: 'bg-orange-100 text-orange-800' },
};

export default function IndividualTickets() {
  const [tickets, setTickets] = useState<IndividualTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [proposingFor, setProposingFor] = useState<string | null>(null);
  const [justifyInputs, setJustifyInputs] = useState<Record<string, string>>({});
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [bookMenu, setBookMenu] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    apiGetTickets()
      .then(setTickets)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (highlightId) setExpanded((prev) => new Set(prev).add(highlightId));
  }, [highlightId]);

  const toggleExpand = (id: string) => {
    navigate(`/tickets?highlight=${id}`, { replace: true });
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleProposeFare = async (ticket: IndividualTicket, fare: ProposeFareInput) => {
    const { ticket: updated } = await apiProposeTicketFare(ticket.id, fare);
    setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
    setProposingFor(null);
  };

  const handleAcceptAI = async (ticket: IndividualTicket) => {
    if (!ticket.aiFare) return;
    try {
      const { ticket: updated } = await apiAcceptTicketAIFare(ticket.id);
      setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      window.dispatchEvent(new CustomEvent('travelers:refresh'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to accept AI fare');
    }
  };

  const handleJustify = async (ticket: IndividualTicket) => {
    const justification = justifyInputs[ticket.id] || '';
    if (justification.trim().length < 20) {
      alert('Justification must be at least 20 characters');
      return;
    }
    try {
      const { ticket: updated } = await apiJustifyTicketFare(ticket.id, justification);
      setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      setJustifyInputs((prev) => { const n = { ...prev }; delete n[ticket.id]; return n; });
      window.dispatchEvent(new CustomEvent('travelers:refresh'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit justification');
    }
  };

  const handleFinalizeAgency = async (ticket: IndividualTicket) => {
    try {
      const { ticket: updated } = await apiFinalizeTicketAgencyFare(ticket.id);
      setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      window.dispatchEvent(new CustomEvent('travelers:refresh'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to confirm agency fare');
    }
  };

  const handleBook = async (ticket: IndividualTicket, type: TicketType) => {
    setBookMenu(null);
    try {
      const { ticket: updated } = await apiBookTicket(ticket.id, type);
      setTickets((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      window.dispatchEvent(new CustomEvent('travelers:refresh'));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark as booked');
    }
  };

  const handleSendChoice = async (ticket: IndividualTicket) => {
    try {
      const { to } = await apiSendTicketChoice(ticket.id);
      alert(`Ticket options emailed to organizer (${to}).`);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to send ticket options');
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading tickets...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Individual Tickets</h1>
        <p className="text-gray-500 text-sm mt-1">Manage individual traveler ticket proposals and AI fare options</p>
      </div>

      <div className="space-y-3">
        {tickets.map((ticket) => {
          const isOpen = expanded.has(ticket.id);
          const isHighlighted = highlightId === ticket.id;

          return (
            <div
              key={ticket.id}
              className={`bg-white rounded-xl border overflow-hidden transition-all ${
                isHighlighted ? 'border-teal-400 ring-2 ring-teal-100' : 'border-gray-200'
              }`}
            >
              <div
                className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
                onClick={() => toggleExpand(ticket.id)}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3
                        onClick={(e) => { e.stopPropagation(); navigate(`/travelers?highlight=${ticket.travelerId}`); }}
                        className="text-lg font-semibold text-teal-700 hover:underline cursor-pointer"
                        title="View in Travelers"
                      >{ticket.travelerName}</h3>
                      {ticket.roleOverride && (
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${roleColors[ticket.roleOverride] || 'bg-gray-100 text-gray-700'}`}>
                          {ticket.roleOverride}
                        </span>
                      )}
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusLabels[ticket.status]?.color}`}>
                        {statusLabels[ticket.status]?.label}
                      </span>
                      {ticket.booked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                          Booked · {ticket.bookedType ? typeLabel[ticket.bookedType] : ''}{bookedPrice(ticket) != null ? ` $${bookedPrice(ticket)!.toLocaleString()}` : ''}
                        </span>
                      ) : (ticket.status === 'approved' || ticket.status === 'approved_agency') ? (
                        <span className="inline-flex items-center gap-1.5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSendChoice(ticket); }}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border border-teal-300 text-teal-700 hover:bg-teal-50 transition-colors"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>
                            Choose the ticket
                          </button>
                          <span className="relative">
                            <button
                              onClick={(e) => { e.stopPropagation(); setBookMenu(bookMenu === ticket.id ? null : ticket.id); }}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path d="M5 13l4 4L19 7"/></svg>
                              Mark as booked
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                            </button>
                            {bookMenu === ticket.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setBookMenu(null); }} />
                                <div className="absolute z-20 mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-44">
                                  {availableTypes(ticket).map((o) => (
                                    <button
                                      key={o.value}
                                      onClick={(e) => { e.stopPropagation(); handleBook(ticket, o.value); }}
                                      className="w-full text-left px-3 py-1.5 text-xs hover:bg-gray-50 flex items-center justify-between gap-2"
                                    >
                                      <span>Booked · {typeLabel[o.value]}</span>
                                      <span className="font-semibold text-gray-700">${o.price.toLocaleString()}</span>
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </span>
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{ticket.destination}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
                        <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                        {ticket.departureAirport} → {ticket.arrivalAirport}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{ticket.departureDate} – {ticket.returnDate}</p>
                  </div>
                </div>
                <span className="text-gray-300 text-xs shrink-0">{isOpen ? '▲' : '▼'}</span>
              </div>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-4">

                  {/* No fare yet — Propose Fare button or form */}
                  {ticket.status === 'pending' && (
                    proposingFor === ticket.id ? (
                      <ProposeFareForm
                        title="Propose a Ticket Fare"
                        variant="ticket"
                        outboundRoute={{ from: ticket.departureAirport, to: ticket.arrivalAirport }}
                        returnRoute={{ from: ticket.arrivalAirport, to: ticket.departureAirport }}
                        onCancel={() => setProposingFor(null)}
                        onSubmit={(fare) => handleProposeFare(ticket, fare)}
                      />
                    ) : (
                      <button
                        onClick={() => setProposingFor(ticket.id)}
                        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                          <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                        Propose Fare
                      </button>
                    )
                  )}

                  {/* Fare comparison */}
                  {(ticket.agencyFare || ticket.aiFare) && (
                    <FareComparison agencyFare={ticket.agencyFare} aiFare={ticket.aiFare} paxCount={1} />
                  )}

                  {/* Agency decision */}
                  {ticket.status === 'ai_ready' && (
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Agency Decision</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAcceptAI(ticket)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-teal-50 hover:border-teal-300 transition-colors"
                        >
                          👍 Accept AI fare
                        </button>
                        <button
                          onClick={() => setJustifyInputs((p) => ({ ...p, [ticket.id]: p[ticket.id] ?? '' }))}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                        >
                          👎 Keep original + justify
                        </button>
                      </div>
                      {ticket.id in justifyInputs && (
                        <div className="flex gap-2 mt-3">
                          <textarea
                            value={justifyInputs[ticket.id]}
                            onChange={(e) => setJustifyInputs((p) => ({ ...p, [ticket.id]: e.target.value }))}
                            placeholder="Why keep the agency fare? (min. 20 characters)..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                            rows={2}
                          />
                          <button
                            onClick={() => handleJustify(ticket)}
                            className="px-4 py-1.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors self-end"
                          >
                            Submit
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Waiting for organizer */}
                  {ticket.status === 'waiting_organizer' && (
                    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                      <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                        <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        Waiting for organizers
                      </p>
                      <p className="text-xs text-amber-700 mt-1">The justification and AI alternative link were sent to the organizer for a final review.</p>
                      {ticket.justification && (
                        <p className="text-xs text-gray-600 mt-2 italic bg-white border border-amber-100 rounded p-2">"{ticket.justification}"</p>
                      )}
                      <div className="mt-3 pt-3 border-t border-amber-200">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-amber-700/80 mb-2">Organizer replied? Apply their choice</p>
                        <div className="flex gap-2">
                          <button onClick={() => handleAcceptAI(ticket)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-violet-300 text-violet-700 rounded-lg text-sm font-medium hover:bg-violet-50 transition-colors">
                            👍 Accept AI fare
                          </button>
                          <button onClick={() => handleFinalizeAgency(ticket)}
                            className="flex items-center gap-2 px-4 py-2 bg-white border border-teal-300 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-50 transition-colors">
                            ✓ Keep agency fare
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Organizer responded → finalize */}
                  {ticket.status === 'organizer_responded' && (
                    <div>
                      <div className={`rounded-lg border p-3 mb-3 ${ticket.organizerRecommendation === 'ai' ? 'border-violet-200 bg-violet-50' : 'border-teal-200 bg-teal-50'}`}>
                        <p className="text-sm font-semibold text-gray-800">
                          🧑‍💼 Organizer recommends the <span className={ticket.organizerRecommendation === 'ai' ? 'text-violet-700' : 'text-teal-700'}>{ticket.organizerRecommendation === 'ai' ? 'AI fare' : 'agency fare'}</span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">Make the final choice below.</p>
                      </div>
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Final Decision</p>
                      <div className="flex gap-2">
                        <button onClick={() => handleAcceptAI(ticket)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-violet-50 hover:border-violet-300 transition-colors">
                          👍 Accept AI fare
                        </button>
                        <button onClick={() => handleFinalizeAgency(ticket)}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-teal-50 hover:border-teal-300 transition-colors">
                          ✓ Confirm agency fare
                        </button>
                      </div>
                    </div>
                  )}

                  {(ticket.status === 'approved' || ticket.status === 'approved_agency') && (
                    <span className="inline-block text-sm text-green-600 font-medium">✓ Approved</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {tickets.length === 0 && (
          <div className="text-center text-gray-400 py-12">No individual tickets found</div>
        )}
      </div>
    </div>
  );
}
