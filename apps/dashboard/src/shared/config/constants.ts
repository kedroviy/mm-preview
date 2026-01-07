/**
 * Application URLs configuration
 * Uses environment variables with fallback to local development URLs
 */
function getAppUrl(key: "LANDING" | "USER_CREATION" | "DASHBOARD"): string {
  const envKey = `NEXT_PUBLIC_${key}_URL`;
  const envValue = process.env[envKey];

  if (envValue) {
    return envValue;
  }

  // Fallback to local development URLs
  const localUrls: Record<string, string> = {
    LANDING: "http://landing.local",
    USER_CREATION: "http://user-creation.local",
    DASHBOARD: "http://dashboard.local",
  };

  return localUrls[key];
}

export const APP_URLS = {
  LANDING: getAppUrl("LANDING"),
  USER_CREATION: getAppUrl("USER_CREATION"),
  DASHBOARD: getAppUrl("DASHBOARD"),
} as const;
