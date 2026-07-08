export interface Facility {
  id: number;
  admin?: string; // admin email
  company_name: string;
  company_description: string;
  company_address: string;
  contact: string;
  email?: string;
  website?: string;
  latitude?: string;
  longitude?: string;
  is_verified?: boolean;
  is_opened?: boolean;
  company_categories?: number | null; // category id
  location?: number | null; // location id
  insurances?: number[];
}

export interface Service {
  id: number;
  name: string;
  description: string;
  price: string; // decimal string
  service_hours: string;
  requirements: string;
  is_available: boolean;
  facility?: number;
  category?: number | null;
  insurances?: number[];
}

export interface ServiceCategory {
  id: number;
  name: string;
}

export interface FacilityCategory {
  id: number;
  category_name: string;
}

export interface LocationItem {
  id: number;
  location_name: string;
}

export interface InsuranceItem {
  id: number;
  insurance_name: string;
}

export interface Booking {
  id: number;
  patient_name: string;
  service: number;
  service_name: string;
  facility_name: string;
  date_time: string;
  phone: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  notes: string;
  created_at: string;
  updated_at: string;
}

// Utility to get auth headers dynamically
function getAuthHeaders(contentType: boolean = true): HeadersInit {
  const token = localStorage.getItem("admin_token");
  const headers: Record<string, string> = {};
  if (contentType) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }
  return headers;
}

export const apiService = {
  // --- Services CRUD ---
  async getServices(): Promise<Service[]> {
    const res = await fetch("/api/services/", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch services");
    return res.json();
  },

  async createService(data: Partial<Service>): Promise<Service> {
    const res = await fetch("/api/services/", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err ? Object.values(err).flat().join(" ") : "Failed to create service");
    }
    return res.json();
  },

  async updateService(id: number, data: Partial<Service>): Promise<Service> {
    const res = await fetch(`/api/services/${id}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err ? Object.values(err).flat().join(" ") : "Failed to update service");
    }
    return res.json();
  },

  async deleteService(id: number): Promise<void> {
    const res = await fetch(`/api/services/${id}/`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete service");
  },

  // --- Bookings CRUD ---
  async getBookings(): Promise<Booking[]> {
    const res = await fetch("/api/bookings/", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch bookings");
    return res.json();
  },

  async updateBookingStatus(id: number, status: Booking["status"]): Promise<Booking> {
    const res = await fetch(`/api/bookings/${id}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error("Failed to update booking status");
    return res.json();
  },

  // --- Facility Profile & Onboarding CRUD ---
  async getFacility(id: number): Promise<Facility> {
    const res = await fetch(`/api/facilities/${id}/`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch facility details");
    return res.json();
  },

  // Used to find if the admin already has registered their OneToOne facility
  async getMyFacilityList(): Promise<Facility[]> {
    const res = await fetch("/api/facilities/", {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch facilities list");
    return res.json();
  },

  async createFacility(data: Partial<Facility>): Promise<Facility> {
    const res = await fetch("/api/facilities/", {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err ? Object.values(err).flat().join(" ") : "Failed to register facility");
    }
    return res.json();
  },

  async updateFacility(id: number, data: Partial<Facility>): Promise<Facility> {
    const res = await fetch(`/api/facilities/${id}/`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => null);
      throw new Error(err ? Object.values(err).flat().join(" ") : "Failed to update facility");
    }
    return res.json();
  },

  // --- Dropdowns & Global Metadata Lists ---
  async getServiceCategories(): Promise<ServiceCategory[]> {
    const res = await fetch("/api/servicecategories/");
    if (!res.ok) throw new Error("Failed to fetch service categories");
    return res.json();
  },

  async getFacilityCategories(): Promise<FacilityCategory[]> {
    const res = await fetch("/api/categories/");
    if (!res.ok) throw new Error("Failed to fetch facility categories");
    return res.json();
  },

  async getLocations(): Promise<LocationItem[]> {
    const res = await fetch("/api/locations/");
    if (!res.ok) throw new Error("Failed to fetch locations");
    return res.json();
  },

  async getInsurances(): Promise<InsuranceItem[]> {
    const res = await fetch("/api/insurances/");
    if (!res.ok) throw new Error("Failed to fetch insurances");
    return res.json();
  },
};

export default apiService;
