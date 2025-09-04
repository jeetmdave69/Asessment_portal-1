'use client';

import * as React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Box, Paper, Typography, Skeleton } from '@mui/material';

export type TimeData = { 
  q: number; 
  timeSec: number 
};

type Props = {
  title?: string;
  subtitle?: string;
  data: TimeData[] | null | undefined;
  height?: number;
  compact?: boolean;
};

const palette = {
  title: '#002366',
  axis: '#6b7280',
  grid: '#e9edf3',
  barStart: '#60a5fa',
  barEnd: '#2563eb',
  average: '#9ca3af',
  text: '#0b1a34',
};

function formatTime(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

function CustomTooltip({ active, payload, label }: any) {
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
        Question {label}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        Time: <b>{formatTime(data.value)}</b>
      </Typography>
    </Paper>
  );
}

export default function PremiumTimeAnalysis({
  title = 'Time Analysis',
  subtitle = 'Time spent per question',
  data,
  height,
  compact,
}: Props) {
  const h = height ?? (compact ? 320 : 380);

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
          <Typography variant="body2" color="text.secondary">No timing data available.</Typography>
        </Paper>
      </Box>
    );
  }

  // Validate and clean data
  const validData = data.filter(item => 
    item && 
    typeof item === 'object' && 
    typeof item.q === 'number' && 
    typeof item.timeSec === 'number' && 
    isFinite(item.timeSec) &&
    item.timeSec >= 0
  );

  if (validData.length === 0) {
    return (
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 800, color: palette.title, mb: .5 }}>
          {title}
        </Typography>
        <Typography variant="caption" color="text.secondary">{subtitle}</Typography>
        <Paper sx={{ mt: 2, p: 3, textAlign: 'center', borderRadius: 3, border: '1px solid rgba(15,23,42,.08)' }}>
          <Typography variant="body2" color="text.secondary">No valid timing data available.</Typography>
        </Paper>
      </Box>
    );
  }

  const avg = Math.round(validData.reduce((sum, item) => sum + item.timeSec, 0) / validData.length);

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
          'radial-gradient(1000px 400px at 10% -20%, rgba(37,99,235,.06), transparent 55%),' +
          'repeating-linear-gradient(135deg, rgba(2,6,23,.03) 0px, rgba(2,6,23,.03) 1px, transparent 1px, transparent 10px)',
        border: '1px solid rgba(15,23,42,.08)',
        boxShadow: '0 8px 28px rgba(2,6,23,.06)',
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={validData}
            margin={{ top: 24, right: 16, left: 8, bottom: 16 }}
          >
            <defs>
              <linearGradient id="timeBarGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.barStart} />
                <stop offset="100%" stopColor={palette.barEnd} />
              </linearGradient>
              
              {/* Soft drop shadow */}
              <filter id="timeBarShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity=".15" floodColor="#1f2937" />
              </filter>
            </defs>

            <CartesianGrid stroke={palette.grid} strokeDasharray="4 6" vertical={false} />
            <XAxis
              dataKey="q"
              tick={{ fontSize: 12, fill: palette.axis }}
              axisLine={false}
              tickLine={false}
              label={{ 
                value: 'Question #', 
                position: 'insideBottomRight', 
                offset: -2, 
                fill: palette.axis,
                fontSize: 11,
                fontWeight: 600
              }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: palette.axis }}
              axisLine={false}
              tickLine={false}
              label={{ 
                value: 'Time (Seconds)', 
                angle: -90, 
                position: 'insideLeft', 
                fill: palette.axis,
                fontSize: 11,
                fontWeight: 600
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Average line */}
            <ReferenceLine
              y={avg}
              stroke={palette.average}
              strokeDasharray="3 6"
              label={{
                value: `Avg ${formatTime(avg)}`,
                fill: palette.axis,
                fontSize: 11,
                fontWeight: 600,
                position: 'right',
              }}
            />

            {/* Time bars */}
            <Bar
              dataKey="timeSec"
              fill="url(#timeBarGrad)"
              radius={[4, 4, 0, 0]}
              barSize={20}
              style={{ filter: 'url(#timeBarShadow)' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
