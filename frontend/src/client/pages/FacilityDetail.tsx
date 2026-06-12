import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Calendar,
  Pill,
  CheckCircle,
  Map as MapIcon,
  ChevronDown,
  Share2,
  Info,
  Search,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { motion } from "motion/react";
import { api } from "@/src/client/services/api";
import { cn } from "@/src/client/lib/utils";
import { useGeolocation } from "@/src/client/hooks/useGeolocation";
import {
  calculateDistance,
  getGoogleMapsUrl,
} from "@/src/client/lib/locationUtils";

type Facility = {
  id: string;
  name: string;
  type: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  rating: number;
  reviews: number;
  status: string;
  hours: string;
  description?: string;
  image: string;
  services: string[];
};

type ServiceItem = {
  id: string;
  name: string;
  category: string;
  price: string;
};

type Category = {
  id: string | number;
  category_name: string;
};

type Location = {
  id: string | number;
  location_name: string;
};

type FacilityServiceApi = {
  id: string | number;
  facility: string | number;
  name: string;
  price?: string;
};

const mockReviews = [
  {
    id: 1,
    user: "Mutoni K.",
    date: "2 days ago",
    rating: 5,
    comment:
      "The pharmacist was very helpful and explained exactly how to take my medication. They had everything in stock!",
  },
  {
    id: 2,
    user: "Jean N.",
    date: "1 week ago",
    rating: 5,
    comment:
      "Clean facility and very organized. Appointment booking was seamless through the app.",
  },
];

