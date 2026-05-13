/**
 * Утилиты TanStack Query для Next.js App Router:
 * - сервер: `createServerQueryClient` + `prefetchQuery(get…QueryOptions(…))` + `dehydrate`
 * - обёртка: `<HydrationBoundary state={…}>` вокруг клиентского дерева
 * - клиент: сгенерированные Orval-хуки `use…` в `"use client"` (те же ключи кеша, что и на сервере)
 */
export {
	dehydrate,
	hydrate,
	HydrationBoundary,
	type DehydratedState,
	type HydrationBoundaryProps,
} from "@tanstack/react-query";

export {
	createServerQueryClient,
	defaultQueryClient,
	queryClientDefaultOptions,
} from "../query-client";
