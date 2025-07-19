import { useInitTheme } from "../hooks/useInitTheme";

export default function ThemeSlider() {
    const { theme, toggleTheme } = useInitTheme();

    const labelStyle = `${theme === "dark" ? "opacity-60" : "opacity-100"} top-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-opacity duration-200`

    return (
        <button
            type="button"
            aria-label={`Activate ${theme === "dark" ? "light" : "dark"} mode`}
            aria-pressed={theme === "dark"}
            onClick={toggleTheme}
            className=" relative inline-flex h-9 w-18 items-center rounded-full bg-bg-tertiary dark:bg-bg-secondary transition-colors duration-200 outline-none ring-2 ring-ring-accent shadow-sm group select-none touch-manipulation hover:scale-minimal cursor-pointer"
            style={{ minWidth: 44, minHeight: 24 }}
        >
            <span className={`${labelStyle} absolute left-2.5 text-text-white`}>
                On
            </span>
            <span className={`${labelStyle} absolute right-2.5 text-text-primary`}>
                Off
            </span>
            <span
                className={`${theme === "dark" ? "translate-x-9" : "translate-x-0"} absolute top-1 left-1 h-7 w-7 rounded-full bg-button shadow transition-transform duration-200`}
                style={{ boxShadow: "var(--shadow)" }}
            />
        </button>
    );
}
