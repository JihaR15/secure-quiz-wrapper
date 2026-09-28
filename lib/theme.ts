export type Theme = "dark" | "light";

export const THEME_STORAGE_KEY = "quiz_theme";

/** Fired in-tab after applyTheme, because the storage event only fires cross-tab. */
export const THEME_CHANGE_EVENT = "quiz:theme-change";

export function isTheme(value: unknown): value is Theme {
  return value === "dark" || value === "light";
}

/**
 * The exam runner defaults to light. The form underneath is a Google Form and
 * almost always renders light, so a dark shell around it is jarring, and a
 * lit page is the least suspicious thing to put in front of a student. An
 * explicit choice in localStorage still wins.
 */
function defaultThemeForPath(pathname: string): Theme {
  return pathname.startsWith("/quiz") ? "light" : "dark";
}

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (isTheme(saved)) return saved;
  const routeDefault = defaultThemeForPath(window.location.pathname);
  if (routeDefault === "light") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function readCurrentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.style.colorScheme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}

/**
 * Runs before first paint so the correct theme is on <html> with no flash.
 * Mirrors `getInitialTheme` + `applyTheme` and must stay dependency-free.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});var onRunner=location.pathname.indexOf("/quiz")===0;var t=(s==="dark"||s==="light")?s:(onRunner?"light":(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"));var r=document.documentElement;r.classList.remove("dark","light");r.classList.add(t);r.style.colorScheme=t;}catch(e){}})();`;
