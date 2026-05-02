const BASE_URL = "/api";

/**
 * Helper function for native fetch with async/await
 */
async function fetchApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(
        errorData?.detail || `HTTP error! status: ${response.status}`,
      );
    }

    return await response.json();
  } catch (error) {
    console.error(`API Fetch Error [${endpoint}]:`, error);
    throw error;
  }
}

export const api = {
  // Facilities
  getFacilities: async () => {
    return await fetchApi("/facilities/");
  },
  getFacility: async (id) => {
    return await fetchApi(`/facilities/${id}/`);
  },

  // Services
  getServices: async () => {
    return await fetchApi("/services/");
  },
  getService: async (id) => {
    return await fetchApi(`/services/${id}/`);
  },

  // Categories
  getCategories: async () => {
    return await fetchApi("/categories/");
  },

  // Locations
  getLocations: async () => {
    return await fetchApi("/locations/");
  },

  // Insurances
  getInsurances: async () => {
    return await fetchApi("/insurances/");
  },

  // Languages
  getLanguages: async () => {
    return await fetchApi("/languages/");
  },
};
