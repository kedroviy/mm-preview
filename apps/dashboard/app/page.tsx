import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { decodeJWT } from "@mm-preview/sdk";

async function getUserIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token");
  
  if (accessToken?.value) {
    try {
      const decoded = decodeJWT(accessToken.value);
      return decoded?.userId || null;
    } catch {
      return null;
    }
  }
  
  return null;
}

export default async function DashboardRootPage() {
  // Получаем userId из cookies и редиректим на страницу пользователя
  const userId = await getUserIdFromCookies();
  
  if (userId) {
    redirect(`/${userId}`);
  }
  
  // Если userId нет, редиректим на страницу создания пользователя
  const userCreationUrl = process.env.NEXT_PUBLIC_USER_CREATION_URL || "http://localhost:3001";
  redirect(userCreationUrl);
}