export function FacilityDetail() {
  const { id } = useParams();
  const [facility, setFacility] = useState<Facility | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { latitude: userLat, longitude: userLng } = useGeolocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facilityData, allServices, categoriesData, locationsData] =
          await Promise.all([
            api.getFacility(id),
            api.getServices(),
            api.getCategories(),
            api.getLocations(),
          ]);

        const category = categoriesData.find(
          (c: Category) => c.id === facilityData.company_categories,
        );
        const location = locationsData.find(
          (l: Location) => l.id === facilityData.location,
        );

        setFacility({
          id: facilityData.id.toString(),
          name: facilityData.company_name,
          type: category ? category.category_name : "Facility", // Map from API
          location: location
            ? location.location_name
            : facilityData.company_address || "Kigali",
          latitude: facilityData.latitude,
          longitude: facilityData.longitude,
          address: facilityData.company_address,
          rating: 4.5, // Static for now
          reviews: 120, // Static for now
          status: "Open Now", // Static for now
          hours: facilityData.hours || "24/7", // Map from API
          // description: facilityData.company_description,
          image:
            facilityData.company_logo ||
            "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
          services: ["Digital Prescriptions", "Home Delivery", "BP Screening"], // Static mock services array for bottom section
        });

        const facilityServices = allServices.filter(
          (s: FacilityServiceApi) => s.facility.toString() === id,
        );

        setServices(
          facilityServices.slice(0, 3).map((s: FacilityServiceApi) => ({
            id: s.id.toString(),
            name: s.name,
            category: "Service",
            price: s.price || "Contact for Price",
          })),
        );
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchData();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="bg-surface min-h-screen flex items-center justify-center">
        <p className="text-xl text-text-muted">Facility not found</p>
      </div>
    );
  }

  return (
    <div className="bg-surface min-h-screen pb-24">
      <section className="relative h-[250px] overflow-hidden">
        <img
          src={facility.image}
          alt={facility.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-6 left-6 bg-green-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
          Open Now
        </div>
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent"></div>
        {/* <div className="absolute top-8 left-8">
          <span className="px-3 py-1 bg-secondary text-white text-[10px] font-bold rounded uppercase tracking-wider">
            Open Now
          </span>
        </div> */}
        <div className="absolute bottom-12 left-0 right-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center text-yellow-300 space-x-2 font-bold text-sm mb-2">
              <ShieldCheck size={18} />
              <span>Kizazi Accredited Facility</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {facility.name}
            </h1>
            <p className="text-xl text-white/80 max-w-2xl">
              {facility.description}
            </p>
          </div>
        </div>
      </section>
      {/* Info Bar */}
      <div className="bg-black/5 dark:bg-white/5 border-b border-black/5 dark:border-white/5 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap items-center gap-8 md:gap-12">
            <div className="flex items-center space-x-2 ">
              <div className="flex items-center text-yellow-500 font-bold">
                <Star size={18} fill="currentColor" className="mr-1" />
              </div>
              <span className="text-primary">{`${facility.rating} (${facility.reviews} Reviews)`}</span>
            </div>
            <div className="flex items-center space-x-2 text-primary ">
              <MapPin size={18} className="text-primary" />
              <span className="text-sm">{facility.location.split(",")[0]}</span>
            </div>
            <div className="flex items-center space-x-2 text-primary">
              <Clock size={18} className="text-primary" />
              <span className="text-sm">{facility.hours}</span>
            </div>
            <div className="ml-auto flex space-x-4 w-full md:w-auto mt-4 md:mt-0">
              <button className="flex-1 md:flex-none bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center hover:opacity-90 transition-all">
                <Calendar size={18} className="mr-2" /> Book Appointment
              </button>
              <button className="flex-1 md:flex-none bg-blue-500 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center hover:opacity-90 transition-all">
                <Phone size={18} className="mr-2" /> Contact Facility
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Hero Header */}

      <div className="container-custom mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Inventory */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold text-primary">
                  Available Services
                </h2>
                <div className="relative border border-gray-400 rounded-xl">
                  <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Search services..."
                    className="bg-surface border border-black/5 dark:border-white/5 rounded-xl pl-12 pr-6 py-3 text-sm outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {services.map((med) => (
                  <div
                    key={med.id}
                    className="bg-surface p-3 rounded-3xl border border-black/5 dark:border-white/5 flex items-center justify-between group hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                        <Stethoscope className="text-primary" size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-primary">{med.name}</h4>
                        <p className="text-xs text-text-muted">
                          {med.category}
                        </p>
                        <div className="flex items-center gap-1 mt-1">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          <span className="text-[10px] font-bold text-green-600 uppercase tracking-tighter">
                            Available
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-display font-bold text-primary mb-2">
                        {isNaN(parseFloat(med.price))
                          ? "Contact for price"
                          : `${parseFloat(med.price).toLocaleString()} RWF`}
                      </p>
                      <Link
                        to={`/services/${med.id}`}
                        className="inline-block bg-secondary text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-primary hover:text-white transition-all"
                      >
                        Read more
                      </Link>
                    </div>
                  </div>
                ))}
                {services.length === 0 && (
                  <p className="text-text-muted">
                    No specific services/inventory listed.
                  </p>
                )}
              </div>
            </section>

            {/* Reviews */}
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-display font-bold text-primary">
                  Patient Experience
                </h2>
                <button className="px-6 py-2 border-2 border-primary text-primary font-bold rounded-xl text-sm hover:bg-primary hover:text-white transition-all">
                  Write a Review
                </button>
              </div>

              <div className="space-y-4">
                {mockReviews.map((review) => (
                  <div
                    key={review.id}
                    className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#1B4B36]/10 text-[#1B4B36] rounded-full flex items-center justify-center font-bold">
                          {review.user.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {review.user}
                          </p>
                          <p className="text-sm text-gray-500">{review.date}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? "fill-[#F59E0B] text-[#F59E0B]" : "text-gray-200 fill-gray-200"}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 italic">"{review.comment}"</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Map Card */}
            <div className="bg-surface p-8 rounded-[40px] shadow-xl">
              <h3 className="font-bold text-primary mb-6 flex justify-between items-center">
                <span>Location & Access</span>
                {facility.latitude && facility.longitude && (
                  <span className="text-xs bg-secondary text-primary px-2.5 py-1 rounded-full font-bold">
                    {calculateDistance(
                      userLat,
                      userLng,
                      facility.latitude,
                      facility.longitude,
                    )}
                  </span>
                )}
              </h3>
              <div className="relative rounded-3xl overflow-hidden h-64 bg-secondary/30 mb-6 group cursor-pointer">
                <a
                  href={getGoogleMapsUrl(
                    facility.latitude,
                    facility.longitude,
                    facility.address,
                    userLat,
                    userLng,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full h-full"
                >
                  {/* Mock Map */}
                  <img
                    src="/satellite_view.png"
                    alt="Map"
                    className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg animate-bounce">
                      <MapPin size={20} />
                    </div>
                  </div>
                </a>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">5 min walk</p>
                    <p className="text-xs text-text-muted">
                      From Central Bus Station
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-lg flex items-center justify-center shrink-0">
                    <Info size={16} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-primary">
                      Free Parking
                    </p>
                    <p className="text-xs text-text-muted">
                      Available at the back entrance
                    </p>
                  </div>
                </div>

                <a
                  href={getGoogleMapsUrl(
                    facility.latitude,
                    facility.longitude,
                    facility.address,
                    userLat,
                    userLng,
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-primary text-white py-3 rounded-xl font-bold text-sm hover:bg-secondary hover:text-primary transition-all flex items-center justify-center"
                >
                  <MapPin size={16} className="mr-2" />
                  View Map & Directions
                </a>
              </div>
            </div>

            {/* Services Card */}
            <div className="bg-primary p-8 rounded-[40px] text-white shadow-xl">
              <h3 className="font-bold mb-6">Available Services</h3>
              <ul className="space-y-4">
                {facility.services.map((service, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 text-sm font-medium"
                  >
                    <CheckCircle size={18} className="text-accent" />
                    {service}
                  </li>
                ))}
                <li className="flex items-center gap-3 text-sm font-medium">
                  <CheckCircle size={18} className="text-accent" />
                  Insurance Claims Help
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions (Mobile Only) */}
      <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-black/5 dark:border-white/5 p-4 md:hidden z-40 flex gap-4">
        <button className="flex-1 btn-primary py-4">Book Now</button>
        <button className="p-4 bg-secondary text-primary rounded-2xl">
          <Share2 size={24} />
        </button>
      </div>
    </div>
  );
}

function InfoItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-black/5 dark:bg-white/5 rounded-xl flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-sm font-bold text-primary">{label}</span>
    </div>
  );
}
