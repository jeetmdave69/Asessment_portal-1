'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PageTransitionLoader from './PageTransitionLoader';

interface ClientLayoutWrapperProps {
  children: ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prevPath = useRef(pathname);

  // Ensure component is mounted before showing any dynamic content
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && prevPath.current !== pathname) {
      setLoading(true);
      // Simulate a short transition delay; replace with real data loading if needed
      const timer = setTimeout(() => setLoading(false), 700);
      prevPath.current = pathname;
      return () => clearTimeout(timer);
    }
  }, [pathname, mounted]);

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        {children}
      </LocalizationProvider>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {loading && <PageTransitionLoader />}
      {children}
    </LocalizationProvider>
  );
}
