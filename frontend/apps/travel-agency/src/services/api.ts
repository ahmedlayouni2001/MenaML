// ─────────────────────────────────────────────────────────────────────────────
// MOCK API — in-memory implementation of the Travel Agency backend.
//
// This file replaces the original fetch-based client so the portal runs with NO
// backend. It keeps the EXACT same exported function signatures, so no page or
// component needed to change. State lives in memory and resets on a hard refresh
// (auth is persisted in localStorage). The workflow logic mirrors the real
// backend services (propose fare → mock AI alternative → accept/justify →
// transaction, booking, organizer review, incoming submissions, etc.).
//
// To use a real backend instead, restore the original fetch-based api.ts.
// ─────────────────────────────────────────────────────────────────────────────
import type {
  Traveler, GroupProposal, IndividualTicket, Transaction, User,
  AgencyTask, AgencyNotification, PendingTraveler, FareOption, ProposeFareInput, FlightLeg,
} from '../types';

export const BASE_URL = '(mock)';

// ── small helpers ────────────────────────────────────────────────────────────
const tick = (ms = 120) => new Promise<void>((r) => setTimeout(r, ms));
let _seq = 1000;
const nextId = () => String(++_seq);
function fail(message: string): never { throw new Error(message); }

// ── internal record types ────────────────────────────────────────────────────
interface FareRec extends FareOption { ownerType: 'group' | 'ticket'; ownerId: string; fareType: 'agency' | 'ai'; }
interface GroupRec {
  id: string; groupName: string; destination: string; departureAirport: string; arrivalAirport: string;
  departureDate: string; returnDate: string; status: GroupProposal['status']; createdAt: string;
  justification?: string; organizerRecommendation?: 'agency' | 'ai'; booked: boolean;
}
interface TicketRec {
  id: string; travelerId: string; roleOverride?: string; reasonCannotGroup?: string;
  status: IndividualTicket['status']; justification?: string; organizerRecommendation?: 'agency' | 'ai';
  booked: boolean; bookedType?: 'non_refund' | 'tax_refund' | 'full_refund';
}
interface TxRec {
  id: string; type: 'group' | 'individual'; referenceName: string; referenceId: string;
  amount: number; currency: string; status: string; paidStatus: Transaction['paidStatus'];
  date: string; description: string; paymentMethod?: string; flight: string; pax: number; unitCost: number;
  outboundFlight?: Transaction['outboundFlight']; returnFlight?: Transaction['returnFlight'];
}

// ── in-memory store ──────────────────────────────────────────────────────────
const SUBMISSION_TOKEN = '4a5a911cc58307b24a1bd60095913e6c';
let user: User;
let travelers: Traveler[];
let groups: GroupRec[];
let tickets: TicketRec[];
let fares: FareRec[];
let transactions: TxRec[];
let notifications: AgencyNotification[];
let tasks: AgencyTask[];
let pendings: PendingTraveler[];

const AGENCY = 'Wanderlust Travel Co.';
const EVENT = 'MenaML 2026';
const DEST = 'Dubai, UAE';

function mkTraveler(
  id: string, name: string, email: string, phone: string, role: string,
  airport: string, visa: Traveler['visa'], groupId: string | undefined,
  dep = '2026-06-10', ret = '2026-06-18',
): Traveler {
  return {
    id, name, email, phone, agency: AGENCY, event: EVENT, status: 'pending',
    destination: DEST, departureDate: dep, returnDate: ret, role,
    departureAirport: airport, arrivalAirport: 'DXB', reservation: '—', flightDetails: '—',
    cost: 0, visa, groupId,
  };
}

