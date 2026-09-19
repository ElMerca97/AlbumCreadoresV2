import { useEffect } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type Theme = "dark" | "light";

type UIState = {
  theme: Theme;
  /** vista del álbum: hoja estilo Panini o cuadrícula */
  albumView: "panini" | "grid";
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  setAlbumView: (v: "panini" | "grid") => void;
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      albumView: "panini",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "dark" ? "light" : "dark" }),
      setAlbumView: (albumView) => set({ albumView }),
    }),
    {
      name: "maldonadocards:ui",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ theme: s.theme, albumView: s.albumView }),
    },
  ),
);

/** Aplica el tema al <html> (usar una sola vez en App). */
export function useThemeEffect() {
  const theme = useUIStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
}
