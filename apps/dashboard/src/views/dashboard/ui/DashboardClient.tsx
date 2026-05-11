"use client";

import {
  authApi,
  removeAllAuthTokens,
  useUsersController_getProfile,
} from "@mm-preview/sdk";
import { Button, ProgressSpinner } from "@mm-preview/ui";
import type { Room } from "@/src/entities/room";
import { getAppUrls } from "@/src/shared/config/constants";
import {
  useViewTransition,
  ViewTransition,
} from "@/src/shared/components/ViewTransition";
import { useTokenRefresh } from "@/src/shared/hooks/useTokenRefresh";
import { useWebSocketMyRooms } from "@/src/shared/hooks/useWebSocketMyRooms";
import { useCallback, useEffect, useMemo, useState } from "react";

type DashboardTab = "discover" | "match" | "profile";

interface DashboardClientProps {
  userId: string;
  initialProfile?: {
    userId: string;
    name: string;
    role?: string;
    lastActive?: number;
    recentRooms?: string[];
    rooms?: Room[];
  } | null;
}

const MOOD_TILES = [
  { title: "Cozy night", hue: "from-rose-200/90 via-fuchsia-100/80 to-violet-200/90" },
  { title: "Neon city", hue: "from-cyan-200/90 via-blue-200/80 to-indigo-300/90" },
  { title: "Soft indie", hue: "from-amber-100/90 via-orange-50/80 to-rose-200/90" },
  { title: "Late 90s", hue: "from-emerald-200/90 via-teal-100/80 to-cyan-200/90" },
  { title: "Rainy window", hue: "from-slate-200/90 via-zinc-100/80 to-stone-200/90" },
  { title: "Dream pop", hue: "from-purple-200/90 via-pink-100/80 to-sky-200/90" },
];

function formatLastActive(ms?: number): string {
  if (!ms) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(ms));
  } catch {
    return "—";
  }
}

