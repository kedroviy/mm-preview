/**
 * Application URLs configuration
 * Uses environment variables with fallback to dynamic URL detection
 */

function getAppUrl(key: "LANDING" | "USER_CREATION" | "DASHBOARD"): string {
  const envKey = `NEXT_PUBLIC_${key}_URL`;
  const envValue = process.env[envKey];

  // If environment variable is set, use it
  if (envValue) {
    return envValue;
  }

  // Dynamic URL detection based on current domain
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // Vercel pattern: mm-preview-landing.vercel.app -> mm-preview-user-creation.vercel.app
    if (hostname.includes("vercel.app")) {
      const baseDomain = hostname.replace(/^mm-preview-\w+\./, "");
      const appNames: Record<string, string> = {
        LANDING: "mm-preview-landing",
        USER_CREATION: "mm-preview-user-creation",
        DASHBOARD: "mm-preview-dashboard",
      };
      return `https://${appNames[key]}.${baseDomain}`;
    }

    // Local development with subdomains
    if (hostname.includes(".local")) {
      const appNames: Record<string, string> = {
        LANDING: "landing",
        USER_CREATION: "user-creation",
        DASHBOARD: "dashboard",
      };
      return `http://${appNames[key]}.local`;
    }
  }

  // Fallback to local development URLs
  const localUrls: Record<string, string> = {
    LANDING: "http://landing.local",
    USER_CREATION: "http://user-creation.local",
    DASHBOARD: "http://dashboard.local",
  };

  return localUrls[key];
}

// Export as a function to get URLs dynamically
export function getAppUrls() {
  return {
    LANDING: getAppUrl("LANDING"),
    USER_CREATION: getAppUrl("USER_CREATION"),
    DASHBOARD: getAppUrl("DASHBOARD"),
  } as const;
}

// For backward compatibility, export as object (will be evaluated at module load time)
// Note: This will use fallback values if env vars are not set during build
export const APP_URLS = getAppUrls();
