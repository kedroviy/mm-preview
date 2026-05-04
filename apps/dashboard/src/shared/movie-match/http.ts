"use client";

import { getAccessToken } from "@mm-preview/sdk";
import { getMovieMatchBaseUrl } from "./config";

function unwrapBody<T>(body: unknown): T {
  if (
    body &&
    typeof body === "object" &&
    "data" in body &&
    ("success" in body || "ok" in body)
  ) {
    return (body as { data: T }).data;
  }
  return body as T;
}

export async function movieMatchFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const base = getMovieMatchBaseUrl();
  const url = path.startsWith("http")
    ? path
    : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const token = getAccessToken();

  const headers: HeadersInit = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers ?? {}),
  };

  const res = await fetch(url, { ...init, headers });
  const text = await res.text();
  let body: unknown = {};
  if (text) {
    try {
      body = JSON.parse(text) as unknown;
    } catch {
      body = { raw: text };
    }
  }

  if (!res.ok) {
    const msg =
      (body && typeof body === "object" && "message" in body
        ? String((body as { message?: string }).message)
        : null) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return unwrapBody<T>(body);
}
