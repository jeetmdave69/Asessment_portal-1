import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeModeProvider } from '@/providers/ThemeModeProvider';
import { SettingsProvider } from '@/context/settings-context';
import { Experimental_CssVarsProvider as CssVarsProvider } from '@mui/material/styles';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';

export const metadata = {
  title: 'OctaMind',
  description: 'AI-Based Assessment Platform',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <CssVarsProvider>
            <SettingsProvider>
              <ThemeModeProvider>
                <ClientLayoutWrapper>
                  {children}
                </ClientLayoutWrapper>
              </ThemeModeProvider>
            </SettingsProvider>
          </CssVarsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
