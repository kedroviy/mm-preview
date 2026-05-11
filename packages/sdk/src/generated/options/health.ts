// movie-match has no AppController health routes used by this monorepo.
import type { Client } from "../../types";

export function getHelloOptions(_config: {
  client: Client;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    queryKey: ["health", "getHello"] as const,
    queryFn: async () => ({ ok: true as const }),
  };
}

export function healthCheckOptions(_config: {
  client: Client;
  credentials?: RequestCredentials;
  headers?: HeadersInit;
}) {
  return {
    queryKey: ["health", "healthCheck"] as const,
    queryFn: async () => ({ ok: true as const }),
  };
}
