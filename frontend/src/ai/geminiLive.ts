/**
 * geminiLive.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Core Gemini Multimodal Live API session manager.
 *
 * Audio pipeline (input):
 *   Mic → AudioContext → AudioWorkletNode (ostrabacus-mic) → PCM chunks → sendRealtimeInput
 *
 * Audio pipeline (output):
 *   base64 PCM chunks from Gemini → AudioPlaybackQueue → AudioContext → speakers
 *
 * Key design decisions:
 *   - AudioWorkletNode replaces the deprecated ScriptProcessorNode.
 *   - The worklet code is injected as an inline Blob URL (no separate file needed).
 *   - `_sendEnabled` is the FIRST thing set to false in close(), preventing the
 *     "WebSocket already CLOSING/CLOSED" error that occurs when the worklet's
 *     message queue still has pending callbacks after a close() call.
 *   - Gemini session is closed LAST, after all audio nodes are torn down.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import { GoogleGenAI, Modality } from "@google/genai";

// ─── Constants ───────────────────────────────────────────────────────────────

/** Stable Live API model available on all tiers including free */
export const LIVE_MODEL = "gemini-2.5-flash-native-audio-latest";


/** Gemini Live expects PCM at this sample rate */
const MIC_SAMPLE_RATE = 16_000;

/** Gemini Live outputs PCM at this sample rate */
const PLAYBACK_SAMPLE_RATE = 24_000;

// ─── AudioWorklet processor (injected as inline Blob) ────────────────────────
// Runs in the audio worklet thread; posts Float32 chunks to the main thread.
// slice(0) copies the buffer before the engine reclaims it.

const MIC_WORKLET_CODE = `
class OstrabacusMicProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const ch = inputs[0]?.[0];
    if (ch && ch.length > 0) {
      this.port.postMessage(ch.slice(0));
    }
    return true; // keep alive
  }
}
registerProcessor('ostrabacus-mic', OstrabacusMicProcessor);
`;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface LiveToolCallEvent {
  name: string;
  args: Record<string, any>;
  callId: string;
}

export interface LiveSessionCallbacks {
  onSpeaking: () => void;
  onTurnComplete: () => void;
  onListening: () => void;
  onTranscript: (text: string) => void;
  onToolCall: (event: LiveToolCallEvent) => void;
  onStatus: (message: string) => void;
  onError: (message: string) => void;
  onClose: () => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function float32ToPcm16(f32: Float32Array): ArrayBuffer {
  const buf = new ArrayBuffer(f32.length * 2);
  const view = new DataView(buf);
  for (let i = 0; i < f32.length; i++) {
    const s = Math.max(-1, Math.min(1, f32[i]));
    view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buf;
}

function arrayBufferToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.byteLength; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function base64ToPcm16(b64: string): Int16Array {
  const bin = atob(b64);
  const buf = new ArrayBuffer(bin.length);
  const u8 = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Int16Array(buf);
}

/** Linear downsample float32 audio from one rate to another (mono) */
function downsample(src: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return src;
  const ratio = fromRate / toRate;
  const out = new Float32Array(Math.round(src.length / ratio));
  for (let i = 0; i < out.length; i++) out[i] = src[Math.round(i * ratio)];
  return out;
}

// ─── Gapless PCM Playback Queue ───────────────────────────────────────────────

class AudioPlaybackQueue {
  private ctx: AudioContext;
  private nextAt = 0;
  private count = 0;
  private _playing = false;
  private _onStart?: () => void;
  private _onEnd?: () => void;

  constructor(ctx: AudioContext) { this.ctx = ctx; }

  setCallbacks(onStart: () => void, onEnd: () => void) {
    this._onStart = onStart;
    this._onEnd = onEnd;
  }

  enqueue(pcm16: Int16Array) {
    const f32 = new Float32Array(pcm16.length);
    for (let i = 0; i < pcm16.length; i++) {
      f32[i] = pcm16[i] / (pcm16[i] < 0 ? 0x8000 : 0x7fff);
    }
    const buf = this.ctx.createBuffer(1, f32.length, PLAYBACK_SAMPLE_RATE);
    buf.copyToChannel(f32, 0);

    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.ctx.destination);

    const now = this.ctx.currentTime;
    const startAt = Math.max(now, this.nextAt);
    src.start(startAt);
    this.nextAt = startAt + buf.duration;

    this.count++;
    if (!this._playing) { this._playing = true; this._onStart?.(); }

    src.onended = () => {
      this.count = Math.max(0, this.count - 1);
      if (this.count === 0) { this._playing = false; this._onEnd?.(); }
    };
  }

  get isPlaying() { return this._playing; }

  clear() {
    this.nextAt = 0;
    this.count = 0;
    this._playing = false;
  }
}

// ─── Gemini Live Session ──────────────────────────────────────────────────────

export class GeminiLiveSession {
  private apiKey: string;
  private systemInstruction: string;
  private callbacks: LiveSessionCallbacks;

