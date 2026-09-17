const API_BASE_URL = "http://localhost:3333/api";

interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

class ApiClient {
  private baseUrl: string;
  private token: string | null;

  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          ...data,
        };
      }

      return data;
    } catch (error) {
      if (error && typeof error === "object" && "status" in error) {
        throw error;
      }

      throw {
        success: false,
        message: "Server connection error",
      };
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  // Auth endpoints
  async register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async login(data: {
    email: string;
    password: string;
    remember?: boolean;
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });

    if (response.success && response.data?.token) {
      this.setToken(response.data.token);
    }

    return response;
  }

  async logout(): Promise<ApiResponse> {
    const response = await this.request("/auth/logout", {
      method: "POST",
    });

    this.setToken(null);
    return response;
  }

  async forgotPassword(data: {
    email: string;
  }): Promise<ApiResponse> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: {
    code: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse> {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return this.request<{ user: User }>("/auth/me");
  }

  // Activity log
  async logActivity(data: { action: string; category: string; detail?: string; metadata?: unknown }): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>("/activity", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getActivity(params?: { page?: number; limit?: number; category?: string }): Promise<ApiResponse<{ logs: Array<{ id: string; action: string; category: string; detail: string | null; metadata: unknown; createdAt: string }>; pagination: { page: number; limit: number; total: number; pages: number } }>> {
    const query = new URLSearchParams();
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));
    if (params?.category) query.set("category", params.category);
    const qs = query.toString();
    return this.request(`/activity${qs ? `?${qs}` : ""}`);
  }

  async getActivityStats(): Promise<ApiResponse<{ total: number; byCategory: Array<{ category: string; count: number }>; recent: Array<{ action: string; category: string; createdAt: string }> }>> {
    return this.request("/activity/stats");
  }

  // Telemetry
  async logTelemetry(data: { eventType: string; eventData?: unknown; appVersion?: string; platform?: string }): Promise<ApiResponse<{ id: string }>> {
    return this.request<{ id: string }>("/telemetry", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logTelemetryBatch(events: Array<{ eventType: string; eventData?: unknown; appVersion?: string; platform?: string }>): Promise<ApiResponse<{ count: number }>> {
    return this.request<{ count: number }>("/telemetry/batch", {
      method: "POST",
      body: JSON.stringify({ events }),
    });
  }

  async getTelemetryStats(): Promise<ApiResponse<{ total: number; last24h: number; byType: Array<{ eventType: string; count: number }> }>> {
    return this.request("/telemetry/stats");
  }
}

export const api = new ApiClient();
export type { User, AuthResponse, ApiResponse };