import { useState } from 'react';
import type { ProposeFareInput } from '../types';

interface Props {
  title?: string;
  variant?: 'group' | 'ticket';   // ticket → 3 prices
  outboundRoute?: { from: string; to: string };
  returnRoute?: { from: string; to: string };
  onCancel: () => void;
  onSubmit: (fare: ProposeFareInput) => Promise<void>;
}

const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent';
const labelCls = 'block text-xs font-semibold text-gray-500 mb-1';

function StopSelector({ value, airport, onType, onAirport }: {
  value: 'direct' | 'stop'; airport: string;
  onType: (v: 'direct' | 'stop') => void; onAirport: (v: string) => void;
}) {
  return (
    <div>
      <label className={labelCls}>Stops</label>
      <div className="flex gap-2">
        <button type="button" onClick={() => onType('direct')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
            value === 'direct' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
          }`}>Direct</button>
        <button type="button" onClick={() => onType('stop')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
            value === 'stop' ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
          }`}>1 Stop</button>
      </div>
      {value === 'stop' && (
        <input className={inputCls + ' uppercase mt-2'} value={airport}
          onChange={(e) => onAirport(e.target.value)} placeholder="Stopover airport e.g. IST" maxLength={4} />
      )}
    </div>
  );
}

function RouteBadge({ route }: { route?: { from: string; to: string } }) {
  if (!route) return null;
  return (
    <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></svg>
      {route.from} → {route.to}
    </span>
  );
}

