'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';
import { Box, Paper, Typography, Skeleton } from '@mui/material';

export type ScoreSlice = { 
  name: 'Correct' | 'Incorrect' | 'Skipped'; 
  value: number 
};

type Props = {
  title?: string;
  subtitle?: string;
  data: ScoreSlice[] | null | undefined;
  height?: number;
  compact?: boolean;
};

const palette = {
  title: '#002366',
  correct: '#16a34a',
  incorrect: '#dc2626',
  skipped: '#f59e0b',
  text: '#0b1a34',
  secondary: '#6b7280',
};

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  return (
    <Paper elevation={0} sx={{
      px: 1.5, py: 1, borderRadius: 2,
      border: '1px solid rgba(15,23,42,.08)', 
      boxShadow: '0 8px 20px rgba(2,6,23,.08)',
      bgcolor: '#fff',
    }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: palette.title, mb: .5 }}>
        {data.name}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        Count: <b>{data.value}</b>
      </Typography>
    </Paper>
  );
}

export default function PremiumScoreDonut({
  title = 'Score Composition',
  subtitle = 'Correct, Incorrect, and Skipped questions',
  data,
  height,
  compact,
}: Props) {
  const h = height ?? (compact ? 300 : 340);

  // Empty/skeleton state
  if (!data) {
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: palette.title, mb: .5 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        <Box sx={{ mt: 2 }}>
          <Skeleton variant="rounded" height={h} />
        </Box>
      </Box>
    );
  }
  if (data.length === 0) {
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: palette.title, mb: .5 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        <Paper sx={{ mt: 2, p: 3, textAlign: 'center', borderRadius: 3, border: '1px solid rgba(15,23,42,.08)' }}>
          <Typography variant="body2" color="text.secondary">No score data available.</Typography>
        </Paper>
      </Box>
    );
  }

  const total = data.reduce((sum, item) => sum + (item?.value || 0), 0);
  const correct = data.find(d => d.name === 'Correct')?.value || 0;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 800, color: palette.title, mb: .5 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">{subtitle}</Typography>

      <Box sx={{
        mt: 1.5,
        height: h,
        borderRadius: 3,
        overflow: 'hidden',
        position: 'relative',
        background:
          'radial-gradient(1000px 400px at 90% -20%, rgba(22,163,74,.06), transparent 55%),' +
          'repeating-linear-gradient(135deg, rgba(2,6,23,.03) 0px, rgba(2,6,23,.03) 1px, transparent 1px, transparent 10px)',
        border: '1px solid rgba(15,23,42,.08)',
        boxShadow: '0 8px 28px rgba(2,6,23,.06)',
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {/* Soft drop shadow */}
              <filter id="donutShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity=".15" floodColor="#1f2937" />
              </filter>
            </defs>

            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius={80}
              outerRadius={104}
              paddingAngle={2}
              cornerRadius={6}
              style={{ filter: 'url(#donutShadow)' }}
            >
              <Cell fill={palette.correct} />
              <Cell fill={palette.incorrect} />
              <Cell fill={palette.skipped} />
            </Pie>

            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              align="center"
              iconType="circle"
              wrapperStyle={{ paddingTop: 16, fontSize: 12, color: '#64748b' }}
            />

            {/* Center KPI */}
            <foreignObject x="36%" y="36%" width="28%" height="28%">
              <Box sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
              }}>
                <Typography variant="h3" fontWeight={900} sx={{ 
                  color: palette.correct, 
                  lineHeight: 1,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {percentage}%
                </Typography>
                <Typography variant="caption" sx={{ 
                  color: palette.secondary, 
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5
                }}>
                  Correct
                </Typography>
              </Box>
            </foreignObject>
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
