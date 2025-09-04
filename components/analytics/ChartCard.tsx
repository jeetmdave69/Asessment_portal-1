'use client';

import * as React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import { designTokens } from '../../theme/design-tokens';

type Props = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
  compact?: boolean;
};

export default function ChartCard({
  title,
  subtitle,
  children,
  height,
  compact,
}: Props) {
  const h = height ?? (compact ? 300 : 450);

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '24px',
        border: '2px solid rgba(15,23,42,0.06)',
        boxShadow: '0 16px 60px rgba(2,6,23,.06), 0 0 0 1px rgba(15,23,42,0.03)',
        background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 50%, #f8fafc 100%)',
        overflow: 'hidden',
        transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, #0d9488, #4f46e5, #7c3aed)',
          borderRadius: '24px 24px 0 0',
        },
        '&:hover': {
          transform: 'translateY(-3px)',
          boxShadow: '0 24px 80px rgba(2,6,23,.08), 0 0 0 1px rgba(15,23,42,0.06)',
          borderColor: 'rgba(13, 148, 136, 0.15)',
        },
      }}
    >
      <Box sx={{ 
        p: { xs: 3, md: 4 },
        background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(250,251,252,0.95) 100%)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(15,23,42,0.04)',
      }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            color: '#0f172a',
            mb: subtitle ? 1 : 2,
            lineHeight: 1.2,
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            letterSpacing: '-0.025em',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="subtitle1"
            color="#475569"
            sx={{ 
              mb: 2, 
              fontSize: '0.95rem',
              fontWeight: 500,
              letterSpacing: '0.02em',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      
      <Box sx={{ 
        height: h, 
        px: { xs: 2, md: 3 }, 
        pb: { xs: 2, md: 3 },
        background: 'linear-gradient(135deg, rgba(250,251,252,0.6) 0%, rgba(255,255,255,0.9) 100%)',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(400px 300px at 50% 50%, rgba(13, 148, 136, 0.02) 0%, transparent 60%)',
          pointerEvents: 'none',
        }
      }}>
        {children}
      </Box>
    </Paper>
  );
}
