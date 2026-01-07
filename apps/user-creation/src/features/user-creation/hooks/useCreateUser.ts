import {
  type CreateUserRequest,
  useCreateUser as useSDKCreateUser,
} from "@mm-preview/sdk";
import { getAppUrls } from "@/src/shared/config/constants";

export function useCreateUser() {
  const mutation = useSDKCreateUser();

  const mutate = (data: CreateUserRequest) => {
    mutation.mutate(data, {
      onSuccess: () => {
        // Redirect to dashboard after successful user creation
        const urls = getAppUrls();
        window.location.href = urls.DASHBOARD;
      },
    });
  };

  return {
    ...mutation,
    mutate,
  };
}
