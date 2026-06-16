import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  MapPin,
  Calendar,
  Clock,
  ShieldCheck,
  ChevronLeft,
  Phone,
  MessageSquare,
  Share2,
  Heart,
  CheckCircle2,
  AlertCircle,
  Activity,
  ArrowRight,
  Building2,
  Star,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { api } from "../services/api";
import DistanceBadge, { useGeolocation } from "../components/DistanceBadge";
import { getGoogleMapsUrl } from "../lib/locationUtils";
import BookingModal from "../components/BookingModal";
import { useOstrabacus } from "../../ai/OstrabacusContext";

type InsuranceItem = {
  name: string;
  logo: string;
};

type ServiceFacility = {
  name: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  address: string | null;
  rating: number;
  reviews: number;
  image: string;
  phone: string;
};

type ServiceData = {
  id: string | number;
  title: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  facility: ServiceFacility;
  insuranceAccepted: InsuranceItem[];
  requirements: string[];
  highlights: string[];
};

export default function ServiceDetail() {
  const { id } = useParams();
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { latitude: userLat, longitude: userLng } = useGeolocation();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { shouldOpenModal, setShouldOpenModal, prefilledBookingData, setPageContext } = useOstrabacus();

  // Ostrabacus AI Integration: Automatically trigger booking modal open if prefill request is pending for this facility
  useEffect(() => {
    if (shouldOpenModal && serviceData && prefilledBookingData) {
      const matchesFacility = 
        serviceData.facility.name.toLowerCase().includes(prefilledBookingData.facilityName.toLowerCase()) ||
        prefilledBookingData.facilityName.toLowerCase().includes(serviceData.facility.name.toLowerCase());
      
      if (matchesFacility) {
        setIsBookingModalOpen(true);
        setShouldOpenModal(false); // Reset so it doesn't reopen unexpectedly
      }
    }
  }, [shouldOpenModal, serviceData, prefilledBookingData, setShouldOpenModal]);

  useEffect(() => {
    if (serviceData) {
      setPageContext({
        type: "service",
        data: {
          title: serviceData.title,
          category: serviceData.category,
          price: serviceData.price,
          duration: serviceData.duration,
          facilityName: serviceData.facility.name,
          requirements: serviceData.requirements,
          description: serviceData.description,
        }
      });
    }
    return () => {
      setPageContext(null);
    };
  }, [serviceData, setPageContext]);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const [
          service,
          facilitiesData,
          locationsData,
          categoriesData,
          insurancesData,
        ] = await Promise.all([
          api.getService(id),
          api.getFacilities(),
          api.getLocations(),
          api.getCategories(),
          api.getInsurances(),
        ]);

        const facility = facilitiesData.find(
          (f: any) => f.id === service.facility,
        );

        let locationName = "Unknown Location";
        if (facility) {
          const loc = locationsData.find(
            (l: any) => l.id === facility.location,
          );
          locationName = loc
            ? loc.location_name
            : facility.company_address || "Unknown Location";
        }

        let categoryName = "General";
        if (facility && facility.company_categories) {
          const cat = categoriesData.find(
            (c: any) => c.id === facility.company_categories,
          );
          categoryName = cat ? cat.category_name : "General";
        }

        const acceptedInsurances = insurancesData
          .filter(
            (ins: any) =>
              service.insurances && service.insurances.includes(ins.id),
          )
          .map((ins: any) => ({
            name: ins.insurance_name,
            logo: "https://api.iconify.design/material-symbols:account-balance.svg",
          }));

        const mappedData = {
          id: service.id,
          title: service.name,
          category: categoryName,
          description: service.description || "No description provided.",
          price: service.price
            ? `${Number(service.price).toLocaleString()} RWF`
            : "Contact for price",
          duration: service.service_hours || "Contact for duration",
          facility: {
            name: facility ? facility.company_name : "Unknown Facility",
            location: locationName,
            latitude: facility ? facility.latitude : null,
            longitude: facility ? facility.longitude : null,
            address: facility ? facility.company_address : null,
            rating: 4.8,
            reviews: 156,
            image:
              facility && facility.company_logo
                ? facility.company_logo
                : "https://picsum.photos/seed/kigali-medical/800/600",
            phone: facility ? facility.contact : "N/A",
          },
          insuranceAccepted:
            acceptedInsurances.length > 0
              ? acceptedInsurances
              : [
                  {
                    name: "Contact Facility",
                    logo: "https://api.iconify.design/material-symbols:account-balance.svg",
                  },
                ],
          requirements: service.requirements
            ? service.requirements.split("\n").filter(Boolean)
            : [
                "Original National ID or Passport",
                "Insurance card (if applicable)",
              ],
          highlights: [
            "Board-certified Professionals",
            "Modern equipment",
            "Quality service",
          ],
        };
        setServiceData(mappedData);
      } catch (err) {
        console.error("Failed to fetch service details:", err);
        setError("Failed to load service details.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchServiceDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !serviceData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
          <p className="text-gray-500">{error || "Service not found."}</p>
          <Link
            to="/services"
            className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-xl font-bold hover:bg-opacity-90 transition-all"
          >
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  const SERVICE_DATA = serviceData;

  return (
    <div className="pt-6 pb-24 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 flex items-center space-x-2 text-sm">
          <Link to="/" className="text-gray-500 hover:text-primary">
            Home
          </Link>
          <span className="text-gray-300">/</span>
          <Link to="/services" className="text-gray-500 hover:text-primary">
            Medical Services
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-primary font-bold">{SERVICE_DATA.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column: Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Header Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                <div>
                  <span className="px-3 py-1 bg-secondary text-primary text-[10px] font-bold rounded uppercase tracking-wider mb-3 inline-block">
                    {SERVICE_DATA.category}
                  </span>
                  <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
                    {SERVICE_DATA.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-primary">
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-primary" />
                      <span>{SERVICE_DATA.duration}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-primary" />
                        <span>{SERVICE_DATA.facility.location}</span>
                      </div>
                      <DistanceBadge
                        latitude={SERVICE_DATA.facility.latitude}
                        longitude={SERVICE_DATA.facility.longitude}
                        className="text-xs px-2 py-1"
                      />
                    </div>
                    {/* <div className="flex items-center">
                      <ShieldCheck size={16} className="text-secondary mr-2" />
                      Accredited Care
                    </div> */}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button className="p-3 bg-gray-50 rounded-full text-blue-400 hover:text-primary hover:bg-gray-100 transition-all shadow-sm">
                    <Share2 size={20} />
                  </button>
                  <button className="p-3 bg-gray-50 rounded-full text-blue-400 hover:text-red-500 hover:bg-red-50 transition-all shadow-sm">
                    <Heart size={20} />
                  </button>
                </div>
              </div>

              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                {SERVICE_DATA.description}
              </p>

              {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {SERVICE_DATA.highlights.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-secondary/10 rounded-full flex items-center justify-center mt-0.5">
                      <CheckCircle2 size={14} className="text-secondary" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div> */}
            </motion.div>

            {/* Insurance Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100"
            >
              <h2 className="text-2xl font-bold text-primary mb-8 flex items-center">
                <ShieldCheck className="text-primary mr-3" />
                Insurance Partners Accepted
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {SERVICE_DATA.insuranceAccepted.map(
                  (insurance: InsuranceItem, idx: number) => (
                    <div
                      key={idx}
                      className="flex flex-col items-center p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-secondary transition-all group"
                    >
                      <div className="w-8 h-8 mb-3 bg-white rounded-lg flex items-center justify-center border border-gray-50 overflow-hidden group-hover:scale-110 transition-transform">
                        {/* Using a placeholder icon/emoji since we don't have actual logos */}
                        <ShieldCheck className="text-primary/80" size={24} />
                      </div>
                      <span className="text-xs font-bold text-gray-700 text-center">
                        {insurance.name}
                      </span>
                    </div>
                  ),
                )}
              </div>
              <div className="mt-8 p-4 bg-blue-50 rounded-2xl flex items-start space-x-3 border border-blue-100">
                <AlertCircle
                  className="text-blue-500 shrink-0 mt-0.5"
                  size={20}
                />
                <p className="text-sm text-blue-700">
                  Please bring your active insurance membership card. Coverage
                  depends on your specific policy terms. Some extras may require
                  out-of-pocket payment.
                </p>
              </div>
            </motion.div>

            {/* Requirements & Preparation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-primary rounded-3xl p-8 text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <h2 className="text-2xl font-bold mb-6">
                  Patient Requirements
                </h2>
                <div className="space-y-4">
                  {SERVICE_DATA.requirements.map((req: string, idx: number) => (
                    <div key={idx} className="flex items-center space-x-4">
                      <div className="w-2 h-2 rounded-full bg-secondary"></div>
                      <p className="text-white/90">{req}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            </motion.div>
          </div>

          {/* Right Column: Actions & Info */}
          <div className="space-y-8">
            {/* Booking Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 sticky top-28"
            >
              <div className="text-center mb-8">
                <span className="text-gray-500 text-sm block mb-1">
                  Standard Price
                </span>
                <div className="text-4xl font-bold text-primary">
                  {SERVICE_DATA.price}
                  {/* {console.log(SERVICE_DATA.price)} */}
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-3 bg-secondary/60 rounded-xl">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar size={18} className="mr-3 text-primary/80" />
                    Available Day
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    Mon-Sun
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-secondary/60 rounded-xl">
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock size={18} className="mr-3 text-primary/80" />
                    Avg. Wait Time
                  </div>
                  <span className="text-sm font-bold text-primary/80">
                    20 Mins
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsBookingModalOpen(true)}
                className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:opacity-90 transition-all mb-4 flex items-center justify-center"
              >
                <Calendar size={20} className="mr-2" />
                Book Appointment
              </button>

              <button className="w-full bg-blue-500 border-2 border-gray-100 text-white py-4 rounded-2xl font-bold hover:bg-gray-50 hover:text-primary transition-all flex items-center justify-center">
                <Phone size={20} className="mr-2" />
                Call Facility
              </button>

              <div className="mt-8 pt-8 border-t border-gray-100">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center">
                  <Building2 size={18} className="text-primary/80 mr-2" />
                  Facility Information
                </h4>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-sm">
                    <img
                      src={SERVICE_DATA.facility.image}
                      alt={SERVICE_DATA.facility.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-gray-900">
                      {SERVICE_DATA.facility.name}
                    </h5>
                    <div className="flex items-center text-[10px] text-gray-500 mt-1">
                      <Star
                        size={10}
                        fill="currentColor"
                        className="text-yellow-500 mr-1"
                      />
                      {SERVICE_DATA.facility.rating} (
                      {SERVICE_DATA.facility.reviews} reviews)
                    </div>
                  </div>
                </div>
                <div className="flex items-center text-xs text-black mb-6">
                  <MapPin size={14} className="mr-2 text-primary/80" />
                  {SERVICE_DATA.facility.location}
                </div>

                <a
                  href={getGoogleMapsUrl(
                    SERVICE_DATA.facility.latitude,
                    SERVICE_DATA.facility.longitude,
                    SERVICE_DATA.facility.address,
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
            </motion.div>

            {/* Assistance Card */}
            <div className="bg-stats-blue rounded-3xl p-8 text-white">
              <h3 className="font-bold text-lg mb-4">Need Help?</h3>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                Our support team can help you find specialized services or
                manage insurance claims.
              </p>
              <button className="w-full bg-white text-primary py-3 rounded-xl font-bold text-sm flex items-center justify-center shadow-lg">
                <MessageSquare size={16} className="mr-2" />
                Chat with Support
              </button>
            </div>
          </div>
        </div>
      </div>
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        serviceName={SERVICE_DATA.title}
        serviceId={SERVICE_DATA.id}
        requirements={SERVICE_DATA.requirements}
      />
    </div>
  );
}
