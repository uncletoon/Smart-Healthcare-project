import { GoogleGenAI } from "@google/genai";

// Standard response schema returned by the assistant
export interface OstrabacusCommandResponse {
  intent: string;
  tool_called: string | null;
  parameters: Record<string, any>;
  execution_strategy: "BACKGROUND_PREFILL" | "REFUSE" | "NAVIGATE";
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
const SYSTEM_INSTRUCTION = `
You are the core intelligence of Ostrabacus AI, an embedded accessibility assistant for a healthcare platform.
Your purpose is to help users—specifically those with visual impairments—seamlessly navigate the app, search for healthcare resources, and fill out booking forms via natural language voice/text.

Determine the user's intent and return a clean JSON object matching the schema.

INTENTS & ACTIONS:
1. RESOURCE_SEARCH
   - Action (tool_called): "fetch_resources"
   - Parameters:
     - "facility_type": "clinic" | "pharmacy" | "hospital" (allowed types)
     - "status": "open_now" | "all"
     - "location": string (e.g. "Kigali", "Remera", etc.)
   - Strategy: "BACKGROUND_PREFILL"

2. NAVIGATE
   - Action (tool_called): "navigate_to"
   - Parameters:
     - "page_route": "/search" | "/booking" | "/dashboard" | "/home" (allowed page routes)
   - Strategy: "NAVIGATE"

3. FACILITY_BOOKING
   - Action (tool_called): "prefill_booking_form"
   - Parameters:
     - "facility_name": string (the healthcare facility name mentioned)
     - "requested_date": string formatted as YYYY-MM-DD
     - "requested_time": string formatted as HH:MM:SS
   - Strategy: "BACKGROUND_PREFILL"

CRITICAL LAWS:
- THE HUMAN-IN-THE-LOOP RULE: Never finalize bookings or submit forms automatically. Prefill them and direct focus.
- CONTEXT BOUNDARY: Refuse off-topic questions (e.g. weather, flights, jokes). Respond with:
  - intent: "OFF_TOPIC"
  - tool_called: null
  - strategy: "REFUSE"
  - spoken_feedback: Refuse politely and remind them of your local healthcare clinic/pharmacy capabilities.

OUTPUT FORMAT:
Respond ONLY with a valid, clean JSON object. Do not include markdown formatting like \`\`\`json, conversational padding, or commentary.
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
      spoken_feedback: "I'm sorry, as the Ostrabacus healthcare assistant, I can only help you find local clinics, pharmacies, hospitals, and pre-fill booking appointments. How can I help you navigate care today?"
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
    // { keywords: ["dashboard", "admin", "profile", "analytics"], route: "/dashboard", name: "admin dashboard" }
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
    spoken_feedback: "I am updating the resources search view. You can also ask me to book appointments or navigate pages."
  };
}

/**
 * Main command analysis entrypoint.
 * Sends the user input to Gemini if initialized, falling back to local parsing.
 */
export async function analyzeCommand(userInput: string): Promise<OstrabacusCommandResponse> {
  if (!aiClient) {
    return parseLocalNLP(userInput);
  }

  try {
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash",
      contents: userInput,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
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
                requested_date: { type: "STRING" },
                requested_time: { type: "STRING" },
                page_route: { type: "STRING" }
              }
            },
            execution_strategy: {
              type: "STRING",
              enum: ["BACKGROUND_PREFILL", "REFUSE", "NAVIGATE"]
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
