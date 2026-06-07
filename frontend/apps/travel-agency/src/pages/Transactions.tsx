import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Transaction } from '../types';
import { apiGetTransactions, apiGetTransactionSummary, apiSetPaymentStatus } from '../services/api';

// Workflow status — same labels/colors as the Groups & Individuals pages
const workflowLabels: Record<string, { label: string; color: string }> = {
  pending:             { label: 'Pending',                color: 'bg-gray-100 text-gray-700' },
  ai_reviewing:        { label: 'AI Reviewing...',        color: 'bg-blue-100 text-blue-800' },
  ai_ready:            { label: 'AI Reviewed',            color: 'bg-purple-100 text-purple-800' },
  waiting_organizer:   { label: 'Waiting for organizers', color: 'bg-amber-100 text-amber-800' },
  organizer_responded: { label: 'Organizer responded',   color: 'bg-indigo-100 text-indigo-800' },
  approved_ai:         { label: 'Approved (AI)',          color: 'bg-teal-100 text-teal-800' },
  approved:            { label: 'Approved (AI)',          color: 'bg-teal-100 text-teal-800' },
  approved_agency:     { label: 'Approved (Agency)',      color: 'bg-green-100 text-green-800' },
  justified:           { label: 'Justified',              color: 'bg-orange-100 text-orange-800' },
  proposed:            { label: 'Proposed',               color: 'bg-teal-100 text-teal-800' },
};

// Payment status (the editable "Paid" column)
const PAID_META: Record<string, { label: string; color: string }> = {
  not_paid:         { label: 'Not Paid',    color: 'bg-gray-100 text-gray-600' },
  paid:             { label: 'Paid',        color: 'bg-green-100 text-green-700' },
  paid_full_refund: { label: 'Full-Refund', color: 'bg-blue-100 text-blue-700' },
  paid_tax_refund:  { label: 'Tax-Refund',  color: 'bg-violet-100 text-violet-700' },
};
const paidMeta = (v: string) => PAID_META[v];

const typeLabel: Record<string, string> = { non_refund: 'Non-Refund', tax_refund: 'Tax-Refund', full_refund: 'Full-Refund' };
// Maps a ticket's booked refund type to its paid value.
const paidValueForType: Record<string, string> = { non_refund: 'paid', tax_refund: 'paid_tax_refund', full_refund: 'paid_full_refund' };

// Groups: simple paid/not-paid. Individuals: not-paid + the paid option matching the booked type.
const optionsFor = (t: Transaction): string[] => {
  if (t.type === 'group') return ['not_paid', 'paid'];
  const paidVal = t.bookedType ? paidValueForType[t.bookedType] : 'paid';
  return ['not_paid', paidVal];
};

