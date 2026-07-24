import { useState, useEffect } from "react";

const DARK  = "devtinder-dark";
const LIGHT = "devtinder-light";

/**
 * useTheme – reads/writes the DaisyUI data-theme on <html>
 * and persists choice in localStorage so it survives refresh.
 */
export function useTheme() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("devtinder-theme") || DARK;
    } catch {
      return DARK;
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("devtinder-theme", theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === DARK ? LIGHT : DARK));
  const isDark = theme === DARK;

  return { theme, isDark, toggleTheme };
}
