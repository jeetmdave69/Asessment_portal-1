'use client';

import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeModeProvider } from '@/providers/ThemeModeProvider';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SettingsProvider } from '@/context/settings-context';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <CssVarsProvider>
            <SettingsProvider>
              <ThemeModeProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {children}
                </LocalizationProvider>
              </ThemeModeProvider>
            </SettingsProvider>
          </CssVarsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
