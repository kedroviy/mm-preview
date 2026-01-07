import {
  type CreateUserRequest,
  useCreateUser as useSDKCreateUser,
} from "@mm-preview/sdk";
import { APP_URLS } from "@/src/shared/config/constants";

export function useCreateUser() {
  const mutation = useSDKCreateUser();

  const mutate = (data: CreateUserRequest) => {
    mutation.mutate(data, {
      onSuccess: () => {
        // Redirect to dashboard after successful user creation
        window.location.href = APP_URLS.DASHBOARD;
      },
    });
  };

  return {
    ...mutation,
    mutate,
  };
}
