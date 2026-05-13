import { QueryClient } from "@tanstack/react-query";

/** Shared defaults for browser singleton and per-request server clients. */
export const queryClientDefaultOptions = {
	queries: {
		staleTime: 60_000,
	},
} as const;

/**
 * Singleton for client-side Next.js (`"use client"` provider).
 * Do not use this instance during RSC — use {@link createServerQueryClient} instead.
 */
export const defaultQueryClient = new QueryClient({
	defaultOptions: queryClientDefaultOptions,
});

/**
 * Новый `QueryClient` на каждый серверный запрос (App Router RSC / Route Handler).
 * Не кешируйте один экземпляр между разными запросами на сервере.
 */
export function createServerQueryClient() {
	return new QueryClient({
		defaultOptions: queryClientDefaultOptions,
	});
}
