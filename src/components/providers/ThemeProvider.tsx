"use client";

import { useEffect } from "react";
import { useSettingsStore } from "@/lib/settingsStore";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSettingsStore((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      return;
    }

    if (theme === "light") {
      root.classList.remove("dark");
      return;
    }

    // system
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = (dark: boolean) =>
      dark ? root.classList.add("dark") : root.classList.remove("dark");

    apply(mql.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  return <>{children}</>;
}
