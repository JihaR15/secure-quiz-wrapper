export function encodeFormUrl(url: string): string {
  try {
    return encodeURIComponent(btoa(url));
  } catch {
    return encodeURIComponent(url);
  }
}

export function decodeFormUrl(encoded: string): string {
  try {
    const decoded = atob(decodeURIComponent(encoded));
    return ensureEmbeddedUrl(decoded);
  } catch {
    return ensureEmbeddedUrl(decodeURIComponent(encoded));
  }
}

export function ensureEmbeddedUrl(url: string): string {
  if (!url) return "";
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has("embedded")) {
      parsed.searchParams.set("embedded", "true");
    }
    return parsed.toString();
  } catch {
    if (url.includes("?")) {
      return url.includes("embedded=true") ? url : `${url}&embedded=true`;
    }
    return `${url}?embedded=true`;
  }
}
