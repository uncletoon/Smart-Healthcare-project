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

// Define the shape of our context
interface OstrabacusContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  prefilledBookingData: PrefilledBookingData | null;
  setPrefilledBookingData: (data: PrefilledBookingData | null) => void;
  shouldOpenModal: boolean;
  setShouldOpenModal: (shouldOpen: boolean) => void;
  lastSpokenText: string;
  speakText: (text: string) => void;
  clearPrefilledData: () => void;
  currentIntent: string | null;
  setCurrentIntent: (intent: string | null) => void;
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

  // Clean out pre-fill cache once booking is completed or dismissed
  const clearPrefilledData = useCallback(() => {
    setPrefilledBookingData(null);
    setShouldOpenModal(false);
  }, []);

  // Text-To-Speech function using Web Speech API synthesis
  const speakText = useCallback((text: string) => {
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
      
      window.speechSynthesis.speak(utterance);
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
            speakText("Ostrabacus accessibility assistant opened. How can I help you today?");
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
