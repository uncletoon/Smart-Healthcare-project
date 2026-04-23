import React from "react";
import { Search, Pill, ChevronDown, Info } from "lucide-react";
import { motion } from "motion/react";
import { MOCK_MEDICINES } from "@/src/types";

export function Medicines() {
  return (
    <div className="bg-surface min-h-screen py-8">
      <div className="container-custom">
        <h1 className="text-4xl font-display font-bold text-primary mb-6">
          Search Available Medicines
        </h1>

        {/* Search Bar */}
        <div className="bg-surface p-4 rounded-3xl shadow-lg border border-black/5 dark:border-white/5 mb-8">
          <div className="flex items-center gap-4 px-4 py-2">
            <Search className="text-text-muted" size={24} />
            <input
              type="text"
              placeholder="Search for paracetamol, insulin, antibiotics..."
              className="w-full bg-transparent outline-none text-lg text-primary placeholder:text-text-muted/50"
            />
          </div>
        </div>

        {/* Suggestions */}
        <div className="flex items-center gap-4 mb-6 overflow-x-auto no-scrollbar">
          <span className="text-sm font-medium text-text-muted whitespace-nowrap">
            Suggested:
          </span>
          {["Amoxicillin", "Ibuprofen", "Vitamin C"].map((tag) => (
            <button
              key={tag}
              className="px-4 py-2 bg-black/5 dark:bg-white/10 rounded-full text-sm font-medium text-primary hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              {tag}
            </button>
          ))}
        </div>

        {/* Medicine List */}
        <div className="space-y-4">
          {MOCK_MEDICINES.map((med, idx) => (
            <motion.div
              key={med.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-surface p-4 rounded-[12px] shadow-sm border border-black/5 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-6 w-full md:w-auto">
                <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0">
                  <Pill className="text-primary" size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primary">{med.name}</h3>
                  <p className="text-text-muted flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary/30 rounded-full" />
                    {med.pharmacy}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto md:gap-16">
                <div className="text-right">
                  <p className="text-2xl font-display font-bold text-primary">
                    {med.price.toLocaleString()} RWF
                  </p>
                  <span className="text-[10px] font-bold text-green-600 tracking-widest uppercase">
                    Available
                  </span>
                </div>
                <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-light transition-colors">
                  Details
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <button className="flex items-center gap-2 px-8 py-4 bg-black/5 dark:bg-white/10 text-primary font-bold rounded-2xl hover:bg-gray-200 transition-colors">
            Load more medicines <ChevronDown size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
