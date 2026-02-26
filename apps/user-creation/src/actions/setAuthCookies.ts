"use server";

import { cookies, headers } from "next/headers";

function getCookieDomainFromHost(host: string): string | undefined {
  const hostname = host.split(":")[0];

  if (
    hostname.endsWith(".moviematch.space") ||
    hostname === "moviematch.space"
  ) {
    return ".moviematch.space";
  }

  if (hostname.endsWith(".vercel.app")) {
    return ".vercel.app";
  }

  return undefined;
}

/**
 * Re-issues auth cookies with a shared domain attribute so they are
 * accessible across all subdomains (e.g. start.* → dashboard.*).
 * Must be called after the backend sets the cookies via the proxy.
 */
export async function setAuthCookiesWithDomain(): Promise<void> {
  const headerStore = await headers();
  const host = headerStore.get("host") || "";
  const domain = getCookieDomainFromHost(host);

  // On localhost/dev there is no cross-subdomain issue – nothing to do.
  if (!domain) return;

  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;
  const refreshToken = cookieStore.get("refresh_token")?.value;

  if (accessToken) {
    cookieStore.set("access_token", accessToken, {
      domain,
      path: "/",
      sameSite: "lax",
      secure: true,
      maxAge: 30 * 24 * 60 * 60,
    });
  }

  if (refreshToken) {
    cookieStore.set("refresh_token", refreshToken, {
      domain,
      path: "/",
      sameSite: "lax",
      secure: true,
      maxAge: 30 * 24 * 60 * 60,
    });
  }
}
