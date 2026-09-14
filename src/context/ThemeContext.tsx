import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  primary: string;
  primaryDark: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  textPrimary: string;
  textSecondary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  modalOverlay: string;
  accent: string;
  gold: string;
}

export const lightColors: ThemeColors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  secondary: '#3B82F6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  modalOverlay: 'rgba(0,0,0,0.55)',
  accent: '#2563EB',
  gold: '#D4AF37',
};

export const darkColors: ThemeColors = {
  primary: '#3B82F6',
  primaryDark: '#2563EB',
  secondary: '#60A5FA',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  modalOverlay: 'rgba(0,0,0,0.85)',
  accent: '#3B82F6',
  gold: '#D4AF37',
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: (value?: boolean) => void;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType>({
  isDarkMode: false,
  toggleDarkMode: () => {},
  colors: lightColors,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('app_theme_dark').then((val) => {
      if (val !== null) {
        setIsDarkMode(val === 'true');
      } else {
        setIsDarkMode(false);
      }
    }).catch(() => {});
  }, []);

  const toggleDarkMode = (value?: boolean) => {
    setIsDarkMode((prev) => {
      const nextVal = value !== undefined ? value : !prev;
      AsyncStorage.setItem('app_theme_dark', nextVal ? 'true' : 'false').catch(() => {});
      return nextVal;
    });
  };

  const colors = isDarkMode ? darkColors : lightColors;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
