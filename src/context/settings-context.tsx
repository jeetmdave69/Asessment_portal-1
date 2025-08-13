'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export interface SettingsState {
  colorScheme: 'light' | 'dark' | 'system';
  contrast: 'default' | 'hight';
  direction: 'ltr' | 'rtl';
  compactLayout: boolean;
  navColor: 'integrate' | 'apparent';
  navLayout: 'vertical' | 'horizontal' | 'mini';
  primaryColor: string;
  fontFamily: string;
  fontSize: number;
}

const defaultSettings: SettingsState = {
  colorScheme: 'light',
  contrast: 'default',
  direction: 'ltr',
  compactLayout: false,
  navColor: 'integrate',
  navLayout: 'vertical',
  primaryColor: '#1976d2',
  fontFamily: 'Inter Variable',
  fontSize: 16,
};

interface SettingsContextProps {
  state: SettingsState;
  setState: (s: Partial<SettingsState>) => void;
  onReset: () => void;
  canReset: boolean;
  openDrawer: boolean;
  onOpenDrawer: () => void;
  onCloseDrawer: () => void;
}

const SettingsContext = createContext<SettingsContextProps | undefined>(undefined);

export const useSettingsContext = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettingsContext must be used within SettingsProvider');
  return ctx;
};

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setStateInternal] = useState<SettingsState>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('app-settings');
      return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
    }
    return defaultSettings;
  });
  const [openDrawer, setOpenDrawer] = useState(false);

  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(state));
  }, [state]);

  const setState = useCallback((s: Partial<SettingsState>) => {
    setStateInternal(prev => ({ ...prev, ...s }));
  }, []);

  const onReset = useCallback(() => setStateInternal(defaultSettings), []);
  const canReset = JSON.stringify(state) !== JSON.stringify(defaultSettings);

  return (
    <SettingsContext.Provider
      value={{
        state,
        setState,
        onReset,
        canReset,
        openDrawer,
        onOpenDrawer: () => setOpenDrawer(true),
        onCloseDrawer: () => setOpenDrawer(false),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}; 