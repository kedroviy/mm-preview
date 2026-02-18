/**
 * Application URLs configuration
 * Uses environment variables with fallback to dynamic URL detection
 */

function getAppUrl(key: "LANDING" | "USER_CREATION" | "DASHBOARD"): string {
  const envKey = `NEXT_PUBLIC_${key}_URL`;
  const envValue = process.env[envKey];

  // Priority 1: Environment variable (production)
  if (envValue) {
    return envValue;
  }

  // Dynamic URL detection based on current domain
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;

    // Mode 2: Production - Vercel
    if (hostname.includes("vercel.app")) {
      const parts = hostname.split(".");
      const baseDomain = parts.length >= 2 
        ? parts.slice(-2).join(".")
        : "vercel.app";
      
      const appNames: Record<string, string> = {
        LANDING: "mm-preview-landing",
        USER_CREATION: "mm-preview-user-creation",
        DASHBOARD: "mm-preview-dashboard",
      };
      
      return `https://${appNames[key]}.${baseDomain}`;
    }

    // Mode 1: Dev mode - IP address or localhost
    const isDevMode = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || 
                      hostname === "localhost" || 
                      hostname === "127.0.0.1";
    
    if (isDevMode) {
      const devPorts: Record<string, string> = {
        LANDING: "3000",
        USER_CREATION: "3001",
        DASHBOARD: "3002",
      };
      return `${protocol}//${hostname}:${devPorts[key]}`;
    }
  }

  // If no environment variable and not in dev/production mode, throw error
  throw new Error(`NEXT_PUBLIC_${key}_URL must be set for non-dev environments`);
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
