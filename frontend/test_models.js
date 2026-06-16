const { GoogleGenAI } = require('@google/genai');

// Load API key from env
const GEMINI_API_KEY = "AQ.Ab8RN6LsebVPJj5S01K9alFVzhsgFL6hud_p2MZFUFmP-mb-zw";

async function main() {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  try {
    console.log("Listing models...");
    const response = await ai.models.list();
    console.log("Found models count:", response.length);
    for (const m of response) {
      if (m.supportedMethods && m.supportedMethods.some(method => method.includes('bidiGenerateContent') || method.includes('Live') || method.includes('connect'))) {
        console.log(`- ${m.name}: ${m.displayName} (methods: ${m.supportedMethods.join(', ')})`);
      } else if (m.name.includes('live') || m.name.includes('audio') || m.name.includes('dialog')) {
        console.log(`- ${m.name}: ${m.displayName} (potential)`);
      }
    }
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

main();
