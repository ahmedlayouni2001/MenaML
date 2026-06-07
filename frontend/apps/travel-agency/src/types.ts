export interface FlightInfo {
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  stops: number;
  stopAirport?: string | null;
}

export interface FlightLeg {
  airline: string;
  flightNumber?: string;
  departureTime: string;
  arrivalTime: string;
  stops: number;
  stopAirport?: string;
}

export interface Traveler {
  id: string;
  name: string;
  email: string;
  phone: string;
  agency: string;
  event: string;
  status: 'pending' | 'confirmed' | 'waiting_organizer';
  destination: string;
  departureDate: string;
  returnDate: string;
  role: string;
  departureAirport: string;
  arrivalAirport: string;
  reservation: string;
  flightDetails: string;
  cost: number;
  visa: 'not_required' | 'processing' | 'accepted';
  groupId?: string;
  groupName?: string;
  ticketId?: string;
  outboundFlight?: FlightInfo;
  returnFlight?: FlightInfo;
}

export interface GroupMember {
  id: string;
  name: string;
}

export interface GroupProposal {
  id: string;
  groupName: string;
  size: number;
  destination: string;
  departureDate: string;
  returnDate: string;
  departureAirport: string;
  arrivalAirport: string;
  agencyFare: FareOption | null;
  aiFare: FareOption | null;
  status: 'pending' | 'ai_reviewing' | 'ai_ready' | 'waiting_organizer' | 'organizer_responded' | 'approved_ai' | 'approved_agency' | 'justified';
  createdAt: string;
  members: GroupMember[];
  justification?: string;
  organizerRecommendation?: 'agency' | 'ai';
  booked: boolean;
}

export interface FareOption {
  id?: number;
  airline: string;
  currency: string;
  source?: string;
  sourceUrl?: string;
  selected?: boolean;
  price: number;                    // non-refundable
  priceRefundableTicket?: number;   // individual tickets only
  priceRefundableTaxes?: number;    // individual tickets only
  outbound: FlightLeg;
  returnLeg: FlightLeg;
}

export interface ProposeFareInput {
  price: number;
  priceRefundableTicket?: number;
  priceRefundableTaxes?: number;
  outbound: FlightLeg;
  returnLeg: FlightLeg;
}

export interface IndividualTicket {
  id: string;
  travelerName: string;
  travelerId: string;
  roleOverride?: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  departureAirport: string;
  arrivalAirport: string;
  agencyFare: FareOption | null;
  aiFare: FareOption | null;
  status: 'pending' | 'ai_reviewing' | 'ai_ready' | 'waiting_organizer' | 'organizer_responded' | 'proposed' | 'approved' | 'approved_agency' | 'justified';
  justification?: string;
  organizerRecommendation?: 'agency' | 'ai';
  booked: boolean;
  bookedType?: 'non_refund' | 'tax_refund' | 'full_refund';
}

export interface Transaction {
  id: string;
  type: 'group' | 'individual';
  referenceName: string;
  referenceId: string;
  amount: number;
  currency: string;
  status: string;
  workflowStatus: string;
  booked: boolean;
  paidStatus: 'no_fare' | 'not_paid' | 'paid' | 'paid_full_refund' | 'paid_tax_refund';
  date: string;
  description: string;
  paymentMethod?: string;
  flight: string;
  pax: number;
  unitCost: number;
  outboundFlight?: FlightInfo;
  returnFlight?: FlightInfo;
  bookedType?: 'non_refund' | 'tax_refund' | 'full_refund';
}

export interface AgencyTask {
  id: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
  refType?: string;
  refId?: string;
}

export interface PendingTraveler {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  event: string;
  destination: string;
  departureAirport: string;
  arrivalAirport: string;
  preferredDepartureDate: string;
  preferredReturnDate: string;
  visa: string;
  notes: string;
  status: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  agency: string;
  email: string;
  token: string;
  submissionToken?: string;
  organizerEmail?: string;
}

export interface AgencyNotification {
  id: string;
  type: string;
  message: string;
  emailTarget?: string;
  emailSent: boolean;
  read: boolean;
  createdAt: string;
}
