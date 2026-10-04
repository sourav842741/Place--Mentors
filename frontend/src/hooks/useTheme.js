import { useState, useEffect, useCallback } from "react";
import { getStoredTheme, resolveIsDark, applyTheme } from "../utils/theme";

export function useTheme() {
  const [theme, setThemeState] = useState(() => getStoredTheme());
  const [isDark, setIsDarkState] = useState(() => resolveIsDark(getStoredTheme()));

  useEffect(() => {
    const handleSync = () => {
      const stored = getStoredTheme();
      setThemeState(stored);
      setIsDarkState(resolveIsDark(stored));
    };

    window.addEventListener("placemetor-theme-change", handleSync);
    window.addEventListener("storage", handleSync);

    const mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;
    mq?.addEventListener?.("change", handleSync);

    return () => {
      window.removeEventListener("placemetor-theme-change", handleSync);
      window.removeEventListener("storage", handleSync);
      mq?.removeEventListener?.("change", handleSync);
    };
  }, []);

  const setTheme = useCallback((newTheme) => {
    applyTheme(newTheme);
    setThemeState(newTheme);
    setIsDarkState(resolveIsDark(newTheme));
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = isDark ? "light" : "dark";
    setTheme(nextTheme);
  }, [isDark, setTheme]);

  return { theme, isDark, setTheme, toggleTheme };
}

export default useTheme;
