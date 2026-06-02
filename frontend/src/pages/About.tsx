import React from "react";
import { Search, CheckCircle, MapPin, Clock } from "lucide-react";
import { cn } from "@/src/lib/utils";

export function About() {
  return (
    <div className="flex flex-col">
      {/* Page Header */}
      <section className="bg-primary mt-6 py-16 text-white text-center">
        <div className="container-custom">
          <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
            About Locasiyo
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto text-lg leading-relaxed">
            Rwanda's leading real-time healthcare resource network — connecting
            patients to medicines, clinics, and care with smarter data.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
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
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm">
              <CheckCircle size={24} />
            </div>
            <div>
              <span className="text-7xl font-display font-bold">500+</span>
              <p className="text-primary/70 mt-2">Partner Pharmacies</p>
            </div>
          </div>
          <div className="bg-blue-500 p-12 rounded-[40px] text-white flex flex-col justify-between min-h-[300px]">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <span className="text-7xl font-display font-bold">24/7</span>
              <p className="text-white/70 mt-2">Emergency Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="container-custom py-16">
        <div className="bg-gray-50 rounded-3xl md:rounded-[40px] p-6 md:p-12 flex flex-col md:flex-row items-center gap-12">
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
            <p className="text-text-main text-lg leading-relaxed">
              Our platform connects directly with pharmacy management systems to
              provide true inventory data, not estimates.
            </p>
          </div>
          <div className="w-full md:w-1/3 bg-accent p-6 sm:p-10 rounded-3xl sm:rounded-[40px] flex flex-col justify-between min-h-[240px]">
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
        <span className="mr-2">{number}.</span>
        {title}
      </h3>
      <p className="text-text-main leading-relaxed">{description}</p>
    </div>
  );
}
