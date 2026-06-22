import { GoogleGenAI } from "@google/genai";
import { ChatMessage, BookingSession, PageContext } from "./OstrabacusContext";

// Standard response schema returned by the assistant
export interface OstrabacusCommandResponse {
  intent: string;
  tool_called: string | null;
  parameters: Record<string, any>;
  execution_strategy: "BACKGROUND_PREFILL" | "REFUSE" | "NAVIGATE" | "SPEAK" | "COLLECT_INFO";
  spoken_feedback: string;
}

// Get the API key from environment variables
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || (typeof process !== "undefined" ? process.env.GEMINI_API_KEY : "") || "";

let aiClient: GoogleGenAI | null = null;
if (GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    console.log("Ostrabacus AI: GoogleGenAI client initialized successfully.");
  } catch (err) {
    console.error("Ostrabacus AI: Failed to initialize GoogleGenAI client:", err);
  }
} else {
  console.log("Ostrabacus AI: No Gemini API Key found in env. Falling back to local NLP regex parsing.");
}

/**
 * System prompt instructing Gemini how to act, what intents are available, and the output format constraint.
 */
const BASE_SYSTEM_INSTRUCTION = `
You are the core intelligence of Ostrabacus AI, a smart conversational accessibility assistant for a healthcare platform.
Your purpose is to help users—specifically those with visual impairments—navigate the app, search for healthcare resources, understand service details, and book appointments via natural language.

State Machine Intents & Strategies:
1. RESOURCE_SEARCH:
   - tool_called: "fetch_resources"
   - parameters:
     - facility_type: "clinic" | "pharmacy" | "hospital" | "medicines" | null
     - status: "open_now" | "all" | null
     - location: matched location name from Available Locations OR "near me" if they ask for things nearby or specify distance, otherwise null.
   - execution_strategy: "BACKGROUND_PREFILL"

2. NAVIGATE:
   - tool_called: "navigate_to"
   - parameters:
     - page_route: "/search" (for facilities) | "/booking" (for services) | "/medicines" | "/home"
   - execution_strategy: "NAVIGATE"

3. FACILITY_BOOKING / COLLECT_INFO:
   - tool_called: "prefill_booking_form"
   - parameters:
     - patient_name, phone, requested_date, requested_time, facility_name, service_name, notes
   - Guidelines:
     - CRITICAL: patient_name and phone are ALWAYS PRE-FILLED from the logged-in user - NEVER ask for them.
     - Required fields to collect via conversation: service_name, requested_date, requested_time (3 fields only).
     - Auto-filling facility from service:
       - A service always belongs to exactly ONE facility. If the user mentions a service name, look it up in the Available Services list, find its facilityName, and auto-set BOTH service_name AND facility_name in your response parameters immediately. NEVER ask "which facility?" if they already named a service.
       - If the user selects a facility first (not a service), THEN ask which service from that facility.
     - Step-by-step collection order:
       1. Extract service_name from user message → auto-set facility_name from Available Services.
       2. If requested_date is missing → ask "What date would you like the appointment? (e.g. tomorrow, June 20)"
       3. If requested_time is missing → ask "What time would you like? (e.g. 9 AM, 2:30 PM)"
       4. Once service, date, and time are all set → execution_strategy: "BACKGROUND_PREFILL" and confirm details.
     - If any of the 3 required fields are missing, set execution_strategy to "COLLECT_INFO" and ask only for the NEXT missing field.
     - Once ALL 3 are gathered, set execution_strategy to "BACKGROUND_PREFILL" and compose a detailed confirmation summary in spoken_feedback listing all details (service, facility, date, time, name, phone).

4. READ_DETAILS:
   - tool_called: null
   - parameters: {}
   - Guidelines:
     - If the user asks about the requirements, price, wait time, or details of the current service/facility (found in ACTIVE PAGE CONTEXT), answer their question clearly using that context.
     - execution_strategy: "SPEAK"

5. CONVERSATION:
   - tool_called: null
   - parameters: {}
   - Guidelines:
     - Use this for greeting the user, explaining what you can do, or general polite chit-chat.
     - execution_strategy: "SPEAK"

6. OFF_TOPIC:
   - tool_called: null
   - parameters: {}
   - Guidelines:
     - If the user asks about unrelated topics (weather, flights, jokes, programming, code), politely refuse.
     - execution_strategy: "REFUSE"

Output Format:
Return ONLY a valid JSON object matching the schema. Do not output markdown code blocks.
`;

/**
 * High-quality client-side Regex/NLP fallback parser.
 * This runs when the API key is missing or the network request fails,
 * ensuring the application remains 100% interactive and functional.
 */
