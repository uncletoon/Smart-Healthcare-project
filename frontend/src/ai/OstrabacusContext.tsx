import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// Define shape of prefilled booking information
export interface PrefilledBookingData {
  facilityName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  patientName: string;
  phone: string;
  notes: string;
}

export interface ChatMessage {
  sender: "user" | "ai";
  text: string;
  timestamp: string;
}

export interface BookingSession {
  facilityName?: string;
  serviceId?: string | number;
  serviceName?: string;
  patientName?: string;
  phone?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:MM:SS
  notes?: string;
}

export interface PageContext {
  type: "service" | "facility" | "list" | "medicines" | "other";
  data: any;
}

// Define the shape of our context
interface OstrabacusContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  prefilledBookingData: PrefilledBookingData | null;
  setPrefilledBookingData: (data: PrefilledBookingData | null) => void;
  shouldOpenModal: boolean;
  setShouldOpenModal: (shouldOpen: boolean) => void;
  lastSpokenText: string;
  speakText: (text: string, onEnd?: () => void) => void;
  clearPrefilledData: () => void;
  currentIntent: string | null;
  setCurrentIntent: (intent: string | null) => void;
  
  // Expanded for multi-turn dialogue
  chatHistory: ChatMessage[];
  setChatHistory: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  bookingSession: BookingSession | null;
  setBookingSession: React.Dispatch<React.SetStateAction<BookingSession | null>>;
  pageContext: PageContext | null;
  setPageContext: React.Dispatch<React.SetStateAction<PageContext | null>>;
  addChatMessage: (sender: "user" | "ai", text: string) => void;
  clearChat: () => void;
  resetBookingSession: () => void;
}

const OstrabacusContext = createContext<OstrabacusContextType | undefined>(undefined);

export const OstrabacusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Assistant panel visibility state
  const [isOpen, setIsOpen] = useState(false);
  
  // Stored booking data pre-filled by the AI assistant
  const [prefilledBookingData, setPrefilledBookingData] = useState<PrefilledBookingData | null>(null);
  
  // Flag indicating whether the booking modal should automatically open once navigate completes
  const [shouldOpenModal, setShouldOpenModal] = useState(false);
  
  // Text announcement for screen readers (aria-live region)
  const [lastSpokenText, setLastSpokenText] = useState("");
  
  // Current parsed intent (for debugging / visual feedback)
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);

  // Conversational state additions
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [bookingSession, setBookingSession] = useState<BookingSession | null>(null);
  const [pageContext, setPageContext] = useState<PageContext | null>(null);

  // Add message helper
  const addChatMessage = useCallback((sender: "user" | "ai", text: string) => {
    setChatHistory((prev) => [
      ...prev,
      {
        sender,
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, []);

  // Reset chat helper
  const clearChat = useCallback(() => {
    setChatHistory([]);
  }, []);

  // Reset booking session helper
  const resetBookingSession = useCallback(() => {
    setBookingSession(null);
  }, []);

  // Clean out pre-fill cache once booking is completed or dismissed
  const clearPrefilledData = useCallback(() => {
    setPrefilledBookingData(null);
    setShouldOpenModal(false);
    setBookingSession(null);
  }, []);

  // Text-To-Speech function using Web Speech API synthesis
  // onEnd callback lets the caller (e.g. mic manager) know when speech has finished
  const speakText = useCallback((text: string, onEnd?: () => void) => {
    if (!text) return;
    setLastSpokenText(text); // Updates the aria-live region for screen readers

    // Fallback/parallel vocalization using native SpeechSynthesis
    if ("speechSynthesis" in window) {
      // Cancel any ongoing speech to avoid overlap queuing
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      
      // Get standard English voice if available
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(v => v.lang.startsWith("en"));
      if (englishVoice) {
        utterance.voice = englishVoice;
      }

      // Fire onEnd when the browser finishes speaking so callers can chain actions
      if (onEnd) {
        utterance.onend = onEnd;
        utterance.onerror = onEnd; // also unblock mic on error
      }
      
      window.speechSynthesis.speak(utterance);
    } else if (onEnd) {
      // No speech synthesis available – fire callback immediately so mic restarts
      onEnd();
    }
  }, []);

  // Global keyboard listener for accessibility shortcut: Alt + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && (e.key === "a" || e.key === "A")) {
        e.preventDefault();
        setIsOpen((prev) => {
          const nextState = !prev;
          if (nextState) {
            speakText("Ostrabacus assistant opened. How can I help you today?");
          } else {
            speakText("Ostrabacus assistant closed.");
          }
          return nextState;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [speakText]);

  return (
    <OstrabacusContext.Provider
      value={{
        isOpen,
        setIsOpen,
        prefilledBookingData,
        setPrefilledBookingData,
        shouldOpenModal,
        setShouldOpenModal,
        lastSpokenText,
        speakText,
        clearPrefilledData,
        currentIntent,
        setCurrentIntent,
        
        chatHistory,
        setChatHistory,
        bookingSession,
        setBookingSession,
        pageContext,
        setPageContext,
        addChatMessage,
        clearChat,
        resetBookingSession,
      }}
    >
      {children}
      
      {/* Accessible screen reader live-region hidden visually but readable by assistive tech */}
      <div 
        id="ostrabacus-live-announcer"
        aria-live="polite" 
        className="sr-only absolute w-px h-px p-0 -m-px overflow-hidden clip-rect-0 border-0"
      >
        {lastSpokenText}
      </div>
    </OstrabacusContext.Provider>
  );
};

// Custom Hook to consume Ostrabacus context
export const useOstrabacus = () => {
  const context = useContext(OstrabacusContext);
  if (!context) {
    throw new Error("useOstrabacus must be used within an OstrabacusProvider");
  }
  return context;
};
