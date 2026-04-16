import { cookies } from 'next/headers';
import type { SupportedLocale } from '@/src/shared/config/metadata';
import {
    FALLBACK_HEADER_COPY,
    FALLBACK_MESSAGES,
    mapHeaderFromMessages,
    normalizeSwitcherLocales,
    type LandingDictionary,
} from './landing-messages';

const LANDING_SEGMENT_LOCALE_COOKIE = 'mm_landing_segment_locale';

type LandingDictionaryApiResponse = Readonly<{
    switcherLocales?: string[];
    messages?: Record<string, string>;
}>;

function getServerApiBaseUrl(): string {
    const envBase =
        process.env.API_URL || process.env.BACKEND_URL || 'http://localhost:4000';
    return envBase.replace(/\/$/, '');
}

async function getSegmentLocale(currentLocale: SupportedLocale): Promise<SupportedLocale> {
    const cookieStore = await cookies();
    const cookieLocale = cookieStore.get(LANDING_SEGMENT_LOCALE_COOKIE)?.value;
    if (cookieLocale === 'ru' || cookieLocale === 'en' || cookieLocale === 'es') {
        return cookieLocale;
    }
    return currentLocale;
}

export async function getLandingDictionary(locale: SupportedLocale): Promise<LandingDictionary> {
    const url = `${getServerApiBaseUrl()}/api/v1/i18n/landing?locale=${locale}`;
    const fallbackMessages = FALLBACK_MESSAGES[locale] ?? FALLBACK_MESSAGES.en;
    const segmentLocale = await getSegmentLocale(locale);
    const defaultSwitcherLocales: SupportedLocale[] =
        segmentLocale === 'en' ? ['en'] : ['en', segmentLocale];

    try {
        const response = await fetch(url, {
            method: 'GET',
            next: { revalidate: 300 },
            headers: { Accept: 'application/json' },
        });

        if (!response.ok) {
            return {
                header: FALLBACK_HEADER_COPY[locale] ?? FALLBACK_HEADER_COPY.en,
                switcherLocales: defaultSwitcherLocales,
                messages: fallbackMessages,
            };
        }

        const payload = (await response.json()) as LandingDictionaryApiResponse;
        const mergedMessages = {
            ...fallbackMessages,
            ...(payload.messages ?? {}),
        };
        return {
            header: mapHeaderFromMessages(locale, mergedMessages),
            switcherLocales: normalizeSwitcherLocales(
                segmentLocale,
                payload.switcherLocales,
            ),
            messages: mergedMessages,
        };
    } catch {
        return {
            header: FALLBACK_HEADER_COPY[locale] ?? FALLBACK_HEADER_COPY.en,
            switcherLocales: defaultSwitcherLocales,
            messages: fallbackMessages,
        };
    }
}
