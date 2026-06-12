import React, { useState, useEffect } from "react";
import { Modal } from "./modal/model";
import { Calendar, Phone, CheckCircle2, User, AlertCircle, FileText } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceName: string;
  requirements: string[];
}

export default function BookingModal({
  isOpen,
  onClose,
  serviceName,
  requirements = [],
}: BookingModalProps) {
  // Form fields matching Django Booking model fields
  const [patientName, setPatientName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [notes, setNotes] = useState("");

  const [confirmRequirements, setConfirmRequirements] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Reset states when modal closes or opens
  useEffect(() => {
    if (isOpen) {
      setPatientName("");
      setPhone("");
      setDateTime("");
      setNotes("");
      setConfirmRequirements(false);
      setIsSubmitted(false);
    }
  }, [isOpen]);

  const getMinDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmRequirements) return;
    // Simulate successful booking
    setIsSubmitted(true);
  };

  const defaultRequirements = [
    "Original National ID or Passport",
    "Active insurance membership card (if applicable)",
    "Arrive 15 minutes before the scheduled time",
  ];

  const requirementsList = requirements.length > 0 ? requirements : defaultRequirements;

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl p-0 overflow-hidden">
      <div className="p-6 md:p-8 bg-white dark:bg-gray-900">
        <AnimatePresence mode="wait">
          {!isSubmitted ? (
            <motion.div
              key="booking-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div className="mb-6">
                <span className="text-xs font-bold text-primary uppercase tracking-wider bg-secondary px-3 py-1 rounded-md">
                  Appointment Request
                </span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-2 leading-tight">
                  Book {serviceName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Fill in the details below to request your slot.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Requirements Checklist */}
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <AlertCircle size={16} className="text-primary" />
                    Required for Appointment
                  </h4>
                  <ul className="space-y-2.5 mb-4 text-xs text-gray-600 dark:text-gray-300">
                    {requirementsList.map((req, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>

                  <label className="flex items-center gap-3 cursor-pointer select-none group border-t border-gray-200/60 dark:border-gray-700/60 pt-3">
                    <input
                      type="checkbox"
                      checked={confirmRequirements}
                      onChange={(e) => setConfirmRequirements(e.target.checked)}
                      className="rounded border-gray-300 text-primary focus:ring-primary h-4.5 w-4.5 transition cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-gray-800 dark:text-gray-200 group-hover:text-primary transition">
                      I confirm that I meet all the requirements listed above.
                    </span>
                  </label>
                </div>

                {/* Form fields - disabled until requirements are checked */}
                <div
                  className={`space-y-4 transition-all duration-300 ${
                    confirmRequirements ? "opacity-100" : "opacity-45 pointer-events-none select-none"
                  }`}
                >
                  {/* Patient Name */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Patient Name
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                        <User size={16} />
                      </span>
                      <input
                        type="text"
                        required={confirmRequirements}
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-gray-800 dark:text-white transition"
                      />
                    </div>
                  </div>

                  {/* Phone & Date Time */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Phone Number
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Phone size={16} />
                        </span>
                        <input
                          type="tel"
                          required={confirmRequirements}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+250 788 000 000"
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-gray-800 dark:text-white transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                        Appointment Date & Time
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                          <Calendar size={16} />
                        </span>
                        <input
                          type="datetime-local"
                          required={confirmRequirements}
                          min={getMinDateTimeString()}
                          value={dateTime}
                          onChange={(e) => setDateTime(e.target.value)}
                          className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-xs outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-gray-800 dark:text-white transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes / Symptoms */}
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                      Special Notes / Symptoms
                    </label>
                    <div className="relative">
                      <span className="absolute top-3 left-3.5 text-gray-400 pointer-events-none">
                        <FileText size={16} />
                      </span>
                      <textarea
                        rows={3}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Briefly describe symptoms, medical history, or insurance query..."
                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 text-gray-800 dark:text-white transition resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold text-sm transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!confirmRequirements}
                    className="flex-1 bg-primary text-white py-3 rounded-xl font-bold text-sm hover:opacity-90 transition disabled:opacity-45 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Calendar size={18} />
                    Confirm
                  </button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="text-center py-6"
            >
              <div className="w-16 h-16 bg-green-50 dark:bg-green-950/30 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-100 dark:border-green-900">
                <CheckCircle2 size={36} className="text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                Appointment Requested!
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm mx-auto">
                Your appointment has been successfully requested. The facility will review and confirm your slot.
              </p>

              {/* Booking Details Card */}
              <div className="bg-gray-50 dark:bg-gray-800/80 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 max-w-sm mx-auto my-6 text-left space-y-3">
                <div className="text-xs border-b border-gray-200/50 dark:border-gray-700/50 pb-2 flex justify-between">
                  <span className="font-bold text-gray-400 uppercase tracking-wider">Appointment Summary</span>
                  <span className="font-bold text-amber-600 uppercase tracking-wider">Pending Review</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">Service</span>
                  <span className="font-bold text-gray-800 dark:text-white">{serviceName}</span>
                </div>
                <div className="text-sm">
                  <span className="text-gray-500 dark:text-gray-400 text-xs block">Patient</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{patientName}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400 text-xs block">Contact Phone</span>
                    <span className="font-semibold text-gray-800 dark:text-white">{phone}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-gray-500 dark:text-gray-400 text-xs block">Requested Time</span>
                    <span className="font-semibold text-gray-800 dark:text-white">
                      {new Date(dateTime).toLocaleString()}
                    </span>
                  </div>
                </div>
                {notes && (
                  <div className="text-sm border-t border-gray-100 dark:border-gray-700/50 pt-2.5">
                    <span className="text-gray-500 dark:text-gray-400 text-xs block">Notes</span>
                    <p className="text-gray-600 dark:text-gray-300 text-xs italic mt-0.5 max-h-16 overflow-y-auto">
                      "{notes}"
                    </p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full max-w-sm bg-primary text-white py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg shadow-primary/10"
              >
                Close Summary
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
