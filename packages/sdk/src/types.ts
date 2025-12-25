export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
}

export interface RequestConfig extends RequestInit {
  baseURL?: string;
  params?: Record<string, string | number | boolean | null | undefined>;
  timeout?: number;
}

