import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { ThemeType, darkTheme, lightTheme } from './colors';

type Preference = 'light' | 'dark' | 'system';

type ThemeContextValue = {
  theme: ThemeType;
  themePreference: Preference;
  setThemePreference: (pref: Preference) => void;
  activeMode: 'light' | 'dark';
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'themePreference';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<Preference>('system');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === 'light' || value === 'dark' || value === 'system') {
        setThemePreferenceState(value);
      }
      setLoaded(true);
    });
  }, []);

  const setThemePreference = async (pref: Preference) => {
    setThemePreferenceState(pref);
    await AsyncStorage.setItem(STORAGE_KEY, pref);
  };

  const activeMode: 'light' | 'dark' =
    themePreference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePreference;

  const theme = activeMode === 'dark' ? darkTheme : lightTheme;

  if (!loaded) return null;

  return (
    <ThemeContext.Provider value={{ theme, themePreference, setThemePreference, activeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
