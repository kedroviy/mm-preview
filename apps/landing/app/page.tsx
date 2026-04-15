import { redirect } from "next/navigation";
import { DEFAULT_LOCALE } from "@/src/shared/config/metadata";

export const dynamic = "force-static";

export default function Home() {
  redirect(`/${DEFAULT_LOCALE}`);
}
