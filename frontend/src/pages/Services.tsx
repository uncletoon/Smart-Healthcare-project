import React, { useState, useEffect } from "react";
import SearchSection from "../components/SearchSection";
import ServiceCard, { Service as ServiceCardType } from "../components/ServiceCard";
import { api } from "@/src/services/api";

interface ServiceApi {
  id: number;
  name: string;
  facility: number;
  image?: string;
  [key: string]: any;
}

interface FacilityApi {
  id: number;
  company_name: string;
  location: number;
  company_address?: string;
  [key: string]: any;
}

interface LocationApi {
  id: number;
  location_name: string;
  [key: string]: any;
}

export function Services() {
  const [services, setServices] = useState<ServiceCardType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const [data, facilitiesData, locationsData] = await Promise.all([
          api.getServices(),
          api.getFacilities(),
          api.getLocations()
        ]) as [ServiceApi[], FacilityApi[], LocationApi[]];
        
        const mappedData = data.map((item: ServiceApi) => {
          const facility = facilitiesData.find((f) => f.id === item.facility);
          let locationName = "Kigali";
          
          if (facility) {
            const loc = locationsData.find((l) => l.id === facility.location);
            locationName = loc ? loc.location_name : facility.company_address || "Kigali";
          }
          
          return {
            id: item.id.toString(),
            image: item.image || "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
            title: item.name,
            clinic: facility ? facility.company_name : "Facility", // Maps to 'clinic' for ServiceCard
            location: locationName, 
            rating: 4.5,
          };
        });
        setServices(mappedData);
      } catch (error) {
        console.error("Failed to fetch services:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  return (
    <div className="bg-[#ffffff] min-h-screen pb-24">
      {/* Reusable Search Section */}
      <SearchSection />

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between text-gray-600 mb-8">
          <h2 className="text-2xl font-bold text-[#113321]">
            Available Services
          </h2>
          <p className="text-sm font-medium">
            Showing {services.length} results
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B4B36]"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">No services found</h3>
            <p className="text-gray-500">We couldn't find any medical services matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service) => (
              <ServiceCard key={String(service.id)} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
