'use client';

import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeModeProvider } from '@/providers/ThemeModeProvider';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { SettingsProvider } from '@/context/settings-context';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import PageTransitionLoader from '../components/PageTransitionLoader';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const prevPath = useRef(pathname);

  useEffect(() => {
    if (prevPath.current !== pathname) {
      setLoading(true);
      // Simulate a short transition delay; replace with real data loading if needed
      const timer = setTimeout(() => setLoading(false), 700);
      prevPath.current = pathname;
      return () => clearTimeout(timer);
    }
  }, [pathname]);

  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <CssVarsProvider>
            <SettingsProvider>
              <ThemeModeProvider>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                  {loading && <PageTransitionLoader />}
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
