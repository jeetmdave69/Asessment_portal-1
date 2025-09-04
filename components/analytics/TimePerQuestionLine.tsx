'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { Paper, Typography, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, TrendingUp, Zap } from 'lucide-react';

export type TimeData = {
  q: number;
  timeSec: number;
};

type Props = {
  data: TimeData[] | null | undefined;
  height?: number;
};

// Premium color palette inspired by Apple Fitness
const premiumPalette = {
  line: {
    start: '#3b82f6', // blue-500
    end: '#8b5cf6', // violet-500
    glow: 'rgba(59, 130, 246, 0.4)',
  },
  area: {
    start: 'rgba(59, 130, 246, 0.15)',
    end: 'rgba(139, 92, 246, 0.05)',
  },
  grid: {
    primary: 'rgba(156, 163, 175, 0.08)',
    secondary: 'rgba(156, 163, 175, 0.04)',
  },
  axis: {
    primary: '#6b7280', // gray-500
    secondary: '#9ca3af', // gray-400
  },
  text: {
    primary: '#1f2937', // gray-800
    secondary: '#6b7280', // gray-500
  },
  background: {
    primary: '#ffffff',
    secondary: '#f9fafb', // gray-50
  },
  shadow: {
    soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    strong: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  }
};

function formatTime(seconds: number): string {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  }
  return `${seconds}s`;
}

