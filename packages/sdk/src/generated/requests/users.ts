import { api } from "../../client";

/** movie-match: POST /auth/register */
export async function UsersController_createUser(body: {
  email: string;
  password: string;
}) {
  const url = `/auth/register`;
  const response = await api.post<{ message: string }>(url, body);
  return response;
}

/** movie-match: GET /user/me */
export async function UsersController_getProfile() {
  const url = `/user/me`;
  const response = await api.get<{
    id: number;
    email: string;
    username: string;
  }>(url);
  return response;
}

export async function UsersController_getAllUsers(_params?: {
  id?: unknown;
  name?: unknown;
}) {
  throw new Error(
    "UsersController_getAllUsers is not available on movie-match backend",
  );
}

export async function UsersController_getUser(_path: { userId: string }) {
  throw new Error(
    "UsersController_getUser is not available on movie-match backend",
  );
}

/** movie-match: DELETE /user/:email */
export async function UsersController_deleteUser(path: { userId: string }) {
  const email = encodeURIComponent(path.userId);
  const url = `/user/${email}`;
  const response = await api.delete<{ message: string }>(url);
  return response;
}

/** movie-match: PATCH /user/update-username */
export async function UsersController_updateName(
  path: { userId: string },
  body: { newUsername: string },
) {
  const url = `/user/update-username`;
  const response = await api.patch(url, {
    userId: path.userId,
    newUsername: body.newUsername,
  });
  return response;
}
