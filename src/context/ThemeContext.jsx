import React, { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  // Always light theme
  const theme = "light";

  useEffect(() => {
    // Enforce light theme on mount
    const root = document.documentElement;
    root.classList.remove("dark");
    localStorage.setItem("ebp_theme", "light");
  }, []);

  const toggleTheme = () => {
    // No-op
  };

  const value = {
    theme,
    isDark: false,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
