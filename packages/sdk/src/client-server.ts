import type { ApiError, ApiResponse, Client, RequestConfig } from "./types";
import { getServerApiUrl } from "./utils/api-url";

class ServerApiClient implements Client {
  private baseURL: string;
  private defaultHeaders: HeadersInit;
  private timeout: number;

  constructor(config?: {
    baseURL?: string;
    timeout?: number;
    headers?: HeadersInit;
  }) {
    this.baseURL = config?.baseURL || getServerApiUrl();
    this.timeout = config?.timeout || 30000;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config?.headers,
    };
  }

  private buildURL(url: string, params?: RequestConfig["params"]): string {
    let base = this.baseURL;
    if (base.endsWith("/api/v1") && url.startsWith("/api/v1")) {
      base = base.replace(/\/api\/v1\/?$/, "");
    }

    const fullURL = url.startsWith("http") ? url : `${base}${url}`;

    if (!params || Object.keys(params).length === 0) {
      return fullURL;
    }

    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined) {
        searchParams.append(key, String(value));
      }
    }

    const separator = fullURL.includes("?") ? "&" : "?";
    return `${fullURL}${separator}${searchParams.toString()}`;
  }

  private async request<T>(
    url: string,
    config: RequestConfig = {},
  ): Promise<ApiResponse<T>> {
    const { params, timeout = this.timeout, ...fetchConfig } = config;

    const fullURL = this.buildURL(url, params);
    const headers: Record<string, string> = {
      ...(this.defaultHeaders as Record<string, string>),
      ...(fetchConfig.headers as Record<string, string>),
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const { credentials: _, ...restFetchConfig } = fetchConfig;

      const response = await fetch(fullURL, {
        ...restFetchConfig,
        headers,
        signal: controller.signal,
        credentials: fetchConfig.credentials ?? "include",
        cache: "no-store",
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `HTTP Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {
          // not JSON
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
          throw { message: "Request timeout", code: "TIMEOUT" } as ApiError;
        }
        throw { message: error.message } as ApiError;
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

/**
 * Create a server-side API client.
 * Pass cookies and auth headers via options factory `headers` param.
 *
 * @example
 * ```ts
 * const client = createServerClient();
 * await queryClient.prefetchQuery({
 *   ...getUserProfileOptions({
 *     client,
 *     headers: { Cookie: cookieStore.toString(), Authorization: `Bearer ${token}` },
 *   }),
 * });
 * ```
 */
export function createServerClient(config?: {
  baseURL?: string;
  timeout?: number;
  headers?: HeadersInit;
}): Client {
  return new ServerApiClient(config);
}

export const serverApi = new ServerApiClient();
