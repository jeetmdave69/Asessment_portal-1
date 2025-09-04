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
  LabelList,
} from 'recharts';
import { Paper, Typography, Box, useTheme } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

export type SectionBarDatum = {
  section: string;
  total: number;
  obtained: number;
  percentage: number;
};

type Props = {
  data: SectionBarDatum[] | null | undefined;
  height?: number;
};

// Premium color palette for high-end SaaS dashboard
const premiumPalette = {
  // Primary dual gradient: teal → indigo
  primaryStart: '#0d9488',
  primaryEnd: '#4f46e5',
  // Glossy highlight
  glossyHighlight: 'rgba(255, 255, 255, 0.25)',
  // Background layers
  glassBg: 'rgba(255, 255, 255, 0.08)',
  glassBorder: 'rgba(255, 255, 255, 0.15)',
  // Text colors
  textPrimary: '#0f172a',
  textSecondary: '#475569',
  textMuted: '#64748b',
  // Grid and reference lines
  gridLine: 'rgba(15, 23, 42, 0.06)',
  referenceLine: 'rgba(15, 23, 42, 0.08)',
  // Shadows and depth
  barShadow: 'rgba(13, 148, 136, 0.15)',
  hoverShadow: 'rgba(13, 148, 136, 0.25)',
  // Shimmer effect
  shimmerStart: 'rgba(255, 255, 255, 0.02)',
  shimmerEnd: 'rgba(255, 255, 255, 0.08)',
};

function fmtPct(v?: number) {
  if (v == null || !isFinite(v)) return '—';
  return `${Math.round(v)}%`;
}

