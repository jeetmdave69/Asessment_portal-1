'use client';

import { Fragment, useEffect, useState } from 'react';
import Portal from '@mui/material/Portal';
import { styled, keyframes } from '@mui/material/styles';
import LinearProgress from '@mui/material/LinearProgress';
import CircularProgress from '@mui/material/CircularProgress';
import Fade from '@mui/material/Fade';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { motion, AnimatePresence } from 'framer-motion';
import { School, Rocket } from '@mui/icons-material';

interface LoadingScreenProps {
  portal?: boolean;
  sx?: object;
  [key: string]: any;
}

// Define keyframes
const float = keyframes`
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
    opacity: 0.6;
  }
`;

export default function LoadingScreen({ portal = false, sx = {}, ...other }: LoadingScreenProps) {
  const PortalWrapper = portal ? Portal : Fragment;
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('Initializing...');

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prevProgress + Math.random() * 15;
      });
    }, 200);

    const textInterval = setInterval(() => {
      setLoadingText((prevText) => {
        const texts = [
          'Initializing...',
          'Loading components...',
          'Preparing interface...',
          'Almost ready...',
          'Welcome to Assessment Portal...'
        ];
        const currentIndex = texts.indexOf(prevText);
        const nextIndex = (currentIndex + 1) % texts.length;
        return texts[nextIndex];
      });
    }, 1500);

    return () => {
      clearInterval(interval);
      clearInterval(textInterval);
    };
  }, []);

  return (
    <PortalWrapper>
      <Fade in>
        <LoadingContent sx={sx} {...other}>
          {/* Animated Background Particles */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '10%',
                right: '10%',
                width: 200,
                height: 200,
                background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: `${float} 6s ease-in-out infinite`,
              },
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: '20%',
                left: '5%',
                width: 150,
                height: 150,
                background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                animation: `${float} 8s ease-in-out infinite reverse`,
              },
            }}
          />

          {/* Main Content */}
          <Box
            sx={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            {/* Logo and Title */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <School sx={{ fontSize: 48, color: '#00d4ff' }} />
                </motion.div>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
                  }}
                >
                  Assessment Portal
                </Typography>
              </Box>
            </motion.div>

            {/* Loading Animation */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: 120,
                  height: 120,
                  mb: 3,
                }}
              >
                <CircularProgress
                  size={120}
                  thickness={2}
                  sx={{
                    color: 'rgba(0, 212, 255, 0.3)',
                    position: 'absolute',
                  }}
                />
                <CircularProgress
                  size={120}
                  thickness={2}
                  variant="determinate"
                  value={progress}
                  sx={{
                    color: '#00d4ff',
                    position: 'absolute',
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Rocket sx={{ fontSize: 32, color: '#00d4ff' }} />
                  </motion.div>
                </Box>
              </Box>
            </motion.div>

            {/* Progress Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Box sx={{ width: 300, mb: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    height: 6,
                    borderRadius: 3,
                    background: 'rgba(0, 212, 255, 0.2)',
                    '& .MuiLinearProgress-bar': {
                      background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
                      borderRadius: 3,
                    },
                  }}
                />
              </Box>
            </motion.div>

            {/* Loading Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.9 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={loadingText}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.8)',
                      fontWeight: 300,
                      textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
                    }}
                  >
                    {loadingText}
                  </Typography>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Progress Percentage */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: '#00d4ff',
                  fontWeight: 700,
                  mt: 2,
                  textShadow: '0 2px 8px rgba(0, 212, 255, 0.3)',
                }}
              >
                {Math.round(progress)}%
              </Typography>
            </motion.div>
          </Box>
        </LoadingContent>
      </Fade>
    </PortalWrapper>
  );
}

// Styled container
const LoadingContent = styled('div')(({ theme }) => ({
  flexGrow: 1,
  width: '100%',
  display: 'flex',
  minHeight: '100vh',
  alignItems: 'center',
  justifyContent: 'center',
  flexDirection: 'column',
  background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 20%, rgba(0, 212, 255, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(0, 212, 255, 0.1) 0%, transparent 50%)',
    zIndex: 0,
  },
}));
