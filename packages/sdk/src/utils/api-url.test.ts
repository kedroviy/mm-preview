import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getClientApiUrl,
  getServerApiUrl,
  getWebSocketRoomsUrl,
} from "./api-url";

const ORIGINAL_ENV = { ...process.env };

function resetEnv() {
  process.env = { ...ORIGINAL_ENV };
}

beforeEach(() => {
  resetEnv();
});

afterEach(() => {
  resetEnv();
});

describe("getServerApiUrl", () => {
  it("uses BACKEND_URL when set", () => {
    process.env.BACKEND_URL = "https://api.example.com";
    delete process.env.NEXT_PUBLIC_API_URL;
    delete process.env.API_URL;
    expect(getServerApiUrl()).toBe("https://api.example.com");
  });

  it("uses NEXT_PUBLIC_API_URL as-is (trailing slash trimmed only)", () => {
    delete process.env.BACKEND_URL;
    process.env.NEXT_PUBLIC_API_URL = "https://host.test/api/v1/";
    expect(getServerApiUrl()).toBe("https://host.test/api/v1");
  });

  it("falls back to API_URL or localhost", () => {
    delete process.env.BACKEND_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    process.env.API_URL = "http://custom:9000";
    expect(getServerApiUrl()).toBe("http://custom:9000");
    delete process.env.API_URL;
    expect(getServerApiUrl()).toBe("http://localhost:4000");
  });
});

describe("getClientApiUrl", () => {
  it("returns default production API host when not using proxy", () => {
    process.env.NODE_ENV = "production";
    delete process.env.NEXT_PUBLIC_USE_API_PROXY;
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getClientApiUrl()).toBe("https://movie-api.moviematch.space");
  });

  it("returns NEXT_PUBLIC_API_URL in dev (trailing slash trimmed)", () => {
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_API_URL = "http://localhost:4000/api/v1";
    expect(getClientApiUrl()).toBe("http://localhost:4000/api/v1");
  });
});

describe("getWebSocketRoomsUrl", () => {
  it("uses wss in production", () => {
    process.env.NODE_ENV = "production";
    process.env.BACKEND_URL = "https://api.example.com";
    expect(getWebSocketRoomsUrl()).toBe("wss://api.example.com/rooms");
  });

  it("uses ws in development with localhost base", () => {
    process.env.NODE_ENV = "development";
    delete process.env.BACKEND_URL;
    delete process.env.NEXT_PUBLIC_API_URL;
    expect(getWebSocketRoomsUrl()).toBe("ws://localhost:4000/rooms");
  });
});
