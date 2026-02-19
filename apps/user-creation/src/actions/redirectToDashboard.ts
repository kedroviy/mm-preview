"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAppUrls } from "@/src/shared/config/constants";

/**
 * Server action для редиректа на dashboard
 * Получает куки на сервере и делает redirect на dashboard
 * Куки должны передаваться автоматически при редиректе, если они установлены без domain
 */
export async function redirectToDashboard(userId: string) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  const refreshToken = cookieStore.get("refresh_token");

  // Проверяем, что куки есть
  if (!accessToken?.value && !refreshToken?.value) {
    // Если кук нет, остаемся на странице создания пользователя
    return;
  }

  // Получаем URL dashboard
  const urls = getAppUrls();
  const dashboardUrl = urls.DASHBOARD;

  // Просто делаем redirect на dashboard
  // Куки должны передаваться автоматически, если они установлены без domain (undefined для localhost)
  redirect(`${dashboardUrl}/${userId}`);
}