// Premium tooltip with stopwatch icon
function PremiumTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
      >
        <Paper
          elevation={0}
          sx={{
            px: 3,
            py: 2.5,
            borderRadius: 3,
            border: `1px solid rgba(255, 255, 255, 0.2)`,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            boxShadow: premiumPalette.shadow.strong,
            position: 'relative',
            overflow: 'hidden',
            minWidth: 180,
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, ${premiumPalette.line.start}, ${premiumPalette.line.end})`,
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ 
              color: premiumPalette.line.start,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `${premiumPalette.line.start}15`,
            }}>
              <Clock size={16} />
            </Box>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700, 
                color: premiumPalette.text.primary,
                fontSize: '0.95rem',
              }}
            >
              Question {label}
            </Typography>
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800, 
              color: premiumPalette.line.start,
              fontSize: '1.25rem',
              mb: 0.5,
            }}
          >
            {formatTime(data.value)}
          </Typography>
          
          <Typography 
            variant="caption" 
            sx={{ 
              color: premiumPalette.text.secondary,
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          >
            Time spent
          </Typography>
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
}

export default function TimePerQuestionLine({ data, height = 380 }: Props) {
  // Remove all animation state - use data directly

  // Debug logging to see what data is being received
  console.log('🔍 TimePerQuestionLine Component:', {
    receivedData: data,
    dataLength: data?.length,
    dataType: typeof data,
    isArray: Array.isArray(data),
    sampleData: data?.[0],
    allData: data,
    // Additional debugging
    firstItem: data?.[0],
    lastItem: data?.[data?.length - 1],
    allItems: data?.map((item, index) => ({ index, item }))
  });

  if (!data || data.length === 0) {
    console.log('⚠️ No data provided to TimePerQuestionLine');
    return (
      <Box sx={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${premiumPalette.background.primary} 0%, ${premiumPalette.background.secondary} 100%)`,
        borderRadius: 4,
      }}>
        <Typography variant="body2" color={premiumPalette.text.secondary}>
          No timing data available
        </Typography>
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

  console.log('🔍 Data validation:', {
    originalDataLength: data?.length,
    validDataLength: validData.length,
    validationResults: data?.map((item, index) => ({
      index,
      item,
      isValid: item &&
        typeof item === 'object' &&
        typeof item.q === 'number' &&
        typeof item.timeSec === 'number' &&
        isFinite(item.timeSec) &&
        item.timeSec >= 0
    }))
  });

  if (validData.length === 0) {
    return (
      <Box sx={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: `linear-gradient(135deg, ${premiumPalette.background.primary} 0%, ${premiumPalette.background.secondary} 100%)`,
        borderRadius: 4,
      }}>
        <Typography variant="body2" color={premiumPalette.text.secondary}>
          No valid timing data available
        </Typography>
      </Box>
    );
  }



  const avg = Math.round(validData.reduce((sum, item) => sum + item.timeSec, 0) / validData.length);
  const maxTime = Math.max(...validData.map(item => item.timeSec));
  const minTime = Math.min(...validData.map(item => item.timeSec));

  return (
    <Box
      sx={{
        height,
        position: 'relative',
        background: `linear-gradient(135deg, ${premiumPalette.background.primary} 0%, ${premiumPalette.background.secondary} 100%)`,
        borderRadius: 4,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 2px,
              ${premiumPalette.grid.secondary} 2px,
              ${premiumPalette.grid.secondary} 4px
            )
          `,
          opacity: 0.3,
          pointerEvents: 'none',
        }
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={validData}
          margin={{ top: 32, right: 24, left: 16, bottom: 24 }}
        >
          <defs>
            {/* Gradient for the line */}
            <linearGradient id="timeLineGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={premiumPalette.line.start} />
              <stop offset="100%" stopColor={premiumPalette.line.end} />
            </linearGradient>
            
            {/* Gradient for the area fill */}
            <linearGradient id="timeAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={premiumPalette.area.start} />
              <stop offset="100%" stopColor={premiumPalette.area.end} />
            </linearGradient>
            
            {/* Glow filter for the line */}
            <filter id="lineGlow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Subtle diagonal grid */}
          <CartesianGrid 
            stroke={premiumPalette.grid.primary} 
            strokeDasharray="2 4" 
            vertical={false}
            opacity={0.6}
          />
          
          <XAxis
            dataKey="q"
            tick={{ 
              fontSize: 11, 
              fill: premiumPalette.axis.primary,
              fontWeight: 500,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            label={{
              value: 'Question #',
              position: 'insideBottomRight',
              offset: -8,
              fill: premiumPalette.axis.secondary,
              fontSize: 10,
              fontWeight: 600,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          />
          
          <YAxis
            tick={{ 
              fontSize: 11, 
              fill: premiumPalette.axis.primary,
              fontWeight: 500,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            domain={[Math.max(0, minTime - 5), maxTime + 5]}
            label={{
              value: 'Time (Seconds)',
              angle: -90,
              position: 'insideLeft',
              offset: 8,
              fill: premiumPalette.axis.secondary,
              fontSize: 10,
              fontWeight: 600,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          />
          
          <Tooltip 
            content={<PremiumTooltip />}
            wrapperStyle={{ 
              position: 'absolute',
              zIndex: 1000,
              pointerEvents: 'none',
              transform: 'translate(20px, -60px)'
            }}
            cursor={false}
          />

          {/* Average reference line */}
          <ReferenceLine
            y={avg}
            stroke={premiumPalette.axis.secondary}
            strokeDasharray="4 6"
            strokeWidth={1.5}
            opacity={0.7}
            label={{
              value: `Avg ${formatTime(avg)}`,
              fill: premiumPalette.axis.primary,
              fontSize: 10,
              fontWeight: 600,
              position: 'right',
              offset: 8,
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}
          />

          {/* Area fill under the line */}
          <Area
            type="monotone"
            dataKey="timeSec"
            fill="url(#timeAreaGrad)"
            stroke="none"
            isAnimationActive={false}
          />

          {/* Main time line with smooth curve */}
          <Line
            type="monotone"
            dataKey="timeSec"
            stroke="url(#timeLineGrad)"
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={{
              r: 4,
              fill: premiumPalette.line.start,
              stroke: premiumPalette.line.end,
              strokeWidth: 2,
              filter: 'url(#lineGlow)',
              opacity: 0.9,
            }}
            activeDot={{
              r: 6,
              fill: premiumPalette.line.end,
              stroke: premiumPalette.line.start,
              strokeWidth: 3,
              filter: 'url(#lineGlow)',
              opacity: 1,
            }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Decorative corner accents */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${premiumPalette.line.start}, ${premiumPalette.line.end})`,
          boxShadow: `0 0 15px ${premiumPalette.line.glow}`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          width: 4,
          height: 4,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${premiumPalette.line.end}, ${premiumPalette.line.start})`,
          boxShadow: `0 0 10px ${premiumPalette.line.glow}`,
        }}
      />
    </Box>
  );
}
