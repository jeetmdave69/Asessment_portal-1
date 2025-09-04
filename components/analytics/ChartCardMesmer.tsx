'use client';
import * as React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

export default function ChartCardMesmer({
  title, subtitle, action, children,
}: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode }) {
  const reduceMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  return (
    <Card
      elevation={0}
      sx={{
        position: 'relative',
        borderRadius: 4,
        color: '#e5e7eb',
        background: 'rgba(17,24,39,0.65)',
        backdropFilter: 'blur(10px)',
        overflow: 'hidden',
        boxShadow: '0 10px 40px rgba(2,6,23,.35)',
        // animated neon border
        '&::before': {
          content: '""', position: 'absolute', inset: 0, padding: '1px', borderRadius: 4,
          background: 'conic-gradient(from 0deg, #22d3ee, #3b82f6, #34d399, #a78bfa, #22d3ee)',
          WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          WebkitMaskComposite: 'xor', maskComposite: 'exclude',
          animation: reduceMotion ? undefined : 'spin 7s linear infinite',
        },
        // faint diagonal hatch
        '&::after': {
          content: '""', position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(135deg, rgba(255,255,255,.03) 0 6px, transparent 6px 12px)',
          pointerEvents: 'none',
        },
        '@keyframes spin': { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.25}>
          <Box>
            <Typography variant="subtitle1" fontWeight={900} sx={{ color:'#22d3ee', letterSpacing:.3 }}>
              {title}
            </Typography>
            {subtitle && <Typography variant="caption" sx={{ color:'#94a3b8' }}>{subtitle}</Typography>}
          </Box>
          {action}
        </Box>
        {children}
      </CardContent>
    </Card>
  );
}
