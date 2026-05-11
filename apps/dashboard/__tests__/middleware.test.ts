import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { middleware } from "../middleware";

const savedEnv = { ...process.env };

afterEach(() => {
  process.env = { ...savedEnv };
});

describe("dashboard middleware", () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_USER_CREATION_URL = "http://localhost:3001";
  });

  it("redirects to user-creation when there are no auth cookies", async () => {
    const req = new NextRequest(new URL("http://localhost:3002/some/page"));
    const res = await middleware(req);
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toBe("http://localhost:3001/");
  });

  it("allows the request when access_token cookie is present", async () => {
    const req = new NextRequest(new URL("http://localhost:3002/home"), {
      headers: { cookie: "access_token=any" },
    });
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });

  it("allows the request when only refresh_token cookie is present", async () => {
    const req = new NextRequest(new URL("http://localhost:3002/home"), {
      headers: { cookie: "refresh_token=any" },
    });
    const res = await middleware(req);
    expect(res.status).toBe(200);
  });
});
