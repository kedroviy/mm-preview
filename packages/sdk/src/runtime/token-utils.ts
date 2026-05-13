/**
 * JWT payload decode without signature verification — suitable only for reading
 * claims (e.g. redirect UX). Does not validate authenticity.
 *
 * Works in Edge middleware (no Node `Buffer`), browser, and Node.
 */
export function decodeJWT(token: string): Record<string, unknown> | null {
	const parts = token.split(".");
	if (parts.length !== 3) return null;

	const segment = parts[1];
	const base64 = segment.replace(/-/g, "+").replace(/_/g, "/");
	const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

	try {
		let json: string;
		if (typeof atob === "function") {
			const binary = atob(padded);
			const bytes = new Uint8Array(binary.length);
			for (let i = 0; i < binary.length; i++) {
				bytes[i] = binary.charCodeAt(i);
			}
			json = new TextDecoder().decode(bytes);
		} else if (typeof Buffer !== "undefined") {
			json = Buffer.from(padded, "base64").toString("utf8");
		} else {
			return null;
		}

		const parsed: unknown = JSON.parse(json);
		return typeof parsed === "object" &&
			parsed !== null &&
			!Array.isArray(parsed)
			? (parsed as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
}

/**
 * Returns a leading-dot cookie domain so cookies can be shared across subdomains
 * (e.g. `start.example.com` → `.example.com`). Returns `null` for localhost and IPs.
 */
export function getCookieDomain(hostname: string): string | null {
	const h = hostname.trim().toLowerCase();
	if (!h) return null;
	if (h === "localhost" || /^(\d{1,3}\.){3}\d{1,3}$/.test(h)) {
		return null;
	}
	const segments = h.split(".");
	if (segments.length < 2) return null;
	return `.${segments.slice(-2).join(".")}`;
}