function seed() {
  user = {
    id: '1', name: 'Sarah Johnson', agency: AGENCY, email: 'sarah@wanderlust.com',
    token: 'mock-jwt-token', submissionToken: SUBMISSION_TOKEN,
  };

  groups = [
    { id: 'g-1', groupName: 'Gulf Scholars Group',         destination: DEST, departureAirport: 'RUH', arrivalAirport: 'DXB', departureDate: '2026-06-10', returnDate: '2026-06-18', status: 'pending', createdAt: '2026-05-20', booked: false },
    { id: 'g-2', groupName: 'Levant Scholars Group',       destination: DEST, departureAirport: 'AMM', arrivalAirport: 'DXB', departureDate: '2026-06-10', returnDate: '2026-06-18', status: 'pending', createdAt: '2026-05-18', booked: false },
    { id: 'g-3', groupName: 'North Africa Scholars Group', destination: DEST, departureAirport: 'CAI', arrivalAirport: 'DXB', departureDate: '2026-06-10', returnDate: '2026-06-18', status: 'pending', createdAt: '2026-05-15', booked: false },
    { id: 'g-4', groupName: 'East Africa Scholars Group',  destination: DEST, departureAirport: 'NBO', arrivalAirport: 'DXB', departureDate: '2026-06-10', returnDate: '2026-06-18', status: 'pending', createdAt: '2026-05-22', booked: false },
    { id: 'g-5', groupName: 'Maghreb Scholars Group',      destination: DEST, departureAirport: 'TUN', arrivalAirport: 'DXB', departureDate: '2026-06-10', returnDate: '2026-06-18', status: 'pending', createdAt: '2026-05-28', booked: false },
  ];

  travelers = [
    // Gulf (g-1) — RUH
    mkTraveler('t-1', 'Layla Hassan',     'layla@email.com',  '+966 55 234 5678', 'Scholar', 'RUH', 'not_required', 'g-1'),
    mkTraveler('t-2', 'Aisha Rahman',     'aisha@email.com',  '+966 55 222 3344', 'Scholar', 'RUH', 'not_required', 'g-1'),
    mkTraveler('t-3', 'Fahad Al-Otaibi',  'fahad@email.com',  '+966 55 333 4455', 'Scholar', 'RUH', 'not_required', 'g-1'),
    mkTraveler('t-4', 'Nora Al-Ghamdi',   'nora@email.com',   '+966 55 444 5566', 'Scholar', 'RUH', 'not_required', 'g-1'),
    // Levant (g-2) — AMM
    mkTraveler('t-5', 'Dr. Dania Khalil', 'dania@email.com',  '+962 79 890 1234', 'Scholar', 'AMM', 'not_required', 'g-2'),
    mkTraveler('t-6', 'Rami Jabri',       'rami@email.com',   '+962 79 111 2233', 'Scholar', 'AMM', 'not_required', 'g-2'),
    mkTraveler('t-7', 'Hana Mansour',     'hana@email.com',   '+962 79 222 3344', 'Scholar', 'AMM', 'not_required', 'g-2'),
    // North Africa (g-3) — CAI
    mkTraveler('t-8',  'Samir Nasr',      'samir@email.com',   '+20 100 345 6789', 'Scholar', 'CAI', 'not_required', 'g-3'),
    mkTraveler('t-9',  'Yasmine Mostafa', 'yasmine@email.com', '+20 100 456 7890', 'Scholar', 'CAI', 'not_required', 'g-3'),
    mkTraveler('t-10', 'Tariq El-Sayed',  'tariq@email.com',   '+20 100 567 8901', 'Scholar', 'CAI', 'not_required', 'g-3'),
    mkTraveler('t-11', 'Amira Hassan',    'amira@email.com',   '+20 100 678 9012', 'Scholar', 'CAI', 'not_required', 'g-3'),
    // East Africa (g-4) — NBO (visas processing)
    mkTraveler('t-12', 'Amina Okonkwo',   'amina@email.com',   '+254 70 111 2222', 'Scholar', 'NBO', 'processing', 'g-4'),
    mkTraveler('t-13', 'Kwame Asante',    'kwame@email.com',   '+254 70 333 4444', 'Scholar', 'NBO', 'processing', 'g-4'),
    mkTraveler('t-14', 'Fatou Diallo',    'fatou@email.com',   '+254 70 555 6666', 'Scholar', 'NBO', 'processing', 'g-4'),
    // Maghreb (g-5) — TUN
    mkTraveler('t-15', 'Mehdi Benali',    'mehdi@email.com',   '+216 29 777 8888', 'Scholar', 'TUN', 'not_required', 'g-5'),
    mkTraveler('t-16', 'Leila Bouazza',   'leila@email.com',   '+216 29 999 0011', 'Scholar', 'TUN', 'not_required', 'g-5'),
    mkTraveler('t-17', 'Yassine Khadri',  'yassine@email.com', '+216 29 111 2233', 'Scholar', 'TUN', 'not_required', 'g-5'),
    // Speakers (individual — no group)
    mkTraveler('t-18', 'Dr. Ahmed Al-Rashid',   'ahmed@email.com',  '+966 55 123 4567', 'Speaker', 'RUH', 'not_required', undefined),
    mkTraveler('t-19', 'Prof. Omar Farouk',     'omar@email.com',   '+966 55 987 6543', 'Speaker', 'JED', 'not_required', undefined),
    mkTraveler('t-20', 'Dr. Khalid Mansour',    'khalid@email.com', '+966 55 567 8901', 'Speaker', 'DMM', 'processing',   undefined, '2026-06-11', '2026-06-19'),
    mkTraveler('t-21', 'Prof. Yusuf Mansouri',  'yusuf@email.com',  '+966 55 111 2233', 'Speaker', 'RUH', 'not_required', undefined),
    mkTraveler('t-22', 'Dr. Fatima Al-Zahra',   'fatima@email.com', '+965 99 333 4455', 'Speaker', 'KWI', 'not_required', undefined),
    mkTraveler('t-23', 'Prof. Hassan Al-Turki', 'hassan@email.com', '+20 100 789 0123', 'Speaker', 'CAI', 'not_required', undefined),
  ];

  const reasons = [
    'Keynote speaker — requires dedicated itinerary and flexible rebooking',
    'Invited speaker — different departure city, incompatible with scholar groups',
    'Speaker — visa processing requires individual booking',
    'Keynote speaker — confirmed with special fare requirements',
    'Guest speaker — requires arrival day before scholars for rehearsal',
    'Panel speaker — contract specifies business class, not offered on group fare',
  ];
  tickets = travelers
    .filter((t) => t.role === 'Speaker')
    .map((t, i) => ({ id: `i-${i + 1}`, travelerId: t.id, roleOverride: 'Speaker', reasonCannotGroup: reasons[i], status: 'pending' as const, booked: false }));
  // link travelers → ticketId
  for (const tk of tickets) {
    const tr = travelers.find((t) => t.id === tk.travelerId);
    if (tr) tr.ticketId = tk.id;
  }

  fares = [];
  transactions = [];
  notifications = [];
  tasks = [];
  pendings = [];
}
seed();

// ── auth/session ─────────────────────────────────────────────────────────────
export function getToken(): string | null {
  try {
    const u = localStorage.getItem('user');
    return u ? (JSON.parse(u) as User).token : null;
  } catch { return null; }
}

/** SSE is not available in mock mode; components guard against null. */
export function openEventStream(): EventSource | null { return null; }

// ── fare assembly + mock AI ──────────────────────────────────────────────────
function toOption(f: FareRec): FareOption {
  const { ownerType: _o, ownerId: _i, fareType: _t, ...opt } = f;
  return opt;
}

