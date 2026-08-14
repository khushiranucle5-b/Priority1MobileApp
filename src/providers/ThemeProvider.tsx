import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { colors, darkColors } from '../theme/colors';
import { spacing } from '../theme/tokens/spacing';
import { typography } from '../theme/tokens/typography';
import { borderRadius } from '../theme/tokens/borderRadius';
import { shadows } from '../theme/tokens/shadows';

export type ThemeType = 'light' | 'dark';

export interface ThemeTokens {
  colors: typeof colors;
  spacing: typeof spacing;
  typography: typeof typography;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
}

interface ThemeContextType extends ThemeTokens {
  theme: ThemeType;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Tokens that don't change between light/dark
const staticTokens = { spacing, typography, borderRadius, shadows };

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorScheme = useColorScheme();
  const [theme, setTheme] = useState<ThemeType>(colorScheme === 'dark' ? 'dark' : 'light');

  useEffect(() => {
    setTheme(colorScheme === 'dark' ? 'dark' : 'light');
  }, [colorScheme]);

  const toggleTheme = () => setTheme(prev => (prev === 'light' ? 'dark' : 'light'));

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    colors: theme === 'light' ? colors : darkColors,
    ...staticTokens,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
