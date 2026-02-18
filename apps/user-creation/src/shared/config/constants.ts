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
    const port = window.location.port;
    const protocol = window.location.protocol;
    // Also check href to ensure we have port information
    const href = window.location.href;

    // Vercel pattern: 
    // - mm-preview-landing.vercel.app
    // - mm-preview-user-creation.vercel.app  
    // - mm-preview-dashboard.vercel.app
    if (hostname.includes("vercel.app")) {
      // For Vercel, base domain is always the last two parts: "vercel.app"
      // Extract base domain by taking last two parts of hostname
      // e.g., "mm-preview-user-creation.vercel.app" -> "vercel.app"
      const parts = hostname.split(".");
      const baseDomain = parts.length >= 2 
        ? parts.slice(-2).join(".")  // Always take last two parts: "vercel.app"
        : "vercel.app"; // Fallback
      
      const appNames: Record<string, string> = {
        LANDING: "mm-preview-landing",
        USER_CREATION: "mm-preview-user-creation",
        DASHBOARD: "mm-preview-dashboard",
      };
      
      // Construct URL: https://{app-name}.{base-domain}
      // e.g., https://mm-preview-dashboard.vercel.app
      return `https://${appNames[key]}.${baseDomain}`;
    }

    // Dev mode with IP address or localhost (e.g., http://192.168.0.104:3000)
    // Check this BEFORE .local to prioritize IP addresses in dev mode
    const isIPAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname === "localhost" || hostname === "127.0.0.1";
    // Check if we're in dev mode (has port in URL, which indicates dev server)
    // Port can be empty string, so we check for truthy value and that it's a number
    // Also check href for port pattern (e.g., :3000, :3001, :3002)
    const hasPort = (port && port !== "" && !isNaN(Number(port))) || /:\d{4}/.test(href);
    const isDevMode = isIPAddress && hasPort;
    
    if (isDevMode) {
      const devPorts: Record<string, string> = {
        LANDING: "3000",
        USER_CREATION: "3001",
        DASHBOARD: "3002",
      };
      // Always use the port for the target app, not the current port
      return `${protocol}//${hostname}:${devPorts[key]}`;
    }

    // Local development with subdomains (only if not in dev mode with IP)
    // Only use .local if hostname actually contains .local
    if (hostname.includes(".local")) {
      const appNames: Record<string, string> = {
        LANDING: "landing",
        USER_CREATION: "user-creation",
        DASHBOARD: "dashboard",
      };
      return `http://${appNames[key]}.local`;
    }
    
    // If we have IP address but no port detected, still try to use dev ports
    // This handles edge cases where port might not be detected
    if (isIPAddress) {
      const devPorts: Record<string, string> = {
        LANDING: "3000",
        USER_CREATION: "3001",
        DASHBOARD: "3002",
      };
      return `${protocol}//${hostname}:${devPorts[key]}`;
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
