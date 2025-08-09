'use client';

import { SignUp } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  useTheme, 
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Container,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine, Container as ParticlesContainer } from 'tsparticles-engine';
import {
  School,
  Psychology,
  Analytics,
  Assessment,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  ArrowForward,
  Security,
  Timeline,
  Rocket,
  AutoAwesome,
} from '@mui/icons-material';
import { useState } from 'react';

export default function SignUpPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [showPassword, setShowPassword] = useState(false);

  // Initialize tsparticles
  const particlesInit = async (main: Engine): Promise<void> => {
    await loadSlim(main);
  };

  const particlesLoaded = async (container?: ParticlesContainer): Promise<void> => {};

  const features = [
    {
      icon: <Rocket sx={{ fontSize: 40, color: '#00d4ff' }} />,
      title: "Get Started Fast",
      description: "Quick and easy setup process to get you started in minutes."
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: '#00d4ff' }} />,
      title: "AI-Powered Features",
      description: "Access to advanced AI features and personalized learning experiences."
    },
    {
      icon: <Security sx={{ fontSize: 40, color: '#00d4ff' }} />,
      title: "Secure Platform",
      description: "Enterprise-grade security to protect your data and privacy."
    },
    {
      icon: <Timeline sx={{ fontSize: 40, color: '#00d4ff' }} />,
      title: "Progress Tracking",
      description: "Track your learning progress with detailed analytics and insights."
    }
  ];

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
      {/* Particle Background */}
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
                onHover: { 
                  enable: true, 
                  mode: 'repulse',
                  parallax: {
                    enable: true,
                    force: 60,
                    smooth: 10
                  }
                },
                resize: true,
              },
              modes: {
                push: { quantity: 4 },
                repulse: { 
                  distance: 200, 
                  duration: 0.4,
                  factor: 100
                },
              },
            },
            particles: {
              color: { value: '#00d4ff' },
              links: {
                color: '#00d4ff',
                distance: 150,
                enable: true,
                opacity: 0.3,
                width: 1,
              },
              collisions: { enable: false },
              move: {
                direction: 'none',
                enable: true,
                outModes: { default: 'bounce' },
                random: false,
                speed: 2,
                straight: false,
              },
              number: {
                density: { enable: true, area: 800 },
                value: 100,
              },
              opacity: { value: 0.5 },
              shape: { type: 'circle' },
              size: { value: { min: 1, max: 3 } },
            },
            detectRetina: true,
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        />
      )}

      {/* Main content container */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100vh', display: 'flex', alignItems: 'center' }}>
        <Grid container spacing={4} alignItems="center" sx={{ minHeight: '80vh' }}>
          {/* Left Section - Information and Features */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Branding */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <School sx={{ fontSize: 48, color: '#00d4ff' }} />
                <Box>
                  <Typography
                    variant="h3"
                    sx={{
                      fontWeight: 800,
                      color: 'white',
                      textShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
                    }}
                  >
                    Assessment Portal
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontWeight: 300,
                    }}
                  >
                    AI-Based Learning Platform
                  </Typography>
                </Box>
              </Box>

              {/* Welcome Message */}
              <Typography
                variant="body1"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mb: 4,
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                }}
              >
                Join our comprehensive assessment portal and experience the future of education. Create your account to access intelligent learning tools, track your progress, and achieve your educational goals.
              </Typography>

              {/* Feature Cards */}
              <Grid container spacing={2}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    >
                      <Card
                        sx={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          backdropFilter: 'blur(20px)',
                          border: '1px solid rgba(0, 212, 255, 0.2)',
                          borderRadius: '15px',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 12px 40px rgba(0, 212, 255, 0.2)',
                            border: '1px solid rgba(0, 212, 255, 0.4)',
                          },
                        }}
                      >
                        <CardContent sx={{ p: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                            {feature.icon}
                            <Typography
                              variant="h6"
                              sx={{
                                fontWeight: 600,
                                color: 'white',
                                fontSize: '0.9rem',
                              }}
                            >
                              {feature.title}
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            sx={{
                              color: 'rgba(255, 255, 255, 0.7)',
                              fontSize: '0.8rem',
                              lineHeight: 1.4,
                            }}
                          >
                            {feature.description}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </motion.div>
          </Grid>

          {/* Right Section - Sign Up Form */}
          <Grid item xs={12} md={6}>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card
                sx={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(20px)',
                  border: '2px solid rgba(0, 212, 255, 0.3)',
                  borderRadius: '25px',
                  boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
                  maxWidth: 500,
                  mx: 'auto',
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  {/* Header */}
                  <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: 'white',
                        mb: 1,
                        textShadow: '0 2px 8px rgba(0, 212, 255, 0.3)',
                      }}
                    >
                      Create Your Account
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                      }}
                    >
                      Sign up to access your portal
                    </Typography>
                  </Box>

                  {/* Clerk Sign-up Component */}
                  <Box
                    sx={{
                      '& .cl-internal-b3fm6y': {
                        background: 'transparent !important',
                      },
                      '& .cl-formButtonPrimary': {
                        background: 'linear-gradient(45deg, #00d4ff, #0099cc) !important',
                        borderRadius: '25px !important',
                        textTransform: 'none !important',
                        fontWeight: 600,
                        fontSize: '1rem',
                        padding: '12px 24px !important',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #0099cc, #00d4ff) !important',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 8px 25px rgba(0, 212, 255, 0.3)',
                        },
                      },
                      '& .cl-formFieldInput': {
                        background: 'rgba(255, 255, 255, 0.1) !important',
                        border: '1px solid rgba(0, 212, 255, 0.3) !important',
                        borderRadius: '15px !important',
                        color: 'white !important',
                        '&:focus': {
                          border: '1px solid rgba(0, 212, 255, 0.6) !important',
                          boxShadow: '0 0 0 2px rgba(0, 212, 255, 0.2) !important',
                        },
                      },
                      '& .cl-formFieldLabel': {
                        color: 'rgba(255, 255, 255, 0.8) !important',
                      },
                      '& .cl-footerActionLink': {
                        color: '#00d4ff !important',
                        '&:hover': {
                          color: '#0099cc !important',
                        },
                      },
                      '& .cl-dividerLine': {
                        background: 'rgba(255, 255, 255, 0.2) !important',
                      },
                      '& .cl-dividerText': {
                        color: 'rgba(255, 255, 255, 0.6) !important',
                      },
                    }}
                  >
                    <SignUp path="/sign-up" routing="path" />
                  </Box>

                  {/* Demo Credentials */}
                  <Box
                    sx={{
                      mt: 3,
                      p: 2,
                      background: 'rgba(0, 212, 255, 0.1)',
                      borderRadius: '15px',
                      border: '1px solid rgba(0, 212, 255, 0.2)',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.8)',
                        fontWeight: 600,
                        mb: 1,
                      }}
                    >
                      Demo Credentials:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.8rem',
                      }}
                    >
                      Name: Demo User
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.8rem',
                      }}
                    >
                      Email: demo@portal.com
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'rgba(255, 255, 255, 0.6)',
                        fontSize: '0.8rem',
                      }}
                    >
                      Password: demo123
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
