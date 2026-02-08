'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemePreference } from '@/types';

interface ThemeContextType {
  theme: ThemePreference;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'enfinotes-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(storageKey) as ThemePreference | null;
    if (stored && (stored === 'dark' || stored === 'light')) {
      setThemeState(stored);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem(storageKey, theme);
  }, [theme, mounted, storageKey]);

  const setTheme = (newTheme: ThemePreference) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return (
      <div style={{ visibility: 'hidden' }}>
        {children}
      </div>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
