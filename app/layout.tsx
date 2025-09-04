import { ReactNode } from 'react';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeModeProvider } from '../src/providers/ThemeModeProvider';
import { SettingsProvider } from '../src/context/settings-context';
import ClientLayoutWrapper from '../components/ClientLayoutWrapper';
import { Inter } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'OctoMind By F13 Technologies',
  description: 'OctoMind By F13 Technologies - AI-Based Assessment Platform',
  icons: {
    icon: '/OCTOMIND LOOG (4).svg',
    shortcut: '/OCTOMIND LOOG (4).svg',
    apple: '/OCTOMIND LOOG (4).svg',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
                  return (
                  <ClerkProvider
                    signInUrl="/sign-in"
                    signUpUrl="/sign-up"
                    afterSignInUrl="/dashboard"
                    afterSignUpUrl="/dashboard"
                  >
                    <html lang="en" className={inter.variable}>
                      <head>
                        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
                        <style dangerouslySetInnerHTML={{
                          __html: `
                            body {
                              background-color: #060818;
                              color: #e0e0e0;
                              margin: 0;
                              padding: 0;
                              font-family: 'Inter', sans-serif;
                            }
                          `
                        }} />
                      </head>
                      <body className={inter.className}>
                        <SettingsProvider>
                          <ThemeModeProvider>
                            <ClientLayoutWrapper>
                              {children}
                            </ClientLayoutWrapper>
                          </ThemeModeProvider>
                        </SettingsProvider>
                      </body>
                    </html>
                  </ClerkProvider>
                );
}