const AI_AIRLINES = [
  { name: 'flydubai', code: 'FZ' }, { name: 'Air Arabia', code: 'G9' }, { name: 'flynas', code: 'XY' },
  { name: 'Pegasus', code: 'PC' }, { name: 'Wizz Air', code: 'W6' }, { name: 'Turkish Airlines', code: 'TK' }, { name: 'Air Cairo', code: 'SM' },
];
const SOURCES = [
  { name: 'Kayak', url: 'https://www.kayak.com/flights' },
  { name: 'Google Flights', url: 'https://www.google.com/travel/flights' },
  { name: 'Skyscanner', url: 'https://www.skyscanner.net/transport/flights' },
  { name: 'Momondo', url: 'https://www.momondo.com/flight-search' },
];
const pick = <T,>(a: T[]): T => a[Math.floor(Math.random() * a.length)];
function shiftTime(time: string, minutes: number): string {
  const [h, m] = (time || '00:00').split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return time;
  const total = ((h * 60 + m + minutes) % 1440 + 1440) % 1440;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
const round5 = (n: number) => Math.max(50, Math.round(n / 5) * 5);
function aiLeg(agencyLeg: FlightLeg): FlightLeg {
  let al = pick(AI_AIRLINES);
  let guard = 0;
  while (al.name.toLowerCase() === (agencyLeg.airline || '').toLowerCase() && guard++ < 5) al = pick(AI_AIRLINES);
  const stops = Math.random() < 0.7 ? 0 : 1;
  return {
    airline: al.name,
    flightNumber: `${al.code}${100 + Math.floor(Math.random() * 899)}`,
    departureTime: shiftTime(agencyLeg.departureTime, (Math.floor(Math.random() * 9) - 4) * 30),
    arrivalTime: shiftTime(agencyLeg.arrivalTime, (Math.floor(Math.random() * 9) - 4) * 30),
    stops,
    stopAirport: stops > 0 ? pick(['IST', 'DOH', 'AUH', 'JED', 'CAI']) : undefined,
  };
}
function makeAIFare(input: ProposeFareInput, ownerType: 'group' | 'ticket', ownerId: string): FareRec {
  const factor = 1 - (0.08 + Math.random() * 0.12);
  const src = pick(SOURCES);
  const out = aiLeg(input.outbound);
  return {
    id: Number(nextId()), ownerType, ownerId, fareType: 'ai',
    airline: out.airline, currency: 'USD', source: src.name, sourceUrl: src.url, selected: false,
    price: round5(input.price * factor),
    priceRefundableTicket: input.priceRefundableTicket != null ? round5(input.priceRefundableTicket * factor) : undefined,
    priceRefundableTaxes: input.priceRefundableTaxes != null ? round5(input.priceRefundableTaxes * factor) : undefined,
    outbound: out, returnLeg: aiLeg(input.returnLeg),
  };
}
function makeAgencyFare(input: ProposeFareInput, ownerType: 'group' | 'ticket', ownerId: string): FareRec {
  return {
    id: Number(nextId()), ownerType, ownerId, fareType: 'agency',
    airline: input.outbound.airline, currency: 'USD', selected: false,
    price: input.price, priceRefundableTicket: input.priceRefundableTicket, priceRefundableTaxes: input.priceRefundableTaxes,
    outbound: { ...input.outbound }, returnLeg: { ...input.returnLeg },
  };
}
function validateFare(input: ProposeFareInput) {
  if (!input.outbound?.airline?.trim()) fail('Outbound airline is required');
  if (!input.returnLeg?.airline?.trim()) fail('Return airline is required');
  if (!input.price || input.price <= 0) fail('Non-refundable price must be greater than 0');
  if (input.outbound.stops > 0 && !input.outbound.stopAirport?.trim()) fail('Please specify the outbound stopover airport');
  if (input.returnLeg.stops > 0 && !input.returnLeg.stopAirport?.trim()) fail('Please specify the return stopover airport');
}

// ── assemblers ───────────────────────────────────────────────────────────────
function assembleGroup(g: GroupRec): GroupProposal {
  const members = travelers.filter((t) => t.groupId === g.id).map((t) => ({ id: t.id, name: t.name }));
  const gf = fares.filter((f) => f.ownerType === 'group' && f.ownerId === g.id);
  return {
    id: g.id, groupName: g.groupName, size: members.length, destination: g.destination,
    departureDate: g.departureDate, returnDate: g.returnDate, departureAirport: g.departureAirport, arrivalAirport: g.arrivalAirport,
    agencyFare: gf.filter((f) => f.fareType === 'agency').map(toOption)[0] ?? null,
    aiFare: gf.filter((f) => f.fareType === 'ai').map(toOption)[0] ?? null,
    status: g.status, createdAt: g.createdAt, members,
    justification: g.justification, organizerRecommendation: g.organizerRecommendation, booked: g.booked,
  };
}
function assembleTicket(tk: TicketRec): IndividualTicket {
  const tr = travelers.find((t) => t.id === tk.travelerId);
  const tf = fares.filter((f) => f.ownerType === 'ticket' && f.ownerId === tk.id);
  return {
    id: tk.id, travelerName: tr?.name ?? '(removed)', travelerId: tk.travelerId, roleOverride: tk.roleOverride,
    destination: tr?.destination ?? DEST, departureDate: tr?.departureDate ?? '', returnDate: tr?.returnDate ?? '',
    departureAirport: tr?.departureAirport ?? '', arrivalAirport: tr?.arrivalAirport ?? 'DXB',
    agencyFare: tf.filter((f) => f.fareType === 'agency').map(toOption)[0] ?? null,
    aiFare: tf.filter((f) => f.fareType === 'ai').map(toOption)[0] ?? null,
    status: tk.status, justification: tk.justification, organizerRecommendation: tk.organizerRecommendation,
    booked: tk.booked, bookedType: tk.bookedType,
  };
}
function travelerOut(t: Traveler): Traveler {
  return { ...t, groupName: t.groupId ? groups.find((g) => g.id === t.groupId)?.groupName : undefined };
}

function selectedFare(owner: 'group' | 'ticket', id: string): FareRec | null {
  const fs = fares.filter((f) => f.ownerType === owner && f.ownerId === id);
  return fs.find((f) => f.selected) ?? fs.find((f) => f.fareType === 'agency') ?? fs.find((f) => f.fareType === 'ai') ?? null;
}
function applyFareToTraveler(t: Traveler, f: FareRec) {
  t.cost = f.price;
  t.flightDetails = `${f.outbound.airline} ${f.outbound.flightNumber ?? ''} / ${f.returnLeg.airline} ${f.returnLeg.flightNumber ?? ''}`;
  t.reservation = f.outbound.flightNumber || 'PENDING';
  t.outboundFlight = { airline: f.outbound.airline, flightNumber: f.outbound.flightNumber ?? '', departureTime: f.outbound.departureTime, arrivalTime: f.outbound.arrivalTime, stops: f.outbound.stops, stopAirport: f.outbound.stopAirport ?? null };
  t.returnFlight = { airline: f.returnLeg.airline, flightNumber: f.returnLeg.flightNumber ?? '', departureTime: f.returnLeg.departureTime, arrivalTime: f.returnLeg.arrivalTime, stops: f.returnLeg.stops, stopAirport: f.returnLeg.stopAirport ?? null };
}

// ── tasks / notifications ────────────────────────────────────────────────────
function addTask(type: string, message: string, ref?: { refType: string; refId: string }) {
  tasks.unshift({ id: nextId(), type, message, read: false, createdAt: new Date().toISOString().slice(0, 19), refType: ref?.refType, refId: ref?.refId });
}
function dismissTasksByRef(refType: string, refId: string, type?: string) {
  tasks = tasks.map((t) => (t.refType === refType && t.refId === refId && (!type || t.type === type) ? { ...t, read: true } : t));
}
function addNotification(type: string, message: string, emailTarget?: string): AgencyNotification {
  const n: AgencyNotification = { id: nextId(), type, message, emailTarget, emailSent: false, read: false, createdAt: new Date().toISOString().slice(0, 19) };
  notifications.unshift(n);
  return n;
}

// ── transactions ─────────────────────────────────────────────────────────────
function createTransaction(data: Omit<TxRec, 'id' | 'paidStatus' | 'date' | 'currency'> & { currency?: string }): TxRec {
  const tx: TxRec = {
    id: 'tr-' + nextId(), currency: data.currency ?? 'USD', paidStatus: 'no_fare',
    date: new Date().toISOString().slice(0, 10),
    type: data.type, referenceName: data.referenceName, referenceId: data.referenceId,
    amount: data.amount, status: data.status, description: data.description, paymentMethod: data.paymentMethod,
    flight: data.flight, pax: data.pax, unitCost: data.unitCost,
    outboundFlight: data.outboundFlight, returnFlight: data.returnFlight,
  };
  transactions.unshift(tx);
  return tx;
}
function enablePaymentForRef(type: 'group' | 'individual', refId: string) {
  transactions.forEach((t) => { if (t.type === type && t.referenceId === refId && t.paidStatus === 'no_fare') t.paidStatus = 'not_paid'; });
}
function txToTransaction(tx: TxRec): Transaction {
  let workflowStatus = tx.status; let booked = false; let bookedType: Transaction['bookedType'];
  if (tx.type === 'group') { const g = groups.find((x) => x.id === tx.referenceId); if (g) { workflowStatus = g.status; booked = g.booked; } }
  else { const tk = tickets.find((x) => x.id === tx.referenceId); if (tk) { workflowStatus = tk.status; booked = tk.booked; bookedType = tk.bookedType; } }
  return {
    id: tx.id, type: tx.type, referenceName: tx.referenceName, referenceId: tx.referenceId, amount: tx.amount,
    currency: tx.currency, status: tx.status, workflowStatus, booked, bookedType, paidStatus: tx.paidStatus,
    date: tx.date, description: tx.description, paymentMethod: tx.paymentMethod, flight: tx.flight, pax: tx.pax,
    unitCost: tx.unitCost, outboundFlight: tx.outboundFlight, returnFlight: tx.returnFlight,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// AUTH (any credentials accepted in mock mode)
// ═══════════════════════════════════════════════════════════════════════════════
export async function apiRegister(_email: string, _password: string, _name: string, _agencyName: string): Promise<{ message: string }> {
  await tick(); return { message: 'Account created. Please check your email to verify your account.' };
}
export async function apiVerifyEmail(_token: string): Promise<{ message: string }> {
  await tick(); return { message: 'Email verified successfully. You can now log in.' };
}
export async function apiResendVerification(_email: string): Promise<{ message: string }> {
  await tick(); return { message: 'If that email exists and is unverified, a new link has been sent.' };
}
export async function apiForgotPassword(_email: string): Promise<{ message: string }> {
  await tick(); return { message: 'If an account with that email exists, a password reset link has been sent.' };
}
export async function apiResetPassword(_token: string, _password: string): Promise<{ message: string }> {
  await tick(); return { message: 'Password reset successfully. You can now log in.' };
}
export async function apiLogin(email: string, _password: string): Promise<{ token: string; user: User }> {
  await tick();
  user = { ...user, email: email || user.email };
  return { token: user.token, user: { ...user } };
}
export async function apiGetMe(): Promise<Omit<User, 'token'>> {
  await tick();
  const { token: _t, ...rest } = user;
  return rest;
}
export async function apiSetOrganizerEmail(organizerEmail: string): Promise<User> {
  await tick();
  if (!organizerEmail || !/^\S+@\S+\.\S+$/.test(organizerEmail)) fail('Please provide a valid organizer email');
  user = { ...user, organizerEmail: organizerEmail.trim() };
  try {
    const stored = localStorage.getItem('user');
    if (stored) localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), organizerEmail: user.organizerEmail }));
  } catch { /* ignore */ }
  return { ...user };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRAVELERS
