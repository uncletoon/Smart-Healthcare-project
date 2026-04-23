import React from "react";
import {
  Search,
  MapPin,
  Star,
  Filter,
  ChevronDown,
  List,
  Map as MapIcon,
  Droplets,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";
import { MOCK_FACILITIES } from "@/src/types";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";

export function Facilities() {
  return (
    <div className="bg-surface min-h-screen py-16">
      <div className="container-custom">
        <h1 className="text-4xl font-display font-bold text-primary mb-2">
          Healthcare Facilities
        </h1>
        <p className="text-text-muted mb-12">
          Showing 24 results for pharmacies and clinics in Kigali
        </p>

        {/* Search & Filters */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <div className="flex-1 bg-surface p-2 rounded-2xl shadow-sm border border-black/5 dark:border-white/5 flex items-center gap-4 px-6">
            <Search className="text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Search by name, treatment, or specialty..."
              className="w-full py-3 outline-none text-primary"
            />
            <button className="bg-primary text-white px-6 py-2 rounded-xl font-bold text-sm">
              Search
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-4 bg-surface border border-black/5 dark:border-white/5 rounded-2xl text-sm font-bold text-primary shadow-sm">
              <Filter size={18} /> Filter
            </button>

            <button className="flex items-center gap-2 px-6 py-4 bg-surface border border-black/5 dark:border-white/5 rounded-2xl text-sm font-bold text-primary shadow-sm">
              Sort by: <span className="font-black">Distance</span>{" "}
              <ChevronDown size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Sidebar Wellness Tip */}
          <div className="bg-primary rounded-3xl p-6 text-white relative overflow-hidden h-fit lg:sticky lg:top-24">
            <div className="relative z-10">
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-70 mb-4 block">
                Wellness Tip
              </span>
              <Activity size={32} className="mb-6 opacity-80" />
              <h3 className="text-2xl font-bold mb-4">
                Stay Hydrated for Better Immunity
              </h3>
              <p className="text-sm text-white/80 mb-8 leading-relaxed">
                Drinking at least 2 liters of water daily helps maintain energy
                levels and supports your body's natural defense mechanisms.
              </p>
              <ul className="space-y-3 text-sm mb-10">
                <li className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                    ✓
                  </div>{" "}
                  Boosts mental clarity
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                    ✓
                  </div>{" "}
                  Improves skin health
                </li>
                <li className="flex items-center">
                  <div className="w-5 h-5 rounded-full bg-secondary/20 flex items-center justify-center mr-3">
                    ✓
                  </div>{" "}
                  Regulates body temperature
                </li>
              </ul>
              <button className="w-full py-3 bg-surface text-primary rounded-xl font-bold text-sm hover:bg-black/5 dark:bg-white/10 transition-colors">
                Learn More →
              </button>
            </div>
          </div>

          {/* Facilities List */}
          <div className="lg:col-span-3 space-y-8">
            {MOCK_FACILITIES.map((facility, idx) => (
              <motion.div
                key={facility.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-surface p-8 rounded-[20px] shadow-sm border border-black/5 dark:border-white/5 flex flex-col md:flex-row gap-8 group hover:shadow-xl transition-all"
              >
                <div className="w-full md:w-72 h-48 rounded-2xl overflow-hidden shrink-0">
                  <img
                    src={facility.image}
                    alt={facility.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="text-2xl font-bold text-primary mb-1">
                          {facility.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="bg-secondary text-primary text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase">
                            {facility.type}
                          </span>
                          <p className="text-text-muted text-xs flex items-center gap-1">
                            <MapPin size={12} /> {facility.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 bg-accent/20 text-accent-dark px-2 py-1 rounded-lg">
                        <Star size={14} fill="currentColor" />
                        <span className="text-xs font-bold text-primary">
                          {facility.rating}
                        </span>
                      </div>
                    </div>
                    <p className="text-text-muted text-sm leading-relaxed mt-4 line-clamp-2">
                      {facility.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-8">
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          facility.status === "Open Now"
                            ? "bg-green-500"
                            : "bg-red-500",
                        )}
                      />
                      <span
                        className={cn(
                          "text-xs font-bold",
                          facility.status === "Open Now"
                            ? "text-green-600"
                            : "text-red-600",
                        )}
                      >
                        {facility.status}
                      </span>
                    </div>
                    <Link
                      to={`/facilities/${facility.id}`}
                      className="text-primary font-bold text-sm flex items-center gap-2 hover:underline"
                    >
                      View Details{" "}
                      <ChevronDown className="-rotate-90" size={16} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            <div className="flex justify-center gap-2 pt-12">
              <PaginationButton label="1" active />
              <PaginationButton label="2" />
              <PaginationButton label="3" />
              <span className="px-4 py-2 text-text-muted">...</span>
              <PaginationButton label="8" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PaginationButton({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={cn(
        "w-12 h-12 rounded-2xl font-bold transition-colors",
        active
          ? "bg-primary text-white"
          : "bg-surface text-primary border border-black/5 dark:border-white/5 hover:bg-black/5 dark:bg-white/5",
      )}
    >
      {label}
    </button>
  );
}
