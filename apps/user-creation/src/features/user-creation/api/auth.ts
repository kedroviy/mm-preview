import { getClientApiUrl } from "@mm-preview/sdk";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
}

export interface VerifyGoogleRequest {
  idToken: string;
}

interface AuthErrorResponse {
  code?: string;
  retryAfterSeconds?: number;
  message?: string | string[];
}

export class AuthApiError extends Error {
  code: string;
  status: number;
  retryAfterSeconds?: number;

  constructor(params: {
    message: string;
    code?: string;
    status: number;
    retryAfterSeconds?: number;
  }) {
    super(params.message);
    this.name = "AuthApiError";
    this.code = params.code || "AUTH_UNKNOWN";
    this.status = params.status;
    this.retryAfterSeconds = params.retryAfterSeconds;
  }
}

function getAuthUrl(path: string): string {
  const baseUrl = getClientApiUrl();
  return `${baseUrl}${path}`;
}

function parseErrorMessage(payload?: AuthErrorResponse): string {
  if (typeof payload?.message === "string") {
    return payload.message;
  }
  if (Array.isArray(payload?.message) && payload.message.length > 0) {
    return payload.message[0];
  }
  return "Authorization failed";
}

async function postAuth<T>(path: string, payload: unknown): Promise<T> {
  // movie-match auth endpoints return JSON only (no Set-Cookie). Using
  // credentials: "include" forces credentialed CORS: ACAO cannot be "*",
  // which breaks with Nest's default `origin: '*'` until the API sets
  // explicit origins + credentials: true.
  const response = await fetch(getAuthUrl(path), {
    method: "POST",
    credentials: "omit",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json().catch(() => ({}))) as T &
    AuthErrorResponse;

  if (!response.ok) {
    throw new AuthApiError({
      message: parseErrorMessage(data),
      status: response.status,
      code: data.code,
      retryAfterSeconds: data.retryAfterSeconds,
    });
  }

  return data as T;
}

export async function register(payload: RegisterRequest): Promise<void> {
  await postAuth("/auth/register", payload);
}

export async function login(payload: LoginRequest): Promise<AuthTokenResponse> {
  return postAuth<AuthTokenResponse>("/auth/login", payload);
}

export async function verifyGoogleIdToken(
  payload: VerifyGoogleRequest,
): Promise<AuthTokenResponse> {
  return postAuth<AuthTokenResponse>("/auth/verify-id-token", payload);
}
