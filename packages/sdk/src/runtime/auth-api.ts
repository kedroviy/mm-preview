import { axiosInstance } from "../orval-mutator";

/** Minimal auth helpers used by the dashboard. */
export const authApi = {
	/** Logout: clears server session when an endpoint exists; safe no-op otherwise. */
	async logout(): Promise<void> {
		try {
			await axiosInstance.post("/auth/logout");
		} catch {
			/* ignore — dashboard clears cookies locally */
		}
	},
};
