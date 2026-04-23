import React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MapPin, User, Menu, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";

const NAV_LINKS = [
  { name: "Find Care", href: "/services" },
  { name: "Medicines", href: "/medicines" },
  { name: "Facilities", href: "/facilities" },
  { name: "Emergency", href: "/emergency" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg">
      <div className="container-custom py-4 flex items-center justify-between">
        <Link
          to="/"
          className="text-2xl font-display font-bold text-white flex items-center gap-2"
        >
          <span className="text-accent">Kizazi</span> Health
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.name}
              to={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-accent",
                location.pathname === link.href
                  ? "text-accent"
                  : "text-white/80",
              )}
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-6">
          <button className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors">
            <MapPin size={18} />
            Location
          </button>
          <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
            <User size={20} />
          </button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden p-2" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-primary-light border-t border-white/10 overflow-hidden"
          >
            <div className="container-custom py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium hover:text-accent"
                >
                  {link.name}
                </Link>
              ))}
              <hr className="border-white/10" />
              <button className="flex items-center gap-2 text-lg font-medium">
                <MapPin size={20} />
                Location
              </button>
              <button className="flex items-center gap-2 text-lg font-medium">
                <User size={20} />
                Profile
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-[#F1F5F9] pt-16 pb-8 border-t border-gray-200">
      <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <h3 className="text-xl font-display font-bold text-primary mb-4">
            Kizazi Health
          </h3>
          <p className="text-text-muted text-sm leading-relaxed">
            Rwanda's leading healthcare resource network. Dedicated to
            transparency and accessibility in medical care.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-primary mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>
              <Link to="/facilities" className="hover:text-primary">
                Pharmacy Network
              </Link>
            </li>
            <li>
              <Link to="/emergency" className="hover:text-primary">
                Emergency Centers
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-primary">
                Medical Blog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-primary mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-text-muted">
            <li>
              <Link to="#" className="hover:text-primary">
                Contact Us
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-primary">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-primary">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-primary mb-4">Regional</h4>
          <p className="text-sm text-text-muted mb-2">Language: Kinyarwanda</p>
        </div>
      </div>

      <div className="container-custom mt-16 pt-8 border-t border-gray-200 text-center text-xs text-text-muted">
        <p>© 2026 Kizazi Health Rwanda. All rights reserved.</p>
      </div>
    </footer>
  );
}
