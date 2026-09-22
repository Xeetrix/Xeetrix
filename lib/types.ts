export type TripType = "oneway" | "roundtrip";

export type CabinClass = "Economy" | "Premium Economy" | "Business" | "First Class";

export type ServiceType =
  | "general"
  | "middle-east-workers"
  | "student-flights"
  | "umrah-holidays"
  | "date-change"
  | "group-booking";

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

export interface QuoteRequestPayload {
  fullName: string;
  phone: string;
  email: string;
  tripType: TripType;
  fromCity: string;
  toCity: string;
  departureDate: string;
  returnDate?: string;
  cabinClass: CabinClass;
  passengers: number;
  passengerCategory: string;
  specialRequirements?: string;
  preferredAirline?: string;
}

export interface QuoteResponse {
  success: boolean;
  referenceId: string;
  message: string;
}
