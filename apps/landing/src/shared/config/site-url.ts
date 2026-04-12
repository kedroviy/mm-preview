/**
 * Публичный URL лендинга для canonical, Open Graph, sitemap и JSON-LD.
 * На проде задайте NEXT_PUBLIC_LANDING_URL (без завершающего слэша).
 */
export function getLandingSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_LANDING_URL?.trim();
  if (raw) {
    return raw.replace(/\/$/, "");
  }
  return "https://moviematch.space";
}