// Premium tooltip with glassmorphism
function PremiumTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload as SectionBarDatum;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.96 }}
      transition={{ duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <Paper
        elevation={0}
        sx={{
          px: 3,
          py: 2.5,
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(24px) saturate(200%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 25px 80px rgba(0, 0, 0, 0.15), 0 10px 30px rgba(0, 0, 0, 0.1)',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'linear-gradient(90deg, #0d9488, #4f46e5)',
            borderRadius: '16px 16px 0 0',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1.5 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0d9488, #4f46e5)',
              boxShadow: '0 0 20px rgba(13, 148, 136, 0.4)',
            }}
          />
          <Typography 
            variant="subtitle1" 
            sx={{ 
              fontWeight: 700, 
              color: premiumPalette.textPrimary,
              fontSize: '0.95rem',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {d.section}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          <Typography 
            variant="body2" 
            sx={{ 
              color: premiumPalette.textSecondary,
              fontWeight: 500,
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Score: <Box component="span" sx={{ fontWeight: 700, color: premiumPalette.textPrimary }}>
              {d.obtained}/{d.total}
            </Box>
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(135deg, #0d9488, #4f46e5)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: '1.25rem',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            {fmtPct(d.percentage)}
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  );
}

// Premium value labels with bold typography
function PremiumValueLabel(props: any) {
  const { x, y, value, index } = props;
  if (value == null) return null;

  return (
    <motion.g 
      transform={`translate(${x},${y})`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        delay: index * 0.08 + 0.2, 
        duration: 0.6, 
        ease: [0.25, 0.46, 0.45, 0.94] 
      }}
    >
      {/* Bold white label with shadow */}
      <text
        x={0}
        y={-16}
        textAnchor="middle"
        fontSize={14}
        fontWeight={800}
        fill="rgba(255, 255, 255, 0.95)"
        stroke="rgba(255, 255, 255, 0.95)"
        strokeWidth={4}
        paintOrder="stroke"
        filter="drop-shadow(0 2px 8px rgba(0,0,0,0.15))"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
      >
        {fmtPct(value)}
      </text>
      
      {/* Main text */}
      <text
        x={0}
        y={-16}
        textAnchor="middle"
        fontSize={14}
        fontWeight={800}
        fill="rgba(255, 255, 255, 0.95)"
        fontFamily="Inter, -apple-system, BlinkMacSystemFont, sans-serif"
      >
        {fmtPct(value)}
      </text>
    </motion.g>
  );
}

export default function SectionBar({ data, height = 450 }: Props) {
  const theme = useTheme();
  
  // Enhanced data validation
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.02) 0%, rgba(255, 255, 255, 0.4) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}>
        <Typography variant="body2" color="text.secondary">
          No section data available
        </Typography>
      </Box>
    );
  }

  // Validate and clean data
  const validData = data.filter(item => 
    item && 
    typeof item === 'object' && 
    item.section && 
    typeof item.percentage === 'number' && 
    isFinite(item.percentage)
  );

  if (validData.length === 0) {
    return (
      <Box sx={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.02) 0%, rgba(255, 255, 255, 0.4) 100%)',
        borderRadius: '24px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
      }}>
        <Typography variant="body2" color="text.secondary">
          Invalid data format
        </Typography>
      </Box>
    );
  }

  // Sort sections by percentage for better visual flow
  const sortedData = [...validData].sort((a, b) => b.percentage - a.percentage);
  const maxPercentage = Math.max(...sortedData.map(d => d.percentage), 100);

  return (
    <Box
      sx={{
        height,
        width: '100%',
        position: 'relative',
        borderRadius: '24px',
        overflow: 'hidden',
        background: `
          radial-gradient(900px 600px at 20% 20%, ${premiumPalette.shimmerStart} 0%, transparent 60%),
          radial-gradient(800px 500px at 80% 80%, ${premiumPalette.shimmerEnd} 0%, transparent 60%),
          linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)
        `,
        border: '1px solid rgba(255, 255, 255, 0.3)',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(13, 148, 136, 0.008) 30px, rgba(13, 148, 136, 0.008) 31px)',
          pointerEvents: 'none',
          animation: 'shimmer 8s linear infinite',
        },
        '@keyframes shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        }
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedData}
          margin={{ top: 48, right: 32, left: 32, bottom: 40 }}
        >
          <defs>
            {/* Primary dual gradient for bars */}
            <linearGradient id="premiumBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={premiumPalette.primaryStart} stopOpacity={0.95} />
              <stop offset="60%" stopColor={premiumPalette.primaryStart} stopOpacity={0.9} />
              <stop offset="100%" stopColor={premiumPalette.primaryEnd} stopOpacity={0.95} />
            </linearGradient>
            
            {/* Glossy top highlight */}
            <linearGradient id="glossyHighlight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={premiumPalette.glossyHighlight} stopOpacity={0.4} />
              <stop offset="30%" stopColor={premiumPalette.glossyHighlight} stopOpacity={0.2} />
              <stop offset="100%" stopColor="transparent" stopOpacity={0} />
            </linearGradient>
          </defs>

          {/* Horizontal reference lines only at key percentages */}
          <CartesianGrid 
            stroke={premiumPalette.referenceLine} 
            strokeDasharray="2 4" 
            vertical={false}
            strokeOpacity={0.4}
            horizontalPoints={[25, 50, 75, 100]}
          />
          
          {/* X-axis with premium typography */}
          <XAxis
            dataKey="section"
            interval={0}
            tick={{ 
              fontSize: 13, 
              fill: premiumPalette.textSecondary,
              fontWeight: 600,
              letterSpacing: '0.02em',
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
            axisLine={false}
            tickLine={false}
            tickMargin={20}
          />
          
          {/* Y-axis with reference percentages */}
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ 
              fontSize: 12, 
              fill: premiumPalette.textMuted,
              fontWeight: 500,
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            }}
            axisLine={false}
            tickLine={false}
            tickMargin={16}
            ticks={[0, 25, 50, 75, 100]}
          />
          
          {/* Premium tooltip */}
          <Tooltip content={<PremiumTooltip />} />
          
          {/* Premium bars with dual gradient and glossy highlight */}
          <Bar
            dataKey="percentage"
            fill="url(#premiumBarGradient)"
            radius={[12, 12, 0, 0]}
            barSize={48}
            isAnimationActive={true}
            animationBegin={0}
            animationDuration={1400}
            style={{
              filter: 'drop-shadow(0 6px 20px rgba(13, 148, 136, 0.15))',
              transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            }}
          >
            {/* Glossy highlight overlay */}
            <defs>
              <linearGradient id="glossyOverlay" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.3)" />
                <stop offset="40%" stopColor="rgba(255, 255, 255, 0.1)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
            
            {/* Premium value labels */}
            <LabelList dataKey="percentage" content={<PremiumValueLabel />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Premium corner accents */}
      <Box
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(13, 148, 136, 0.08), rgba(79, 70, 229, 0.08))',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(12px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #0d9488, #4f46e5)',
            opacity: 0.6,
          }
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.08), rgba(13, 148, 136, 0.08))',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(10px)',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f46e5, #0d9488)',
            opacity: 0.5,
          }
        }}
      />
    </Box>
  );
}
