import type { ApiResponse } from "../../types";

/** Stubs — movie-match has no dedicated `/` or `/health` REST routes for this app. */
export async function AppController_getHello(): Promise<ApiResponse<{ ok: true }>> {
  return { data: { ok: true }, status: 200, statusText: "OK" };
}

export async function AppController_healthCheck(): Promise<
  ApiResponse<{ ok: true }>
> {
  return AppController_getHello();
}