  // audio graph
  private audioCtx: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private micStream: MediaStream | null = null;
  private playbackCtx: AudioContext | null = null;
  private playbackQueue: AudioPlaybackQueue | null = null;

  // gemini
  private session: any = null;

  // state flags
  private _closed = false;
  private _sendEnabled = false; // guards against "WebSocket CLOSED" errors
  private _userMuted = false;

  constructor(apiKey: string, systemInstruction: string, callbacks: LiveSessionCallbacks) {
    this.apiKey = apiKey;
    this.systemInstruction = systemInstruction;
    this.callbacks = callbacks;
  }

  // ── Public API ─────────────────────────────────────────────────────────────

  async connect(): Promise<void> {
    this._closed = false;

    // ── Playback context ──────────────────────────────────────────────────────
    this.playbackCtx = new AudioContext({ sampleRate: PLAYBACK_SAMPLE_RATE });
    this.playbackQueue = new AudioPlaybackQueue(this.playbackCtx);
    this.playbackQueue.setCallbacks(
      () => this.callbacks.onSpeaking(),
      () => {
        this.callbacks.onTurnComplete();
        if (!this._userMuted) this.callbacks.onListening();
      }
    );

    // ── Microphone ────────────────────────────────────────────────────────────
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    } catch {
      this.callbacks.onError("Microphone access denied. Please allow microphone permissions and refresh.");
      return;
    }

    // ── AudioWorklet (replaces deprecated ScriptProcessorNode) ────────────────
    this.audioCtx = new AudioContext();

    const blob = new Blob([MIC_WORKLET_CODE], { type: "application/javascript" });
    const workletUrl = URL.createObjectURL(blob);
    try {
      await this.audioCtx.audioWorklet.addModule(workletUrl);
    } catch (err) {
      this.callbacks.onError("AudioWorklet failed to load. Try refreshing the page.");
      URL.revokeObjectURL(workletUrl);
      return;
    }
    URL.revokeObjectURL(workletUrl);

    const sourceNode = this.audioCtx.createMediaStreamSource(this.micStream);
    this.workletNode = new AudioWorkletNode(this.audioCtx, "ostrabacus-mic");

    // Silent sink: keeps the graph active without playing mic audio to speakers
    const silentGain = this.audioCtx.createGain();
    silentGain.gain.value = 0;
    sourceNode.connect(this.workletNode);
    this.workletNode.connect(silentGain);
    silentGain.connect(this.audioCtx.destination);

    // This fires for each audio buffer from the mic
    this.workletNode.port.onmessage = (e: MessageEvent<Float32Array>) => {
      // Guard: immediately skip if we've been closed or send is disabled
      if (!this._sendEnabled || this._closed || !this.session || this._userMuted) return;

      const downsampled = downsample(e.data, this.audioCtx!.sampleRate, MIC_SAMPLE_RATE);
      const pcmBuf = float32ToPcm16(downsampled);
      const b64 = arrayBufferToBase64(pcmBuf);

      try {
        this.session.sendRealtimeInput({
          audio: { data: b64, mimeType: `audio/pcm;rate=${MIC_SAMPLE_RATE}` }
        });
      } catch {
        // Session is closing — disable immediately to stop further attempts
        this._sendEnabled = false;
      }
    };

