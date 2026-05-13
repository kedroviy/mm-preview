/**
 * Base URL for REST calls. Mirrors apps’ `.env.example` (`NEXT_PUBLIC_API_URL`).
 */
export function getPublicApiBaseUrl(): string {
  const raw =
    (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_URL) ||
    "https://movie-api.moviematch.space";
  return raw.replace(/\/$/, "");
}

/** Alias for legacy imports (`user-creation`, docs). */
export function getClientApiUrl(): string {
  return getPublicApiBaseUrl();
}
