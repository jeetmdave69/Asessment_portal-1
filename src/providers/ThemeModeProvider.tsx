'use client';

import { ReactNode, createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ThemeMode = 'light' | 'dark';

type ThemeModeContextType = {
  mode: ThemeMode;
  toggleMode: () => void;
};

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

// Custom hook to use the context
export const useThemeMode = (): ThemeModeContextType => {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return context;
};

// Theme mode provider
export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('light');

  useEffect(() => {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    if (savedMode === 'dark' || savedMode === 'light') {
      setMode(savedMode);
    } else {
      // Default to light mode if no saved preference
      setMode('light');
    }
  }, []);

  const toggleMode = () => {
    setMode((prevMode) => {
      const nextMode = prevMode === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', nextMode);
      return nextMode;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: '#2563eb' },
          secondary: { main: '#0ea5a6' },
          success: { main: '#22C55E' },
          warning: { main: '#FACC15' },
          error: { main: '#EF4444' },
          ...(mode === 'dark' && {
            text: { 
              primary: '#E5E7EB', 
              secondary: '#E5E7EB',
              disabled: '#9CA3AF'
            },
            divider: '#2A2A2A',
            background: { 
              default: '#0D0D0D', 
              paper: '#1E1E1E' 
            },
            action: {
              hover: '#2A2A2A',
              selected: 'rgba(37, 99, 235, 0.12)',
              disabled: 'rgba(255,255,255,0.12)'
            },
            grey: {
              50: '#1E1E1E',
              100: '#2A2A2A',
              200: '#2E2E2E',
              300: '#3A3A3A',
              400: '#4A4A4A',
              500: '#6B6B6B',
              600: '#8A8A8A',
              700: '#9CA3AF',
              800: '#C4C4C4',
              900: '#E5E7EB'
            }
          }),
          ...(mode === 'light' && {
            text: { primary: '#111827', secondary: '#6b7280' },
            divider: 'rgba(15,23,42,0.08)',
            background: { default: '#f9fafb', paper: '#ffffff' },
          }),
        },
        shape: { borderRadius: 14 },
        typography: {
          fontFamily: 'var(--font-inter), "Inter", "SF Pro Text", "Segoe UI", system-ui, Arial, sans-serif',
          h4: { fontWeight: 700, letterSpacing: '-0.025em' },
          h6: { fontWeight: 700, letterSpacing: '-0.025em' },
          subtitle1: { fontWeight: 600, letterSpacing: '-0.025em' },
          button: { textTransform: 'none', fontWeight: 700, letterSpacing: '-0.025em' },
          body1: { letterSpacing: '-0.025em' },
          body2: { letterSpacing: '-0.025em' },
          caption: { letterSpacing: '-0.025em' },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                border: mode === 'dark' 
                  ? '1px solid #2A2A2A' 
                  : '1px solid rgba(15,23,42,0.08)',
                boxShadow: mode === 'dark' 
                  ? '0 4px 16px rgba(0,0,0,0.4)' 
                  : '0 2px 10px rgba(2,6,23,0.04)',
                backgroundColor: mode === 'dark' ? '#1E1E1E' : '#ffffff',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? '#1E1E1E' : '#ffffff',
                border: mode === 'dark' 
                  ? '1px solid #2A2A2A' 
                  : '1px solid rgba(15,23,42,0.08)',
                borderRadius: 12,
                '&:hover': {
                  backgroundColor: mode === 'dark' ? '#2A2A2A' : '#f8fafc',
                  transform: 'translateY(-2px)',
                  boxShadow: mode === 'dark' 
                    ? '0 8px 24px rgba(0,0,0,0.5)' 
                    : '0 4px 16px rgba(2,6,23,0.08)',
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                '&:focus-visible': {
                  outline: `2px solid ${mode === 'dark' ? '#2563eb' : '#2563eb'}`,
                  outlineOffset: '2px',
                },
                '&.MuiButton-outlined': {
                  borderColor: mode === 'dark' ? '#2A2A2A' : 'rgba(15,23,42,0.08)',
                  color: mode === 'dark' ? '#E5E7EB' : 'inherit',
                  '&:hover': {
                    backgroundColor: mode === 'dark' ? '#2A2A2A' : 'rgba(15,23,42,0.04)',
                    borderColor: mode === 'dark' ? '#2A2A2A' : 'rgba(15,23,42,0.12)',
                  },
                },
              },
            },
          },
          MuiChip: { 
            styleOverrides: { 
              root: { borderRadius: 999 } 
            } 
          },
        },
      }),
    [mode]
  );

  return (
    <ThemeModeContext.Provider value={{ mode, toggleMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
}