// ═══════════════════════════════════════════════════════════════════════════════
export async function apiGetTravelers(filters: Record<string, string> = {}): Promise<Traveler[]> {
  await tick();
  let list = travelers.slice();
  if (filters.status) list = list.filter((t) => t.status === filters.status);
  if (filters.airport) list = list.filter((t) => t.departureAirport === filters.airport);
  if (filters.role) list = list.filter((t) => t.role === filters.role);
  list.sort((a, b) => (a.groupId ? 0 : 1) - (b.groupId ? 0 : 1) || a.name.localeCompare(b.name));
  return list.map(travelerOut);
}
export async function apiCreateTraveler(data: Partial<Traveler>): Promise<Traveler> {
  await tick();
  if (!data.name?.trim()) fail('Name is required');
  if (!data.departureAirport) fail('Departure airport is required');
  if (!data.arrivalAirport) fail('Arrival airport is required');
  if (!data.departureDate) fail('Departure date is required');
  if (!data.returnDate) fail('Return date is required');
  const t: Traveler = {
    id: 't-' + nextId(), name: data.name, email: data.email ?? '', phone: data.phone ?? '', agency: AGENCY,
    event: data.event ?? EVENT, status: (data.status as Traveler['status']) ?? 'pending', destination: data.destination ?? DEST,
    departureDate: data.departureDate, returnDate: data.returnDate, role: data.role ?? 'Scholar',
    departureAirport: data.departureAirport, arrivalAirport: data.arrivalAirport, reservation: data.reservation ?? '—',
    flightDetails: data.flightDetails ?? '—', cost: data.cost ?? 0, visa: (data.visa as Traveler['visa']) ?? 'not_required',
    groupId: data.groupId,
  };
  travelers.push(t);
  return travelerOut(t);
}
export async function apiUpdateTraveler(id: string, data: Partial<Traveler>): Promise<Traveler> {
  await tick();
  const t = travelers.find((x) => x.id === id) ?? fail('Traveler not found');
  Object.assign(t, data);
  return travelerOut(t);
}
export async function apiDeleteTraveler(id: string): Promise<void> {
  await tick();
  removeTraveler(id);
}
function removeTraveler(id: string) {
  const t = travelers.find((x) => x.id === id);
  if (!t) return;
  // remove individual tickets + their fares + their transactions
  const tk = tickets.find((k) => k.travelerId === id);
  if (tk) {
    fares = fares.filter((f) => !(f.ownerType === 'ticket' && f.ownerId === tk.id));
    transactions = transactions.filter((x) => !(x.type === 'individual' && x.referenceId === tk.id));
    tickets = tickets.filter((k) => k.id !== tk.id);
  }
  travelers = travelers.filter((x) => x.id !== id);
}
export async function apiAcceptVisa(id: string): Promise<Traveler> {
  await tick();
  const t = travelers.find((x) => x.id === id) ?? fail('Traveler not found');
  t.visa = 'accepted';
  return travelerOut(t);
}
export async function apiRefuseVisa(id: string): Promise<AgencyNotification> {
  await tick();
  const t = travelers.find((x) => x.id === id) ?? fail('Traveler not found');
  let type: string; let message: string;
  if (t.groupId) {
    const g = groups.find((x) => x.id === t.groupId);
    type = 'visa_removed_group';
    message = `We removed "${t.name}" from ${g?.groupName ?? 'the group'} (departs ${t.departureAirport} → ${t.arrivalAirport} on ${t.departureDate}) because their visa was refused. Are there other participants available for that date and airport? Please send them via the submission link.`;
  } else {
    type = 'visa_removed_individual';
    message = `We removed "${t.name}" because their visa was refused. If there is another speaker who can replace them, please send them via the submission link.`;
  }
  removeTraveler(id);
  return addNotification(type, message, user.organizerEmail);
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS (bell)
// ═══════════════════════════════════════════════════════════════════════════════
export async function apiGetNotifications(): Promise<AgencyNotification[]> {
  await tick(); return notifications.slice();
}
export async function apiMarkNotificationRead(id: string): Promise<void> {
  await tick(); const n = notifications.find((x) => x.id === id); if (n) n.read = true;
}
export async function apiSendNotificationEmail(id: string): Promise<{ sent: boolean; to: string }> {
  await tick();
  const n = notifications.find((x) => x.id === id) ?? fail('Notification not found');
  n.emailSent = true;
  return { sent: true, to: n.emailTarget ?? user.organizerEmail ?? '' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GROUPS
// ═══════════════════════════════════════════════════════════════════════════════
export async function apiGetGroups(): Promise<GroupProposal[]> {
  await tick();
  return groups.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map(assembleGroup);
}
export async function apiProposeGroupFare(groupId: string, fare: ProposeFareInput): Promise<{ group: GroupProposal }> {
  await tick();
  const g = groups.find((x) => x.id === groupId) ?? fail('Group not found');
  validateFare(fare);
  fares = fares.filter((f) => !(f.ownerType === 'group' && f.ownerId === groupId));
  fares.push(makeAgencyFare(fare, 'group', groupId), makeAIFare(fare, 'group', groupId));
  g.status = 'ai_ready';
  addTask('ai_ready', `AI response is ready to check for ${g.groupName}.`, { refType: 'group', refId: groupId });
  return { group: assembleGroup(g) };
}
export async function apiAcceptAIFare(groupId: string): Promise<{ group: GroupProposal; transaction: Transaction }> {
  await tick();
  const g = groups.find((x) => x.id === groupId) ?? fail('Group not found');
  const ai = fares.find((f) => f.ownerType === 'group' && f.ownerId === groupId && f.fareType === 'ai') ?? fail('No AI fare available for this group');
  fares.forEach((f) => { if (f.ownerType === 'group' && f.ownerId === groupId) f.selected = f.id === ai.id; });
  g.status = 'approved_ai';
  const members = travelers.filter((t) => t.groupId === groupId);
  members.forEach((t) => applyFareToTraveler(t, ai));
  dismissTasksByRef('group', groupId);
  const tx = createTransaction({
    type: 'group', referenceName: g.groupName, referenceId: groupId,
    description: `Group booking - ${ai.airline} (AI fare)`,
    flight: `${ai.outbound.flightNumber ?? ''} / ${ai.returnLeg.flightNumber ?? ''}`,
    pax: members.length, unitCost: ai.price, amount: ai.price * members.length, status: 'pending',
    outboundFlight: members[0]?.outboundFlight, returnFlight: members[0]?.returnFlight,
  });
  return { group: assembleGroup(g), transaction: txToTransaction(tx) };
}
export async function apiFinalizeAgencyFare(groupId: string): Promise<{ group: GroupProposal; transaction: Transaction }> {
  await tick();
  const g = groups.find((x) => x.id === groupId) ?? fail('Group not found');
  const agency = fares.find((f) => f.ownerType === 'group' && f.ownerId === groupId && f.fareType === 'agency') ?? fail('No agency fare available for this group');
  fares.forEach((f) => { if (f.ownerType === 'group' && f.ownerId === groupId) f.selected = f.id === agency.id; });
  g.status = 'approved_agency';
  const members = travelers.filter((t) => t.groupId === groupId);
  members.forEach((t) => applyFareToTraveler(t, agency));
  dismissTasksByRef('group', groupId);
  const tx = createTransaction({
    type: 'group', referenceName: g.groupName, referenceId: groupId,
    description: `Group booking - ${agency.airline} (agency fare, justified)`,
    flight: `${agency.outbound.flightNumber ?? ''} / ${agency.returnLeg.flightNumber ?? ''}`,
    pax: members.length, unitCost: agency.price, amount: agency.price * members.length, status: 'processing',
    outboundFlight: members[0]?.outboundFlight, returnFlight: members[0]?.returnFlight,
  });
  return { group: assembleGroup(g), transaction: txToTransaction(tx) };
}
export async function apiJustifyFare(groupId: string, justification: string): Promise<{ group: GroupProposal }> {
  await tick();
  if (!justification || justification.trim().length < 20) fail('Justification must be at least 20 characters');
  const g = groups.find((x) => x.id === groupId) ?? fail('Group not found');
  if (!fares.find((f) => f.ownerType === 'group' && f.ownerId === groupId && f.fareType === 'agency')) fail('No agency fare available for this group');
  g.justification = justification.trim();
  g.status = 'waiting_organizer';
  travelers.filter((t) => t.groupId === groupId).forEach((t) => (t.status = 'waiting_organizer'));
  dismissTasksByRef('group', groupId, 'ai_ready');
  return { group: assembleGroup(g) };
}
export async function apiBookGroup(groupId: string): Promise<{ group: GroupProposal }> {
  await tick();
  const g = groups.find((x) => x.id === groupId) ?? fail('Group not found');
  g.booked = true;
  travelers.filter((t) => t.groupId === groupId).forEach((t) => (t.status = 'confirmed'));
  enablePaymentForRef('group', groupId);
  addTask('send_booking', `Send the booking details to the organizer for ${g.groupName}.`, { refType: 'group', refId: groupId });
  return { group: assembleGroup(g) };
}
export async function apiSendGroupBooking(groupId: string): Promise<{ sent: boolean; to: string }> {
  await tick();
  const g = groups.find((x) => x.id === groupId) ?? fail('Group not found');
  if (!user.organizerEmail) fail('No organizer email set. Add one in Agency Settings.');
  dismissTasksByRef('group', groupId, 'send_booking');
  void g;
  return { sent: true, to: user.organizerEmail };
}
export async function apiCreateGroup(data: {
  name: string; destination?: string; departureAirport?: string; arrivalAirport?: string;
  departureDate: string; returnDate: string; travelerIds: string[];
}): Promise<GroupProposal> {
  await tick();
  const g: GroupRec = {
    id: 'g-' + nextId(), groupName: data.name, destination: data.destination ?? DEST,
    departureAirport: data.departureAirport ?? '', arrivalAirport: data.arrivalAirport ?? 'DXB',
    departureDate: data.departureDate, returnDate: data.returnDate, status: 'pending',
    createdAt: new Date().toISOString().slice(0, 10), booked: false,
  };
  groups.unshift(g);
  assignTravelers(g, data.travelerIds);
  return assembleGroup(g);
}
export async function apiAddTravelersToGroup(groupId: string, travelerIds: string[]): Promise<GroupProposal> {
  await tick();
  const g = groups.find((x) => x.id === groupId) ?? fail('Group not found');
  assignTravelers(g, travelerIds);
  return assembleGroup(g);
}
function assignTravelers(g: GroupRec, travelerIds: string[]) {
  for (const id of travelerIds) {
    const t = travelers.find((x) => x.id === id);
    if (!t) continue;
    t.groupId = g.id;
    if (t.departureDate !== g.departureDate || t.returnDate !== g.returnDate) {
      const oldDep = t.departureDate; const oldRet = t.returnDate;
      t.departureDate = g.departureDate; t.returnDate = g.returnDate;
      addTask('date_updated', `You have updated the flight dates of ${t.name} — from ${oldDep}–${oldRet} to ${g.departureDate}–${g.returnDate}. Please inform the organizers.`);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INDIVIDUAL TICKETS
// ═══════════════════════════════════════════════════════════════════════════════
function choiceMessage(name: string, f: FareRec): string {
  const parts = [`Non-Refund $${f.price}`];
  if (f.priceRefundableTaxes != null) parts.push(`Tax-Refund $${f.priceRefundableTaxes}`);
  if (f.priceRefundableTicket != null) parts.push(`Full-Refund $${f.priceRefundableTicket}`);
  return `Send ${name} the ticket options to choose — ${parts.join(' · ')}.`;
}
export async function apiGetTickets(): Promise<IndividualTicket[]> {
  await tick();
  return tickets.slice().map(assembleTicket);
}
export async function apiProposeTicketFare(ticketId: string, fare: ProposeFareInput): Promise<{ ticket: IndividualTicket }> {
  await tick();
  const tk = tickets.find((x) => x.id === ticketId) ?? fail('Ticket not found');
  validateFare(fare);
  fares = fares.filter((f) => !(f.ownerType === 'ticket' && f.ownerId === ticketId));
  fares.push(makeAgencyFare(fare, 'ticket', ticketId), makeAIFare(fare, 'ticket', ticketId));
  tk.status = 'ai_ready';
  addTask('ai_ready', `AI response is ready to check for ${assembleTicket(tk).travelerName}.`, { refType: 'ticket', refId: ticketId });
  return { ticket: assembleTicket(tk) };
}
export async function apiAcceptTicketAIFare(ticketId: string): Promise<{ ticket: IndividualTicket; transaction: Transaction }> {
  await tick();
  const tk = tickets.find((x) => x.id === ticketId) ?? fail('Ticket not found');
  const ai = fares.find((f) => f.ownerType === 'ticket' && f.ownerId === ticketId && f.fareType === 'ai') ?? fail('No AI fare available for this ticket');
  fares.forEach((f) => { if (f.ownerType === 'ticket' && f.ownerId === ticketId) f.selected = f.id === ai.id; });
  tk.status = 'approved';
  const tr = travelers.find((t) => t.id === tk.travelerId);
  if (tr) applyFareToTraveler(tr, ai);
  dismissTasksByRef('ticket', ticketId);
  const name = assembleTicket(tk).travelerName;
  const tx = createTransaction({
    type: 'individual', referenceName: name, referenceId: ticketId,
    description: `Individual ticket - ${ai.airline} (AI fare)`,
    flight: `${ai.outbound.flightNumber ?? ''} / ${ai.returnLeg.flightNumber ?? ''}`,
    pax: 1, unitCost: ai.price, amount: ai.price, status: 'pending',
    outboundFlight: tr?.outboundFlight, returnFlight: tr?.returnFlight,
  });
  addNotification('choose_ticket', choiceMessage(name, ai), user.organizerEmail);
  return { ticket: assembleTicket(tk), transaction: txToTransaction(tx) };
}
export async function apiFinalizeTicketAgencyFare(ticketId: string): Promise<{ ticket: IndividualTicket; transaction: Transaction }> {
  await tick();
  const tk = tickets.find((x) => x.id === ticketId) ?? fail('Ticket not found');
  const agency = fares.find((f) => f.ownerType === 'ticket' && f.ownerId === ticketId && f.fareType === 'agency') ?? fail('No agency fare available for this ticket');
  fares.forEach((f) => { if (f.ownerType === 'ticket' && f.ownerId === ticketId) f.selected = f.id === agency.id; });
  tk.status = 'approved_agency';
  const tr = travelers.find((t) => t.id === tk.travelerId);
  if (tr) applyFareToTraveler(tr, agency);
  dismissTasksByRef('ticket', ticketId);
  const name = assembleTicket(tk).travelerName;
  const tx = createTransaction({
    type: 'individual', referenceName: name, referenceId: ticketId,
    description: `Individual ticket - ${agency.airline} (agency fare, justified)`,
    flight: `${agency.outbound.flightNumber ?? ''} / ${agency.returnLeg.flightNumber ?? ''}`,
    pax: 1, unitCost: agency.price, amount: agency.price, status: 'processing',
    outboundFlight: tr?.outboundFlight, returnFlight: tr?.returnFlight,
  });
  addNotification('choose_ticket', choiceMessage(name, agency), user.organizerEmail);
  return { ticket: assembleTicket(tk), transaction: txToTransaction(tx) };
}
export async function apiJustifyTicketFare(ticketId: string, justification: string): Promise<{ ticket: IndividualTicket }> {
  await tick();
  if (!justification || justification.trim().length < 20) fail('Justification must be at least 20 characters');
  const tk = tickets.find((x) => x.id === ticketId) ?? fail('Ticket not found');
  if (!fares.find((f) => f.ownerType === 'ticket' && f.ownerId === ticketId && f.fareType === 'agency')) fail('No agency fare available for this ticket');
  tk.justification = justification.trim();
  tk.status = 'waiting_organizer';
  const tr = travelers.find((t) => t.id === tk.travelerId);
  if (tr) tr.status = 'waiting_organizer';
  dismissTasksByRef('ticket', ticketId, 'ai_ready');
  return { ticket: assembleTicket(tk) };
}
export async function apiBookTicket(ticketId: string, type: 'non_refund' | 'tax_refund' | 'full_refund'): Promise<{ ticket: IndividualTicket }> {
  await tick();
  const tk = tickets.find((x) => x.id === ticketId) ?? fail('Ticket not found');
  const f = selectedFare('ticket', ticketId) ?? fail('No fare selected for this ticket');
  const price = type === 'non_refund' ? f.price : type === 'tax_refund' ? f.priceRefundableTaxes : f.priceRefundableTicket;
  if (price == null) fail('That ticket type is not available for this fare');
  tk.booked = true; tk.bookedType = type;
  const tr = travelers.find((t) => t.id === tk.travelerId);
  if (tr) { tr.status = 'confirmed'; tr.cost = price; }
  transactions.forEach((x) => { if (x.type === 'individual' && x.referenceId === ticketId) { x.unitCost = price; x.amount = price; } });
  enablePaymentForRef('individual', ticketId);
  addTask('send_booking', `Send the booking details to the organizer for ${assembleTicket(tk).travelerName}.`, { refType: 'ticket', refId: ticketId });
  return { ticket: assembleTicket(tk) };
}
export async function apiSendTicketChoice(ticketId: string): Promise<{ sent: boolean; to: string }> {
  await tick();
  const tk = tickets.find((x) => x.id === ticketId) ?? fail('Ticket not found');
  if (!selectedFare('ticket', ticketId)) fail('No fare selected for this ticket');
  if (!user.organizerEmail) fail('No organizer email set. Add one in Agency Settings.');
  void tk;
  return { sent: true, to: user.organizerEmail };
}
export async function apiSendTicketBooking(ticketId: string): Promise<{ sent: boolean; to: string }> {
  await tick();
  const tk = tickets.find((x) => x.id === ticketId) ?? fail('Ticket not found');
  if (!user.organizerEmail) fail('No organizer email set. Add one in Agency Settings.');
  dismissTasksByRef('ticket', ticketId, 'send_booking');
  void tk;
  return { sent: true, to: user.organizerEmail };
}

// ═══════════════════════════════════════════════════════════════════════════════
// ORGANIZER REVIEWS (public, token-based)
// ═══════════════════════════════════════════════════════════════════════════════
export async function apiGetOrganizerReviews(_token: string): Promise<{ groups: GroupProposal[]; tickets: IndividualTicket[] }> {
  await tick();
  return {
    groups: groups.filter((g) => g.status === 'waiting_organizer').map(assembleGroup),
    tickets: tickets.filter((t) => t.status === 'waiting_organizer').map(assembleTicket),
  };
}
export async function apiRespondOrganizerReview(_token: string, refType: 'group' | 'ticket', refId: string, recommendation: 'agency' | 'ai'): Promise<{ message: string }> {
  await tick();
  if (recommendation !== 'agency' && recommendation !== 'ai') fail('recommendation must be "agency" or "ai"');
  if (refType === 'group') {
    const g = groups.find((x) => x.id === refId) ?? fail('Group not found');
    g.organizerRecommendation = recommendation; g.status = 'organizer_responded';
    addTask('organizer_responded', `Organizer reviewed ${g.groupName} — recommends the ${recommendation === 'ai' ? 'AI' : 'agency'} fare.`, { refType: 'group', refId });
  } else if (refType === 'ticket') {
    const tk = tickets.find((x) => x.id === refId) ?? fail('Ticket not found');
    tk.organizerRecommendation = recommendation; tk.status = 'organizer_responded';
    addTask('organizer_responded', `Organizer reviewed ${assembleTicket(tk).travelerName}'s ticket — recommends the ${recommendation === 'ai' ? 'AI' : 'agency'} fare.`, { refType: 'ticket', refId });
  } else fail('refType must be "group" or "ticket"');
  return { message: 'Review submitted. The agency has been notified.' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// INCOMING (organizer submissions → pending travelers)
// ═══════════════════════════════════════════════════════════════════════════════
export async function apiGetPendingTravelers(): Promise<PendingTraveler[]> {
  await tick(); return pendings.filter((p) => p.status === 'pending');
}
export async function apiGetPendingCount(): Promise<{ count: number }> {
  await tick(); return { count: pendings.filter((p) => p.status === 'pending').length };
}
export async function apiApprovePendingTraveler(id: string): Promise<Traveler> {
  await tick();
  const p = pendings.find((x) => x.id === id) ?? fail('Pending traveler not found');
  if (p.status !== 'pending') fail('This traveler has already been processed');
  const t = await apiCreateTraveler({
    name: p.name, email: p.email || undefined, phone: p.phone || undefined, role: p.role, event: p.event,
    destination: p.destination, departureAirport: p.departureAirport || 'TBD', arrivalAirport: p.arrivalAirport,
    departureDate: p.preferredDepartureDate || new Date().toISOString().slice(0, 10),
    returnDate: p.preferredReturnDate || new Date().toISOString().slice(0, 10),
    visa: (p.visa as Traveler['visa']) || 'not_required', status: 'pending', reservation: '—', flightDetails: '—', cost: 0,
  });
  if (p.role === 'Speaker') {
    const tk: TicketRec = { id: 'i-' + nextId(), travelerId: t.id, roleOverride: 'Speaker', reasonCannotGroup: 'Speaker — requires individual booking', status: 'pending', booked: false };
    tickets.unshift(tk);
    const tr = travelers.find((x) => x.id === t.id); if (tr) tr.ticketId = tk.id;
    createTransaction({ type: 'individual', referenceName: t.name, referenceId: tk.id, description: `Individual ticket created — ${t.name} (Speaker)`, flight: '—', pax: 1, unitCost: 0, amount: 0, status: 'no_fare' });
  }
  p.status = 'approved';
  return t;
}
export async function apiRejectPendingTraveler(id: string): Promise<void> {
  await tick();
  const p = pendings.find((x) => x.id === id); if (p) p.status = 'rejected';
}
export async function apiGetAgencyInfo(_token: string): Promise<{ agencyName: string }> {
  await tick(); return { agencyName: user.agency };
}
export async function apiSubmitTraveler(data: {
  token: string; name: string; email?: string; phone?: string; role: string;
  event?: string; destination?: string; departureAirport?: string;
  preferredDepartureDate?: string; preferredReturnDate?: string; visa?: string; notes?: string;
}): Promise<PendingTraveler> {
  await tick();
  if (!data.token || !data.name) fail('Token and name are required');
  const p: PendingTraveler = {
    id: 'p-' + nextId(), name: data.name, email: data.email ?? '', phone: data.phone ?? '', role: data.role || 'Scholar',
    event: data.event ?? EVENT, destination: data.destination ?? DEST, departureAirport: data.departureAirport ?? '',
    arrivalAirport: 'DXB', preferredDepartureDate: data.preferredDepartureDate ?? '', preferredReturnDate: data.preferredReturnDate ?? '',
    visa: data.visa ?? 'not_required', notes: data.notes ?? '', status: 'pending', createdAt: new Date().toISOString().slice(0, 10),
  };
  pendings.unshift(p);
  return p;
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENCY TASKS
// ═══════════════════════════════════════════════════════════════════════════════
export async function apiGetAgencyTasks(): Promise<AgencyTask[]> {
  await tick(); return tasks.filter((t) => !t.read);
}
export async function apiDismissTask(id: string): Promise<void> {
  await tick(); const t = tasks.find((x) => x.id === id); if (t) t.read = true;
}
export async function apiSendTaskEmail(id: string): Promise<{ sent: boolean; to: string }> {
  await tick();
  const t = tasks.find((x) => x.id === id) ?? fail('Task not found');
  t.read = true;
  return { sent: true, to: user.organizerEmail ?? '' };
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTIONS
// ═══════════════════════════════════════════════════════════════════════════════
export async function apiGetTransactions(): Promise<Transaction[]> {
  await tick();
  return transactions.slice()
    .sort((a, b) => (a.type === 'group' ? 0 : 1) - (b.type === 'group' ? 0 : 1) || b.date.localeCompare(a.date))
    .map(txToTransaction);
}
export async function apiGetTransactionSummary(): Promise<{ totalPaid: number; fullRefund: number; taxRefund: number; totalRefunded: number; grandTotal: number }> {
  await tick();
  let plainPaid = 0, fullRefund = 0, taxRefund = 0;
  for (const t of transactions) {
    if (t.paidStatus === 'paid') plainPaid += t.amount;
    if (t.paidStatus === 'paid_full_refund') fullRefund += t.amount;
    if (t.paidStatus === 'paid_tax_refund') taxRefund += t.amount;
  }
  const totalPaid = plainPaid + fullRefund + taxRefund;
  const totalRefunded = fullRefund + taxRefund;
  return { totalPaid, fullRefund, taxRefund, totalRefunded, grandTotal: totalPaid + totalRefunded };
}
export async function apiSetPaymentStatus(id: string, paidStatus: string): Promise<Transaction> {
  await tick();
  const valid = ['no_fare', 'not_paid', 'paid', 'paid_full_refund', 'paid_tax_refund'];
  if (!valid.includes(paidStatus)) fail('Transaction not found or invalid payment status');
  const tx = transactions.find((x) => x.id === id) ?? fail('Transaction not found or invalid payment status');
  tx.paidStatus = paidStatus as Transaction['paidStatus'];
  return txToTransaction(tx);
}
