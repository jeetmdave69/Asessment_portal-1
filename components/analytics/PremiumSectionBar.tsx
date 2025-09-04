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
  Legend,
  LabelList,
} from 'recharts';
import { Box, Paper, Typography, Skeleton } from '@mui/material';

export type SectionBarDatum = {
  section: string;     // e.g. "Science"
  total: number;       // e.g. 3
  obtained: number;    // e.g. 2
  percentage: number;  // e.g. 67
};

type Props = {
  title?: string;
  subtitle?: string;
  data: SectionBarDatum[] | null | undefined;
  height?: number;     // default 360
  compact?: boolean;   // reduces height to ~300
};

            const palette = {
              title: '#002366',
              axis: '#6b7280',
              grid: '#e9edf3',
              total: '#94a3b8',
              totalPattern: '#64748b',
              obtainedStart: '#60a5fa', // gradient top
              obtainedEnd:   '#2563eb', // gradient bottom
              labelText: '#0b1a34',
            };

function fmtPct(v?: number) {
  if (v == null || !isFinite(v)) return '—';
  return `${Math.round(v)}%`;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload as SectionBarDatum;
  return (
    <Paper elevation={0} sx={{
      px: 1.5, py: 1, borderRadius: 2,
      border: '1px solid rgba(15,23,42,.08)', boxShadow: '0 8px 20px rgba(2,6,23,.08)',
      bgcolor: '#fff',
    }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: palette.title, mb: .5 }}>
        {d.section}
      </Typography>
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
        Obtained <b>{d.obtained}</b> / {d.total} &nbsp;•&nbsp; {fmtPct(d.percentage)}
      </Typography>
    </Paper>
  );
}

// Value label above the obtained bar (clean & readable)
function ValueLabel(props: any) {
  const { x, y, value } = props;
  if (value == null) return null;

  // Draw text with white outline to stay readable above any background.
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0} y={-8}
        textAnchor="middle"
        fontSize={12}
        fontWeight={800}
        fill={palette.labelText}
        stroke="#fff" strokeWidth={3} paintOrder="stroke"
      >
        {fmtPct(value)}
      </text>
      <text
        x={0} y={-8}
        textAnchor="middle"
        fontSize={12}
        fontWeight={800}
        fill={palette.labelText}
      >
        {fmtPct(value)}
      </text>
    </g>
  );
}

export default function PremiumSectionBar({
  title = 'Section-wise Performance',
  subtitle = 'Obtained vs Total (labels show %)',
  data,
  height,
  compact,
}: Props) {
  const h = height ?? (compact ? 300 : 360);

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
          <Typography variant="body2" color="text.secondary">No section data available.</Typography>
        </Paper>
      </Box>
    );
  }

  // Compute max for a pleasing Y domain
  const maxTotal = Math.max(...data.map(d => d.total ?? 0), 1);

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
        // Subtle premium background (radial glow + faint diagonal hatch)
        background:
          'radial-gradient(1000px 400px at -10% -20%, rgba(37,99,235,.06), transparent 55%),' +
          'repeating-linear-gradient(135deg, rgba(2,6,23,.03) 0px, rgba(2,6,23,.03) 1px, transparent 1px, transparent 10px)',
        border: '1px solid rgba(15,23,42,.08)',
        boxShadow: '0 8px 28px rgba(2,6,23,.06)',
      }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 24, right: 16, left: 8, bottom: 16 }}
          >
            <defs>
              <linearGradient id="obtainedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={palette.obtainedStart} />
                <stop offset="100%" stopColor={palette.obtainedEnd} />
              </linearGradient>

              {/* soft drop shadow */}
              <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="0" dy="2" stdDeviation="4" floodOpacity=".18" floodColor="#1f2937" />
              </filter>

                                        {/* Enhanced total bar styling */}
                          <filter id="totalBarShadow" x="-50%" y="-50%" width="200%" height="200%">
                            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity=".1" floodColor="#64748b" />
                          </filter>
            </defs>

            <CartesianGrid stroke={palette.grid} strokeDasharray="4 6" vertical={false} />
            <XAxis
              dataKey="section"
              interval={0}
              tick={{ fontSize: 12, fill: palette.axis }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[0, Math.ceil(maxTotal)]}
              allowDecimals={false}
              tick={{ fontSize: 12, fill: palette.axis }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
                                    <Legend
                          verticalAlign="top"
                          align="right"
                          iconType="rect"
                          wrapperStyle={{ paddingBottom: 8, fontSize: 12, color: '#64748b' }}
                        />

                                                            {/* Total */}
                        <Bar
                          dataKey="total"
                          name="Total"
                          fill={palette.total}
                          radius={0}
                          isAnimationActive={true}
                          animationBegin={80}
                          animationDuration={900}
                          stroke={palette.totalPattern}
                          strokeWidth={1}
                          style={{ filter: 'url(#totalBarShadow)' }}
                          barSize={24}
                        />

                        {/* Obtained */}
                        <Bar
                          dataKey="obtained"
                          name="Obtained"
                          fill="url(#obtainedGrad)"
                          radius={0}
                          style={{ filter: 'url(#softShadow)' }}
                          isAnimationActive={true}
                          animationBegin={160}
                          animationDuration={1100}
                          barSize={20}
                        >
                          {/* % labels above bars */}
                          <LabelList dataKey="percentage" content={<ValueLabel />} />
                        </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
