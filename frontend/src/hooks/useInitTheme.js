import { useEffect, useState, useCallback } from "react";

export function useInitTheme() {
    const getInitialTheme = () => {
        if (typeof window === "undefined") return "light";
        const stored = localStorage.getItem('theme');
        if (stored === "dark" || stored === "light") return stored;
        return "light";
    };

    const [theme, setTheme] = useState(getInitialTheme);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    }, []);

    return { theme, toggleTheme };
}
