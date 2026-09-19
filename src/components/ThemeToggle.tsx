import { useUIStore } from "@/store/uiStore";
import { cn } from "@/utils/cn";

export default function ThemeToggle({ className }: { className?: string }) {
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Pasar a modo claro" : "Pasar a modo oscuro"}
      aria-label="Cambiar tema"
      className={cn(
        "group relative flex h-9 w-16 items-center rounded-full border border-line bg-panel-2 px-1 transition",
        className,
      )}
    >
      <span
        className={cn(
          "absolute flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-[13px] shadow transition-transform duration-300",
          isDark
            ? "translate-x-0 from-slate-700 to-slate-900"
            : "translate-x-7 from-amber-300 to-orange-400",
        )}
      >
        {isDark ? "🌙" : "☀️"}
      </span>
      <span className="ml-auto mr-1.5 font-display text-[9px] tracking-widest text-faint">
        {isDark ? "OFF" : "ON"}
      </span>
    </button>
  );
}
