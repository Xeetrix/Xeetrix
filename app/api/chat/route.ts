import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// Lazy initialize Gemini client
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not configured");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const SYSTEM_INSTRUCTION = `You are the Xeetrix AI Flight Concierge, the official airline ticketing, route intelligence, and passenger advisory specialist for Xeetrix (xeetrix.com) — an authorized global air ticketing agency.

Your capabilities:
1. Air Ticket Fares & Airlines: Assist with flights on 120+ carriers (Biman, Saudia, Emirates, Qatar Airways, Singapore Airlines, flydubai, US-Bangla, Turkish Airlines, etc.).
2. Special Fares & Baggage: Detail standard, Middle East migrant worker (40-46kg), and student baggage concessions.
3. Transit & Visas: Provide verified transit visa policies and airport terminal navigation guidance.
4. Airport & Terminal Locations: Provide Google Maps-grounded advice for airports (DAC Hazrat Shahjalal, DXB Dubai, JED King Abdulaziz, RUH King Khalid, KUL Kuala Lumpur, LHR Heathrow, etc.), terminals, and transportation.
5. Agency Action: Provide clear follow-up actions: users can request an official PNR quotation directly in the Xeetrix app or call the 24/7 Ticketing Desk at +880 965 803 6631.

Tone: Prestigious, professional, clear, and reassuring. Format lists cleanly. Keep answers crisp and actionable.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, mode = "general" } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "A non-empty array of messages is required." },
        { status: 400 }
      );
    }

    const ai = getAi();

    // Map conversation history into Gemini format
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }],
    }));

    const lastUserMessage = messages[messages.length - 1]?.content || "";
    const lower = lastUserMessage.toLowerCase();

    // Model & Tool Selection
    let modelName = "gemini-3.5-flash";
    let tools: any[] | undefined = undefined;

    // Detect if user is asking for geographical location, airport map, distance, terminal
    const needsMaps =
      mode === "maps" ||
      lower.includes("where is") ||
      lower.includes("map") ||
      lower.includes("terminal location") ||
      lower.includes("distance to") ||
      lower.includes("how to get to") ||
      lower.includes("airport address");

    // Detect if user needs live real-time web search
    const needsSearch =
      mode === "search" ||
      lower.includes("today") ||
      lower.includes("current fare") ||
      lower.includes("live") ||
      lower.includes("schedule today") ||
      lower.includes("price right now") ||
      lower.includes("latest policy") ||
      lower.includes("restrictions");

    if (mode === "complex" || lower.includes("multi-city") || lower.includes("custom itinerary") || lower.includes("corporate tender")) {
      modelName = "gemini-3.1-pro-preview";
    } else if (mode === "fast" || lower.length < 25) {
      modelName = "gemini-3.1-flash-lite";
    } else if (needsMaps) {
      modelName = "gemini-3.5-flash";
      tools = [{ googleMaps: {} }];
    } else if (needsSearch) {
      modelName = "gemini-3.5-flash";
      tools = [{ googleSearch: {} }];
    } else {
      // Default to gemini-3.5-flash with Google Search grounding for accurate air travel intel
      modelName = "gemini-3.5-flash";
      tools = [{ googleSearch: {} }];
    }

    const config: any = {
      systemInstruction: SYSTEM_INSTRUCTION,
    };

    if (tools) {
      config.tools = tools;
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents,
      config,
    });

    const candidate = response.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text || "I was unable to retrieve flight information. Please contact our 24/7 Ticketing Desk at +880 965 803 6631.";
    const groundingMetadata = candidate?.groundingMetadata;

    // Extract sources if available
    let sources: { title: string; url: string }[] = [];
    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks as any[]) {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({ title: chunk.web.title, url: chunk.web.uri });
        }
      }
    }

    return NextResponse.json({
      text,
      modelUsed: modelName,
      groundingType: needsMaps ? "maps" : tools ? "search" : "none",
      searchQueries: groundingMetadata?.webSearchQueries || [],
      sources: sources.slice(0, 4),
    });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    return NextResponse.json(
      {
        error: error?.message || "Failed to generate AI flight assistance response.",
        text: "Our AI flight desk encountered a brief service interruption. Please call our direct ticketing helpline at +880 965 803 6631 for instantaneous booking and fare assistance.",
      },
      { status: 500 }
    );
  }
}
