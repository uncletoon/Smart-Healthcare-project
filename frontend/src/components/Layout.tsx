import React from "react";
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { MapPin, User, Menu, X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import Switch from "./Switch";

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
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return (
    <nav className="bg-primary text-white sticky top-0 z-50 shadow-lg rounded-b-2xl">
      <div className="container-custom py-4 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2"
        >
          <img src="/LOGO.png" alt="Locasiyo" className="h-8 md:h-10 w-auto object-contain" />
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
            
          </button>
          {/* <Switch checked={isDarkMode} onChange={toggleDarkMode} /> */}

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
            className="md:hidden bg-primary border-t border-white/10 overflow-hidden"
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
                <User size={20} />
                Profile
              </button>
              <div className="flex items-center justify-between">
                <span className="text-lg font-medium">Mode</span>
                <Switch checked={isDarkMode} onChange={toggleDarkMode} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="bg-primary pt-16 pb-8 border-t border-gray-200">
      <div className="container-custom grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="mb-4">
            <img src="/LOGO.png" alt="Locasiyo Logo" className="h-8 md:h-10 w-auto object-contain" />
          </div>
          <p className="text-white/80 text-sm leading-relaxed">
            Rwanda's leading healthcare resource network. Dedicated to
            transparency and accessibility in medical care.
          </p>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">Resources</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link to="/facilities" className="hover:text-yellow-400">
                Pharmacy Network
              </Link>
            </li>
            <li>
              <Link to="/emergency" className="hover:text-yellow-400">
                Emergency Centers
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-yellow-400">
                Medical Blog
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">Company</h4>
          <ul className="space-y-2 text-sm text-white/80">
            <li>
              <Link to="#" className="hover:text-yellow-400">
                Contact Us
              </Link>
            </li>
             <li>
              <Link to="/about" className="hover:text-yellow-400">
                About
              </Link>
            </li>
            <li>
              <Link to="#" className="hover:text-yellow-400">
                Terms of Service
              </Link>
            </li>
           
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-white mb-4">Regional</h4>
          <p className="text-sm text-white/80 mb-2">Language: English</p>
        </div>
      </div>

      <div className="container-custom mt-16 pt-2 border-t border-gray-200 text-center text-xs text-white/80">
        <p>© 2026 All rights reserved.</p>
      </div>
    </footer>
  );
}
