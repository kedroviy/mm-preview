/**
 * movieMatcher (legacy) HTTP + Socket.IO — те же пути, что в React Native приложении.
 * Включается через NEXT_PUBLIC_USE_MOVIE_MATCH_API=true
 */

const DEFAULT_MOVIE_MATCH_BASE = "https://movie-match-x5ue.onrender.com";

export function isMovieMatchLegacy(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOVIE_MATCH_API === "true";
}

export function getMovieMatchBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_MOVIE_MATCH_API_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  return DEFAULT_MOVIE_MATCH_BASE;
}

/** Socket.IO namespace /rooms — как в movieMatcher `io(serverUrl + '/rooms', ...)`. */
export function getMovieMatchSocketUrl(): string {
  const base = getMovieMatchBaseUrl()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const protocol = getMovieMatchBaseUrl().startsWith("https") ? "wss" : "ws";
  return `${protocol}://${base}/rooms`;
}
