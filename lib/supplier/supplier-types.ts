import { FlightSearchQuery, Booking, TicketDetails, QuoteDetails } from "@/lib/types";

export type FlightProviderMode = "MANUAL" | "TBO_API" | "HYBRID";

export interface FlightSearchRequest {
  tripType: "oneway" | "roundtrip" | "multicity";
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  children: number;
  infants: number;
  cabinClass: string;
  currency?: string;
}

export interface FlightOfferItem {
  id: string;
  provider: "TBO" | "MANUAL";
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  aircraft?: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  stopoverAirports?: string[];
  baggageAllowance: string;
  baseFare: number;
  taxAndCharges: number;
  totalFare: number;
  currency: string;
  refundable: boolean;
  seatsAvailable?: number;
  validatingCarrier: string;
  fareBasisCode?: string;
}

export interface FlightSearchResponse {
  success: boolean;
  mode: "LIVE_API" | "MANUAL_REQUEST" | "UNAVAILABLE";
  provider: "TBO" | "MANUAL";
  message: string;
  offers: FlightOfferItem[];
  tboConnected: boolean;
  tboApplicationId?: string;
}

export interface FlightProvider {
  name: string;
  code: "TBO" | "MANUAL";
  isConfigured(): boolean;
  searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse>;
  repriceFlight(offerId: string): Promise<{ success: boolean; fare: number; currency: string; message?: string }>;
  createBooking(bookingPayload: any): Promise<{ success: boolean; supplierRef?: string; pnr?: string; message: string }>;
  issueTicket(bookingId: string, paymentRef: string): Promise<{ success: boolean; ticket?: TicketDetails; message: string }>;
  getBooking(supplierRef: string): Promise<any>;
  cancelBooking(supplierRef: string, reason: string): Promise<{ success: boolean; message: string }>;
  requestRefund(supplierRef: string, amount: number): Promise<{ success: boolean; message: string }>;
}