export default function ProposeFareForm({ title = 'Propose a Fare', variant = 'group', outboundRoute, returnRoute, onCancel, onSubmit }: Props) {
  // outbound
  const [oAirline, setOAirline] = useState('');
  const [oNum, setONum] = useState('');
  const [oDep, setODep] = useState('');
  const [oArr, setOArr] = useState('');
  const [oStop, setOStop] = useState<'direct' | 'stop'>('direct');
  const [oAirport, setOAirport] = useState('');

  // return
  const [rAirline, setRAirline] = useState('');
  const [rNum, setRNum] = useState('');
  const [rDep, setRDep] = useState('');
  const [rArr, setRArr] = useState('');
  const [rStop, setRStop] = useState<'direct' | 'stop'>('direct');
  const [rAirport, setRAirport] = useState('');

  // pricing
  const [price, setPrice] = useState('');                       // non-refundable
  const [priceRefTicket, setPriceRefTicket] = useState('');     // refundable ticket
  const [priceRefTaxes, setPriceRefTaxes] = useState('');       // refundable taxes

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pct = (val: string) => {
    const base = Number(price);
    const v = Number(val);
    if (!base || !v) return null;
    const diff = Math.round(((v - base) / base) * 100);
    return diff;
  };

  const handleSubmit = async () => {
    setError('');
    if (!oAirline.trim()) { setError('Outbound airline is required'); return; }
    if (!rAirline.trim()) { setError('Return airline is required'); return; }
    if (!price || Number(price) <= 0) { setError('Enter the non-refundable price'); return; }
    if (oStop === 'stop' && !oAirport.trim()) { setError('Enter the outbound stopover airport'); return; }
    if (rStop === 'stop' && !rAirport.trim()) { setError('Enter the return stopover airport'); return; }

    setLoading(true);
    try {
      await onSubmit({
        price: Number(price),
        priceRefundableTicket: variant === 'ticket' && priceRefTicket ? Number(priceRefTicket) : undefined,
        priceRefundableTaxes: variant === 'ticket' && priceRefTaxes ? Number(priceRefTaxes) : undefined,
        outbound: {
          airline: oAirline.trim(), flightNumber: oNum.trim(), departureTime: oDep || '00:00', arrivalTime: oArr || '00:00',
          stops: oStop === 'stop' ? 1 : 0, stopAirport: oStop === 'stop' ? oAirport.trim().toUpperCase() : undefined,
        },
        returnLeg: {
          airline: rAirline.trim(), flightNumber: rNum.trim(), departureTime: rDep || '00:00', arrivalTime: rArr || '00:00',
          stops: rStop === 'stop' ? 1 : 0, stopAirport: rStop === 'stop' ? rAirport.trim().toUpperCase() : undefined,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to propose fare');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/60 p-5">
      <h4 className="text-sm font-bold text-gray-900 mb-4">{title}</h4>

      {/* Outbound leg */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Outbound</p>
          <RouteBadge route={outboundRoute} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div><label className={labelCls}>Airline</label><input className={inputCls} value={oAirline} onChange={(e) => setOAirline(e.target.value)} placeholder="e.g. Royal Air Maroc" /></div>
          <div><label className={labelCls}>Flight No</label><input className={inputCls} value={oNum} onChange={(e) => setONum(e.target.value)} placeholder="e.g. AT200" /></div>
          <div><label className={labelCls}>Dep. time</label><input type="time" className={inputCls} value={oDep} onChange={(e) => setODep(e.target.value)} /></div>
          <div><label className={labelCls}>Arr. time</label><input type="time" className={inputCls} value={oArr} onChange={(e) => setOArr(e.target.value)} /></div>
          <StopSelector value={oStop} airport={oAirport} onType={setOStop} onAirport={setOAirport} />
        </div>
      </div>

      {/* Return leg */}
      <div className="mb-5">
        <div className="flex items-center gap-2 mb-2">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">Return</p>
          <RouteBadge route={returnRoute} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div><label className={labelCls}>Airline</label><input className={inputCls} value={rAirline} onChange={(e) => setRAirline(e.target.value)} placeholder="e.g. Royal Air Maroc" /></div>
          <div><label className={labelCls}>Flight No</label><input className={inputCls} value={rNum} onChange={(e) => setRNum(e.target.value)} placeholder="e.g. AT201" /></div>
          <div><label className={labelCls}>Dep. time</label><input type="time" className={inputCls} value={rDep} onChange={(e) => setRDep(e.target.value)} /></div>
          <div><label className={labelCls}>Arr. time</label><input type="time" className={inputCls} value={rArr} onChange={(e) => setRArr(e.target.value)} /></div>
          <StopSelector value={rStop} airport={rAirport} onType={setRStop} onAirport={setRAirport} />
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-5">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Price / pax ($)</p>
        {variant === 'ticket' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Non-refundable</label>
              <input type="number" min="0" className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
            </div>
            <div className="relative">
              <label className={labelCls}>Full-Refund</label>
              <input type="number" min="0" className={inputCls} value={priceRefTicket} onChange={(e) => setPriceRefTicket(e.target.value)} placeholder="0" />
              {pct(priceRefTicket) !== null && (
                <span className="absolute top-0 right-0 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  {pct(priceRefTicket)! >= 0 ? '+' : ''}{pct(priceRefTicket)}%
                </span>
              )}
            </div>
            <div className="relative">
              <label className={labelCls}>Tax-Refund</label>
              <input type="number" min="0" className={inputCls} value={priceRefTaxes} onChange={(e) => setPriceRefTaxes(e.target.value)} placeholder="0" />
              {pct(priceRefTaxes) !== null && (
                <span className="absolute top-0 right-0 text-[10px] font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                  {pct(priceRefTaxes)! >= 0 ? '+' : ''}{pct(priceRefTaxes)}%
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-xs">
            <input type="number" min="0" className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors">
          Cancel
        </button>
        <button type="button" onClick={handleSubmit} disabled={loading}
          className="px-5 py-2 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors disabled:opacity-60 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
            <path d="M5 3v4M3 5h4M6 17v4m-2-2h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5L13 3z"/>
          </svg>
          {loading ? 'Running AI check…' : 'Propose & run AI check'}
        </button>
      </div>
    </div>
  );
}