export function parseLocalNLP(input: string): OstrabacusCommandResponse {
  const normalized = input.toLowerCase().trim();
  const today = new Date();

  // 1. Off-Topic Refusals
  const offTopicKeywords = [
    "weather", "flight", "hotel", "restaurant", "food", "movie", "song", "joke", 
    "recipe", "flight ticket", "paris", "vacation", "game", "football", "code", "programming"
  ];
  if (offTopicKeywords.some(keyword => normalized.includes(keyword))) {
    return {
      intent: "OFF_TOPIC",
      tool_called: null,
      parameters: {},
      execution_strategy: "REFUSE",
      spoken_feedback: "I'm sorry, as the Ostrabacus healthcare assistant, I can only help you find local clinics, pharmacies, hospitals, and pre-fill booking appointments."
    };
  }

  // 2. Booking / Prefill Form
  const isBookingQuery = /book|appointment|schedule|reserve/i.test(normalized);
  if (isBookingQuery) {
    // Extract Facility Name (e.g. "at Apex Clinic" or "in Kigali Medical")
    let facilityName = "General Clinic";
    const facilityMatch = /at\s+([a-zA-Z0-9\s]+?)(?=\s+for|\s+tomorrow|\s+today|\s+at|\s+on|$)/i.exec(normalized);
    if (facilityMatch && facilityMatch[1]) {
      facilityName = facilityMatch[1]
        .split(" ")
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")
        .trim();
    }

    // Extract Date
    let requestedDate = today.toISOString().split("T")[0]; // default today
    if (normalized.includes("tomorrow")) {
      const tomorrow = new Date();
      tomorrow.setDate(today.getDate() + 1);
      requestedDate = tomorrow.toISOString().split("T")[0];
    } else if (normalized.includes("day after tomorrow")) {
      const future = new Date();
      future.setDate(today.getDate() + 2);
      requestedDate = future.toISOString().split("T")[0];
    } else {
      // Search for YYYY-MM-DD pattern
      const dateMatch = /\d{4}-\d{2}-\d{2}/.exec(normalized);
      if (dateMatch) {
        requestedDate = dateMatch[0];
      }
    }

    // Extract Time
    let requestedTime = "09:00:00"; // default 9 AM
    const timeMatch = /(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i.exec(normalized);
    if (timeMatch) {
      let hours = parseInt(timeMatch[1], 10);
      const minutes = timeMatch[2] ? timeMatch[2] : "00";
      const ampm = timeMatch[3].toLowerCase();
      
      if (ampm === "pm" && hours < 12) hours += 12;
      if (ampm === "am" && hours === 12) hours = 0;
      
      requestedTime = `${String(hours).padStart(2, "0")}:${minutes}:00`;
    } else {
      // Match raw 24h format (e.g. "14:30")
      const time24Match = /(\d{2}):(\d{2})/.exec(normalized);
      if (time24Match) {
        requestedTime = `${time24Match[1]}:${time24Match[2]}:00`;
      }
    }

    const formattedTimeStr = requestedTime.split(":")[0] + ":" + requestedTime.split(":")[1];
    return {
      intent: "FACILITY_BOOKING",
      tool_called: "prefill_booking_form",
      parameters: {
        facility_name: facilityName,
        requested_date: requestedDate,
        requested_time: requestedTime
      },
      execution_strategy: "BACKGROUND_PREFILL",
      spoken_feedback: `I have filled out your booking details for ${facilityName} for ${requestedDate} at ${formattedTimeStr}. Please review and confirm on the screen.`
    };
  }

  // 3. Navigation Intent
  const navigateRoutes = [
    { keywords: ["home", "landing"], route: "/home", name: "home page" },
    { keywords: ["search", "search facility", "facilities", "healthcare", "find care", "find a place"], route: "/services", name: "facility search" },
    { keywords: ["booking", "book a service", "search for a service"], route: "/services", name: "medical services" },
    { keywords: ["medicines", "search for a medicines"], route: "/medicines", name: "medicines page" },
  ];

  for (const item of navigateRoutes) {
    if (item.keywords.some(kw => normalized.includes(kw) && (normalized.includes("go to") || normalized.includes("navigate") || normalized.includes("open")))) {
      return {
        intent: "NAVIGATE",
        tool_called: "navigate_to",
        parameters: { page_route: item.route },
        execution_strategy: "NAVIGATE",
        spoken_feedback: `Navigating you to the ${item.name}.`
      };
    }
  }

  // 4. Resource Search / Facilities search
  const isSearchQuery = /find|search|where|look for|pharmacy|clinic|hospital|show/i.test(normalized);
  if (isSearchQuery) {
    let facilityType: "clinic" | "pharmacy" | "hospital" = "clinic";
    if (normalized.includes("pharmacy") || normalized.includes("chemist") || normalized.includes("drugstore")) {
      facilityType = "pharmacy";
    } else if (normalized.includes("hospital") || normalized.includes("emergency")) {
      facilityType = "hospital";
    }

    const status = normalized.includes("open now") || normalized.includes("open right now") || normalized.includes("active now") ? "open_now" : "all";
    
    // Simple location extraction
    let location = "kigali";
    const locationMatch = /in\s+([a-zA-Z]+)/i.exec(normalized);
    if (locationMatch && locationMatch[1]) {
      location = locationMatch[1];
    } else if (normalized.includes("near me") || normalized.includes("around me")) {
      location = "near me";
    }

    const statusText = status === "open_now" ? "open" : "available";
    return {
      intent: "RESOURCE_SEARCH",
      tool_called: "fetch_resources",
      parameters: {
        facility_type: facilityType,
        status: status,
        location: location
      },
      execution_strategy: "BACKGROUND_PREFILL",
      spoken_feedback: `Searching for ${statusText} ${facilityType}s in ${location === "near me" ? "your current location" : location}. I am updating your list now.`
    };
  }

  // General Fallback
  return {
    intent: "RESOURCE_SEARCH",
    tool_called: "fetch_resources",
    parameters: {
      facility_type: "clinic",
      status: "all",
      location: "kigali"
    },
    execution_strategy: "BACKGROUND_PREFILL",
    spoken_feedback: "I got you, Please wait a few moments. You can also ask me to book appointments or navigate pages."
  };
}

/**
 * Main command analysis entrypoint.
 * Sends the user input and conversation context to Gemini, falling back to local parsing.
 */
export async function analyzeCommand(
  userInput: string,
  chatHistory: ChatMessage[],
  context: {
    currentPath: string;
    pageContext: PageContext | null;
    bookingSession: BookingSession | null;
    availableLocations: string[];
    availableFacilities: string[];
    availableServices: Array<{ id: string | number; name: string; facilityName: string }>;
    prefilledPatientName: string;
    prefilledPhone: string;
  }
): Promise<OstrabacusCommandResponse> {
  if (!aiClient) {
    return parseLocalNLP(userInput);
  }

  try {
    // Format conversation history for Gemini API
    const contents = chatHistory.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    }));

    // Add current user prompt
    contents.push({
      role: "user",
      parts: [{ text: userInput }]
    });

    // Instate dynamic system instructions with context
    const dynamicSystemInstruction = `
${BASE_SYSTEM_INSTRUCTION}

CURRENT DATA SYSTEM CONTEXT:
- Available Locations: ${JSON.stringify(context.availableLocations)}
- Available Facilities: ${JSON.stringify(context.availableFacilities)}
- Available Services (each service has exactly ONE facility): ${JSON.stringify(context.availableServices)}

PREFILLED PATIENT CREDENTIALS (DO NOT ASK THE USER FOR THESE):
- patient_name: "${context.prefilledPatientName}"
- phone: "${context.prefilledPhone}"
Always include these values in your parameters when constructing a booking response.

ACTIVE PAGE CONTEXT:
${context.pageContext ? JSON.stringify(context.pageContext) : "No active service or facility page loaded."}

CURRENT BOOKING SESSION DATA (COLLECTED SO FAR):
${context.bookingSession ? JSON.stringify(context.bookingSession) : "No active booking session."}
    `;

    const response = await aiClient.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: contents as any,
      config: {
        systemInstruction: dynamicSystemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            intent: { type: "STRING" },
            tool_called: { type: "STRING", nullable: true },
            parameters: {
              type: "OBJECT",
              properties: {
                facility_type: { type: "STRING" },
                status: { type: "STRING" },
                location: { type: "STRING" },
                facility_name: { type: "STRING" },
                service_name: { type: "STRING" },
                patient_name: { type: "STRING" },
                phone: { type: "STRING" },
                requested_date: { type: "STRING" },
                requested_time: { type: "STRING" },
                page_route: { type: "STRING" },
                notes: { type: "STRING" }
              }
            },
            execution_strategy: {
              type: "STRING",
              enum: ["BACKGROUND_PREFILL", "REFUSE", "NAVIGATE", "SPEAK", "COLLECT_INFO"]
            },
            spoken_feedback: { type: "STRING" }
          },
          required: ["intent", "tool_called", "parameters", "execution_strategy", "spoken_feedback"]
        }
      }
    });

    const responseText = response.text?.trim() || "";
    const parsed = JSON.parse(responseText) as OstrabacusCommandResponse;

    if (!parsed.intent || !parsed.execution_strategy) {
      throw new Error("Invalid structure returned from Gemini model.");
    }

    return parsed;
  } catch (error) {
    console.warn("Ostrabacus AI: Gemini API call failed. Falling back to local NLP parser.", error);
    return parseLocalNLP(userInput);
  }
}
