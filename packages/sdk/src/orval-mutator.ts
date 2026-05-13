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
 * Orval `react-query` + `axios` mutator: returns response body (standard Orval + axios).
 */
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
	return axiosInstance
		.request(config)
		.then((response: AxiosResponse) => response.data as T);
};
