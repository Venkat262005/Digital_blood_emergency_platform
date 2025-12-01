import React from "react";
import { useTheme } from "../context/ThemeContext.jsx";
import { FaMoon, FaSun } from "react-icons/fa";

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex items-center gap-1 rounded-full border border-slate-300 dark:border-slate-600 px-2.5 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-100 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-sm"
    >
      {isDark ? (
        <>
          <FaSun className="text-xs" />
          Light
        </>
      ) : (
        <>
          <FaMoon className="text-xs" />
          Dark
        </>
      )}
    </button>
  );
}

export default ThemeToggle;
