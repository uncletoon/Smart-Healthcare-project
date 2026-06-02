import React from "react";
import { Link } from "react-router-dom";
import {
  Pill,
  Hospital,
  MapPin,
  Stethoscope,
  Search,
  CheckCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { cn } from "@/src/lib/utils";

export function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-white py-4 overflow-hidden">
      <div className="container-custom grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[65vh]">
        
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="z-10"
        >
          <div className="inline-flex items-center gap-2 bg-secondary/50 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-4">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Real-time Healthcare Network
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-bold text-primary leading-tight mb-6">
            Find Care <br />
            <span className="text-blue-500/80 italic">
              With Confidence.
            </span>
          </h1>

          <p className="text-base md:text-lg text-text-main max-w-lg mb-6 leading-relaxed">
            Instant medicine availability, clinic wait-times, and emergency
            resource tracking across Rwanda. Secure your health with smarter
            data.
          </p>
        </motion.div>

        {/* Right Video */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <video
            src="/Video.mp4"
            className="w-full max-h-[450px] object-contain "
            autoPlay
            muted
            playsInline
          />

          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-linear-to-t from-primary/20 to-transparent pointer-events-none" />
    
          </motion.div>
        </div>
      </section>

      {/* Search Bar Section */}
      <section className="container-custom -mt-8 z-20">
        <div className="bg-white p-6 rounded-3xl shadow-xl border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-0">
            <Link
              to="/medicines"
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl text-base font-display font-bold text-primary border border-gray-100 hover:border-secondary hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <MapPin size={24} className="text-primary" />
              </div>
              Find Nearby
            </Link>
            <Link
              to="/facilities"
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl text-base font-display font-bold text-primary border border-gray-100 hover:border-secondary hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Hospital size={24} className="text-primary" />
              </div>
              View Clinics
            </Link>
            <Link
              to="/medicines"
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl text-base font-display font-bold text-primary border border-gray-100 hover:border-secondary hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Pill size={24} className="text-primary" />
              </div>
              Find Medicine
            </Link>
            <Link
              to="/services"
              className="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-2xl text-base font-display font-bold text-primary border border-gray-100 hover:border-secondary hover:shadow-md transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform">
                <Stethoscope size={24} className="text-primary" />
              </div>
              Services
            </Link>
          </div>
        </div>
      </section>
      {/* Steps Section */}
      <section className="bg-surface py-16">
        <div className="container-custom text-center mb-10">
          <h2 className="text-4xl font-display font-bold text-primary mb-4">
            Healthcare in Three Simple Steps
          </h2>
          <p className="text-text-main max-w-2xl mx-auto">
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
    <div className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl transition-all group">
      <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-display font-bold text-primary mb-4">
        <span className="text-black-500 mr-2">{number}.</span>
        {title}
      </h3>
      <p className="text-text-main leading-relaxed">{description}</p>
    </div>
  );
}
