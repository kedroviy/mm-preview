import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { getAccessToken } from "./runtime/auth-tokens";
import { getPublicApiBaseUrl } from "./runtime/public-api-url";

export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;

/** Anonymous auth flows — do not attach Bearer (no session yet). */
const PUBLIC_AUTH_PATHS = new Set([
  "/auth/register",
  "/auth/login",
  "/auth/verify-id-token",
  "/auth/send-code-to-email",
  "/auth/verify-code",
  "/auth/change-password",
]);

function normalizedRequestPath(url: string | undefined): string {
  if (!url) return "";
  const withoutQuery = url.split("?")[0] ?? "";
  if (withoutQuery.startsWith("http")) {
    try {
      return new URL(withoutQuery).pathname;
    } catch {
      return withoutQuery;
    }
  }
  return withoutQuery;
}

export const axiosInstance = axios.create({
  baseURL: getPublicApiBaseUrl(),
});

axiosInstance.interceptors.request.use((config) => {
  const path = normalizedRequestPath(config.url);
  if (!path || PUBLIC_AUTH_PATHS.has(path)) {
    return config;
  }

  const token = getAccessToken();
  if (!token) {
    return config;
  }

  config.headers = config.headers ?? {};
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/**
 * Orval `react-query` + `axios` mutator: returns response body (standard Orval + axios).
 */
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
	return axiosInstance
		.request(config)
		.then((response: AxiosResponse) => response.data as T);
};
