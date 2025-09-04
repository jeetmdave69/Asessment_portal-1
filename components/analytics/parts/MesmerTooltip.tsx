'use client';
import * as React from 'react';
import { Paper, Typography, Stack } from '@mui/material';

export default function MesmerTooltip({ active, label, payload, unit }:{
  active?: boolean; label?: any; payload?: any[]; unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <Paper elevation={0} sx={{
      p: 1.25, borderRadius: 2, border: '1px solid #1f2937',
      background: 'linear-gradient(180deg, rgba(2,6,23,.96), rgba(2,6,23,.88))',
      boxShadow: '0 8px 28px rgba(0,0,0,.45)',
      color: '#e5e7eb', transform: 'translateZ(0)', willChange: 'transform',
    }}>
      {label != null && (
        <Typography variant="caption" fontWeight={800} sx={{ color:'#22d3ee' }}>
          {String(label)}
        </Typography>
      )}
      <Stack spacing={.25} mt={.5}>
        {payload.map((p, i) => (
          <Typography key={i} variant="caption" sx={{ color: p.color, fontWeight: 700 }}>
            {p.name}: {p.value}{unit ?? ''}
          </Typography>
        ))}
      </Stack>
    </Paper>
  );
}
