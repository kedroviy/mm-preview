import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { middleware } from "../middleware";

const savedEnv = { ...process.env };

function makeUnsignedJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" }))
    .toString("base64url")
    .replace(/=+$/, "");
  const body = Buffer.from(JSON.stringify(payload))
    .toString("base64url")
    .replace(/=+$/, "");
  return `${header}.${body}.x`;
}

afterEach(() => {
  process.env = { ...savedEnv };
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("user-creation middleware", () => {
  beforeEach(() => {
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_DASHBOARD_URL = "http://localhost:3002";
    delete process.env.BACKEND_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
  });

  it("does not run auth logic for unrelated paths", async () => {
    const req = new NextRequest(new URL("http://localhost:3001/api/health"));
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("allows auth pages when there are no cookies", async () => {
    const req = new NextRequest(new URL("http://localhost:3001/auth/login"));
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("redirects to dashboard when access_token decodes to sub", async () => {
    const token = makeUnsignedJwt({ sub: "user-uuid-1" });
    const req = new NextRequest(new URL("http://localhost:3001/auth/login"), {
      headers: { cookie: `access_token=${token}` },
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe(
      "http://localhost:3002/user-uuid-1",
    );
  });

  it("redirects when access_token uses numeric id (movie-match style)", async () => {
    const token = makeUnsignedJwt({ id: 12345, email: "a@b.c" });
    const req = new NextRequest(new URL("http://localhost:3001/auth/register"), {
      headers: { cookie: `access_token=${token}` },
    });
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3002/12345");
  });

  it("clears cookies when refresh fails and access is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      headers: new Headers(),
    });
    vi.stubGlobal("fetch", fetchMock);

    const req = new NextRequest(new URL("http://localhost:3001/auth/login"), {
      headers: { cookie: "refresh_token=old-refresh" },
    });
    const res = await middleware(req);
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalled();
    const setCookie = res.headers.get("set-cookie") || "";
    expect(setCookie).toContain("access_token=");
    expect(setCookie).toContain("refresh_token=");
  });
});
