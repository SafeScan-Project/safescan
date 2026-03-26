"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch by only rendering after mounting
    useEffect(() => setMounted(true), []);
    if (!mounted) return null;

    return (
        <button
            type="button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors"
            aria-label="Toggle Dark Mode"
        >
            {theme === "dark" ? (
                <FaSun className="text-yellow-400" />
            ) : (
                <FaMoon className="text-blue-600" />
            )}
        </button>
    );
}