export function DashboardClient({
  userId,
  initialProfile,
}: DashboardClientProps) {
  const [tab, setTab] = useState<DashboardTab>("discover");
  const { navigate, isPending } = useViewTransition();

  useTokenRefresh();

  const queryResult = useUsersController_getProfile(
    initialProfile ? { enabled: false } : undefined,
  );

  type ProfileType = {
    userId: string;
    name: string;
    role?: string;
    lastActive?: number;
    recentRooms?: string[];
    rooms?: Room[];
  };

  const profile = (initialProfile || queryResult.data) as
    | ProfileType
    | null
    | undefined;
  const isLoading = initialProfile ? false : queryResult.isLoading;
  const error = initialProfile ? null : queryResult.error;
  const profileUserId = profile?.userId || userId;

  const { rooms: liveRooms, isLoading: isMyRoomsLoading } = useWebSocketMyRooms(
    profileUserId,
    !!profileUserId,
  );

  const roomsToShow = useMemo(() => {
    const fromProfile = profile?.rooms ?? [];
    if (liveRooms?.length) return liveRooms;
    return fromProfile;
  }, [profile?.rooms, liveRooms]);

  const goToRooms = useCallback(() => {
    navigate(`/${profileUserId}/rooms`);
  }, [navigate, profileUserId]);

  const handleSignOut = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore — still clear local session
    } finally {
      removeAllAuthTokens();
      const start = getAppUrls().USER_CREATION;
      window.location.href = `${start}/auth/login`;
    }
  }, []);

  useEffect(() => {
    const status =
      (error as any)?.status ??
      (error as any)?.statusCode ??
      (error as any)?.response?.status;
    if (status === 401) {
      const url = process.env.NEXT_PUBLIC_USER_CREATION_URL;
      if (url) window.location.href = url;
    }
  }, [error]);

  if (isLoading && !initialProfile) {
    return (
      <div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#faf5ff] via-[#fff1f2] to-[#e0f2fe]"
        suppressHydrationWarning
      >
        <ProgressSpinner aria-label="Loading" />
      </div>
    );
  }

  if (error || !profile) {
    const loginUrl = `${getAppUrls().USER_CREATION}/auth/login`;
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-[#faf5ff] via-[#fff1f2] to-[#e0f2fe]"
        suppressHydrationWarning
      >
        <div className="max-w-md w-full rounded-3xl border border-white/60 bg-white/70 backdrop-blur-xl shadow-xl shadow-rose-200/40 p-8 text-center space-y-4">
          <p className="text-lg font-semibold text-slate-800">
            Не удалось загрузить профиль
          </p>
          <p className="text-sm text-slate-500">
            Возможно, токен не подходит для этого API или сессия устарела.
          </p>
          <Button
            label="Войти снова"
            className="w-full"
            onClick={() => {
              window.location.href = loginUrl;
            }}
          />
        </div>
      </div>
    );
  }

  const user = profile;
  const initial = user.name?.trim()?.charAt(0)?.toUpperCase() || "?";

  return (
    <ViewTransition name="page">
      <div className="min-h-screen pb-28 md:pb-8 bg-gradient-to-br from-[#faf5ff] via-[#fff7ed] to-[#e0f2fe] text-slate-800">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-24 h-96 w-96 rounded-full bg-fuchsia-300/25 blur-3xl" />
          <div className="absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-cyan-300/20 blur-3xl" />
        </div>

        <header className="relative z-10 border-b border-white/40 bg-white/35 backdrop-blur-xl">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-11 w-11 shrink-0 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-rose-400 text-white font-bold flex items-center justify-center shadow-lg shadow-fuchsia-500/30">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-widest text-slate-500 font-medium">
                  Movie Match
                </p>
                <h1 className="text-lg sm:text-xl font-semibold truncate">
                  {user.name}
                </h1>
              </div>
            </div>
            <Button
              type="button"
              icon="pi pi-compass"
              label="Комнаты"
              rounded
              outlined
              className="hidden sm:inline-flex shrink-0 border-white/80 bg-white/40"
              onClick={goToRooms}
              disabled={isPending}
              badge={
                !isMyRoomsLoading && roomsToShow.length > 0
                  ? String(roomsToShow.length)
                  : undefined
              }
              badgeSeverity="danger"
            />
          </div>
        </header>

        <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <nav className="hidden md:flex gap-2 mb-8 p-1 rounded-2xl bg-white/50 backdrop-blur-md border border-white/60 shadow-sm w-fit">
            {(
              [
                { id: "discover" as const, label: "Подбор", icon: "pi pi-sparkles" },
                { id: "match" as const, label: "Матч", icon: "pi pi-play" },
                { id: "profile" as const, label: "Профиль", icon: "pi pi-user" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  tab === item.id
                    ? "bg-gradient-to-r from-fuchsia-600 to-rose-500 text-white shadow-md"
                    : "text-slate-600 hover:bg-white/70"
                }`}
              >
                <i className={item.icon} />
                {item.label}
              </button>
            ))}
          </nav>

          {tab === "discover" && (
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-fuchsia-700 via-rose-600 to-orange-500 bg-clip-text text-transparent">
                  Вдохновение на вечер
                </h2>
                <p className="mt-2 text-slate-600 max-w-xl">
                  Как в ленте Pinterest: быстрые «коллажи» настроения. Выберите
                  комнату во вкладке «Матч» и соберите друзей.
                </p>
              </div>
              <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                {MOOD_TILES.map((tile) => (
                  <div
                    key={tile.title}
                    className={`break-inside-avoid rounded-2xl p-5 min-h-[140px] bg-gradient-to-br ${tile.hue} border border-white/50 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all cursor-default`}
                  >
                    <p className="text-sm font-semibold text-slate-800/90">
                      {tile.title}
                    </p>
                    <p className="text-xs text-slate-700/70 mt-2 leading-relaxed">
                      Сохрани идею — потом перенеси в комнату с друзьями.
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {tab === "match" && (
            <section className="space-y-8">
              <div className="rounded-3xl overflow-hidden border border-white/60 bg-white/50 backdrop-blur-xl shadow-xl shadow-rose-200/30">
                <div className="p-8 sm:p-10 bg-gradient-to-br from-fuchsia-600/90 via-rose-500/85 to-orange-400/90 text-white">
                  <p className="text-sm font-medium opacity-90 uppercase tracking-wider">
                    Match
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-bold mt-2 max-w-lg leading-tight">
                    Комнаты, коды и совместный выбор
                  </h2>
                  <p className="mt-4 text-white/90 max-w-md text-sm sm:text-base">
                    Тот же сценарий, что вкладка «Match» в приложении: создай
                    комнату, зови друзей по коду и возвращайся сюда за
                    обновлениями.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button
                      type="button"
                      label="Открыть комнаты"
                      icon="pi pi-arrow-right"
                      iconPos="right"
                      className="!bg-white !text-fuchsia-700 !border-0 font-semibold"
                      onClick={goToRooms}
                      disabled={isPending}
                    />
                    <Button
                      type="button"
                      label="Создать комнату"
                      outlined
                      className="!border-white/80 !text-white"
                      onClick={goToRooms}
                      disabled={isPending}
                    />
                  </div>
                </div>
              </div>

              {roomsToShow.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 mb-4">
                    Твои комнаты
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {roomsToShow.map((room) => (
                      <button
                        key={room.roomId}
                        type="button"
                        onClick={() =>
                          navigate(`/${profileUserId}/rooms/${room.roomId}`)
                        }
                        className="text-left rounded-2xl border border-white/70 bg-white/60 backdrop-blur-md p-5 shadow-sm hover:shadow-lg hover:border-fuchsia-200/80 transition-all disabled:opacity-50"
                        disabled={isPending}
                      >
                        <p className="text-xs text-slate-500 font-medium">
                          Код
                        </p>
                        <p className="text-2xl font-mono font-bold tracking-widest text-fuchsia-700">
                          {room.publicCode}
                        </p>
                        <p className="text-sm text-slate-600 mt-2 line-clamp-2">
                          Участников: {room.users?.length ?? 0}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </section>
          )}

          {tab === "profile" && (
            <section className="max-w-lg">
              <div className="rounded-3xl border border-white/60 bg-white/55 backdrop-blur-xl p-8 shadow-xl shadow-slate-200/50 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white text-2xl font-bold flex items-center justify-center shadow-lg">
                    {initial}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-xs text-slate-500 font-mono break-all">
                      {user.userId}
                    </p>
                  </div>
                </div>
                <dl className="grid grid-cols-1 gap-3 text-sm">
                  <div className="flex justify-between gap-4 py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Роль</dt>
                    <dd className="font-medium capitalize">
                      {user.role ?? "user"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 py-2 border-b border-slate-100">
                    <dt className="text-slate-500">Активность</dt>
                    <dd className="font-medium">
                      {formatLastActive(user.lastActive)}
                    </dd>
                  </div>
                </dl>
                <Button
                  type="button"
                  label="Выйти"
                  icon="pi pi-sign-out"
                  severity="danger"
                  outlined
                  className="w-full"
                  onClick={handleSignOut}
                />
              </div>
            </section>
          )}
        </main>

        <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 border-t border-white/50 bg-white/75 backdrop-blur-xl pb-3 pt-2 px-2">
          <div className="max-w-lg mx-auto flex justify-around items-stretch gap-1">
            {(
              [
                { id: "discover" as const, label: "Подбор", icon: "pi pi-sparkles" },
                { id: "match" as const, label: "Матч", icon: "pi pi-play" },
                { id: "profile" as const, label: "Профиль", icon: "pi pi-user" },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs font-medium transition-colors ${
                  tab === item.id
                    ? "text-fuchsia-600"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                    tab === item.id
                      ? "bg-gradient-to-br from-fuchsia-500 to-rose-400 text-white shadow-md"
                      : "bg-slate-100/80"
                  }`}
                >
                  <i className={`${item.icon} text-base`} />
                </span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </ViewTransition>
  );
}
