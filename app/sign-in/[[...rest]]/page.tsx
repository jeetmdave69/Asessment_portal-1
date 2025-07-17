'use client';

import { SignIn } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material'; // Add useMediaQuery
import { alpha } from '@mui/material/styles';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine, Container } from 'tsparticles-engine';

export default function SignInPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Initialize tsparticles
  const particlesInit = async (main: Engine): Promise<void> => {
    await loadSlim(main);
  };

  // Optional: Callback when particles are loaded
  const particlesLoaded = async (container?: Container): Promise<void> => {};

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        minHeight: '100vh',
        width: '100%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        flexDirection: 'column',
      }}
    >
      {/* Particle Background - only on non-mobile */}
      {!isMobile && (
        <Particles
          id="tsparticles"
          init={particlesInit}
          loaded={particlesLoaded}
          options={{
            background: {
              color: { value: 'transparent' },
            },
            fpsLimit: 120,
            interactivity: {
              events: {
                onClick: { enable: false, mode: 'push' },
                onHover: { enable: true, mode: 'repulse' },
                resize: true,
              },
              modes: {
                push: { quantity: 4 },
                repulse: { distance: 100, duration: 0.4 },
              },
            },
            particles: {
              color: { value: '#ffffff' },
              links: {
                color: '#ffffff',
                distance: 150,
                enable: true,
                opacity: 0.2,
                width: 1,
              },
              collisions: { enable: false },
              move: {
                direction: 'none',
                enable: true,
                outModes: { default: 'bounce' },
                random: false,
                speed: 1,
                straight: false,
              },
              number: {
                density: { enable: true, area: 800 },
                value: 80,
              },
              opacity: { value: 0.3 },
              shape: { type: 'circle' },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
          style={{
            position: 'absolute',
            zIndex: 0,
            width: '100%',
            height: '100%',
          }}
        />
      )}

      {/* Soft radial vignette overlay - less pronounced on mobile */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background: isMobile
            ? 'radial-gradient(ellipse at center, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.7) 100%)'
            : 'radial-gradient(ellipse at center, rgba(0,0,0,0.01) 60%, rgba(0,0,0,0.5) 100%)',
          boxShadow: isMobile ? undefined : '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
          zIndex: 1,
        }}
      />

      {/* Main content container with animation */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: isMobile ? '1rem' : '2rem',
          flexDirection: 'column',
          textAlign: 'center',
        }}
      >
        {/* Modernized Heading */}
        <Typography
          variant="h3"
          component="h1"
          sx={{
            fontWeight: 800,
            marginBottom: 1,
            fontSize: { xs: '2rem', sm: '2.8rem', md: '3.2rem' },
            color: theme.palette.common?.white || '#fff',
            textShadow: '0 4px 20px rgba(0,0,0,0.7)',
            letterSpacing: '0.05em',
          }}
        >
          Assessment Portal
        </Typography>

        {/* Modernized Subtitle */}
        <Typography
          variant="body1"
          sx={{
            color: alpha(theme.palette.common?.white || '#fff', 0.8),
            fontWeight: 400,
            fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
            marginBottom: isMobile ? '2rem' : '3rem',
            maxWidth: '550px',
            lineHeight: 1.6,
          }}
        >
          Your seamless gateway to smarter testing and learning experiences. Empowering education with intuitive tools.
        </Typography>

        {/* Clerk Sign-in Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <SignIn path="/sign-in" routing="path" />
        </motion.div>
      </motion.div>
    </Box>
  );
}
