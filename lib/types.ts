export type TripType = "oneway" | "roundtrip" | "multicity";

export type CabinClass = "Economy" | "Premium Economy" | "Business" | "First Class";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "BOOKING_STAFF"
  | "FINANCE_STAFF"
  | "AGENT"
  | "CUSTOMER";

export type AgentStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED";

export type BookingStatus =
  | "DRAFT"
  | "REQUESTED"
  | "QUOTED"
  | "AWAITING_PAYMENT"
  | "PAYMENT_SUBMITTED"
  | "PAYMENT_VERIFIED"
  | "SUPPLIER_PROCESSING"
  | "CONFIRMED"
  | "TICKETED"
  | "CANCEL_REQUESTED"
  | "CANCELLED"
  | "REFUND_REQUESTED"
  | "REFUNDED"
  | "FAILED";

export type PaymentStatus =
  | "UNPAID"
  | "PAYMENT_SUBMITTED"
  | "UNDER_REVIEW"
  | "PAID"
  | "REJECTED"
  | "REFUNDED"
  | "PARTIALLY_REFUNDED";

export type PaymentMethod = "bKash" | "Nagad" | "Bank Transfer" | "Cash Deposit" | "Other";

export interface Passenger {
  title: "Mr" | "Mrs" | "Ms" | "Mstr" | "Dr";
  firstName: string;
  lastName: string;
  type: "Adult" | "Child" | "Infant";
  dateOfBirth?: string;
  passportNumber?: string;
  passportExpiry?: string;
  nationality?: string;
  frequentFlyerNo?: string;
}

export interface QuoteDetails {
  supplierFare: number;
  xeetrixMarkup: number;
  agentMarkup?: number;
  agentCommission?: number;
  customerFare: number;
  currency: string;
  validUntil?: string;
  airlineNotes?: string;
  quotedAt: string;
  quotedBy?: string;
}

export interface PaymentDetails {
  method: PaymentMethod;
  transactionId: string;
  amount: number;
  currency: string;
  paymentProofUrl?: string;
  paymentStatus: PaymentStatus;
  submittedAt: string;
  verifiedBy?: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

export interface TicketDetails {
  pnr: string;
  eTicketNumber?: string;
  airlineCode?: string;
  airlineName?: string;
  ticketFileUrl?: string;
  ticketFileName?: string;
  issuedAt?: string;
  issuedBy?: string;
  ticketPdfUrl?: string;
}

export interface BookingTimelineEntry {
  status: BookingStatus;
  timestamp: string;
  actor: string;
  actorRole?: string;
  note?: string;
}

export interface Booking {
  id: string;
  bookingReference: string; // e.g., XE-B2C-20260929-0001 or XE-B2B-20260929-0001
  channel: "B2C" | "B2B";
  
  // Agent details if B2B
  agentId?: string;
  agentCode?: string;
  agencyName?: string;
  
  // Customer details
  customerId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress?: string;

  // Flight Route details
  tripType: TripType;
  origin: string;
  originCity: string;
  destination: string;
  destinationCity: string;
  departureDate: string;
  returnDate?: string;
  cabinClass: CabinClass;
  passengerCount: {
    adults: number;
    children: number;
    infants: number;
    total: number;
  };
  passengers: Passenger[];
  preferredAirline?: string;
  specialRequest?: string;

  // Status & Financials
  status: BookingStatus;
  quote?: QuoteDetails;
  payment?: PaymentDetails;
  ticket?: TicketDetails;
  timeline: BookingTimelineEntry[];

  // Supplier info
  supplierCode?: "TBO" | "MANUAL" | "OTHER";
  supplierBookingId?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Agent {
  id: string; // Auth UID or doc ID
  agentCode: string; // e.g. XE-AG-0001
  agencyName: string;
  ownerName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  tradeLicenseNumber?: string;
  website?: string;
  expectedMonthlyVolume: string;
  existingBusiness: boolean;
  notes?: string;

  status: AgentStatus;
  creditEnabled: boolean; // default false
  creditLimit: number; // default 0
  outstandingAmount: number; // default 0

  commissionType: "PERCENTAGE" | "FIXED";
  commissionValue: number;
  markupType: "PERCENTAGE" | "FIXED";
  markupValue: number;

  totalBookings: number;
  totalSales: number;
  totalCommission: number;

  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  actorRole: string;
  action: string;
  entity: "BOOKING" | "AGENT" | "PAYMENT" | "TICKET" | "SUPPLIER" | "QUOTE" | "SYSTEM";
  entityId: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface RefundRequest {
  id: string;
  bookingReference: string;
  bookingId: string;
  requestedBy: string;
  requestedRole: string;
  reason: string;
  requestedAmount: number;
  supplierRefund?: number;
  xeetrixFee?: number;
  refundableAmount?: number;
  status: "REQUESTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED" | "PROCESSED";
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SupplierConfig {
  code: "TBO" | "MANUAL";
  name: string;
  status: "CONNECTED" | "NOT_CONNECTED" | "PENDING_CREDENTIALS";
  environment: "TEST" | "PRODUCTION";
  applicationId?: string;
  lastSuccessfulCall?: string;
  lastError?: string;
  enabled: boolean;
}

export interface FlightSearchQuery {
  tripType: TripType;
  fromCode: string;
  fromCity: string;
  toCode: string;
  toCity: string;
  departureDate: string;
  returnDate?: string;
  cabinClass: CabinClass;
  adults: number;
  children: number;
  infants: number;
  passengerCategory?: "Standard" | "Migrant Worker" | "Student" | "Umrah";
}
