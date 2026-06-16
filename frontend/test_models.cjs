const { GoogleGenAI } = require('@google/genai');

const GEMINI_API_KEY = "AQ.Ab8RN6LsebVPJj5S01K9alFVzhsgFL6hud_p2MZFUFmP-mb-zw";

async function main() {
  const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  try {
    console.log("Listing models...");
    const pager = await ai.models.list();
    let count = 0;
    for await (const m of pager) {
      count++;
      const isLive = m.supportedActions && m.supportedActions.some(act => act.includes('bidiGenerateContent') || act.includes('Live'));
      if (isLive || m.name.includes('live') || m.name.includes('dialog') || m.name.includes('audio')) {
        console.log(`- ${m.name}: ${m.displayName} (Actions: ${m.supportedActions ? m.supportedActions.join(', ') : 'none'})`);
      }
    }
    console.log("Total models scanned:", count);
  } catch (err) {
    console.error("Error listing models:", err);
  }
}

main();
