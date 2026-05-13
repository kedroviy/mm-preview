import {
	authControllerLogin,
	authControllerRegister,
	authControllerVerifyIdToken,
} from "@mm-preview/sdk";
import { isAxiosError, type AxiosError } from "axios";

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

interface ApiErrorBody {
	code?: string;
	message?: string | string[];
	retryAfterSeconds?: number;
	statusCode?: number;
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

function parseErrorMessage(payload?: ApiErrorBody): string {
	if (typeof payload?.message === "string") {
		return payload.message;
	}
	if (Array.isArray(payload?.message) && payload.message.length > 0) {
		return payload.message[0];
	}
	return "Authorization failed";
}

function parseRetryAfterSeconds(error: AxiosError): number | undefined {
	const header = error.response?.headers?.["retry-after"];
	if (header === undefined || header === null) {
		return undefined;
	}
	const n = Number.parseInt(String(header), 10);
	return Number.isNaN(n) ? undefined : n;
}

/** Orval mutator returns `{ data, status, headers }`; BearerToken is nested under `data`. */
function unwrapBearer(res: unknown): AuthTokenResponse {
	const payload = res as {
		data?: { token?: string };
		status?: number;
	};
	const token = payload.data?.token;
	if (!token) {
		throw new AuthApiError({
			message: "Authorization failed",
			status: typeof payload.status === "number" ? payload.status : 0,
			code: "AUTH_NO_TOKEN",
		});
	}
	return { token };
}

function inferAuthCode(status: number): string | undefined {
	switch (status) {
		case 401:
			return "AUTH_INVALID_CREDENTIALS";
		case 403:
			return "AUTH_LOGIN_RATE_LIMITED";
		case 404:
			return "AUTH_USER_NOT_FOUND";
		case 409:
			return "AUTH_EMAIL_ALREADY_EXISTS";
		default:
			return undefined;
	}
}

function mapAxiosToAuthApiError(error: unknown): AuthApiError {
	if (error instanceof AuthApiError) {
		return error;
	}

	if (!isAxiosError(error)) {
		const message = error instanceof Error ? error.message : "Authorization failed";
		return new AuthApiError({
			message,
			status: 0,
			code: "AUTH_UNKNOWN",
		});
	}

	const status = error.response?.status ?? 0;
	const body = error.response?.data as ApiErrorBody | undefined;
	const retryAfterSeconds =
		body?.retryAfterSeconds ?? parseRetryAfterSeconds(error);

	return new AuthApiError({
		message: parseErrorMessage(body),
		status,
		code: body?.code ?? inferAuthCode(status) ?? "AUTH_UNKNOWN",
		retryAfterSeconds,
	});
}

export async function register(payload: RegisterRequest): Promise<void> {
	try {
		await authControllerRegister(payload);
	} catch (error) {
		throw mapAxiosToAuthApiError(error);
	}
}

export async function login(payload: LoginRequest): Promise<AuthTokenResponse> {
	try {
		const res = await authControllerLogin(payload);
		return unwrapBearer(res);
	} catch (error) {
		throw mapAxiosToAuthApiError(error);
	}
}

export async function verifyGoogleIdToken(
	payload: VerifyGoogleRequest,
): Promise<AuthTokenResponse> {
	try {
		const res = await authControllerVerifyIdToken({
			idToken: payload.idToken,
		});
		return unwrapBearer(res);
	} catch (error) {
		throw mapAxiosToAuthApiError(error);
	}
}
