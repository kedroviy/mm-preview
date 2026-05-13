import axios, {
  type AxiosError,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { getPublicApiBaseUrl } from "./runtime/public-api-url";

export type ErrorType<Error> = AxiosError<Error>;

export type BodyType<BodyData> = BodyData;

export const axiosInstance = axios.create({
  baseURL: getPublicApiBaseUrl(),
});

/**
 * Orval `react-query` + `axios` mutator: full response for status discriminated types.
 */
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  return axiosInstance.request(config).then(
    (response: AxiosResponse) =>
      ({
        data: response.data,
        status: response.status,
        headers: response.headers,
      }) as T,
  );
};
