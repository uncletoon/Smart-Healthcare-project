import React from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Pill,
  Hospital,
  MapPin,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  Star,
  Activity,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-24 overflow-hidden">
        <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="z-10"
          >
            <div className="inline-flex items-center gap-2 bg-secondary/50 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-6">
              <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
              Real-time Rwanda Healthcare Network
            </div>
            <h1 className="text-6xl md:text-7xl font-display font-bold text-primary leading-[1.1] mb-8">
              Care that finds <br />
              <span className="text-primary-light italic">you first.</span>
            </h1>
            <p className="text-lg text-text-muted max-w-lg mb-10 leading-relaxed">
              Instant medicine availability, clinic wait-times, and emergency
              resource tracking across Kigali and beyond. Secure your health
              with smarter data.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="../public/main.png"
                alt="Healthcare Professionals"
                className="w-full h-[500px] object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
            </div>

            {/* Floating Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="absolute -bottom-8 -left-8 md:left-12 right-8 md:right-auto bg-white p-6 rounded-2xl shadow-2xl border border-gray-100 max-w-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
                  Trending
                </span>
                <div className="flex items-center gap-1 text-accent-dark">
                  <Star size={14} fill="currentColor" />
                  <span className="text-xs font-bold text-primary">
                    4.9 (240+)
                  </span>
                </div>
              </div>
              <h3 className="text-lg font-bold text-primary mb-1">
                Pharmacie de l'Espoir
              </h3>
              <div className="flex items-center gap-2 text-text-muted text-xs mb-4">
                <MapPin size={12} />
                <span>Open • 400m away</span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                  In Stock
                </span>
                <span className="text-[10px] text-text-muted">
                  Updated 5m ago
                </span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="container-custom -mt-12 z-20">
        <div className="bg-white p-4 rounded-3xl shadow-xl border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-4 bg-gray-50 rounded-2xl px-6 py-4 border border-gray-200">
              <div className="flex items-center gap-2 text-primary font-medium border-r border-gray-300 pr-4 shrink-0">
                <Pill size={20} className="text-accent-dark" />
                <select className="bg-transparent font-medium text-gray-700 outline-none cursor-pointer">
                  <option>Medicines</option>
                  <option>Clinics</option>
                  <option>Hospitals</option>
                </select>
              </div>
              <div className="flex items-center gap-3 w-full">
                <Search size={20} className="text-text-muted" />
                <input
                  type="text"
                  placeholder="Search for Amoxicillin, General Practitioners, or Hospitals..."
                  className="bg-transparent w-full outline-none text-primary placeholder:text-text-muted/60"
                />
              </div>
            </div>
            <button className="btn-primary md:w-40 h-full py-4">
              Search <ArrowRight size={18} />
            </button>
          </div>

          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              to="/medicines"
              className="flex items-center px-4 py-2 bg-gray-50 rounded-lg text-1xl font-display font-bold text-primary  border border-gray-100 hover:border-secondary transition-all"
            >
              <Pill size={18} className="font-bold mr-2" />
              Find Medicine
            </Link>
            <Link
              to="/facilities"
              className="flex items-center px-4 py-2 bg-gray-50 rounded-lg text-1xl font-display font-bold text-primary  border border-gray-100 hover:border-secondary transition-all"
            >
              <Hospital size={18} className="font-bold mr-2" /> View Clinics
            </Link>
            <Link
              to="/medicines"
              className="flex items-center px-4 py-2 bg-gray-50 rounded-lg text-1xl font-display font-bold text-primary  border border-gray-100 hover:border-secondary transition-all"
            >
              <MapPin size={18} className="font-bold mr-2" /> Find Nearby
            </Link>

            <QuickAction
              icon={<Activity size={18} />}
              label="Emergency"
              variant="danger"
            />
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="bg-surface py-32">
        <div className="container-custom text-center mb-20">
          <h2 className="text-4xl font-display font-bold text-primary mb-4">
            Healthcare in Three Simple Steps
          </h2>
          <p className="text-text-muted max-w-2xl mx-auto">
            Connecting you to the nearest pharmacies and hospitals with verified
            availability in real-time.
          </p>
        </div>

        <div className="container-custom grid grid-cols-1 md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Search Resource"
            description="Type your medication or required medical service. Our AI scans live inventory across 500+ Rwandan facilities."
            icon={<Search className="text-primary" />}
          />
          <StepCard
            number="2"
            title="Confirm Availability"
            description="View verified stock status, pricing, and operating hours. No more wasted trips to closed pharmacies."
            icon={<CheckCircle className="text-primary" />}
          />
          <StepCard
            number="3"
            title="Get Care Instantly"
            description="Book a consultation, reserve your medicine, or navigate to the facility directly with integrated maps."
            icon={<MapPin className="text-primary" />}
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-white">
        <div className="container-custom grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-primary p-12 rounded-[40px] text-white flex flex-col justify-between min-h-[300px]">
            <h3 className="text-2xl font-display font-medium leading-tight">
              Empowering Rwanda's Health Ecosystem
            </h3>
            <div>
              <span className="text-7xl font-display font-bold">98%</span>
              <p className="text-white/70 mt-2">Search Accuracy</p>
            </div>
          </div>
          <div className="bg-secondary p-12 rounded-[40px] text-primary flex flex-col justify-between min-h-[300px]">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle size={24} />
            </div>
            <div>
              <span className="text-7xl font-display font-bold">500+</span>
              <p className="text-primary/70 mt-2">Partner Pharmacies</p>
            </div>
          </div>
          <div className="bg-blue-500 p-12 rounded-[40px] text-white flex flex-col justify-between min-h-[300px]">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <AlertCircle size={24} />
            </div>
            <div>
              <span className="text-7xl font-display font-bold">24/7</span>
              <p className="text-white/70 mt-2">Emergency Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="container-custom py-12">
        <div className="bg-gray-50 rounded-[40px] p-8 md:p-12 flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/3 rounded-3xl overflow-hidden shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800"
              alt="Integration"
              className="w-full h-64 object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-display font-bold text-primary mb-4">
              Seamless Integration
            </h2>
            <p className="text-text-muted text-lg leading-relaxed">
              Our platform connects directly with pharmacy management systems to
              provide true inventory data, not estimates.
            </p>
          </div>
          <div className="w-full md:w-1/3 bg-accent p-10 rounded-[40px] flex flex-col justify-between min-h-[240px]">
            <div>
              <h3 className="text-2xl font-display font-bold text-primary mb-2">
                Ready to find care?
              </h3>
              <p className="text-primary/70 text-sm">
                Join thousands of patients already saving time and lives.
              </p>
            </div>
            <button className="bg-primary text-white py-4 rounded-2xl font-bold mt-6 hover:bg-primary-light transition-colors">
              Get Started Now
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  variant = "default",
}: {
  icon: React.ReactNode;
  label: string;
  variant?: "default" | "danger";
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all border",
        variant === "danger"
          ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100"
          : "bg-white text-primary border-gray-100 hover:border-primary/20 hover:bg-gray-50",
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white p-10 rounded-[40px] shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
      <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-primary mb-4">
        <span className="text-primary/30 mr-2">{number}.</span>
        {title}
      </h3>
      <p className="text-text-muted leading-relaxed">{description}</p>
    </div>
  );
}
