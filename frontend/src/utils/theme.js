/**
 * Place Mentor Theme Utility
 * Supports 'light' | 'dark' | 'system' modes.
 * Synchronizes documentElement class, <meta name="theme-color">, and localStorage.
 */

export const THEME_COLOR_LIGHT = "#F7F8FA";
export const THEME_COLOR_DARK = "#0A1210";

export function getStoredTheme() {
  if (typeof window === "undefined") return "system";
  try {
    return localStorage.getItem("theme") || "system";
  } catch {
    return "system";
  }
}

export function getSystemIsDark() {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function resolveIsDark(themePreference) {
  if (themePreference === "dark") return true;
  if (themePreference === "light") return false;
  return getSystemIsDark();
}

export function updateMetaThemeColor(isDark) {
  if (typeof document === "undefined") return;
  let meta = document.querySelector('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", isDark ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
}

export function applyTheme(themePreference) {
  if (typeof document === "undefined") return;
  const isDark = resolveIsDark(themePreference);

  if (isDark) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }

  updateMetaThemeColor(isDark);

  try {
    localStorage.setItem("theme", themePreference);
  } catch {}

  // Dispatch custom event for cross-component sync
  window.dispatchEvent(
    new CustomEvent("placemetor-theme-change", {
      detail: { theme: themePreference, isDark },
    })
  );
}

export function initTheme() {
  const current = getStoredTheme();
  applyTheme(current);

  // Listen to system preference changes if in system mode
  if (typeof window !== "undefined" && window.matchMedia) {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (getStoredTheme() === "system") {
        applyTheme("system");
      }
    };
    mq.addEventListener?.("change", handler);
  }
}
