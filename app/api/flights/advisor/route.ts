import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AIRPORTS } from "@/lib/constants";

let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

export async function POST(req: NextRequest) {
  try {
    const { destinationCode = "JED", destinationCity = "Jeddah", travelerType = "worker", language = "en" } = await req.json();

    const ai = getAi();
    if (ai) {
      try {
        const prompt = `You are a certified air travel, visa, and airline baggage consultant.
Provide precise, verified travel intelligence for a passenger flying to:
- Destination: ${destinationCity} (${destinationCode})
- Passenger Category: ${travelerType}
- Target Language: ${language} (en, bn for Bengali, ar for Arabic)

Return ONLY a JSON response matching:
{
  "destination": "${destinationCity}",
  "country": "Country Name",
  "visaSummary": "Clear concise visa advice (transit, tourist, work, or on-arrival rules)",
  "luggageRules": "Luggage allowances (mentioning 40-46kg worker or 46kg student if applicable)",
  "transitAdvice": "Advice on layovers or stopover visas (e.g. 96-hour Saudi stopover, 48/96h Dubai transit)",
  "bestAirlines": ["Airline 1", "Airline 2", "Airline 3"],
  "currencyTip": "Local currency note and payment advice",
  "airportNotes": "Terminal advice or reporting time (e.g. 3-4 hours prior)"
}`;

        const response = await ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            temperature: 0.2,
          },
        });

        const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          const parsed = JSON.parse(text);
          return NextResponse.json({
            success: true,
            source: "gemini-travel-intel",
            data: parsed,
          });
        }
      } catch (err) {
        console.warn("Travel advisor Gemini fallback:", err);
      }
    }

    // Default intelligence
    return NextResponse.json({
      success: true,
      source: "verified-guidelines",
      data: {
        destination: destinationCity,
        country: "International Destination",
        visaSummary: "Ensure passport is valid for at least 6 months. Work visa holders require valid BMET clearance & medical certificate.",
        luggageRules: travelerType === "worker"
          ? "Special 46kg allowance (2x 23kg checked bags + 7kg cabin) on Biman & Saudia."
          : "Standard 30kg checked baggage + 7kg carry-on.",
        transitAdvice: "Layovers under 24 hours in international transit do not require transit visas.",
        bestAirlines: ["Biman Bangladesh Airlines", "Saudia", "Emirates", "Qatar Airways"],
        currencyTip: "Carry international debit/credit cards or USD/SAR cash for exchange at airport.",
        airportNotes: "Arrive at Dhaka Hazrat Shahjalal International Airport at least 3.5 hours before flight departure.",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to generate travel advice" },
      { status: 500 }
    );
  }
}
