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
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemePreference;
  storageKey?: string;
}

function getInitialTheme(defaultTheme: ThemePreference, storageKey: string): ThemePreference {
  if (typeof window === 'undefined') return defaultTheme;
  try {
    const stored = localStorage.getItem(storageKey) as ThemePreference | null;
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {}
  return defaultTheme;
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  storageKey = 'enfinotes-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemePreference>(() =>
    getInitialTheme(defaultTheme, storageKey)
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch {}
  }, [theme, storageKey]);

  const setTheme = (newTheme: ThemePreference) => setThemeState(newTheme);
  const toggleTheme = () => setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
