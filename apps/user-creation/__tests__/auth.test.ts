import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@mm-preview/sdk", () => ({
	authControllerLogin: vi.fn(),
	authControllerRegister: vi.fn(),
	authControllerVerifyIdToken: vi.fn(),
}));

import {
	authControllerLogin,
	authControllerVerifyIdToken,
} from "@mm-preview/sdk";
import { login, verifyGoogleIdToken } from "../src/features/user-creation/api/auth";

describe("auth api", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("login unwraps BearerToken from customInstance body", async () => {
		vi.mocked(authControllerLogin).mockResolvedValue({
			token: "jwt-access",
		} as never);

		const result = await login({
			email: "a@example.com",
			password: "secret",
		});

		expect(result).toEqual({ token: "jwt-access" });
	});

	it("verifyGoogleIdToken unwraps BearerToken from customInstance body", async () => {
		vi.mocked(authControllerVerifyIdToken).mockResolvedValue({
			token: "jwt-google",
		} as never);

		const result = await verifyGoogleIdToken({
			idToken: "google-id-token",
		});

		expect(result).toEqual({ token: "jwt-google" });
	});
});
