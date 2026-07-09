/**
 * OstrabacusAssistant.tsx
 * ──────────────────────────────────────────────────────────────────────────────
 * Compact bottom-center voice bar for the Gemini Live agent.
 *
 * UI goals (accessibility-first):
 *   - Positioned at the very bottom-center of the viewport.
 *   - Small vertical footprint so the full page is visible behind it.
 *   - Minimal click required: panel auto-opens when user clicks the trigger.
 *   - All state transitions announced via voiceState badge.
 *   - Text input as fallback for environments without mic permission.
 * ──────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useOstrabacus } from "./OstrabacusContext";
import { GeminiLiveSession, buildSystemInstruction, LiveToolCallEvent } from "./geminiLive";
import { useNavigate } from "react-router-dom";
import {
  Mic, MicOff, X, Sparkles, RefreshCw,
  CheckCircle2, XCircle, Loader2, Radio, ChevronUp, ChevronDown, CalendarCheck
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../client/services/api";

// ── Hardcoded patient credentials (dev) ──────────────────────────────────────
// TODO: swap with logged-in user from auth context
const PATIENT_NAME = "Test Patient";

const GEMINI_API_KEY =
  (import.meta as any).env?.VITE_GEMINI_API_KEY ||
  (import.meta as any).env?.GEMINI_API_KEY || "";

// ── Voice states ──────────────────────────────────────────────────────────────
type VoiceState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "muted" | "error";

interface ChatEntry {
  role: "user" | "ai" | "system";
  text: string;
  ts: string;
}

const ts = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

// ── Confirmation keywords ─────────────────────────────────────────────────────
const CONFIRM = ["yes", "confirm", "okay", "ok", "sure", "proceed", "book", "go ahead", "correct", "yep"];
const CANCEL  = ["no", "cancel", "stop", "abort", "nevermind", "nope", "don't"];

export default function OstrabacusAssistant() {
  const {
    isOpen, setIsOpen,
    setPrefilledBookingData, setShouldOpenModal,
    pageContext,
    resetBookingSession,
  } = useOstrabacus();

  const navigate = useNavigate();

  // Stored contact phone number dynamically collected from user
  const [patientPhone, setPatientPhone] = useState(() => localStorage.getItem("ostrabacus_patient_phone") || "");

  // ── State ──────────────────────────────────────────────────────────────────
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [streamingText, setStreamingText] = useState(""); // current AI turn (streaming)
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);
  const [muted, setMuted] = useState(false);
  const [textInput, setTextInput] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [liveApiBlocked, setLiveApiBlocked] = useState(false); // key lacks Live API access

  const [awaitingConfirmation, setAwaitingConfirmation] = useState<{
    params: {
      service_name: string; facility_name: string;
      requested_date: string; requested_time: string; phone: string; notes?: string;
    };
    targetServiceId: string | number | null;
  } | null>(null);

  const [bookingSuccess, setBookingSuccess] = useState<{
    serviceName: string; facilityName: string;
    date: string; time: string;
    patientName: string; phone: string;
  } | null>(null);
  const [isBookingSubmitting, setIsBookingSubmitting] = useState(false);

  const [locations, setLocations] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [medicines, setMedicines] = useState<any[]>([]);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const liveRef      = useRef<GeminiLiveSession | null>(null);
  const sessionGenRef = useRef(0);  // incremented each time we open; callbacks ignore stale gens
  const isOpeningRef = useRef(false); // prevents double-open from StrictMode
  const logEndRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);
  
  // Always-current refs so callbacks captured at session-open never go stale
  const awaitingConfirmationRef = useRef(awaitingConfirmation);
  const servicesRef             = useRef(services);
  const facilitiesRef           = useRef(facilities);
  const medicinesRef            = useRef(medicines);

  // ── Fetch DB context ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [l, f, s, m] = await Promise.all([
          api.getLocations().catch(() => []),
          api.getFacilities().catch(() => []),
          api.getServices().catch(() => []),
          api.getMedicines().catch(() => [])
        ]);
        setLocations(l);
        setFacilities(f);
        setServices(s);
        const medicinesList = Array.isArray(m) ? m : m?.results || [];
        setMedicines(medicinesList);
      } catch (e) { console.error("Ostrabacus context error", e); }
    })();
  }, []);

  // Keep always-current refs in sync with state
  useEffect(() => { awaitingConfirmationRef.current = awaitingConfirmation; }, [awaitingConfirmation]);
  useEffect(() => { servicesRef.current = services; },   [services]);
  useEffect(() => { facilitiesRef.current = facilities; }, [facilities]);
  useEffect(() => { medicinesRef.current = medicines; }, [medicines]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, streamingText, awaitingConfirmation, expanded]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const addEntry = useCallback((role: ChatEntry["role"], text: string) => {
    setChatLog(prev => [...prev, { role, text, ts: ts() }]);
  }, []);

  // ── Core booking submission (shared by voice tool + typed confirm) ─────────────
  // Uses refs so it's safe to call from session callbacks that were captured at open time.
  const submitBooking = useCallback(async () => {
    const pending = awaitingConfirmationRef.current; // always live — never stale
    if (!pending) return;
    const { params, targetServiceId } = pending;

    const serviceId = targetServiceId ?? (
      servicesRef.current.find(s => s.name.toLowerCase().includes(params.service_name.toLowerCase()))?.id ?? null
    );

    if (!serviceId) {
      addEntry("system", "⚠️ Could not find service to book. Please open service you want to book.");
      setAwaitingConfirmation(null);
      return;
    }

    setIsBookingSubmitting(true);
    addEntry("system", "⏳ Submitting your booking…");
    setExpanded(true);

    const timePart = params.requested_time.substring(0, 5);
    const dateTime = `${params.requested_date}T${timePart}`;

    try {
      await api.createBooking({
        patient_name: PATIENT_NAME,
        service: serviceId,
        date_time: dateTime,
        phone: params.phone || patientPhone || "",
        notes: params.notes || "Booked via Ostrabacus AI. Contact client to confirm.",
        status: "Pending",
      });

      setBookingSuccess({
        serviceName: params.service_name,
        facilityName: params.facility_name,
        date: params.requested_date,
        time: timePart,
        patientName: PATIENT_NAME,
        phone: params.phone || patientPhone || "",
      });
      resetBookingSession();
      setAwaitingConfirmation(null);
      addEntry("system", "✅ Appointment booked successfully!");
    } catch (err: any) {
      addEntry("system", `❌ Booking failed: ${err?.message ?? "Please try again."}`);
    } finally {
      setIsBookingSubmitting(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetBookingSession, addEntry]); // refs are stable — awaitingConfirmation/services not needed


  // ── Booking confirmation (text / button path) ───────────────────────────
  const handleConfirmation = useCallback(async (text: string): Promise<boolean> => {
    if (!awaitingConfirmation) return false;
    const norm = text.toLowerCase().trim();
    const isYes = CONFIRM.some(k => norm.includes(k));
    const isNo  = CANCEL.some(k => norm.includes(k));

    if (isYes) { await submitBooking(); return true; }
    if (isNo) {
      resetBookingSession();
      setAwaitingConfirmation(null);
      addEntry("system", "❌ Booking cancelled.");
      return true;
    }
    return false;
  }, [awaitingConfirmation, submitBooking, resetBookingSession, addEntry]);

  // ── Tool execution ─────────────────────────────────────────────────────────
  const executeTool = useCallback(async (event: LiveToolCallEvent) => {
    const { name, args, callId } = event;

    if (name === "navigate_to") {
      const map: Record<string, string> = {
        home: "/",
        facilities: "/facilities",
        services: "/services",
        medicines: "/medicines",
        admin: "/facility-dashboard"
      };
      const route = map[args.page] ?? "/";
      addEntry("system", `📍 → ${args.page}`);
      navigate(route);
      liveRef.current?.sendToolResponse(callId, name, { success: true });
      return;
    }

    if (name === "view_service") {
      const { service_id, service_name } = args;
      // Fallback: try to resolve by name if the model gives a non-numeric id
      let resolvedId = service_id;
      if (!resolvedId || isNaN(Number(resolvedId))) {
        const matched = services.find(s =>
          s.name.toLowerCase().includes((service_name ?? "").toLowerCase())
        );
        resolvedId = matched ? String(matched.id) : null;
      }
      if (resolvedId) {
        addEntry("system", `📄 Opening service: ${service_name ?? service_id}`);
        navigate(`/services/${resolvedId}`);
        liveRef.current?.sendToolResponse(callId, name, { success: true, service_id: resolvedId });
      } else {
        addEntry("system", `⚠️ Could not find service "${service_name}".`);
        liveRef.current?.sendToolResponse(callId, name, { success: false, error: "Service not found" });
      }
      return;
    }

    if (name === "search_facilities") {
      const p = new URLSearchParams();
      if (args.facility_type) p.set("type", args.facility_type);
      if (args.status)        p.set("status", args.status);
      if (args.location)      p.set("location", args.location);
      addEntry("system", `🔍 Searching ${args.facility_type ?? "facilities"}…`);
      navigate(`/facilities?${p.toString()}`);
      liveRef.current?.sendToolResponse(callId, name, { success: true });
      return;
    }

    if (name === "open_booking") {
      // Resolve facility from service using local data — use ref for always-current services list
      const svcList = servicesRef.current;
      const facList = facilitiesRef.current;
      let resolvedFacility = args.facility_name;
      let targetServiceId: string | number | null = null;
      const matched = svcList.find(s => s.name.toLowerCase().includes(args.service_name.toLowerCase()));
      if (matched) {
        targetServiceId = matched.id;
        const fac = facList.find(f => f.id === matched.facility);
        if (fac) resolvedFacility = fac.company_name;
      }

      // Save phone number dynamically if provided by AI
      if (args.phone) {
        setPatientPhone(args.phone);
        localStorage.setItem("ostrabacus_patient_phone", args.phone);
      }

      const params = {
        service_name:   args.service_name,
        facility_name:  resolvedFacility,
        requested_date: args.requested_date,
        requested_time: args.requested_time,
        phone:          args.phone || "",
        notes:          args.notes ?? ""
      };

      // Set booking info for contextual autofill mapping
      setPrefilledBookingData({
        facilityName: params.facility_name,
        date: params.requested_date,
        time: params.requested_time,
        patientName: PATIENT_NAME,
        phone: params.phone,
        notes: params.notes || "Booked via Ostrabacus AI."
      });

      setAwaitingConfirmation({ params, targetServiceId });
      setExpanded(true);

      addEntry("ai",
        `📋 Booking:\n• ${params.service_name} at ${params.facility_name}\n• ${params.requested_date} · ${params.requested_time}\n• ${PATIENT_NAME} · ${params.phone}\n\nSay YES to confirm or NO to cancel.`
      );

      liveRef.current?.sendToolResponse(callId, name, {
        status: "awaiting_confirmation",
        prompt: "Please say YES to confirm the booking, or NO to cancel."
      });
      return;
    }

    if (name === "confirm_booking") {
      // Triggered by voice: user said "yes" — read from ref, not stale closure
      const pending = awaitingConfirmationRef.current;
      if (pending) {
        await submitBooking();
        liveRef.current?.sendToolResponse(callId, name, { status: "done" });
      } else {
        liveRef.current?.sendToolResponse(callId, name, { success: false, error: "No pending booking." });
      }
      return;
    }

    if (name === "cancel_booking") {
      const pending = awaitingConfirmationRef.current;
      if (pending) {
        resetBookingSession();
        setAwaitingConfirmation(null);
        addEntry("system", "❌ Booking cancelled.");
        liveRef.current?.sendToolResponse(callId, name, { success: true });
      } else {
        liveRef.current?.sendToolResponse(callId, name, { success: false, error: "No pending booking." });
      }
      return;
    }

    liveRef.current?.sendToolResponse(callId, name, { success: false, error: "Unknown tool" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, facilities, navigate, addEntry, submitBooking, resetBookingSession]);
  // ↑ awaitingConfirmation intentionally omitted — we read from awaitingConfirmationRef instead

  // ── Open session ───────────────────────────────────────────────────────────
  const openSession = useCallback(async () => {
    // Guard: prevent double-open from React StrictMode double-invoke
    if (isOpeningRef.current || liveRef.current) return;
    isOpeningRef.current = true;

    if (!GEMINI_API_KEY) {
      isOpeningRef.current = false;
      setVoiceState("error");
      addEntry("system", "⚠️ No Gemini API key. Set VITE_GEMINI_API_KEY in .env");
      return;
    }

    // Each open gets a unique generation ID; stale callbacks self-discard
    const myGen = ++sessionGenRef.current;

    setVoiceState("connecting");
    setStreamingText("");

    const availableServices = services.map(s => {
      const fac = facilities.find(f => f.id === s.facility);
      return { id: String(s.id), name: s.name, facilityName: fac?.company_name ?? "Unknown" };
    });

    const availableMedicines = medicines.map(m => {
      return { id: String(m.id), name: m.medicine_name || m.name, price: m.price };
    });

    // Guard wrapper: discards callbacks from orphaned sessions (StrictMode / rapid clicks)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const guard = <T extends (...args: any[]) => void>(fn: T) => (...args: Parameters<T>) => {
      if (sessionGenRef.current !== myGen) return; // stale — discard
      fn(...args);
    };

    const session = new GeminiLiveSession(
      GEMINI_API_KEY,
      buildSystemInstruction({
        patientName: PATIENT_NAME,
        phone: patientPhone,
        availableLocations: locations.map(l => l.location_name),
        availableFacilities: facilities.map(f => f.company_name),
        availableServices,
        availableMedicines,
        pageContext
      }),
      {
        onListening:    guard(() => setVoiceState("listening")),
        onSpeaking:     guard(() => setVoiceState("speaking")),
        onTurnComplete: guard(() => setVoiceState("listening")),
        onTranscript:   guard((t) => setStreamingText(prev => prev + t)),
        onToolCall:     guard((e) => executeTool(e)),
        onStatus:       guard((m) => addEntry("system", m)),
        onError: guard((m: string) => {
          const isBlocked = m.includes('bidiGenerateContent') || m.includes('not found') || m.includes('code 1');
          if (isBlocked) {
            setLiveApiBlocked(true);
            setExpanded(true);
          }
          addEntry("system", `⚠️ ${m}`);
          setVoiceState("error");
          liveRef.current = null;
          isOpeningRef.current = false;
        }),
        onClose:        guard(() => {
          // Server-initiated close: ensure full teardown then update UI
          const ref = liveRef.current;
          liveRef.current = null;
          isOpeningRef.current = false;
          ref?.close(); // safe — close() is idempotent
          setVoiceState("idle");
        })
      } 
    );

    // If StrictMode or rapid clicks closed us before we finished building
    if (sessionGenRef.current !== myGen) {
      session.close();
      isOpeningRef.current = false;
      return;
    }

    liveRef.current = session;
    isOpeningRef.current = false;
    await session.connect();
  }, [locations, facilities, services, medicines, pageContext, executeTool, addEntry]);

  const closeSession = useCallback(() => {
    // Increment generation so any in-flight openSession callbacks self-discard
    sessionGenRef.current++;
    isOpeningRef.current = false;
    const ref = liveRef.current;
    liveRef.current = null;
    ref?.close();
    setVoiceState("idle");
    setStreamingText("");
  }, []);

  // ── Panel lifecycle ────────────────────────────────────────────────────────
  // The cleanup return ensures that in React StrictMode's double-invoke,
  // the first effect's session is torn down before the second one opens.
  useEffect(() => {
    if (isOpen) {
      openSession();
    } else {
      closeSession();
    }
    // Cleanup: called by React when effect re-runs or component unmounts
    return () => {
      sessionGenRef.current++; // invalidate any in-flight open
      isOpeningRef.current = false;
      const ref = liveRef.current;
      liveRef.current = null;
      ref?.close();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Update AI about page context changes (no reconnect needed) ─────────────
  useEffect(() => {
    if (!isOpen || !pageContext || !liveRef.current) return;
    const summary = `[Context update] User navigated to a ${pageContext.type} page: ${JSON.stringify(pageContext.data)}`;
    liveRef.current.sendText(summary);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageContext]);

  // ── Flush streaming text into log when AI finishes its turn ───────────────
  useEffect(() => {
    if (voiceState === "listening" && streamingText.trim()) {
      // Check if AI speech includes a confirmation answer
      handleConfirmation(streamingText.trim());
      addEntry("ai", streamingText.trim());
      setStreamingText("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceState]);

  // ── Mute ──────────────────────────────────────────────────────────────────
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    liveRef.current?.setMuted(next);
    if (!next && voiceState === "muted") setVoiceState("listening");
    if (next) setVoiceState("muted");
  };

    const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = textInput.trim();
    if (!text) return;

    const doConfirm = async () => {
      if (awaitingConfirmation && await handleConfirmation(text)) {
        setTextInput(""); return;
      }
      addEntry("user", text);
      setTextInput("");
      liveRef.current?.sendText(text);
      setVoiceState("thinking");
    };
    doConfirm();
  };

  // ── Voice state config ─────────────────────────────────────────────────────
  const STATE: Record<VoiceState, { label: string; dot: string }> = {
    idle:       { label: "Not connected",       dot: "bg-white/20" },
    connecting: { label: "Connecting…",          dot: "bg-yellow-400 animate-pulse" },
    listening:  { label: "Listening",            dot: "bg-accent animate-pulse" },
    thinking:   { label: "Processing…",          dot: "bg-blue-400 animate-pulse" },
    speaking:   { label: "Speaking",             dot: "bg-purple-400 animate-pulse" },
    muted:      { label: "Muted",                dot: "bg-white/30" },
    error:      { label: liveApiBlocked ? "Live API not available" : "Error", dot: "bg-red-500" },
  };

  const s = STATE[voiceState];

  // Most recent AI/user message to show in collapsed view
  const lastMessage = [...chatLog].reverse().find(e => e.role !== "system");

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Floating trigger (center-bottom) when panel is closed ─── */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 bg-emerald-950/95 border border-accent/30 text-white px-5 py-3 rounded-full shadow-2xl backdrop-blur-xl cursor-pointer hover:border-accent/60 transition-all group"
            aria-label="Activate Ostrabacus AI Voice Assistant (Alt+A)"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
            </span>
            <Sparkles size={16} className="text-accent" />
            <span className="text-sm font-semibold tracking-tight">Ostrabacus AI</span>
            <Mic size={16} className="text-white/60 group-hover:text-accent transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ── Voice bar (center-bottom, compact) ───────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 35 }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 z-[999] w-full max-w-2xl"
            role="dialog"
            aria-label="Ostrabacus AI Voice Bar"
          >
            <div className="bg-emerald-950/95 backdrop-blur-2xl border border-emerald-500/20 border-b-0 rounded-t-2xl shadow-2xl overflow-hidden">

              {/* ── Expandable log area ─────────────────────────────────── */}
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: bookingSuccess ? 340 : 220 }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`${bookingSuccess ? "h-[340px]" : "h-[220px]"} overflow-y-auto px-4 pt-3 pb-2 space-y-2 flex flex-col`}>
                      {chatLog.length === 0 ? (
                        liveApiBlocked ? (
                          <div className="flex-1 flex flex-col justify-center gap-3 text-xs px-2">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                              <p className="text-red-400 font-bold text-[11px] mb-1">⚠️ Gemini Live API Not Available</p>
                              <p className="text-white/60 text-[10px] leading-relaxed mb-2">
                                Your API key does not have access to the <strong>Gemini Live API</strong> (<em>bidiGenerateContent</em>).
                              </p>
                              <p className="text-white/50 text-[10px] leading-relaxed mb-2">
                                <strong className="text-white/80">To fix:</strong> Create a new API key at <strong>aistudio.google.com</strong> and ensure Live API access is enabled, or use a Vertex AI key with the Live API enabled.
                              </p>
                              <div className="flex gap-2 mt-2">
                                <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer"
                                  className="flex-1 text-center bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded-lg py-1.5 text-[9px] font-bold transition-colors">
                                  Get a Live API Key ↗
                                </a>
                                <button onClick={() => { setLiveApiBlocked(false); setChatLog([]); closeSession(); setTimeout(openSession, 300); }}
                                  className="flex-1 bg-white/5 hover:bg-white/10 text-white/60 rounded-lg py-1.5 text-[9px] font-bold cursor-pointer transition-colors border border-white/10">
                                  Retry
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col items-center justify-center text-white/40 text-xs gap-1">
                            <Radio size={20} className="text-accent/60" />
                            <span>Just start speaking — I'm listening</span>
                          </div>
                        )
                      ) : (
                        chatLog.map((entry, i) => (
                          <div
                            key={i}
                            className={`text-[11px] leading-relaxed max-w-[90%] ${
                              entry.role === "user"
                                ? "self-end bg-accent/20 text-accent rounded-2xl rounded-tr-none px-3 py-1.5 font-semibold"
                                : entry.role === "system"
                                ? "self-center text-white/35 italic text-[10px]"
                                : "self-start bg-white/5 text-white rounded-2xl rounded-tl-none px-3 py-1.5"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{entry.text}</p>
                          </div>
                        ))
                      )}

                      {/* Streaming AI text */}
                      {streamingText && (
                        <div className="self-start max-w-[90%] bg-purple-400/10 text-white/70 rounded-2xl rounded-tl-none px-3 py-1.5 text-[11px] italic">
                          {streamingText}
                          <span className="inline-block w-0.5 h-3 bg-purple-400 animate-pulse ml-1 align-bottom" />
                        </div>
                      )}

                      {/* Booking submission in progress */}
                      {isBookingSubmitting && (
                        <div className="self-stretch flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl px-3 py-2.5 text-[11px]">
                          <span className="w-3.5 h-3.5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin shrink-0" />
                          <span className="text-yellow-300">Submitting your appointment…</span>
                        </div>
                      )}

                      {/* Confirmation gate */}
                      {awaitingConfirmation && !isBookingSubmitting && (
                        <div className="self-stretch bg-accent/10 border border-accent/25 rounded-xl p-3 text-xs">
                          <p className="text-white/70 mb-2 text-[11px]">
                            Say <strong className="text-accent">YES</strong> to submit the booking or <strong className="text-red-400">NO</strong> to cancel.
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => handleConfirmation("yes")}
                              className="flex-1 flex items-center justify-center gap-1 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded-lg py-1.5 text-[10px] font-bold cursor-pointer transition-colors">
                              <CheckCircle2 size={11} /> Confirm & Book
                            </button>
                            <button onClick={() => handleConfirmation("no")}
                              className="flex-1 flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-lg py-1.5 text-[10px] font-bold cursor-pointer transition-colors">
                              <XCircle size={11} /> Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Booking success panel */}
                      {bookingSuccess && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="self-stretch bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-xs"
                        >
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center shrink-0">
                              <CalendarCheck size={16} className="text-green-400" />
                            </div>
                            <div>
                              <p className="text-green-400 font-bold text-[11px]">Appointment Requested!</p>
                              <p className="text-white/50 text-[10px]">Your appointment has been successfully requested. The facility will review and confirm your slot.</p>
                            </div>
                          </div>
                          <div className="space-y-1.5 bg-white/5 rounded-lg px-3 py-2 mb-3">
                            <div className="flex justify-between">
                              <span className="text-white/40">Service</span>
                              <span className="text-white font-semibold">{bookingSuccess.serviceName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/40">Facility</span>
                              <span className="text-white/80">{bookingSuccess.facilityName}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/40">Date</span>
                              <span className="text-white/80">{bookingSuccess.date}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/40">Time</span>
                              <span className="text-white/80">{bookingSuccess.time}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-white/40">Status</span>
                              <span className="text-amber-400 font-bold text-[10px] uppercase tracking-wide">Pending Review</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setBookingSuccess(null)}
                            className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/25 rounded-lg py-1.5 text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Dismiss
                          </button>
                        </motion.div>
                      )}

                      <div ref={logEndRef} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Main bar ──────────────────────────────────────────────── */}
              <div className="flex items-center gap-3 px-4 py-3">

                {/* Status dot + label */}
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />

                  {/* Waveform (listening / speaking) */}
                  {(voiceState === "listening" || voiceState === "speaking") && (
                    <div className="flex items-end gap-0.5 h-4 shrink-0">
                      {[...Array(5)].map((_, i) => (
                        <motion.div
                          key={i}
                          className={`w-0.5 rounded-full ${voiceState === "speaking" ? "bg-purple-400" : "bg-accent"}`}
                          animate={{ height: [2, voiceState === "speaking" ? 14 : 10, 2] }}
                          transition={{ duration: 0.45, repeat: Infinity, delay: i * 0.09, ease: "easeInOut" }}
                        />
                      ))}
                    </div>
                  )}

                  {voiceState === "connecting" || voiceState === "thinking"
                    ? <Loader2 size={13} className="shrink-0 animate-spin text-white/50" />
                    : null}

                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-white/40 leading-none">{s.label}</p>
                    {/* Last message preview (collapsed mode) */}
                    {!expanded && lastMessage && (
                      <p className={`text-xs truncate leading-tight mt-0.5 ${lastMessage.role === "user" ? "text-accent/80" : "text-white/70"}`}>
                        {lastMessage.role === "user" ? "You: " : "AI: "}{lastMessage.text.split("\n")[0]}
                      </p>
                    )}
                    {!expanded && !lastMessage && voiceState === "listening" && (
                      <p className="text-xs text-white/50 mt-0.5">Speak naturally…</p>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Expand/collapse log */}
                  <button
                    onClick={() => setExpanded(v => !v)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                    aria-label={expanded ? "Collapse transcript" : "Expand transcript"}
                    title={expanded ? "Collapse" : "Show full conversation"}
                  >
                    {expanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                  </button>

                  {/* Mute */}
                  <button
                    onClick={toggleMute}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer ${muted ? "bg-red-500/20 text-red-400" : "bg-white/5 hover:bg-white/10 text-white/50 hover:text-white"}`}
                    aria-label={muted ? "Unmute" : "Mute microphone"}
                    title={muted ? "Unmute" : "Mute"}
                  >
                    {muted ? <MicOff size={14} /> : <Mic size={14} />}
                  </button>

                  {/* Reconnect */}
                  <button
                    onClick={() => { closeSession(); setTimeout(openSession, 300); }}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
                    aria-label="Reconnect session"
                    title="Reconnect"
                  >
                    <RefreshCw size={14} />
                  </button>

                  {/* Close */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors cursor-pointer"
                    aria-label="Close assistant"
                    title="Close"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* ── Text input ──────────────────────────────────────────────── */}
              <form onSubmit={handleTextSubmit} className="flex items-center gap-2 px-4 pb-3">
                <input
                  ref={inputRef}
                  type="text"
                  value={textInput}
                  onChange={e => setTextInput(e.target.value)}
                  placeholder={
                    awaitingConfirmation ? "Type YES or NO…" :
                    voiceState === "listening" ? "Or type here…" :
                    voiceState === "connecting" ? "Connecting…" :
                    "Type a message…"
                  }
                  disabled={voiceState === "connecting" || voiceState === "error"}
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30 outline-none focus:border-accent/40 transition-colors"
                  aria-label="Type a message to Ostrabacus AI"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || voiceState === "connecting" || voiceState === "error"}
                  className="w-7 h-7 bg-accent text-emerald-950 rounded-lg flex items-center justify-center font-bold text-sm disabled:opacity-30 cursor-pointer transition-opacity hover:opacity-90"
                  aria-label="Send message"
                >
                  ↑
                </button>
              </form>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
