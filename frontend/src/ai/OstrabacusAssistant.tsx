import React, { useState, useEffect, useRef } from "react";
import { useOstrabacus } from "./OstrabacusContext";
import { analyzeCommand } from "./ai";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Send, X, Compass, CheckCircle2, AlertTriangle, Sparkles, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../client/services/api";

export default function OstrabacusAssistant() {
  const {
    isOpen,
    setIsOpen,
    setPrefilledBookingData,
    setShouldOpenModal,
    speakText,
    currentIntent,
    setCurrentIntent
  } = useOstrabacus();

  const navigate = useNavigate();
  const [inputText, setInputText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // History of assistant processing for visual tracking
  const [history, setHistory] = useState<Array<{
    query: string;
    intent: string;
    feedback: string;
    timestamp: string;
  }>>([]);

  const recognitionRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Initialize Speech Recognition API
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setIsListening(true);
        speakText("Listening...");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        handleProcessCommand(transcript);
      };

      rec.onerror = (event: any) => {
        console.error("Speech Recognition Error:", event.error);
        setIsListening(false);
        if (event.error === "no-speech") {
          speakText("I didn't catch that. Please try speaking again or type your request.");
        } else {
          speakText("Voice input error. Please type your request in the field.");
        }
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [speakText]);

  // Accessibility: auto-focus input when panel opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  // Voice toggle trigger
  const toggleListening = () => {
    if (!recognitionRef.current) {
      speakText("Speech recognition is not supported in this browser. Please type your command.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  // Main Command dispatcher implementing critical execution paths
  const handleProcessCommand = async (commandText: string) => {
    if (!commandText.trim()) return;
    setIsLoading(true);
    speakText("Analyzing request...");

    try {
      const response = await analyzeCommand(commandText);
      setCurrentIntent(response.intent);

      // Save to history log
      setHistory(prev => [
        {
          query: commandText,
          intent: response.intent,
          feedback: response.spoken_feedback,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
        ...prev.slice(0, 4) // keep last 5
      ]);

      // 1. Refusal Strategy
      if (response.execution_strategy === "REFUSE") {
        speakText(response.spoken_feedback);
        setIsLoading(false);
        return;
      }

      // 2. Navigation Strategy
      if (response.intent === "NAVIGATE" && response.tool_called === "navigate_to") {
        const route = response.parameters.page_route;
        speakText(response.spoken_feedback);
        
        if (route === "/search") {
          navigate("/facilities");
        } else if (route === "/booking") {
          navigate("/services");
        } else if (route === "/dashboard") {
          navigate("/admin");
        } else if (route === "/home") {
          navigate("/");
        } else {
          navigate(route);
        }
        
        setIsLoading(false);
        return;
      }

      // 3. Search Strategy (fetch_resources)
      if (response.intent === "RESOURCE_SEARCH" && response.tool_called === "fetch_resources") {
        const { facility_type, status, location } = response.parameters;
        speakText(response.spoken_feedback);
        
        const queryParams = new URLSearchParams();
        if (facility_type) queryParams.set("type", facility_type);
        if (status) queryParams.set("status", status);
        if (location) queryParams.set("location", location);
        
        navigate(`/facilities?${queryParams.toString()}`);
        setIsLoading(false);
        return;
      }

      // 4. Booking Strategy (prefill_booking_form)
      if (response.intent === "FACILITY_BOOKING" && response.tool_called === "prefill_booking_form") {
        const facilityName = response.parameters.facility_name;
        const date = response.parameters.requested_date || response.parameters.appointment_date || "";
        const time = response.parameters.requested_time || response.parameters.appointment_time || "";

        speakText(response.spoken_feedback);

        try {
          const [services, facilities] = await Promise.all([
            api.getServices(),
            api.getFacilities()
          ]);

          // Find facility ID matching the parsed name
          const matchedFacility = facilities.find((f: any) => 
            f.company_name.toLowerCase().includes(facilityName.toLowerCase())
          );

          let targetServiceId = null;

          if (matchedFacility) {
            const matchedService = services.find((s: any) => 
              s.facility === matchedFacility.id
            );
            if (matchedService) {
              targetServiceId = matchedService.id;
            }
          }

          // Stage prefilled states in context
          setPrefilledBookingData({
            facilityName: matchedFacility ? matchedFacility.company_name : facilityName,
            date,
            time,
            patientName: "John Doe",
            phone: "0788000000",
            notes: "Prefilled by Ostrabacus AI. Please review."
          });
          setShouldOpenModal(true);

          if (targetServiceId) {
            navigate(`/services/${targetServiceId}`);
          } else {
            navigate("/services");
            speakText("Details prefilled. Please select a service to continue booking.");
          }

        } catch (fetchErr) {
          console.error("Ostrabacus AI: Error pre-fetching facility service mapping:", fetchErr);
          setPrefilledBookingData({
            facilityName,
            date,
            time,
            patientName: "John Doe",
            phone: "0788000000",
            notes: "Prefilled by Ostrabacus AI."
          });
          setShouldOpenModal(true);
          navigate("/services");
        }
      }

    } catch (err) {
      console.error("Ostrabacus AI execution error:", err);
      speakText("There was an error processing your query. Please try again.");
    } finally {
      setIsLoading(false);
      setInputText("");
    }
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      handleProcessCommand(inputText);
    }
  };

  return (
    <>
      {/* Floating Microphone Trigger Button */}
      <div className="fixed bottom-24 right-6 z-999 flex flex-col items-end gap-3 pointer-events-none">
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => {
                setIsOpen(true);
                speakText("Ostrabacus-AI  assistant activated. Press Alt + A to toggle anytime.");
              }}
              className="pointer-events-auto w-14 h-14 bg-primary text-white hover:bg-primary-light rounded-full flex items-center justify-center shadow-2xl border-2 border-accent hover:border-accent-dark transition-all duration-300 relative group cursor-pointer focus:ring-4 focus:ring-primary/40 focus:outline-none"
              aria-label="Activate Ostrabacus AI Voice Assistant (Shortcut: Alt + A)"
              aria-expanded={isOpen}
            >
              <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping opacity-75 group-hover:block" />
              <Mic size={24} className="relative z-10" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Expanded Accessibility Widget Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.95 }}
            className="fixed bottom-24 right-6 w-full max-w-md bg-emerald-950/95 backdrop-blur-xl border border-emerald-500/20 text-white rounded-3xl shadow-2xl p-6 z-999 overflow-hidden flex flex-col"
            ref={panelRef}
            role="dialog"
            aria-label="Ostrabacus AI Accessibility Control Panel"
          >
            {/* Background Glow */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="text-accent animate-pulse" size={20} />
                <div>
                  <h2 className="font-display font-bold text-lg leading-none tracking-tight">Ostrabacus AI</h2>
                  <span className="text-[9px] text-accent font-black tracking-widest uppercase mt-1 block">Accessibility Mode</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  speakText("Ostrabacus assistant closed.");
                }}
                className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
                aria-label="Close Assistant"
              >
                <X size={16} />
              </button>
            </div>

            {/* Command History / Console Output */}
            <div className="flex-1 max-h-56 overflow-y-auto pr-1 space-y-3 custom-scrollbar mb-4">
              {history.length === 0 ? (
                <div className="text-center py-6 text-white/50 text-xs flex flex-col items-center gap-2">
                  <Compass size={24} className="opacity-40 animate-spin-slow" />
                  <p>Speak or type to navigate care pages, search pharmacies, or prefill appointment forms.</p>
                  <p className="text-[10px] text-accent/80">Try saying: "Find open pharmacies near me"</p>
                </div>
              ) : (
                history.map((item, idx) => (
                  <div key={idx} className="p-3 bg-white/5 rounded-xl border border-white/5 text-xs flex flex-col gap-1.5">
                    <div className="flex justify-between text-[10px] text-white/40">
                      <span>User Question</span>
                      <span>{item.timestamp}</span>
                    </div>
                    <p className="font-semibold text-white/95 italic">"{item.query}"</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-accent font-bold mt-1">
                      <CheckCircle2 size={12} />
                      <span>{item.intent}</span>
                    </div>
                    <p className="text-white/80 border-t border-white/5 pt-1 mt-1 leading-relaxed">{item.feedback}</p>
                  </div>
                ))
              )}
            </div>

            {/* Input Actions Controls */}
            <div className="space-y-4">
              {/* Listening pulse waveforms */}
              <AnimatePresence>
                {isListening && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="flex justify-center items-center gap-1.5 py-3"
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 bg-accent rounded-full"
                        animate={{ height: [8, 24, 8] }}
                        transition={{
                          duration: 0.6,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Input Section */}
              <form onSubmit={handleTextSubmit} className="flex gap-2">
                <div className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={isListening ? "Listening..." : "Type command, route or query..."}
                    disabled={isLoading}
                    className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder-white/40"
                    aria-label="Type Ostrabacus-AI instruction"
                  />
                  {inputText && (
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="text-accent hover:text-accent-dark p-0.5"
                      aria-label="Send query"
                    >
                      <Send size={14} />
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={toggleListening}
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-accent text-primary hover:bg-accent-dark"
                  }`}
                  aria-label={isListening ? "Stop voice listening" : "Record voice command"}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
              </form>

              {/* Help Keyboard Shortcuts Banner */}
              <div className="text-[10px] text-white/50 flex justify-between border-t border-white/5 pt-3">
                <span className="flex items-center gap-1"><HelpCircle size={10} /> Keyboard Shortcut:</span>
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] font-bold">Alt + A</kbd>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