type Filter = 'all' | 'paid' | 'full' | 'tax' | 'refunded';

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ totalPaid: 0, fullRefund: 0, taxRefund: 0, totalRefunded: 0, grandTotal: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('paid');
  const [openPayId, setOpenPayId] = useState<string | null>(null);
  const navigate = useNavigate();

  const load = () => {
    Promise.all([apiGetTransactions(), apiGetTransactionSummary()])
      .then(([txns, sum]) => { setTransactions(txns); setSummary(sum); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    window.addEventListener('travelers:refresh', load);
    return () => window.removeEventListener('travelers:refresh', load);
  }, []);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      const isPaid = t.paidStatus === 'paid' || t.paidStatus === 'paid_full_refund' || t.paidStatus === 'paid_tax_refund';
      switch (filter) {
        // "Total Paid" is the default view — also surface booked-but-unpaid rows so new bookings appear.
        case 'paid':     return isPaid || t.booked;
        case 'full':     return t.paidStatus === 'paid_full_refund';
        case 'tax':      return t.paidStatus === 'paid_tax_refund';
        case 'refunded': return t.paidStatus === 'paid_full_refund' || t.paidStatus === 'paid_tax_refund';
        default:         return true;
      }
    });
  }, [transactions, filter]);

  const handleReferenceClick = (t: Transaction) => {
    if (t.type === 'group') navigate(`/groups?highlight=${t.referenceId}`);
    else navigate(`/tickets?highlight=${t.referenceId}`);
  };

  const handlePay = async (t: Transaction, value: Transaction['paidStatus']) => {
    setOpenPayId(null);
    try {
      const updated = await apiSetPaymentStatus(t.id, value);
      setTransactions((prev) => prev.map((x) => x.id === t.id ? updated : x));
      const sum = await apiGetTransactionSummary();
      setSummary(sum);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update payment');
    }
  };

  const cards: { key: Filter; label: string; value: number; border: string; text: string; hover: string; active: string }[] = [
    { key: 'paid',     label: 'Total Paid',     value: summary.totalPaid,     border: 'border-l-green-600',  text: 'text-green-700',  hover: 'hover:bg-green-50',  active: 'bg-green-50 ring-green-300' },
    { key: 'tax',      label: 'Tax-Refund',     value: summary.taxRefund,     border: 'border-l-violet-600', text: 'text-violet-700', hover: 'hover:bg-violet-50', active: 'bg-violet-50 ring-violet-300' },
    { key: 'full',     label: 'Full-Refund',    value: summary.fullRefund,    border: 'border-l-blue-600',   text: 'text-blue-700',   hover: 'hover:bg-blue-50',   active: 'bg-blue-50 ring-blue-300' },
    { key: 'refunded', label: 'Total Refunded', value: summary.totalRefunded, border: 'border-l-red-600',    text: 'text-red-700',    hover: 'hover:bg-red-50',    active: 'bg-red-50 ring-red-300' },
    { key: 'all',      label: 'Grand Total',    value: summary.grandTotal,    border: 'border-l-gray-700',   text: 'text-gray-900',   hover: 'hover:bg-gray-50',   active: 'bg-gray-50 ring-gray-300' },
  ];

  if (loading) return <div className="p-6 text-gray-400">Loading transactions...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <p className="text-gray-500 text-sm mt-1">Financial overview and transaction history</p>
      </div>

      <div className="grid grid-cols-5 gap-3 mb-6">
        {cards.map((c) => (
          <button
            key={c.key}
            onClick={() => setFilter(c.key)}
            className={`bg-white rounded-lg border-l-4 ${c.border} border border-gray-200 text-left p-4 transition-all ${c.hover} ${
              filter === c.key ? `ring-2 ring-offset-1 ${c.active}` : ''
            }`}
          >
            <p className="text-xs text-gray-500 font-medium">{c.label}</p>
            <p className={`text-2xl font-bold mt-0.5 ${c.text}`}>${c.value.toLocaleString()}</p>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-visible">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Reference</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Flight</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Pax</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Unit Cost</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Paid</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((t) => {
              const wf = workflowLabels[t.workflowStatus] || { label: t.workflowStatus, color: 'bg-gray-100 text-gray-700' };
              const pm = paidMeta(t.paidStatus);
              return (
                <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 cursor-pointer" onClick={() => handleReferenceClick(t)}>
                    <span className="font-medium text-teal-700">{t.referenceName}</span>
                    <p className="text-xs text-gray-400">{t.description}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${t.type === 'group' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'}`}>
                      {t.type === 'group' ? 'Group' : 'Individual'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    {t.outboundFlight ? (
                      <div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5 text-teal-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                          <span className="font-semibold text-gray-800">{t.outboundFlight.airline}</span>
                          <span className="text-gray-500 font-mono">{t.outboundFlight.flightNumber}</span>
                        </div>
                        {t.returnFlight && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <svg className="w-3.5 h-3.5 text-gray-400 rotate-180 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
                            <span className="font-semibold text-gray-800">{t.returnFlight.airline}</span>
                            <span className="text-gray-500 font-mono">{t.returnFlight.flightNumber}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-300 italic">No flight yet</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-700">{t.pax}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">${t.unitCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">${t.amount.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    {t.booked ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                        Booked{t.bookedType ? ` (${typeLabel[t.bookedType]})` : ''}
                      </span>
                    ) : (
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${wf.color}`}>{wf.label}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {t.paidStatus === 'no_fare' ? (
                      <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">No Fare Yet</span>
                    ) : (
                      <div className="relative">
                        <button
                          onClick={() => setOpenPayId(openPayId === t.id ? null : t.id)}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${pm?.color} hover:ring-1 hover:ring-gray-300`}
                        >
                          {pm?.label}
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
                        </button>
                        {openPayId === t.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setOpenPayId(null)} />
                            <div className="absolute z-20 mt-1 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-1.5 w-36 space-y-1">
                              {optionsFor(t).map((v) => (
                                <button
                                  key={v}
                                  onClick={() => handlePay(t, v as Transaction['paidStatus'])}
                                  className={`w-full text-left px-2 py-1 rounded-full text-xs font-medium ${PAID_META[v].color} ${v === t.paidStatus ? 'ring-1 ring-gray-400' : 'hover:opacity-80'}`}
                                >
                                  {PAID_META[v].label}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No transactions found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