    // ── Gemini Live session ───────────────────────────────────────────────────
    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    try {
      this.session = await ai.live.connect({
        model: LIVE_MODEL,
        config: {
          systemInstruction: this.systemInstruction,
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: OSTRABACUS_TOOLS }],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } }
          }
        },
        callbacks: {
          onopen: () => {
            // Only enable sending AFTER the session is confirmed open
            this._sendEnabled = true;
            this.callbacks.onStatus("Connected.");
            this.callbacks.onListening();
          },
          onmessage: (msg: any) => this._handleMessage(msg),
          onerror: (err: any) => {
            // Disable audio FIRST — prevents worklet from sending to dead socket
            this._disableAudio();
            if (!this._closed) {
              this.callbacks.onError(err?.message ?? "Live session error.");
            }
          },
          onclose: (close: any) => {
            // Stop audio immediately on any server-side close
            this._disableAudio();
            if (!this._closed) {
              this._closed = true;
              // Code 1008: model not supported / not found for this API key
              // Code 1006: abnormal close (auth failure, no Live API access)
              if (close?.code === 1008 || close?.code === 1006) {
                const msg = close?.code === 1008
                  ? `Live API model not available for this API key. The Gemini Live API (bidiGenerateContent) requires a key with Live API access enabled. Current key type: AI Studio. Solution: Get a key with Live API access from https://ai.google.dev, or upgrade to Vertex AI.`
                  : `Live API connection rejected (code ${close?.code}). This API key may not have Live API access enabled.`;
                this.callbacks.onError(msg);
              } else {
                this.callbacks.onClose();
              }
            }
          }
        }
      });
    } catch (err: any) {
      this.callbacks.onError(`Failed to connect: ${err?.message ?? err}`);
    }
  }

  setMuted(muted: boolean) {
    this._userMuted = muted;
    this.micStream?.getAudioTracks().forEach(t => { t.enabled = !muted; });
  }

  sendText(text: string) {
    if (!this.session || this._closed || !this._sendEnabled) return;
    try {
      this.session.sendClientContent({
        turns: [{ role: "user", parts: [{ text }] }],
        turnComplete: true
      });
    } catch { /* session closing */ }
  }

  sendToolResponse(callId: string, toolName: string, result: Record<string, any>) {
    if (!this.session || this._closed || !this._sendEnabled) return;
    try {
      this.session.sendToolResponse({
        functionResponses: [{ id: callId, name: toolName, response: result }]
      });
    } catch { /* session closing */ }
  }

  interrupt() { this.playbackQueue?.clear(); }

  /** Immediately stop the AudioWorklet from sending — called on server-side close/error */
  private _disableAudio() {
    this._sendEnabled = false;
    try { this.workletNode?.port.close(); } catch { /* ignore */ }
  }

  /**
   * Cleanly shuts down the session.
   * ORDER: (1) disable sends, (2) tear down audio, (3) close WebSocket.
   * If already closed, returns immediately (idempotent).
   */
  close() {
    if (this._closed) return;       // idempotent — safe to call multiple times
    this._closed = true;
    this._disableAudio();            // ← FIRST: stop all worklet sends

    this.playbackQueue?.clear();

    try { this.workletNode?.disconnect(); } catch { /* ignore */ }
    try { this.micStream?.getTracks().forEach(t => t.stop()); } catch { /* ignore */ }
    try { this.audioCtx?.close(); } catch { /* ignore */ }
    try { this.playbackCtx?.close(); } catch { /* ignore */ }

    // Close WebSocket last — after audio pipeline is down
    try { this.session?.close(); } catch { /* ignore - may already be CLOSED */ }

    this.session = null;
    this.micStream = null;
    this.audioCtx = null;
    this.workletNode = null;
    this.playbackCtx = null;
    this.playbackQueue = null;
  }

  // ── Private ────────────────────────────────────────────────────────────────

  private _handleMessage(message: any) {
    if (this._closed) return;

    // Tool call from AI
    if (message.toolCall?.functionCalls?.length) {
      for (const call of message.toolCall.functionCalls) {
        this.callbacks.onToolCall({ name: call.name, args: call.args ?? {}, callId: call.id ?? "" });
      }
      return;
    }

    // Audio / text parts
    const parts = message.serverContent?.modelTurn?.parts ?? [];
    for (const part of parts) {
      if (part.inlineData?.mimeType?.startsWith("audio/")) {
        this.playbackQueue?.enqueue(base64ToPcm16(part.inlineData.data));
      }
      // Skip internal thinking/reasoning tokens emitted by the model.
      // The native audio model tags these with `thought: true`; we also
      // guard against any stray bold-header patterns just in case.
      if (part.text && !part.thought) {
        this.callbacks.onTranscript(part.text);
      }
    }

    // Turn complete
    if (message.serverContent?.turnComplete) {
      if (!this.playbackQueue?.isPlaying) {
        this.callbacks.onTurnComplete();
        if (!this._userMuted) this.callbacks.onListening();
      }
    }
  }
}

