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

  if (envValue) {
    return envValue;
  }

  // Try to detect URL from request if available (for middleware)
  if (request) {
    const hostname = request.headers.get("host") || "";
    const protocol = request.headers.get("x-forwarded-proto") || 
                     (request.url.startsWith("https") ? "https" : "http");
    const hostnameWithoutPort = hostname.split(":")[0];

    // Check for Vercel deployment
    if (hostnameWithoutPort.includes("vercel.app")) {
      // For Vercel, base domain is always the last two parts: "vercel.app"
      const parts = hostnameWithoutPort.split(".");
      const baseDomain = parts.length >= 2 
        ? parts.slice(-2).join(".")  // Always take last two parts: "vercel.app"
        : "vercel.app"; // Fallback
      
      const appNames: Record<string, string> = {
        LANDING: "mm-preview-landing",
        USER_CREATION: "mm-preview-user-creation",
        DASHBOARD: "mm-preview-dashboard",
      };
      
      return `https://${appNames[key]}.${baseDomain}`;
    }

    // Check if we're in dev mode with IP address
    const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostnameWithoutPort) || 
                         hostnameWithoutPort === "localhost" || 
                         hostnameWithoutPort === "127.0.0.1";
    
    if (isIPAddress) {
      const devPorts: Record<string, string> = {
        LANDING: "3000",
        USER_CREATION: "3001",
        DASHBOARD: "3002",
      };
      return `${protocol}://${hostnameWithoutPort}:${devPorts[key]}`;
    }

    // Check for .local subdomain
    if (hostnameWithoutPort.includes(".local")) {
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

export function getServerAppUrls(request?: { headers: { get: (name: string) => string | null }; url: string }) {
  return {
    LANDING: getServerAppUrl("LANDING", request),
    USER_CREATION: getServerAppUrl("USER_CREATION", request),
    DASHBOARD: getServerAppUrl("DASHBOARD", request),
  } as const;
}

