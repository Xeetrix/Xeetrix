import {
  FlightProvider,
  FlightSearchRequest,
  FlightSearchResponse,
} from "./supplier-types";
import { TicketDetails } from "@/lib/types";

/**
 * TBO Air API Provider Implementation (Application ID: 238072)
 *
 * NOTE: Credentials are NOT available yet.
 * All TBO environment variables are completely OPTIONAL.
 * The application works fully in MANUAL mode when credentials are missing.
 * Does NOT crash when any or all TBO environment variables are undefined.
 * NEVER calls the TBO API and NEVER produces fake flight data when unconfigured.
 */
export class TBOProvider implements FlightProvider {
  name = "TBO Air API";
  code = "TBO" as const;

  // All credentials are fully optional strings or undefined
  private baseUrl: string | undefined;
  private apiKey: string | undefined;
  private username: string | undefined;
  private password: string | undefined;
  private secret: string | undefined;

  constructor() {
    // Safely read optional environment variables without throwing or crashing
    try {
      this.baseUrl = process.env.TBO_API_BASE_URL?.trim() || undefined;
      this.apiKey = process.env.TBO_API_KEY?.trim() || undefined;
      this.username = process.env.TBO_USERNAME?.trim() || undefined;
      this.password = process.env.TBO_PASSWORD?.trim() || undefined;
      this.secret = process.env.TBO_SECRET?.trim() || undefined;
    } catch {
      // In case process.env is accessed in restricted environments
      this.baseUrl = undefined;
      this.apiKey = undefined;
      this.username = undefined;
      this.password = undefined;
      this.secret = undefined;
    }
  }

  /**
   * Returns true ONLY if all required TBO credentials are provided in the environment.
   * If any variable is missing, undefined, or empty, returns false.
   */
  isConfigured(): boolean {
    return Boolean(
      this.baseUrl &&
      this.baseUrl !== "" &&
      ((this.apiKey && this.apiKey !== "") ||
       (this.username && this.username !== "" && this.password && this.password !== ""))
    );
  }

  /**
   * Search flights.
   * If credentials are not configured, NEVER calls TBO API, NEVER returns fake flights/prices.
   * Returns MANUAL_REQUEST mode with empty offers so user is routed to travel desk.
   */
  async searchFlights(request: FlightSearchRequest): Promise<FlightSearchResponse> {
    if (!this.isConfigured()) {
      return {
        success: true,
        mode: "MANUAL_REQUEST",
        provider: "MANUAL",
        tboConnected: false,
        tboApplicationId: "238072",
        message:
          "Flight search is currently handled by our travel desk. Submit your requirements and our team will confirm the latest available fare.",
        offers: [],
      };
    }

    try {
      // Live TBO API call - only executed when real credentials are verified
      const response = await fetch(`${this.baseUrl}/Search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(this.apiKey ? { "x-api-key": this.apiKey } : {}),
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`TBO API returned status ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        mode: "LIVE_API",
        provider: "TBO",
        tboConnected: true,
        tboApplicationId: "238072",
        message: "Live TBO flights retrieved successfully.",
        offers: data.results || [],
      };
    } catch (error: any) {
      console.warn("TBO API search error, falling back to manual desk:", error.message);
      return {
        success: true,
        mode: "MANUAL_REQUEST",
        provider: "MANUAL",
        tboConnected: false,
        tboApplicationId: "238072",
        message:
          "Flight search is currently handled by our travel desk. Submit your requirements and our team will confirm the latest available fare.",
        offers: [],
      };
    }
  }

  async repriceFlight(offerId: string): Promise<{ success: boolean; fare: number; currency: string; message?: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        fare: 0,
        currency: "BDT",
        message: "TBO credentials pending. Travel desk verifies live fare upon manual booking request.",
      };
    }
    return { success: false, fare: 0, currency: "BDT", message: "TBO repricing not configured" };
  }

  async createBooking(bookingPayload: any): Promise<{ success: boolean; supplierRef?: string; pnr?: string; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: "TBO API credentials pending activation. Booking routed to Xeetrix Travel Desk for manual PNR creation.",
      };
    }
    return { success: false, message: "TBO booking not configured" };
  }

  async issueTicket(bookingId: string, paymentRef: string): Promise<{ success: boolean; ticket?: TicketDetails; message: string }> {
    if (!this.isConfigured()) {
      return {
        success: false,
        message: "TBO API credentials pending. Ticket issuance handled by authorized Xeetrix ticketing officer.",
      };
    }
    return { success: false, message: "TBO ticketing not configured" };
  }

  async getBooking(supplierRef: string): Promise<any> {
    return null;
  }

  async cancelBooking(supplierRef: string, reason: string): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: "TBO credentials pending. Cancellation processed via offline airline desk.",
    };
  }

  async requestRefund(supplierRef: string, amount: number): Promise<{ success: boolean; message: string }> {
    return {
      success: false,
      message: "TBO credentials pending. Refund processed via offline airline desk.",
    };
  }
}
