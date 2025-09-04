import { ReactNode } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { ThemeModeProvider } from '@/providers/ThemeModeProvider';

export const metadata = {
  title: 'OctoMind By F13 Technologies',
  description: 'OctoMind By F13 Technologies - Create and manage assessments easily',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeModeProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            {children}
          </LocalizationProvider>
        </ThemeModeProvider>
      </body>
    </html>
  );
}
