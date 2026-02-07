
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { storage } from '@/utils/storage';

type ThemeMode = 'system' | 'light' | 'dark';
type AccentColor = 'blue' | 'green' | 'purple';

interface ThemeContextType {
  themeMode: ThemeMode;
  accentColor: AccentColor;
  effectiveColorScheme: 'light' | 'dark';
  setThemeMode: (mode: ThemeMode) => void;
  setAccentColor: (color: AccentColor) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_MODE_KEY = 'did_i_log_it_theme_mode';
const ACCENT_COLOR_KEY = 'did_i_log_it_accent_color';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [accentColor, setAccentColorState] = useState<AccentColor>('blue');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load theme preferences from storage
  useEffect(() => {
    loadThemePreferences();
  }, []);

  const loadThemePreferences = async () => {
    try {
      const savedThemeMode = await storage.getItem(THEME_MODE_KEY);
      const savedAccentColor = await storage.getItem(ACCENT_COLOR_KEY);

      if (savedThemeMode) {
        setThemeModeState(savedThemeMode as ThemeMode);
        console.log('Loaded theme mode from storage:', savedThemeMode);
      }

      if (savedAccentColor) {
        setAccentColorState(savedAccentColor as AccentColor);
        console.log('Loaded accent color from storage:', savedAccentColor);
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading theme preferences:', error);
      setIsLoaded(true);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    console.log('User changed theme mode to:', mode);
    setThemeModeState(mode);
    try {
      await storage.setItem(THEME_MODE_KEY, mode);
      console.log('Theme mode saved to storage:', mode);
    } catch (error) {
      console.error('Error saving theme mode:', error);
    }
  };

  const setAccentColor = async (color: AccentColor) => {
    console.log('User changed accent color to:', color);
    setAccentColorState(color);
    try {
      await storage.setItem(ACCENT_COLOR_KEY, color);
      console.log('Accent color saved to storage:', color);
    } catch (error) {
      console.error('Error saving accent color:', error);
    }
  };

  // Calculate effective color scheme based on theme mode
  const effectiveColorScheme: 'light' | 'dark' =
    themeMode === 'system'
      ? systemColorScheme ?? 'light'
      : themeMode;

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        accentColor,
        effectiveColorScheme,
        setThemeMode,
        setAccentColor,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
