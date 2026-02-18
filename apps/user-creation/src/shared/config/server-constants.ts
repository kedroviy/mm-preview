/**
 * Server-side URL configuration
 * For use in Server Components and middleware
 */

function getServerAppUrl(key: "LANDING" | "USER_CREATION" | "DASHBOARD"): string {
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

export function getServerAppUrls() {
  return {
    LANDING: getServerAppUrl("LANDING"),
    USER_CREATION: getServerAppUrl("USER_CREATION"),
    DASHBOARD: getServerAppUrl("DASHBOARD"),
  } as const;
}

