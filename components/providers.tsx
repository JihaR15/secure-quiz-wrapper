"use client";

import * as React from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Language, Translation, translations } from "@/lib/i18n";
import {
  THEME_CHANGE_EVENT,
  Theme,
  applyTheme,
  readCurrentTheme,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
  t: Translation;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const LanguageContext = React.createContext<LanguageContextValue | null>(null);

const LANGUAGE_STORAGE_KEY = "quiz_language";

/**
 * Theme and language are external systems (the DOM class and localStorage), so
 * they are read through `useSyncExternalStore` instead of state + effect. The
 * blocking script in app/layout.tsx already resolved the theme before paint, so
 * the snapshot only has to read the class back — no flash, and both the header
 * and the runner stay in sync.
 */
const SERVER_THEME: Theme = "dark";
const SERVER_LANGUAGE: Language = "id";

const languageListeners = new Set<() => void>();

function notifyLanguage() {
  for (const listener of languageListeners) listener();
}

function subscribeLanguage(onStoreChange: () => void) {
  languageListeners.add(onStoreChange);
  return () => languageListeners.delete(onStoreChange);
}

function getLanguageSnapshot(): Language {
  const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (saved === "id" || saved === "en") return saved;
  return window.navigator.language.toLowerCase().startsWith("id") ? "id" : "en";
}

function subscribeTheme(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getThemeSnapshot(): Theme {
  return readCurrentTheme();
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(
    subscribeTheme,
    getThemeSnapshot,
    () => SERVER_THEME,
  );

  const setTheme = React.useCallback((next: Theme) => {
    applyTheme(next);
  }, []);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme,
      toggleTheme: () => setTheme(theme === "dark" ? "light" : "dark"),
    }),
    [theme, setTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = React.useSyncExternalStore(
    subscribeLanguage,
    getLanguageSnapshot,
    () => SERVER_LANGUAGE,
  );

  const setLanguage = React.useCallback((next: Language) => {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    notifyLanguage();
  }, []);

  const value = React.useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      toggleLanguage: () => setLanguage(language === "id" ? "en" : "id"),
      t: translations[language],
    }),
    [language, setLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const context = React.useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <AppProviders>");
  return context;
}

export function useLanguage(): LanguageContextValue {
  const context = React.useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used inside <AppProviders>");
  return context;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <TooltipProvider delayDuration={200}>
          {children}
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
