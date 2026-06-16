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
  CheckCircle2, XCircle, Volume2, Loader2, Radio, ChevronUp, ChevronDown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../client/services/api";

// ── Hardcoded patient credentials (dev) ──────────────────────────────────────
// TODO: swap with logged-in user from auth context
const PATIENT_NAME = "Test Patient";
const PATIENT_PHONE = "0788 123 456";

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
      requested_date: string; requested_time: string; notes?: string;
    };
    targetServiceId: string | number | null;
  } | null>(null);

  const [locations, setLocations] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // ── Refs ───────────────────────────────────────────────────────────────────
  const liveRef      = useRef<GeminiLiveSession | null>(null);
  const sessionGenRef = useRef(0);  // incremented each time we open; callbacks ignore stale gens
  const isOpeningRef = useRef(false); // prevents double-open from StrictMode
  const logEndRef    = useRef<HTMLDivElement>(null);
  const inputRef     = useRef<HTMLInputElement>(null);

  // ── Fetch DB context ───────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [l, f, s] = await Promise.all([
          api.getLocations(), api.getFacilities(), api.getServices()
        ]);
        setLocations(l); setFacilities(f); setServices(s);
      } catch (e) { console.error("Ostrabacus context error", e); }
    })();
  }, []);

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatLog, streamingText, awaitingConfirmation, expanded]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const addEntry = useCallback((role: ChatEntry["role"], text: string) => {
    setChatLog(prev => [...prev, { role, text, ts: ts() }]);
  }, []);

  // ── Booking confirmation ───────────────────────────────────────────────────
  const handleConfirmation = useCallback((text: string): boolean => {
    if (!awaitingConfirmation) return false;
    const norm = text.toLowerCase().trim();
    const isYes = CONFIRM.some(k => norm.includes(k));
    const isNo  = CANCEL.some(k => norm.includes(k));

    if (isYes) {
      const { params, targetServiceId } = awaitingConfirmation;
      setPrefilledBookingData({
        facilityName: params.facility_name,
        date: params.requested_date,
        time: params.requested_time,
        patientName: PATIENT_NAME,
        phone: PATIENT_PHONE,
        notes: params.notes || "Prefilled by Ostrabacus AI."
      });
      setShouldOpenModal(true);
      resetBookingSession();
      setAwaitingConfirmation(null);
      addEntry("system", "✅ Booking confirmed — opening form…");
      if (targetServiceId) navigate(`/services/${targetServiceId}`);
      else navigate("/services");
      return true;
    }
    if (isNo) {
      resetBookingSession();
      setAwaitingConfirmation(null);
      addEntry("system", "❌ Booking cancelled.");
      return true;
    }
    return false;
  }, [awaitingConfirmation, setPrefilledBookingData, setShouldOpenModal, resetBookingSession, navigate, addEntry]);

  // ── Tool execution ─────────────────────────────────────────────────────────
  const executeTool = useCallback(async (event: LiveToolCallEvent) => {
    const { name, args, callId } = event;

    if (name === "navigate_to") {
      const map: Record<string, string> = { home: "/", facilities: "/facilities", services: "/services", admin: "/admin" };
      const route = map[args.page] ?? "/";
      addEntry("system", `📍 → ${args.page}`);
      navigate(route);
      liveRef.current?.sendToolResponse(callId, name, { success: true });
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
      // Resolve facility from service using local data
      let resolvedFacility = args.facility_name;
      let targetServiceId: string | number | null = null;
      const matched = services.find(s => s.name.toLowerCase().includes(args.service_name.toLowerCase()));
      if (matched) {
        targetServiceId = matched.id;
        const fac = facilities.find(f => f.id === matched.facility);
        if (fac) resolvedFacility = fac.company_name;
      }

      const params = {
        service_name:   args.service_name,
        facility_name:  resolvedFacility,
        requested_date: args.requested_date,
        requested_time: args.requested_time,
        notes:          args.notes ?? ""
      };

      setAwaitingConfirmation({ params, targetServiceId });
      setExpanded(true); // open log so user sees the summary

      addEntry("ai",
        `📋 Booking:\n• ${params.service_name} at ${params.facility_name}\n• ${params.requested_date} · ${params.requested_time}\n• ${PATIENT_NAME} · ${PATIENT_PHONE}\n\nSay YES to confirm or NO to cancel.`
      );

      liveRef.current?.sendToolResponse(callId, name, {
        status: "awaiting_confirmation",
        message: `I've collected all details. ${params.service_name} at ${params.facility_name} on ${params.requested_date} at ${params.requested_time}. Say yes to confirm or no to cancel.`
      });
      return;
    }

    liveRef.current?.sendToolResponse(callId, name, { success: false, error: "Unknown tool" });
  }, [services, facilities, navigate, addEntry]);

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
      return { name: s.name, facilityName: fac?.company_name ?? "Unknown" };
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
        phone: PATIENT_PHONE,
        availableLocations: locations.map(l => l.location_name),
        availableFacilities: facilities.map(f => f.company_name),
        availableServices,
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
  }, [locations, facilities, services, pageContext, executeTool, addEntry]);

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

  // ── Text submit fallback ───────────────────────────────────────────────────
  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = textInput.trim();
    if (!text) return;

    if (awaitingConfirmation && handleConfirmation(text)) {
      setTextInput(""); return;
    }

    addEntry("user", text);
    setTextInput("");
    liveRef.current?.sendText(text);
    setVoiceState("thinking");
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
                    animate={{ height: 220 }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="h-[220px] overflow-y-auto px-4 pt-3 pb-2 space-y-2 flex flex-col">
                      {chatLog.length === 0 ? (
                        liveApiBlocked ? (
                          <div className="flex-1 flex flex-col justify-center gap-3 text-xs px-2">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3">
                              <p className="text-red-400 font-bold text-[11px] mb-1">⚠️ Gemini Live API Not Available</p>
                              <p className="text-white/60 text-[10px] leading-relaxed mb-2">
                                Your API key (<code className="text-accent text-[9px]">AQ.Ab8R…</code>) does not have access to the <strong>Gemini Live API</strong> (<em>bidiGenerateContent</em>).
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

                      {/* Confirmation gate */}
                      {awaitingConfirmation && (
                        <div className="self-stretch bg-accent/10 border border-accent/25 rounded-xl p-3 text-xs">
                          <p className="text-white/70 mb-2 text-[11px]">
                            Say <strong className="text-accent">YES</strong> to open the booking form or <strong className="text-red-400">NO</strong> to cancel.
                          </p>
                          <div className="flex gap-2">
                            <button onClick={() => handleConfirmation("yes")}
                              className="flex-1 flex items-center justify-center gap-1 bg-accent/20 hover:bg-accent/30 text-accent border border-accent/30 rounded-lg py-1.5 text-[10px] font-bold cursor-pointer transition-colors">
                              <CheckCircle2 size={11} /> Confirm
                            </button>
                            <button onClick={() => handleConfirmation("no")}
                              className="flex-1 flex items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/25 rounded-lg py-1.5 text-[10px] font-bold cursor-pointer transition-colors">
                              <XCircle size={11} /> Cancel
                            </button>
                          </div>
                        </div>
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
