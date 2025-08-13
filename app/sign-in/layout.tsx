// app/sign-in/layout.tsx

'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { Box, CssBaseline, useTheme, alpha } from '@mui/material'; // Import useTheme and alpha
import { ThemeModeProvider } from '@/theme/theme-provider'; // Assuming this path is correct for your theme provider

// ----------------------------------------------------------------------
// Thematic "Live" Background Component (CSS-only, integrated into layout)
// Creates a subtle, animated network/data flow effect for an OctaMind theme.
// ----------------------------------------------------------------------
const AssessmentPortalThematicBackground = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        // Deeper, richer gradient for a more premium modern look
        // Uses primary colors for a consistent brand feel
        background: `linear-gradient(155deg, #000 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.primary.main} 100%)`,

        // Layer 1: Animated "nodes" (data points) - even more subtle, softer glow
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 10% 20%, ${alpha(theme.palette.info.light, 0.05)} 1.5px, transparent 1.5px),
            radial-gradient(circle at 90% 80%, ${alpha(theme.palette.success.light, 0.05)} 1.5px, transparent 1.5px),
            radial-gradient(circle at 30% 70%, ${alpha(theme.palette.warning.light, 0.05)} 1.5px, transparent 1.5px),
            radial-gradient(circle at 60% 40%, ${alpha(theme.palette.primary.light, 0.03)} 1.5px, transparent 1.5px)
          `,
          backgroundSize: '40px 40px', // Larger grid for sparser, cleaner feel
          animation: 'movePoints 80s linear infinite', // Slower animation for extreme calmness
          opacity: 0.7, // Reduced opacity
          zIndex: -1, // Behind the main background box
        },

        // Layer 2: Animated "lines" (information flow) - extremely subtle, delicate lines
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: `
            linear-gradient(0deg, transparent 49%, ${alpha(theme.palette.info.main, 0.03)} 50%, transparent 51%),
            linear-gradient(90deg, transparent 49%, ${alpha(theme.palette.success.main, 0.03)} 50%, transparent 51%),
            linear-gradient(45deg, transparent 49%, ${alpha(theme.palette.primary.light, 0.02)} 50%, transparent 51%)
          `,
          backgroundSize: '150px 150px', // Even wider spacing for minimalist lines
          animation: 'moveLines 60s linear infinite', // Slower for subtle motion
          opacity: 0.5, // Reduced opacity
          zIndex: -2, // Even further behind
        },

        // Layer 3: Subtle color shifting overlay for depth - refined blend mode
        '& .color-shift': {
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: `linear-gradient(120deg, ${alpha(theme.palette.secondary.light, 0.02)} 0%, ${alpha(theme.palette.info.light, 0.02)} 100%)`,
          mixBlendMode: 'overlay', // Most subtle blend mode
          animation: 'colorShift 25s ease-in-out infinite alternate', // Slower animation
          zIndex: -3, // Furthest back
        },

        // Keyframes for subtle movement of points - adjusted speed
        '@keyframes movePoints': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '4000px 4000px' },
        },

        // Keyframes for subtle movement of lines - adjusted speed
        '@keyframes moveLines': {
          '0%': { backgroundPosition: '0 0' },
          '100%': { backgroundPosition: '1500px 1500px' },
        },

        // Keyframes for color shifting overlay - adjusted speed and opacity range
        '@keyframes colorShift': {
          '0%': { opacity: 0.5 },
          '50%': { opacity: 0.8 },
          '100%': { opacity: 0.5 },
        },
      }}
    >
      {/* Layer 3: Color shift overlay (for extra depth) */}
      <Box className="color-shift" />
    </Box>
  );
};

// ----------------------------------------------------------------------

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme(); // Use useTheme hook here as well

  return (
    <ClerkProvider>
      <ThemeModeProvider>
        <CssBaseline />

        {/* Main container for the entire login page, covering the full viewport */}
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
            flexDirection: 'column',
            // Base background for the entire layout. This is the deepest visual layer.
            background: `linear-gradient(120deg, #000 0%, ${theme.palette.primary.dark} 50%, ${theme.palette.primary.main} 100%)`,
          }}
        >
          {/* 1. The main Thematic "Live" background component */}
          <AssessmentPortalThematicBackground />

          {/* 2. Deep Gradient Overlay - crucial for readability and professional look */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              // Increased opacity for a deeper, more refined look over the thematic background
              background: `linear-gradient(135deg, ${alpha('#000', 0.96)} 0%, ${alpha(theme.palette.primary.main, 0.96)} 100%)`, // Even higher alpha
              backdropFilter: 'blur(12px) saturate(1.2)', // Glassmorphism effect
              zIndex: 1, // Above the thematic background
            }}
          />

          {/* 3. Subtle Vignette Overlay - adds cinematic depth */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.01) 60%, rgba(0,0,0,0.5) 100%)', // More pronounced vignette for focus
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)', // Soft shadow for depth
              zIndex: 2, // Above the gradient overlay
            }}
          />

          {/* Content area for children (your SignInPage component) */}
          <Box
            sx={{
              position: 'relative', // Important for zIndex to work against fixed background
              zIndex: 3, // Ensures content is on top of all background layers
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              // No background color here, let the thematic background show through
              // bgcolor: 'transparent', // Explicitly transparent
              minHeight: '100vh', // Ensure children container also takes full height for centering
              width: '100%', // Ensure children container takes full width
              px: 2, // Padding for content
            }}
          >
            {children}
          </Box>
        </Box>
      </ThemeModeProvider>
    </ClerkProvider>
  );
}