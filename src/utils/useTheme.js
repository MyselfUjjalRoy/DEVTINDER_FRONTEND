import { useEffect } from "react";

const DARK = "devtinder-dark";

export function useTheme() {
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", DARK);
    try {
      localStorage.setItem("devtinder-theme", DARK);
    } catch {}
  }, []);

  return { theme: DARK, isDark: true, toggleTheme: () => {} };
}

