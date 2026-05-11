import { describe, expect, it } from "vitest";
import { decodeJWT, getUserIdFromToken } from "./jwt";

function encodePayload(obj: Record<string, unknown>): string {
  const json = JSON.stringify(obj);
  return Buffer.from(json, "utf8").toString("base64url");
}

function makeToken(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" }))
    .toString("base64url")
    .replace(/=/g, "");
  const body = encodePayload(payload);
  return `${header}.${body}.sig`;
}

describe("decodeJWT", () => {
  it("returns payload for valid token shape", () => {
    const token = makeToken({ sub: "uuid-1", name: "Test" });
    expect(decodeJWT(token)).toEqual({ sub: "uuid-1", name: "Test" });
  });

  it("returns null for malformed token", () => {
    expect(decodeJWT("not-a-jwt")).toBeNull();
    expect(decodeJWT("a.b")).toBeNull();
  });
});

describe("getUserIdFromToken", () => {
  it("prefers userId then sub then id", () => {
    expect(getUserIdFromToken(makeToken({ userId: "u1", sub: "s1" }))).toBe(
      "u1",
    );
    expect(getUserIdFromToken(makeToken({ sub: "s2" }))).toBe("s2");
    expect(getUserIdFromToken(makeToken({ id: 42 }))).toBe("42");
  });

  it("returns null when missing", () => {
    expect(getUserIdFromToken(makeToken({ email: "a@b.c" }))).toBeNull();
    expect(getUserIdFromToken(null)).toBeNull();
  });
});
