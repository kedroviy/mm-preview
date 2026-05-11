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

  it("always returns NextResponse.next (auth on client; no cookie gate)", () => {
    expect(middleware().status).toBe(200);
  });
});
