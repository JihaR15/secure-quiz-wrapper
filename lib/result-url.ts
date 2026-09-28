/**
 * Teacher-supplied link to the published results sheet (Google Sheets,
 * Excel Online, anything). Shared by the API routes and the admin form so the
 * same rule applies on both sides.
 */
export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/** Turns a teacher-entered link into something presentable in the UI. */
export function describeResultHost(value: string): string {
  try {
    return new URL(value).host.replace(/^www\./, "");
  } catch {
    return value;
  }
}
