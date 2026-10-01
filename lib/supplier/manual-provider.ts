import {
  FlightProvider,
  FlightSearchRequest,
  FlightSearchResponse,
} from "./supplier-types";
import { TicketDetails } from "@/lib/types";

/**
 * Manual / Travel Desk Flight Provider
 * Used in Phase 1 for B2C & B2B bookings.
 * Submits requests directly to the Xeetrix reservation desk for live airline GDS confirmation.
 */
export class ManualProvider implements FlightProvider {
  name = "Xeetrix Travel Desk (Manual GDS)";
  code = "MANUAL" as const;

  isConfigured(): boolean {
    return true; // Always available
  }

  async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse> {
    return {
      success: true,
      mode: "MANUAL_REQUEST",
      provider: "MANUAL",
      tboConnected: false,
      message:
        "Flight search is currently handled by our travel desk. Submit your requirements and our team will confirm the latest available fare.",
      offers: [],
    };
  }

  async repriceFlight(offerId: string): Promise<{ success: boolean; fare: number; currency: string; message?: string }> {
    return {
      success: true,
      fare: 0,
      currency: "BDT",
      message: "Travel desk verifies live airline net-fares upon booking submission.",
    };
  }

  async createBooking(bookingPayload: any): Promise<{ success: boolean; supplierRef?: string; pnr?: string; message: string }> {
    return {
      success: true,
      supplierRef: `XT-DESK-${Date.now()}`,
      message: "Flight booking request submitted to Xeetrix Travel Desk for airline PNR creation.",
    };
  }

  async issueTicket(bookingId: string, paymentRef: string): Promise<{ success: boolean; ticket?: TicketDetails; message: string }> {
    return {
      success: true,
      message: "Ticket is uploaded and issued by the Xeetrix ticketing officer following verified payment.",
    };
  }

  async getBooking(supplierRef: string): Promise<any> {
    return { supplierRef, status: "DESK_MANAGED" };
  }

  async cancelBooking(supplierRef: string, reason: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: "Cancellation request received. Our ticketing desk will verify airline cancellation penalties.",
    };
  }

  async requestRefund(supplierRef: string, amount: number): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: "Refund request initiated for desk review.",
    };
  }
}
