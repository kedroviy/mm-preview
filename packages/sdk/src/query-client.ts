import {
  type DefaultOptions,
  QueryClient,
  type QueryClientConfig,
} from "@tanstack/react-query";

const defaultQueryConfig: DefaultOptions = {
  queries: {
    refetchOnWindowFocus: false,
    refetchOnMount: true,
    refetchOnReconnect: true,
    retry: (failureCount, error: any) => {
      // Don't retry on 4xx errors
      if (error?.status >= 400 && error?.status < 500) {
        return false;
      }
      // Retry up to 1 time for other errors
      return failureCount < 1;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  },
  mutations: {
    retry: 0,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
};

export function createQueryClient(
  config?: Partial<QueryClientConfig>,
): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryConfig,
    ...config,
  });
}

export const defaultQueryClient = createQueryClient();
