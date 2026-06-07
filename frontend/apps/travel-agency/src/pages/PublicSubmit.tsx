import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiGetAgencyInfo, apiSubmitTraveler } from '../services/api';

// Airports grouped by country so organizers see the country name above each option.
const AIRPORTS_BY_COUNTRY: { country: string; airports: { code: string; city: string }[] }[] = [
  { country: 'Tunisia',              airports: [{ code: 'TUN', city: 'Tunis' }, { code: 'MIR', city: 'Monastir' }, { code: 'DJE', city: 'Djerba' }] },
  { country: 'Algeria',              airports: [{ code: 'ALG', city: 'Algiers' }, { code: 'ORN', city: 'Oran' }] },
  { country: 'Morocco',              airports: [{ code: 'CMN', city: 'Casablanca' }, { code: 'RAK', city: 'Marrakesh' }, { code: 'RBA', city: 'Rabat' }] },
  { country: 'Egypt',                airports: [{ code: 'CAI', city: 'Cairo' }, { code: 'HRG', city: 'Hurghada' }] },
  { country: 'Saudi Arabia',         airports: [{ code: 'RUH', city: 'Riyadh' }, { code: 'JED', city: 'Jeddah' }, { code: 'DMM', city: 'Dammam' }] },
  { country: 'United Arab Emirates', airports: [{ code: 'DXB', city: 'Dubai' }, { code: 'AUH', city: 'Abu Dhabi' }, { code: 'SHJ', city: 'Sharjah' }] },
  { country: 'Jordan',               airports: [{ code: 'AMM', city: 'Amman' }] },
  { country: 'Lebanon',              airports: [{ code: 'BEY', city: 'Beirut' }] },
  { country: 'Kuwait',               airports: [{ code: 'KWI', city: 'Kuwait City' }] },
  { country: 'Qatar',                airports: [{ code: 'DOH', city: 'Doha' }] },
  { country: 'Turkey',               airports: [{ code: 'IST', city: 'Istanbul' }, { code: 'SAW', city: 'Istanbul (Sabiha)' }] },
  { country: 'Kenya',                airports: [{ code: 'NBO', city: 'Nairobi' }] },
  { country: 'France',               airports: [{ code: 'CDG', city: 'Paris (CDG)' }, { code: 'ORY', city: 'Paris (Orly)' }] },
  { country: 'United Kingdom',       airports: [{ code: 'LHR', city: 'London (Heathrow)' }] },
];
const VISAS = [
  { value: 'not_required', label: 'Not Required' },
  { value: 'processing',   label: 'Processing' },
];

export default function PublicSubmit() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';

  const [agencyName, setAgencyName] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '', email: '', phone: '', role: 'Scholar', title: '', event: 'MenaML 2026',
    destination: 'Dubai, UAE', departureAirport: '', preferredDepartureDate: '',
    preferredReturnDate: '', visa: 'not_required', notes: '',
  });

  useEffect(() => {
    if (!token) { setTokenError('Invalid link — no token found.'); return; }
    apiGetAgencyInfo(token)
      .then((d) => setAgencyName(d.agencyName))
      .catch(() => setTokenError('Invalid or expired submission link.'));
  }, [token]);

  const set = (field: string, value: string) => setForm((p) => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('Name is required'); return; }
    setLoading(true);
    setError('');
    try {
      await apiSubmitTraveler({ ...form, token });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  if (tokenError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center max-w-md w-full">
          <p className="text-red-600 font-medium">{tokenError}</p>
          <p className="text-gray-400 text-sm mt-2">Contact your travel agency for a valid link.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 via-white to-teal-50">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 rounded-full bg-teal-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Submitted!</h2>
          <p className="text-gray-500 text-sm">
            Your travel request has been sent to <strong>{agencyName}</strong>. They will be in touch with your flight details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-teal-50 py-10 px-4">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-teal-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✈️</span>
              <div>
                <h1 className="text-white font-bold text-xl">Travel Request</h1>
                <p className="text-teal-100 text-sm">{agencyName || '...'} · MenaML 2026</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <p className="text-sm text-gray-500">Fill in your details below. The travel agency will handle your flight booking.</p>

            {/* Name + Email */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input value={form.name} onChange={(e) => set('name', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Ahmed Al-Rashid" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ahmed@example.com" />
              </div>
            </div>

            {/* Phone + Role */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input value={form.phone} onChange={(e) => set('phone', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="+966 55 123 4567" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select value={form.role} onChange={(e) => { set('role', e.target.value); if (e.target.value !== 'Speaker') set('title', ''); }}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="Scholar">Scholar</option>
                  <option value="Speaker">Speaker</option>
                </select>
              </div>
            </div>

            {/* Title — only for speakers */}
            {form.role === 'Speaker' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Title</label>
                <div className="flex gap-2">
                  {['Dr', 'Prof'].map((t) => (
                    <button key={t} type="button" onClick={() => set('title', form.title === t ? '' : t)}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                        form.title === t
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                      }`}>
                      {t}.
                    </button>
                  ))}
                  <button type="button" onClick={() => set('title', '')}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      !form.title ? 'bg-teal-600 text-white border-teal-600' : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                    }`}>
                    No title
                  </button>
                </div>
              </div>
            )}

            {/* Departure Airport */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departure Airport *</label>
              <select value={form.departureAirport} onChange={(e) => set('departureAirport', e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" required>
                <option value="">Select your airport</option>
                {AIRPORTS_BY_COUNTRY.map((g) => (
                  <optgroup key={g.country} label={g.country}>
                    {g.airports.map((a) => (
                      <option key={a.code} value={a.code}>{a.city} ({a.code})</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Preferred Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Departure</label>
                <input type="date" value={form.preferredDepartureDate} onChange={(e) => set('preferredDepartureDate', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Return</label>
                <input type="date" value={form.preferredReturnDate} onChange={(e) => set('preferredReturnDate', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
            </div>

            {/* Visa */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visa Status</label>
              <div className="flex gap-2">
                {VISAS.map((v) => (
                  <button key={v.value} type="button"
                    onClick={() => set('visa', v.value)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${
                      form.visa === v.value
                        ? 'bg-teal-600 text-white border-teal-600'
                        : 'bg-white text-gray-600 border-gray-300 hover:border-teal-400'
                    }`}>
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea value={form.notes} onChange={(e) => set('notes', e.target.value)} rows={2}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Special requirements, meal preferences, etc." />
            </div>

            {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-teal-600 text-white rounded-lg font-semibold text-sm hover:bg-teal-700 transition-colors disabled:opacity-60">
              {loading ? 'Submitting…' : 'Submit Travel Request'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
