import {
  Search,
  MapPin,
  Star,
  Filter,
  ChevronDown,
  Expand,
  ArrowRight,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { Link } from "react-router-dom";

export function Services() {
  return (
    <div className=" pt-10 pb-32">
      <div className="container-custom">
        <h1 className="text-4xl font-display font-bold text-primary mb-12">
          Find Medical Services & Treatment
        </h1>

        {/* Search Bar */}
        <div className="bg-surface p-2 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-2 mb-16">
          <div className="flex-1 flex items-center gap-3 px-6 py-4 border-b md:border-b-0 md:border-r border-black/5 dark:border-white/5">
            <Search className="text-text-muted" size={20} />
            <input
              type="text"
              placeholder="General Consultation"
              className="w-full outline-none text-primary font-medium"
            />
          </div>
          <div className="flex-1 flex items-center gap-3 px-6 py-4">
            <MapPin className="text-text-muted" size={20} />
            <input
              type="text"
              placeholder="Kigali, Rwanda"
              className="w-full outline-none text-primary font-medium"
            />
          </div>
          <button className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 hover:bg-primary-light transition-colors">
            <Filter size={18} /> Update Search
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Results List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between text-primary/80 mb-4">
              <p className="text-sm">
                Showing 24 results for{" "}
                <span className="text-primary font-bold">
                  "General Consultation"
                </span>
              </p>
              <button className="flex items-center gap-2 text-sm font-medium">
                Sort by: <span className="text-primary font-bold">Nearest</span>{" "}
                <ChevronDown size={16} />
              </button>
            </div>

            <ServiceCard
              id="general-consultation"
              image="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800"
              title="General Consultation"
              provider="Kigali Life Pharmacy & Clinic"
              location="KN 3 Rd, Kigali (0.8 km away)"
              rating={4.8}
            />
            <ServiceCard
              id="city-medical-consultation"
              image="https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800"
              title="General Consultation & Diagnostics"
              provider="City Medical Center"
              location="Kimironko, KG 11 Ave (2.4 km away)"
              rating={4.9}
            />
            <ServiceCard
              id="family-health-screening"
              image="https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800"
              title="Family Health Screening"
              provider="Hope Wellness Clinic"
              location="Nyarugenge, KN 2 St (1.2 km away)"
              rating={4.5}
            />

            <div className="flex justify-center pt-8">
              <button className=" bg-primary px-12 py-4 border-2 border-white/20 text-white font-bold rounded-2xl hover:bg-primary-light transition-colors">
                Load More Services
              </button>
            </div>
          </div>

          {/* Sidebar Filters & Map */}
          <div className="space-y-8">
            <div className="bg-surface p-8 rounded-[40px] shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-primary flex items-center gap-2">
                  <MapPin size={18} /> Quick Map View
                </h3>
              </div>
              <div className="relative rounded-3xl overflow-hidden h-64 bg-secondary/30">
                {/* Mock Map Background */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-primary/20 flex flex-col items-center">
                    <MapPin size={48} className="mb-2" />
                    <span className="text-xs font-bold uppercase tracking-widest">
                      Interactive Map
                    </span>
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <button className="bg-surface text-primary px-6 py-3 rounded-xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
                    <Expand size={18} /> Expand Map
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-surface p-8 rounded-[40px] shadow-xl">
              <h3 className="font-bold text-primary mb-8">
                Refine Your Search
              </h3>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 block">
                    Service Type
                  </label>
                  <div className="space-y-3">
                    <FilterOption label="Consultation" checked />
                    <FilterOption label="Laboratory" checked />
                    <FilterOption label="Pharmacy" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 block">
                    Price Range
                  </label>
                  <div className="px-2">
                    <div className="h-1.5 bg-black/5 dark:bg-white/10 rounded-full relative">
                      <div className="absolute left-0 right-1/4 h-full bg-primary rounded-full" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-surface border-2 border-primary rounded-full shadow-md" />
                      <div className="absolute right-1/4 top-1/2 -translate-y-1/2 w-4 h-4 bg-surface border-2 border-primary rounded-full shadow-md" />
                    </div>
                    <div className="flex justify-between mt-4 text-xs font-bold text-primary">
                      <span>5,000 RWF</span>
                      <span>50,000 RWF+</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-text-muted uppercase tracking-widest mb-4 block">
                    Rating
                  </label>
                  <div className="flex items-center gap-2 text-accent-dark">
                    {[1, 2, 3, 4].map((i) => (
                      <Star key={i} size={18} fill="currentColor" />
                    ))}
                    <Star size={18} className="text-gray-200" />
                    <span className="text-sm font-bold text-primary ml-2">
                      4+ Stars
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ServiceCard({
  id,
  image,
  title,
  provider,
  location,
  rating,
}: {
  id: string;
  image: string;
  title: string;
  provider: string;
  location: string;
  rating: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="bg-surface p-6 rounded-[32px] shadow-xl flex flex-col md:flex-row gap-8 group"
    >
      <div className="w-full md:w-64 h-48 rounded-2xl overflow-hidden shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="flex-1 flex flex-col justify-between py-2">
        <div>
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-2xl font-bold text-primary">{title}</h3>
            <div className="flex items-center gap-1 bg-accent/20 text-accent-dark px-2 py-1 rounded-lg">
              <Star size={14} fill="currentColor" />
              <span className="text-xs font-bold text-primary">{rating}</span>
            </div>
          </div>
          <p className="text-lg font-medium text-primary-light mb-1">
            {provider}
          </p>
          <p className="text-text-muted text-sm flex items-center gap-2">
            <MapPin size={14} /> {location}
          </p>
        </div>
        <div className="flex items-center gap-4 mt-6">
          <Link
            to={`/services/${id}`}
            className="text-primary font-bold text-sm underline underline-offset-4 hover:text-primary-light transition-colors flex items-center gap-1"
          >
            View Details <ArrowRight size={14} />
          </Link>
          <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-primary-light transition-colors ml-auto">
            Book Appointment
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function FilterOption({
  label,
  checked = false,
}: {
  label: string;
  checked?: boolean;
}) {
  return (
    <label className="flex items-center gap-3 cursor-pointer group">
      <div
        className={cn(
          "w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
          checked
            ? "bg-primary border-primary"
            : "border-black/5 dark:border-white/5 group-hover:border-primary/50",
        )}
      >
        {checked && <div className="w-2 h-2 bg-surface rounded-full" />}
      </div>
      <span
        className={cn(
          "text-sm font-medium",
          checked ? "text-primary font-bold" : "text-text-muted",
        )}
      >
        {label}
      </span>
    </label>
  );
}
