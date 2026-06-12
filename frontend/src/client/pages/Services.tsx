import React, { useState, useEffect, useMemo } from "react";
import SearchSection from "../components/SearchSection";
import ServiceCard, {
  Service as ServiceCardType,
} from "../components/ServiceCard";
import { api } from "@/src/client/services/api";

interface ServiceApi {
  id: number;
  name: string;
  facility: number;
  image?: string;
  description?: string;
  category?: number;
  [key: string]: any;
}

interface FacilityApi {
  id: number;
  company_name: string;
  location: number;
  company_address?: string;
  company_categories?: number;
  [key: string]: any;
}

interface LocationApi {
  id: number;
  location_name: string;
  [key: string]: any;
}

interface CategoryApi {
  id: number;
  category_name: string;
  [key: string]: any;
}

interface ServiceCategoryApi {
  id: number;
  name: string;
  [key: string]: any;
}

interface ServiceWithFilters extends ServiceCardType {
  locationId?: number;
  serviceCategoryId?: number;
  facilityCategoryId?: number;
  description?: string;
}

export function Services() {
  const [rawServices, setRawServices] = useState<ServiceWithFilters[]>([]);
  const [locations, setLocations] = useState<LocationApi[]>([]);
  const [serviceCategories, setServiceCategories] = useState<ServiceCategoryApi[]>([]);
  const [facilityCategories, setFacilityCategories] = useState<CategoryApi[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [selectedLocation, setSelectedLocation] = useState<string | number>("all");
  const [selectedServiceCategory, setSelectedServiceCategory] = useState<string | number>("all");
  const [selectedFacilityCategory, setSelectedFacilityCategory] = useState<string | number>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    const fetchServicesData = async () => {
      try {
        const [servicesData, facilitiesData, locationsData, categoriesData, serviceCategoriesData] = (await Promise.all([
          api.getServices(),
          api.getFacilities(),
          api.getLocations(),
          api.getCategories(),
          api.getServiceCategories(),
        ])) as [ServiceApi[], FacilityApi[], LocationApi[], CategoryApi[], ServiceCategoryApi[]];

        setLocations(locationsData);
        setServiceCategories(serviceCategoriesData);
        // Exclude Pharmacy from facility types
        setFacilityCategories(
          categoriesData.filter(
            (c) => c.category_name.toLowerCase() !== "pharmacy"
          )
        );

        const mappedData = servicesData.map((item: ServiceApi) => {
          const facility = facilitiesData.find((f) => f.id === item.facility);
          let locationName = "Kigali";

          if (facility) {
            const loc = locationsData.find((l) => l.id === facility.location);
            locationName = loc
              ? loc.location_name
              : facility.company_address || "Kigali";
          }

          return {
            id: item.id.toString(),
            image:
              item.image ||
              "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800",
            title: item.name,
            clinic: facility ? facility.company_name : "Facility", // Maps to 'clinic' for ServiceCard
            location: locationName,
            rating: 4.5,
            
            // Filtering attributes
            locationId: facility ? facility.location : undefined,
            serviceCategoryId: item.category,
            facilityCategoryId: facility ? facility.company_categories : undefined,
            description: item.description || "",
          };
        });
        setRawServices(mappedData);
      } catch (error) {
        console.error("Failed to fetch services data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchServicesData();
  }, []);

  const filteredServices = useMemo(() => {
    return rawServices.filter((service) => {
      // Filter by location
      if (
        selectedLocation !== "all" &&
        service.locationId?.toString() !== selectedLocation.toString()
      ) {
        return false;
      }

      // Filter by service category
      if (
        selectedServiceCategory !== "all" &&
        service.serviceCategoryId?.toString() !== selectedServiceCategory.toString()
      ) {
        return false;
      }

      // Filter by facility category
      if (
        selectedFacilityCategory !== "all" &&
        service.facilityCategoryId?.toString() !== selectedFacilityCategory.toString()
      ) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const titleMatch = service.title?.toLowerCase().includes(query);
        const clinicMatch = service.clinic?.toLowerCase().includes(query);
        const descMatch = service.description?.toLowerCase().includes(query);

        if (!titleMatch && !clinicMatch && !descMatch) {
          return false;
        }
      }

      return true;
    });
  }, [
    rawServices,
    selectedLocation,
    selectedServiceCategory,
    selectedFacilityCategory,
    searchQuery,
  ]);

  return (
    <div className="bg-white min-h-screen pb-24">
      {/* Reusable Search Section */}
      <SearchSection
        locations={locations}
        serviceCategories={serviceCategories}
        facilityCategories={facilityCategories}
        selectedLocation={selectedLocation}
        selectedServiceCategory={selectedServiceCategory}
        selectedFacilityCategory={selectedFacilityCategory}
        searchQuery={searchQuery}
        onLocationChange={setSelectedLocation}
        onServiceCategoryChange={setSelectedServiceCategory}
        onFacilityCategoryChange={setSelectedFacilityCategory}
        onSearchQueryChange={setSearchQuery}
      />

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between text-gray-600 mb-8">
          <h2 className="text-2xl font-bold text-[#113321]">
            Available Services
          </h2>
          <p className="text-sm font-medium">
            Showing {filteredServices.length} results
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1B4B36]"></div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              No services found
            </h3>
            <p className="text-gray-500">
              We couldn't find any medical services matching your criteria.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <ServiceCard key={String(service.id)} service={service} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