// ─── Gemini Tool Declarations ─────────────────────────────────────────────────

export const OSTRABACUS_TOOLS = [
  {
    name: "navigate_to",
    description: "Navigate the user to a specific page in the healthcare app.",
    parameters: {
      type: "OBJECT",
      properties: {
        page: { type: "STRING", enum: ["home", "facilities", "services", "medicines"], description: "Target page." }
      },
      required: ["page"]
    }
  },
  {
    name: "view_service",
    description: "Navigate to the details page of a specific service. Use this when the user asks to see, view, or learn more about a named service. Look up the service_id from the Available Services list.",
    parameters: {
      type: "OBJECT",
      properties: {
        service_id:   { type: "STRING", description: "The numeric ID of the service from the Available Services list." },
        service_name: { type: "STRING", description: "Human-readable service name, used for confirmation speech." }
      },
      required: ["service_id", "service_name"]
    }
  },
  {
    name: "search_facilities",
    description: "Filter and display healthcare facilities by type, open status, or location.",
    parameters: {
      type: "OBJECT",
      properties: {
        facility_type: { type: "STRING", enum: ["clinic", "pharmacy", "hospital"] },
        status: { type: "STRING", enum: ["open_now", "all"] },
        location: { type: "STRING", description: "City name or 'near me' for geolocation." }
      }
    }
  },
  {
    name: "open_booking",
    description: "Open the pre-filled booking form. Call only when you have: service name, date (YYYY-MM-DD), and time (HH:MM). Patient name and phone are always pre-filled — never ask for them.",
    parameters: {
      type: "OBJECT",
      properties: {
        service_name:   { type: "STRING" },
        facility_name:  { type: "STRING" },
        requested_date: { type: "STRING", description: "YYYY-MM-DD" },
        requested_time: { type: "STRING", description: "HH:MM:SS" },
        notes:          { type: "STRING" }
      },
      required: ["service_name", "facility_name", "requested_date", "requested_time"]
    }
  }
];

// ─── System Instruction Builder ───────────────────────────────────────────────

export function buildSystemInstruction(context: {
  patientName: string;
  phone: string;
  availableLocations: string[];
  availableFacilities: string[];
  availableServices: Array<{ id?: string; name: string; facilityName: string }>;
  pageContext?: { type: string; data: any } | null;
}): string {
  const svcList = context.availableServices
    .map(s => `"${s.name}" (ID: ${s.id ?? "?"}, Facility: ${s.facilityName})`).join(", ");

  const pageCtx = context.pageContext
    ? `\nCURRENT PAGE (${context.pageContext.type}): ${JSON.stringify(context.pageContext.data)}`
    : "";

  return `You are Ostrabacus, a warm and concise AI voice assistant for a healthcare platform in Rwanda.
Your mission: help visually impaired users navigate the app, find services, and book appointments — entirely by voice.

PRE-FILLED PATIENT CREDENTIALS — never ask for these:
  Name: ${context.patientName} | Phone: ${context.phone}

AVAILABLE DATA:
  Locations: ${context.availableLocations.join(", ") || "Kigali, Muhanga, Huye, Rubavu"}
  Facilities: ${context.availableFacilities.join(", ") || "various"}
  Services (service → facility): ${svcList || "none loaded yet"}
${pageCtx}

TOOL USAGE RULES:
1. navigate_to — use for "go to home/facilities/services/medicines".
2. view_service — use when the user says "show me", "open", "view", "tell me about", or "details of" a specific service name. Look up the service_id from the Services list above and call this tool immediately.
3. search_facilities — extract type/status/location from user's words; use "near me" for proximity requests.
4. open_booking — a service belongs to exactly ONE facility; look it up from Services above (never ask which facility if service is named). Collect service → date → time in order, then call open_booking. Ask one question at a time.
5. Page reading — if the user asks about details/requirements/price, use CURRENT PAGE context.
6. Off-topic — politely decline and redirect to healthcare tasks.

Voice style: be brief, warm, and natural. No bullet lists unless reading details.`;
}
