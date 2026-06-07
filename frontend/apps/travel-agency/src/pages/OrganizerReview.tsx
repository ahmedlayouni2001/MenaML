import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { GroupProposal, IndividualTicket } from '../types';
import { apiGetOrganizerReviews, apiRespondOrganizerReview } from '../services/api';
import FareComparison from '../components/FareComparison';

interface ReviewItem {
  refType: 'group' | 'ticket';
  refId: string;
  title: string;
  subtitle: string;
  justification?: string;
  agencyFare: GroupProposal['agencyFare'];
  aiFare: GroupProposal['aiFare'];
  pax: number;
}

export default function OrganizerReview() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [items, setItems] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [tokenError, setTokenError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [doneMsg, setDoneMsg] = useState('');

  const load = () => {
    if (!token) { setTokenError('Invalid link — no token found.'); setLoading(false); return; }
    apiGetOrganizerReviews(token)
      .then(({ groups, tickets }) => {
        const g: ReviewItem[] = groups.map((gr: GroupProposal) => ({
          refType: 'group', refId: gr.id, title: gr.groupName,
          subtitle: `${gr.size} travelers · ${gr.departureAirport} → ${gr.arrivalAirport}`,
          justification: gr.justification, agencyFare: gr.agencyFare, aiFare: gr.aiFare, pax: gr.size,
        }));
        const t: ReviewItem[] = tickets.map((tk: IndividualTicket) => ({
          refType: 'ticket', refId: tk.id, title: tk.travelerName,
          subtitle: `Individual · ${tk.departureAirport} → ${tk.arrivalAirport}`,
          justification: tk.justification, agencyFare: tk.agencyFare, aiFare: tk.aiFare, pax: 1,
        }));
        setItems([...g, ...t]);
      })
      .catch(() => setTokenError('Invalid or expired link.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, [token]);

  const respond = async (item: ReviewItem, recommendation: 'agency' | 'ai') => {
    setBusyId(item.refId + item.refType);
    try {
      await apiRespondOrganizerReview(token, item.refType, item.refId, recommendation);
      setItems((prev) => prev.filter((i) => !(i.refId === item.refId && i.refType === item.refType)));
      setDoneMsg('Thank you — your review was sent to the agency.');
      setTimeout(() => setDoneMsg(''), 4000);
    } catch {
      alert('Failed to submit review');
    } finally {
      setBusyId(null);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center max-w-md w-full">
          <p className="text-red-600 font-medium">{tokenError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-teal-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">✈️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Flight Fare Reviews</h1>
          <p className="text-gray-500 mt-1">The agency kept its own fare and asked for your final decision.</p>
        </div>

        {doneMsg && (
          <div className="mb-6 text-center text-sm text-teal-700 bg-teal-50 border border-teal-200 rounded-lg px-4 py-3">{doneMsg}</div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-12">Loading…</div>
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-10 text-center">
            <p className="text-gray-700 font-medium">No pending reviews 🎉</p>
            <p className="text-gray-400 text-sm mt-1">Everything has been handled. You can close this page.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {items.map((item) => (
              <div key={item.refType + item.refId} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Needs your review</span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{item.subtitle}</p>

                {item.justification && (
                  <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Agency justification</p>
                    <p className="text-sm text-gray-700 italic">"{item.justification}"</p>
                  </div>
                )}

                <FareComparison agencyFare={item.agencyFare} aiFare={item.aiFare} paxCount={item.pax} />
                <p className="text-xs text-gray-400 mt-2">
                  Tip: use the “Verify on …” link on the AI card to check the AI fare yourself.
                </p>

                <div className="flex gap-3 mt-5">
                  <button
                    onClick={() => respond(item, 'agency')}
                    disabled={busyId === item.refId + item.refType}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold border border-teal-300 text-teal-700 hover:bg-teal-50 transition-colors disabled:opacity-60"
                  >
                    Continue with agency fare
                  </button>
                  <button
                    onClick={() => respond(item, 'ai')}
                    disabled={busyId === item.refId + item.refType}
                    className="flex-1 py-2.5 rounded-lg text-sm font-semibold bg-violet-600 text-white hover:bg-violet-700 transition-colors disabled:opacity-60"
                  >
                    Continue with AI fare
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
