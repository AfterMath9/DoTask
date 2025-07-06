import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'pink' | 'teal' | 'indigo';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  themes: { value: Theme; label: string; description: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const themes = [
  { value: 'light' as Theme, label: 'Light', description: 'Clean and bright interface' },
  { value: 'dark' as Theme, label: 'Dark', description: 'Easy on the eyes' },
  { value: 'blue' as Theme, label: 'Ocean Blue', description: 'Professional blue theme' },
  { value: 'green' as Theme, label: 'Forest Green', description: 'Nature-inspired green theme' },
  { value: 'purple' as Theme, label: 'Royal Purple', description: 'Elegant purple theme' },
  { value: 'orange' as Theme, label: 'Sunset Orange', description: 'Warm orange theme' },
  { value: 'red' as Theme, label: 'Crimson Red', description: 'Bold and energetic red theme' },
  { value: 'yellow' as Theme, label: 'Golden Yellow', description: 'Bright and cheerful yellow theme' },
  { value: 'pink' as Theme, label: 'Rose Pink', description: 'Soft and modern pink theme' },
  { value: 'teal' as Theme, label: 'Aqua Teal', description: 'Refreshing teal theme' },
  { value: 'indigo' as Theme, label: 'Deep Indigo', description: 'Rich and sophisticated indigo theme' },
];

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('taskflow-theme');
    return (saved as Theme) || 'light';
  });

  useEffect(() => {
    localStorage.setItem('taskflow-theme', theme);
    
    // Remove all theme classes
    const root = document.documentElement;
    themes.forEach(t => {
      root.classList.remove(`theme-${t.value}`);
    });
    
    // Add current theme class
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};