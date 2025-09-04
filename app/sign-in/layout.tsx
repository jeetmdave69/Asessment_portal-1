'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { 
  Box, 
  CssBaseline, 
  Typography,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import Image from 'next/image';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import { ThemeModeProvider } from '@/theme/theme-provider';
import { keyframes } from '@mui/system';

// Entrance animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideInLeft = keyframes`
  from {
    opacity: 0;
    transform: translateX(-100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const slideInRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(100px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleGoBack = () => {
    // Use window.location to navigate directly to the landing page
    // This bypasses any Clerk redirect logic
    window.location.href = '/';
  };

  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
      appearance={{
        variables: {
          colorPrimary: '#6200EA',
          borderRadius: '12px',
        },
        elements: {
          formButtonPrimary: {
            background: 'linear-gradient(135deg, #6200EA 0%, #7C3AED 100%)',
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            padding: '12px 24px',
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
          formFieldInput: {
            borderRadius: '10px',
          },
          footer: {
            display: 'none',
          },
          // Hide all Clerk card elements
          card: {
            display: 'none',
          },
          rootBox: {
            background: 'transparent',
            boxShadow: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
          },
          header: {
            display: 'none',
          },
          headerTitle: {
            display: 'none',
          },
          headerSubtitle: {
            display: 'none',
          },
          form: {
            background: 'transparent',
            boxShadow: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
          },
          formSection: {
            background: 'transparent',
            boxShadow: 'none',
            border: 'none',
            padding: 0,
            margin: 0,
          },
        },
      }}
    >
      <ThemeModeProvider>
        <CssBaseline />
        
        {/* Full page container with entrance animation */}
        <Box
          sx={{
            width: '100vw',
            height: '100vh',
            bgcolor: '#F5F7FB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            animation: `${fadeIn} 0.3s ease-out`,
            '@media (prefers-reduced-motion: reduce)': {
              animation: 'none',
            },
            position: 'relative',
          }}
        >
          {/* Logo in top left corner */}
          <Box
            sx={{
              position: 'absolute',
              top: '24px',
              left: '24px',
              zIndex: 1000,
              animation: `${fadeIn} 0.6s ease-out 0.2s both`,
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          >
            <Image
              src="/Logo.svg"
              alt="OctoMind Logo"
              width={180}
              height={60}
              priority
              style={{
                filter: 'drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))',
              }}
            />
          </Box>

          {/* Back button in top right corner */}
          <Box
            sx={{
              position: 'absolute',
              top: '24px',
              right: '24px',
              zIndex: 1000,
              animation: `${fadeIn} 0.6s ease-out 0.2s both`,
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          >
            <Tooltip title="Back to Home">
              <IconButton
                onClick={handleGoBack}
                sx={{
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
                aria-label="Go back to home page"
              >
                <ArrowBackIcon sx={{ color: '#6200EA' }} />
              </IconButton>
            </Tooltip>
          </Box>
          {/* Login container with scale entrance */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              width: '100%',
              height: '100%',
              bgcolor: '#FFFFFF',
              overflow: 'hidden',
              animation: `${scaleIn} 0.4s ease-out 0.1s both`,
              '@media (prefers-reduced-motion: reduce)': {
                animation: 'none',
              },
            }}
          >
            
            {/* Left Brand Panel with slide-in animation */}
            <Box
              sx={{
                position: 'relative',
                background: 'linear-gradient(135deg, #6200EA 0%, #7C3AED 100%)',
                color: '#FFFFFF',
                display: { xs: 'none', md: 'flex' },
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                textAlign: 'center',
                clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0% 100%)',
                animation: `${slideInLeft} 0.5s ease-out 0.2s both`,
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }}
            >
              <Box
                sx={{
                  maxWidth: '380px',
                  zIndex: 2,
                }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: '3rem',
                    fontWeight: 700,
                    mb: 2,
                    animation: `${fadeIn} 0.6s ease-out 0.4s both`,
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                    },
                  }}
                >
                  Welcome Back!
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: '1.3rem',
                    lineHeight: 1.6,
                    opacity: 0.9,
                    animation: `${fadeIn} 0.6s ease-out 0.5s both`,
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                    },
                  }}
                >
                  Your seamless gateway to smarter testing and learning experiences. Sign in to continue your journey.
                </Typography>
              </Box>
              
              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  bottom: '30px',
                  fontSize: '0.9rem',
                  opacity: 0.7,
                  animation: `${fadeIn} 0.6s ease-out 0.6s both`,
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                  },
                }}
              >
                © 2025 OctoMind Inc. All rights reserved.
              </Typography>
            </Box>

            {/* Right Form Panel with slide-in animation */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: { xs: 'flex-start', md: 'center' },
                padding: '40px',
                pt: { xs: '15vh', md: '40px' },
                animation: `${slideInRight} 0.5s ease-out 0.3s both`,
                '@media (prefers-reduced-motion: reduce)': {
                  animation: 'none',
                },
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '400px',
                  textAlign: 'center',
                  animation: `${fadeIn} 0.6s ease-out 0.7s both`,
                  '@media (prefers-reduced-motion: reduce)': {
                    animation: 'none',
                  },
                }}
              >
                <Typography
                  variant="h2"
                  sx={{
                    fontSize: '2.5rem',
                    fontWeight: 600,
                    color: '#121212',
                    mb: 1,
                    animation: `${fadeIn} 0.6s ease-out 0.8s both`,
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                    },
                  }}
                >
                  Sign In to OctoMind
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: '#757575',
                    mb: 4,
                    fontSize: '1.1rem',
                    animation: `${fadeIn} 0.6s ease-out 0.9s both`,
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                    },
                  }}
                >
                  Enter your details below to access your account.
                </Typography>
                
                {/* Clerk SignIn Widget with fade-in animation */}
                <Box 
                  sx={{ 
                    width: '100%',
                    animation: `${fadeIn} 0.6s ease-out 1s both`,
                    '@media (prefers-reduced-motion: reduce)': {
                      animation: 'none',
                    },
                  }}
                >
                  {children}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </ThemeModeProvider>
    </ClerkProvider>
  );
}