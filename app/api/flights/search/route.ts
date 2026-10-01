import { NextRequest, NextResponse } from "next/server";
import { flightProviderService } from "@/lib/supplier/flight-provider";
import { AIRPORTS } from "@/lib/constants";

/**
 * Flight Search API Route
 *
 * Architecture Compliance:
 * - Default flightSearchMode is explicitly "MANUAL".
 * - TBO API credentials are NOT available yet (Application ID: 238072).
 * - All TBO environment variables are optional.
 * - When TBO credentials are missing / in MANUAL mode:
 *   - Never calls TBO API
 *   - Never displays fake flight results or fake prices
 *   - Returns MANUAL_REQUEST mode with empty offers, routing user to the "Get Best Fare" manual workflow.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fromCode = "DAC",
      toCode = "JED",
      departureDate = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
      returnDate,
      tripType = "oneway",
      cabinClass = "Economy",
      adults = 1,
      children = 0,
      infants = 0,
      currency = "BDT",
    } = body;

    const fromAirport = AIRPORTS.find((a) => a.code === fromCode) || {
      city: fromCode,
      name: fromCode,
      code: fromCode,
      country: "",
    };
    const toAirport = AIRPORTS.find((a) => a.code === toCode) || {
      city: toCode,
      name: toCode,
      code: toCode,
      country: "",
    };

    const provider = flightProviderService.getProvider();

    // Query active provider
    const searchResponse = await provider.searchFlights({
      tripType,
      origin: fromCode,
      destination: toCode,
      departureDate,
      returnDate,
      adults,
      children,
      infants,
      cabinClass,
      currency,
    });

    return NextResponse.json({
      success: true,
      mode: searchResponse.mode, // "MANUAL_REQUEST" by default
      provider: searchResponse.provider,
      tboConnected: searchResponse.tboConnected,
      tboApplicationId: searchResponse.tboApplicationId || "238072",
      message: searchResponse.message,
      offers: searchResponse.offers, // Empty array in manual mode (No fake data)
      searchParams: {
        fromCode,
        fromCity: fromAirport.city,
        toCode,
        toCity: toAirport.city,
        departureDate,
        returnDate,
        tripType,
        cabinClass,
        adults,
        children,
        infants,
        currency,
      },
      requestUrl: `/flights/request?from=${fromCode}&to=${toCode}&depart=${departureDate}&return=${returnDate || ""}&tripType=${tripType}&adults=${adults}&cabin=${encodeURIComponent(cabinClass)}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        mode: "MANUAL_REQUEST",
        provider: "MANUAL",
        message:
          "Flight search is currently handled by our travel desk. Submit your requirements and our team will confirm the latest available fare.",
        offers: [],
        error: error.message,
      },
      { status: 500 }
    );
  }
}
