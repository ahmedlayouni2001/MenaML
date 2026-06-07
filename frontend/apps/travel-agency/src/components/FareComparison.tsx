import type { FareOption, FlightLeg } from '../types';

interface Props {
  agencyFare: FareOption | null;
  aiFare: FareOption | null;
  paxCount?: number;
}

function airlineInitials(name: string) {
  const clean = name.replace(/[^a-zA-Z ]/g, '').trim();
  const parts = clean.split(' ').filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return clean.slice(0, 2).toUpperCase();
}

function legStops(leg: FlightLeg) {
  if (leg.stops === 0) return 'Direct';
  return `${leg.stops} stop${leg.stops > 1 ? 's' : ''}${leg.stopAirport ? ` (${leg.stopAirport})` : ''}`;
}

function LegRow({ leg, label, accent }: { leg: FlightLeg; label: string; accent: string }) {
  if (!leg.departureTime && !leg.flightNumber && !leg.airline) return null;
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <svg className={`w-3 h-3 shrink-0 ${accent} ${label === 'Return' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
      </svg>
      <span className="text-xs text-gray-400 w-12 shrink-0">{label}</span>
      {leg.airline && <span className="text-xs font-semibold text-gray-700">{leg.airline}</span>}
      {leg.flightNumber && <span className="text-xs font-mono text-gray-500">{leg.flightNumber}</span>}
      <span className="text-xs text-gray-500">{leg.departureTime} → {leg.arrivalTime} · {legStops(leg)}</span>
    </div>
  );
}

function PriceBlock({ fare }: { fare: FareOption }) {
  const pct = (v?: number) => (v && fare.price ? Math.round(((v - fare.price) / fare.price) * 100) : null);
  return (
    <div className="text-right shrink-0">
      <p className="text-xl font-bold text-gray-900">${fare.price.toLocaleString()}</p>
      <p className="text-[10px] text-gray-400 mb-1">non-refundable / pax</p>
      {fare.priceRefundableTicket != null && (
        <p className="text-xs text-gray-600">
          ${fare.priceRefundableTicket.toLocaleString()} <span className="text-gray-400">Full-Refund</span>
          {pct(fare.priceRefundableTicket) !== null && <span className="text-amber-600 font-semibold ml-1">+{pct(fare.priceRefundableTicket)}%</span>}
        </p>
      )}
      {fare.priceRefundableTaxes != null && (
        <p className="text-xs text-gray-600">
          ${fare.priceRefundableTaxes.toLocaleString()} <span className="text-gray-400">Tax-Refund</span>
          {pct(fare.priceRefundableTaxes) !== null && <span className="text-amber-600 font-semibold ml-1">+{pct(fare.priceRefundableTaxes)}%</span>}
        </p>
      )}
    </div>
  );
}

export default function FareComparison({ agencyFare, aiFare, paxCount = 1 }: Props) {
  // A decision has been made once either fare is selected → freeze hover effects
  const decided = !!(agencyFare?.selected || aiFare?.selected);

  const savings =
    agencyFare && aiFare && aiFare.price < agencyFare.price
      ? (agencyFare.price - aiFare.price) * paxCount
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Agency proposal */}
      {agencyFare && (
        <div className={`rounded-xl border p-4 transition-all ${
          agencyFare.selected
            ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-200'
            : decided
            ? 'border-gray-200 bg-white opacity-70'
            : 'border-gray-200 bg-white hover:border-teal-300 hover:shadow-md hover:bg-teal-50/30'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">Agency Proposal</p>
            {agencyFare.selected && (
              <span className="text-[11px] font-semibold bg-teal-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                Chosen
              </span>
            )}
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                {airlineInitials(agencyFare.airline)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-gray-400 mb-1">Round trip</p>
                <div className="space-y-1">
                  <LegRow leg={agencyFare.outbound} label="Outbound" accent="text-teal-500" />
                  <LegRow leg={agencyFare.returnLeg} label="Return" accent="text-gray-400" />
                </div>
              </div>
            </div>
            <PriceBlock fare={agencyFare} />
          </div>
        </div>
      )}

      {/* AI alternative */}
      {aiFare && (
        <div className={`rounded-xl border p-4 transition-all ${
          aiFare.selected
            ? 'border-violet-500 bg-violet-100 ring-2 ring-violet-300'
            : decided
            ? 'border-violet-200 bg-violet-50/40 opacity-70'
            : 'border-violet-200 bg-violet-50/60 hover:border-violet-400 hover:shadow-md hover:bg-violet-100/70'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-violet-600 flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                <path d="M5 3v4M3 5h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5L13 3z"/>
              </svg>
              {savings > 0 ? 'AI Agent found a lower fare' : 'AI Alternative'}
            </p>
            {aiFare.selected ? (
              <span className="text-[11px] font-semibold bg-violet-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                Chosen
              </span>
            ) : savings > 0 && (
              <span className="text-[11px] font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                Saves ${savings.toLocaleString()} total
              </span>
            )}
          </div>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0">
                {airlineInitials(aiFare.airline)}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-semibold text-violet-400 mb-1">Round trip</p>
                <div className="space-y-1">
                  <LegRow leg={aiFare.outbound} label="Outbound" accent="text-violet-500" />
                  <LegRow leg={aiFare.returnLeg} label="Return" accent="text-gray-400" />
                </div>
                {aiFare.source && (
                  aiFare.sourceUrl ? (
                    <a href={aiFare.sourceUrl} target="_blank" rel="noopener noreferrer"
                      className="text-[11px] text-violet-500 mt-1.5 inline-flex items-center gap-1 hover:underline">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                      Verify on {aiFare.source} ↗
                    </a>
                  ) : (
                    <p className="text-[11px] text-violet-400 mt-1.5 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                        <path d="M5 3v4M3 5h4M13 3l2.5 6.5L22 12l-6.5 2.5L13 21l-2.5-6.5L4 12l6.5-2.5L13 3z"/>
                      </svg>
                      {aiFare.source}
                    </p>
                  )
                )}
              </div>
            </div>
            <PriceBlock fare={aiFare} />
          </div>
        </div>
      )}
    </div>
  );
}
