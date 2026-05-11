const PROD_APP_URLS = {
  LANDING: "https://moviematch.space",
  USER_CREATION: "https://start.moviematch.space",
  DASHBOARD: "https://dashboard.moviematch.space",
} as const;

const DEV_PORTS = {
  LANDING: "3000",
  USER_CREATION: "3001",
  DASHBOARD: "3002",
} as const;

type AppKey = keyof typeof PROD_APP_URLS;

function isDevHost(hostname: string): boolean {
  return (
    /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  );
}

function getClientAppUrl(key: AppKey): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const { hostname, protocol } = window.location;
  if (isDevHost(hostname)) {
    return `${protocol}//${hostname}:${DEV_PORTS[key]}`;
  }

  if (hostname.includes("moviematch.space")) {
    return PROD_APP_URLS[key];
  }

  return null;
}

function getServerAppUrl(key: AppKey): string {
  const isDev = process.env.NODE_ENV === "development" || !process.env.NODE_ENV;
  if (isDev) {
    return `http://localhost:${DEV_PORTS[key]}`;
  }
  return PROD_APP_URLS[key];
}

function getAppUrl(key: AppKey): string {
  const envValue = process.env[`NEXT_PUBLIC_${key}_URL`];
  if (envValue) {
    return envValue;
  }

  const clientUrl = getClientAppUrl(key);
  if (clientUrl) {
    return clientUrl;
  }

  return getServerAppUrl(key);
}

export function getAppUrls() {
  return {
    LANDING: getAppUrl("LANDING"),
    USER_CREATION: getAppUrl("USER_CREATION"),
    DASHBOARD: getAppUrl("DASHBOARD"),
  } as const;
}

export const APP_URLS = getAppUrls();
