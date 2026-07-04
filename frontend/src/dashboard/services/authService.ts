const BASE_URL = "/api/auth";

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone_number: string;
  role: "superAdmin" | "clientUser" | "adminUser";
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Helper to format API error messages user-friendly
function parseError(errorData: any): string {
  if (!errorData) return "An unexpected error occurred. Please try again.";
  
  if (typeof errorData === "string") {
    return errorData;
  }
  
  if (errorData.detail) {
    return errorData.detail;
  }
  
  if (errorData.non_field_errors) {
    return Array.isArray(errorData.non_field_errors)
      ? errorData.non_field_errors.join(", ")
      : String(errorData.non_field_errors);
  }
  
  if (typeof errorData === "object") {
    return Object.entries(errorData)
      .map(([field, msgs]) => {
        // Format field name, e.g. "full_name" -> "Full Name"
        const fieldName = field
          .replace(/_/g, " ")
          .replace(/\b\w/g, (char) => char.toUpperCase());
        const messageStr = Array.isArray(msgs) ? msgs.join(", ") : String(msgs);
        return `${fieldName}: ${messageStr}`;
      })
      .join(" | ");
  }
  
  return "An unexpected error occurred. Please try again.";
}

export const authService = {
  async register(data: Record<string, any>): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(parseError(errorData));
    }

    return response.json();
  },

  async login(data: Record<string, any>): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(parseError(errorData));
    }

    return response.json();
  },

  async getProfile(token: string): Promise<User> {
    const response = await fetch(`${BASE_URL}/profile/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Profile validation failed: ${response.status}`);
    }

    return response.json();
  },
};
export default authService;
