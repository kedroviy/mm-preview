import { api } from "../../client";

/** movie-match: POST /auth/login → `{ token }` */
export async function AuthController_login(body: {
  email: string;
  password: string;
}) {
  const url = `/auth/login`;
  const response = await api.post<{ token: string }>(url, body);
  return response;
}

export async function AuthController_refreshToken() {
  throw new Error("movie-match backend has no POST /auth/refresh");
}

export async function AuthController_logout() {
  throw new Error("movie-match backend has no POST /auth/logout");
}

export async function AuthController_adminLogin(_body: unknown) {
  throw new Error("movie-match backend has no POST /auth/admin/login");
}
