'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Paper, Typography, Box, Fade } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';

export type ScoreSlice = {
  name: 'Correct' | 'Incorrect' | 'Skipped';
  value: number;
};

type Props = {
  data: ScoreSlice[] | null | undefined;
  height?: number;
  totalQuestions?: number;
};

// Premium color palette inspired by Stripe's financial analytics
const premiumPalette = {
  correct: {
    primary: '#10b981', // emerald-500
    secondary: '#059669', // emerald-600
    glow: 'rgba(16, 185, 129, 0.3)',
    highlight: '#34d399', // emerald-400
  },
  incorrect: {
    primary: '#f43f5e', // rose-500
    secondary: '#e11d48', // rose-600
    glow: 'rgba(244, 63, 94, 0.3)',
    highlight: '#fb7185', // rose-400
  },
  skipped: {
    primary: '#f59e0b', // amber-500
    secondary: '#d97706', // amber-600
    glow: 'rgba(245, 158, 11, 0.3)',
    highlight: '#fbbf24', // amber-400
  },
  background: {
    primary: '#ffffff',
    secondary: '#f8fafc', // slate-50
    tertiary: '#e2e8f0', // slate-200
  },
  text: {
    primary: '#0f172a', // slate-900
    secondary: '#475569', // slate-600
    accent: '#6366f1', // indigo-500
  },
  shadow: {
    soft: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    medium: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    strong: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  }
};

// Premium tooltip component
function PremiumTooltip({ active, payload }: any) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0];
  
  const getIcon = (name: string) => {
    switch (name) {
      case 'Correct': return <CheckCircle size={16} />;
      case 'Incorrect': return <XCircle size={16} />;
      case 'Skipped': return <Clock size={16} />;
      default: return <TrendingUp size={16} />;
    }
  };

  const getColor = (name: string) => {
    switch (name) {
      case 'Correct': return premiumPalette.correct.primary;
      case 'Incorrect': return premiumPalette.incorrect.primary;
      case 'Skipped': return premiumPalette.skipped.primary;
      default: return premiumPalette.text.accent;
    }
  };

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
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '2px',
              background: `linear-gradient(90deg, ${getColor(data.name)}, ${premiumPalette.text.accent})`,
            }
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box sx={{ 
              color: getColor(data.name),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: `${getColor(data.name)}15`,
            }}>
              {getIcon(data.name)}
            </Box>
            <Typography 
              variant="subtitle1" 
              sx={{ 
                fontWeight: 700, 
                color: premiumPalette.text.primary,
                fontSize: '0.95rem',
              }}
            >
              {data.name}
            </Typography>
          </Box>
          
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 800, 
              color: getColor(data.name),
              fontSize: '1.25rem',
              mb: 0.5,
            }}
          >
            {data.value}
          </Typography>
          
          <Typography 
            variant="caption" 
            sx={{ 
              color: premiumPalette.text.secondary,
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          >
            questions
          </Typography>
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
}

export default function ScoreDonut({ data, height = 340, totalQuestions }: Props) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  if (!data || data.length === 0) {
    return (
      <Box sx={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: `radial-gradient(circle at center, ${premiumPalette.background.primary} 0%, ${premiumPalette.background.secondary} 100%)`,
        borderRadius: 4,
      }}>
        <Typography variant="body2" color={premiumPalette.text.secondary}>
          No score data available
        </Typography>
      </Box>
    );
  }

  const total = data.reduce((sum, item) => sum + (item?.value || 0), 0);
  const correct = data.find(d => d.name === 'Correct')?.value || 0;
  // Use totalQuestions prop if provided, otherwise fall back to calculated total
  const displayTotal = totalQuestions || total;
  const percentage = displayTotal > 0 ? Math.round((correct / displayTotal) * 100) : 0;

  // Animate percentage on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = percentage / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= percentage) {
        current = percentage;
        clearInterval(timer);
      }
      setAnimatedPercentage(Math.round(current));
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [percentage]);

  // Enhanced data with premium styling
  const enhancedData = data.map((item, index) => {
    let color, secondaryColor;
    
    switch (item.name) {
      case 'Correct':
        color = premiumPalette.correct.primary;
        secondaryColor = premiumPalette.correct.secondary;
        break;
      case 'Incorrect':
        color = premiumPalette.incorrect.primary;
        secondaryColor = premiumPalette.incorrect.secondary;
        break;
      case 'Skipped':
        color = premiumPalette.skipped.primary;
        secondaryColor = premiumPalette.skipped.secondary;
        break;
      default:
        color = premiumPalette.text.accent;
        secondaryColor = premiumPalette.text.accent;
    }
    
    return {
      ...item,
      color,
      secondaryColor,
    };
  });

  return (
    <Box
      sx={{
        height,
        position: 'relative',
        background: `radial-gradient(circle at center, ${premiumPalette.background.primary} 0%, ${premiumPalette.background.secondary} 50%, ${premiumPalette.background.tertiary} 100%)`,
        borderRadius: 4,
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          pointerEvents: 'none',
        }
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enhancedData}
            dataKey="value"
            nameKey="name"
            innerRadius={height * 0.25}
            outerRadius={height * 0.35}
            paddingAngle={2}
            cornerRadius={6}
            startAngle={90}
            endAngle={-270}
          >
            {enhancedData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`}
                fill={entry.color}
                stroke={entry.secondaryColor}
                strokeWidth={1}
              />
            ))}
          </Pie>

          <Tooltip 
            content={<PremiumTooltip />}
            wrapperStyle={{ 
              position: 'absolute',
              zIndex: 1000,
              pointerEvents: 'none',
              transform: 'translate(20px, -60px)' // Move tooltip outside chart
            }}
            cursor={false}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Premium center overlay with animated percentage */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 10,
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Typography
            variant="h2"
            fontWeight={900}
            sx={{
              color: premiumPalette.correct.primary,
              lineHeight: 1,
              textShadow: `0 4px 8px ${premiumPalette.correct.glow}`,
              fontSize: height * 0.15,
              mb: 1,
              background: `linear-gradient(135deg, ${premiumPalette.correct.primary}, ${premiumPalette.correct.highlight})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {animatedPercentage}%
          </Typography>
          
          <Typography
            variant="h6"
            sx={{
              color: premiumPalette.text.primary,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: 1,
              fontSize: height * 0.04,
              opacity: 0.9,
            }}
          >
            Correct
          </Typography>
          
          <Typography
            variant="caption"
            sx={{
              color: premiumPalette.text.secondary,
              fontWeight: 500,
              fontSize: height * 0.025,
              opacity: 0.7,
              display: 'block',
              mt: 0.5,
            }}
          >
            {correct} of {displayTotal} questions
          </Typography>
          
          <Typography
            variant="caption"
            sx={{
              color: premiumPalette.text.secondary,
              fontWeight: 500,
              fontSize: height * 0.02,
              opacity: 0.6,
              display: 'block',
              mt: 0.5,
              fontStyle: 'italic',
            }}
          >
            Based on question count
          </Typography>
        </motion.div>
      </Box>

      {/* Decorative corner accents */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 8,
          height: 8,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${premiumPalette.correct.primary}, ${premiumPalette.correct.highlight})`,
          boxShadow: `0 0 20px ${premiumPalette.correct.glow}`,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: 16,
          left: 16,
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: `linear-gradient(135deg, ${premiumPalette.text.accent}, ${premiumPalette.correct.highlight})`,
          boxShadow: `0 0 15px rgba(99, 102, 241, 0.3)`,
        }}
      />
    </Box>
  );
}
