/**
 * Server-side URL configuration
 * For use in Server Components and middleware
 */

function getServerAppUrl(
  key: "LANDING" | "USER_CREATION" | "DASHBOARD",
  request?: { headers: { get: (name: string) => string | null }; url: string },
): string {
  const envKey = `NEXT_PUBLIC_${key}_URL`;
  const envValue = process.env[envKey];

  // Priority 1: Environment variable (production)
  if (envValue) {
    return envValue;
  }

  // Try to detect URL from request if available (for middleware)
  if (request) {
    const hostname = request.headers.get("host") || "";
    const protocol = request.headers.get("x-forwarded-proto") || 
                     (request.url.startsWith("https") ? "https" : "http");
    const hostnameWithoutPort = hostname.split(":")[0];

    // Mode 2: Production - moviematch.space
    if (hostnameWithoutPort.includes("moviematch.space")) {
      const appNames: Record<string, string> = {
        LANDING: "moviematch.space",
        USER_CREATION: "start.moviematch.space",
        DASHBOARD: "dashboard.moviematch.space",
      };
      return `https://${appNames[key]}`;
    }
    
    // Mode 2.1: Production - Vercel (fallback для обратной совместимости)
    if (hostnameWithoutPort.includes("vercel.app")) {
      const parts = hostnameWithoutPort.split(".");
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
    const isDevMode = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostnameWithoutPort) || 
                       hostnameWithoutPort === "localhost" || 
                       hostnameWithoutPort === "127.0.0.1";
    
    if (isDevMode) {
      const devPorts: Record<string, string> = {
        LANDING: "3000",
        USER_CREATION: "3001",
        DASHBOARD: "3002",
      };
      return `${protocol}://${hostnameWithoutPort}:${devPorts[key]}`;
    }
  }

  // If no environment variable and not in dev/production mode, throw error
  throw new Error(`NEXT_PUBLIC_${key}_URL must be set for non-dev environments`);
}

export function getServerAppUrls(request?: { headers: { get: (name: string) => string | null }; url: string }) {
  return {
    LANDING: getServerAppUrl("LANDING", request),
    USER_CREATION: getServerAppUrl("USER_CREATION", request),
    DASHBOARD: getServerAppUrl("DASHBOARD", request),
  } as const;
}

