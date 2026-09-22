import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const quoteSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(6, "Valid phone number is required"),
  email: z.string().email("Valid email is required"),
  tripType: z.enum(["oneway", "roundtrip"]),
  fromCity: z.string().min(2, "Departure origin is required"),
  toCity: z.string().min(2, "Destination is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  returnDate: z.string().optional(),
  cabinClass: z.string().default("Economy"),
  passengers: z.number().int().positive().default(1),
  passengerCategory: z.string().default("Standard"),
  specialRequirements: z.string().optional(),
  preferredAirline: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = quoteSchema.parse(body);

    const referenceId = `XTX-${Date.now().toString().slice(-6)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

    // Log the received quote for processing by ticketing agents
    console.info(`[Xeetrix Air Ticketing] Received quote request ${referenceId}:`, {
      name: validated.fullName,
      route: `${validated.fromCity} -> ${validated.toCity}`,
      date: validated.departureDate,
      phone: validated.phone,
      email: validated.email,
    });

    return NextResponse.json(
      {
        success: true,
        referenceId,
        message:
          "Flight quote request submitted successfully. Our ticketing team is comparing live GDS net-fares and will contact you within 15 minutes.",
        data: {
          referenceId,
          route: `${validated.fromCity} to ${validated.toCity}`,
          passengers: validated.passengers,
          travelClass: validated.cabinClass,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Internal server error. Please call our 24/7 helpline at +8809658036631." },
      { status: 500 }
    );
  }
}
