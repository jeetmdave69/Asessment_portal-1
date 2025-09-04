'use client';
import * as React from 'react';
import { Box } from '@mui/material';

export default function AuroraBackdrop() {
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <Box
      aria-hidden
      sx={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        // soft aurora blobs + vignette
        '&::before': {
          content: '""', position: 'absolute', inset: '-20%',
          background:
            'radial-gradient(1200px 600px at 10% 20%, rgba(34,211,238,.18), transparent 60%),' +
            'radial-gradient(900px 500px at 85% 30%, rgba(167,139,250,.18), transparent 60%),' +
            'radial-gradient(800px 700px at 50% 100%, rgba(16,185,129,.14), transparent 60%)',
          filter: 'blur(20px)',
          animation: reduceMotion ? undefined : 'aurora 18s ease-in-out infinite',
        },
        '&::after': {
          content: '""', position: 'absolute', inset: 0,
          background:
            'radial-gradient(ellipse at center, rgba(0,0,0,.25), rgba(0,0,0,.6) 70%)',
        },
        '@keyframes aurora': {
          '0%':   { transform: 'translate3d(0,0,0) scale(1.0)' },
          '50%':  { transform: 'translate3d(0,-2%,0) scale(1.03)' },
          '100%': { transform: 'translate3d(0,0,0) scale(1.0)' },
        },
      }}
    />
  );
}
