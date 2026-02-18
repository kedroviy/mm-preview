import type { ApiError, ApiResponse, RequestConfig } from "./types";
import { getAccessToken } from "./utils/cookies";

class ApiClient {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private timeout: number;

  constructor(config?: {
    baseURL?: string;
    timeout?: number;
    headers?: HeadersInit;
  }) {
    this.baseURL =
      config?.baseURL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://localhost:4000"; // Fallback для локальной разработки
    this.timeout = config?.timeout || 30000;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config?.headers,
    };
  }

  private buildURL(url: string, params?: RequestConfig["params"]): string {
    const fullURL = url.startsWith("http") ? url : `${this.baseURL}${url}`;

    if (!params || Object.keys(params).length === 0) {
      return fullURL;
    }

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    });

    const separator = fullURL.includes("?") ? "&" : "?";
    return `${fullURL}${separator}${searchParams.toString()}`;
  }

  private async request<T>(
    url: string,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const { params, timeout = this.timeout, ...fetchConfig } = config;

    const fullURL = this.buildURL(url, params);
    const token = getAccessToken();
    const headers: Record<string, string> = {
      ...(this.defaultHeaders as Record<string, string>),
      ...(fetchConfig.headers as Record<string, string>),
    };

    // Добавляем токен в заголовок Authorization, если он есть
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Удаляем credentials из fetchConfig, чтобы гарантировать использование "include"
      const { credentials: _, ...restFetchConfig } = fetchConfig;
      
      const response = await fetch(fullURL, {
        ...restFetchConfig,
        headers,
        signal: controller.signal,
        credentials: "include", // Включаем отправку кук для CORS
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // If response is not JSON, use default error message
        }

        const error: ApiError = {
          message: errorMessage,
          status: response.status,
        };

        throw error;
      }

      const data = await response.json().catch(() => ({}));

      return {
        data: data as T,
        status: response.status,
        statusText: response.statusText,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw {
            message: "Request timeout",
            code: "TIMEOUT",
          } as ApiError;
        }

        throw {
          message: error.message,
        } as ApiError;
      }

      throw error;
    }
  }

  async get<T>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "GET" });
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(
    url: string,
    data?: unknown,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(
    url: string,
    config?: RequestConfig,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(url, { ...config, method: "DELETE" });
  }
}

export function createApiClient(config?: {
  baseURL?: string;
  timeout?: number;
  headers?: HeadersInit;
}) {
  return new ApiClient(config);
}

export const api = createApiClient();
