'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  IconButton,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Grow,
  Pagination,
  Chip,
} from '@mui/material';
import {
  KeyboardArrowDown,
  KeyboardArrowRight,
  KeyboardArrowLeft,
  School,
  Psychology,
  Analytics,
  Star,
  Email,
  ArrowForward,
  Rocket,
  TrendingUp,
  Security,
  Speed,
  Lightbulb,
  Group,
  Assessment,
  Timeline,
  AutoAwesome,
} from '@mui/icons-material';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import type { Engine, Container as ParticlesContainer } from 'tsparticles-engine';

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [email, setEmail] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -300]);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/dashboard');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleSignUp = () => {
    router.push('/sign-up');
  };

  const handleLogin = () => {
    router.push('/sign-in');
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  // Initialize tsparticles
  const particlesInit = async (main: Engine): Promise<void> => {
    await loadSlim(main);
  };

  const particlesLoaded = async (container?: ParticlesContainer): Promise<void> => {};

  const features = [
    {
      icon: <Psychology sx={{ fontSize: 40, color: '#00d4ff' }} />,
      title: "AI-Powered Learning",
      description: "Advanced artificial intelligence that adapts to your learning style and pace."
    },
    {
      icon: <Analytics sx={{ fontSize: 40, color: '#00d4ff' }} />,
      title: "Real-time Analytics",
      description: "Comprehensive insights into your performance and progress tracking."
    },
    {
      icon: <School sx={{ fontSize: 40, color: '#00d4ff' }} />,
      title: "Interactive Assessments",
      description: "Engaging quizzes and tests that make learning enjoyable and effective."
    },
    {
      icon: <Assessment sx={{ fontSize: 40, color: '#00d4ff' }} />,
      title: "Smart Evaluation",
      description: "Intelligent evaluation system that provides detailed feedback and recommendations."
    },
    {
      icon: <Timeline sx={{ fontSize: 40, color: '#00d4ff' }} />,
      title: "Progress Tracking",
      description: "Track your learning journey with detailed progress reports and milestones."
    },
    {
      icon: <AutoAwesome sx={{ fontSize: 40, color: '#00d4ff' }} />,
      title: "Personalized Experience",
      description: "Tailored learning experience that adapts to your individual needs and preferences."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Student",
      content: "The AI-powered assessment system has completely transformed how I study and prepare for exams. The personalized feedback is incredible!",
      rating: 5,
      avatar: "SJ"
    },
    {
      name: "Dr. Michael Chen",
      role: "Professor",
      content: "As an educator, I love how this platform adapts to each student's learning pace and style. It's revolutionized my teaching approach.",
      rating: 5,
      avatar: "MC"
    },
    {
      name: "Emily Rodriguez",
      role: "Student",
      content: "The personalized feedback and analytics help me understand exactly where I need to improve. It's like having a personal tutor!",
      rating: 5,
      avatar: "ER"
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', background: '#000', overflow: 'hidden' }}>
      {/* Particles Background */}
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
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 0,
          }}
        />
      )}

      {/* Header */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(0, 212, 255, 0.2)',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <School sx={{ fontSize: 32, color: '#00d4ff' }} />
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                OctaMind
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={handleLogin}
              sx={{
                borderRadius: '25px',
                px: 3,
                py: 1,
                textTransform: 'none',
                fontWeight: 600,
                background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
                boxShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 30px rgba(0, 212, 255, 0.4)',
                  background: 'linear-gradient(45deg, #0099cc, #00d4ff)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Main Content */}
      <Box ref={containerRef} sx={{ position: 'relative', zIndex: 1, background: 'transparent' }}>
        {/* Hero Section */}
    <Box
      sx={{
        minHeight: '100vh',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            background: 'transparent',
          }}
        >
          <Container maxWidth="lg" sx={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Fade in timeout={1000}>
                  <Box>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                    >
                      <Typography
                        variant="h2"
                        sx={{
                          fontWeight: 800,
                          color: 'white',
                          mb: 2,
                          fontSize: { xs: '2.5rem', md: '3.5rem' },
                          lineHeight: 1.2,
                          textShadow: '0 4px 20px rgba(0, 212, 255, 0.3), 0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.8)',
                        }}
                      >
                        India's AI-Based Assessment Platform
                      </Typography>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                    >
                      <Typography
                        variant="h5"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.9)',
                          mb: 2,
                          fontWeight: 300,
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.8)',
                        }}
                      >
                        Transform your learning experience with intelligent, personalized assessments
                      </Typography>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.6 }}
                    >
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.7)',
                          mb: 4,
                          fontSize: '1.1rem',
                          lineHeight: 1.6,
                          textShadow: '0 2px 8px rgba(0, 0, 0, 0.9), 0 1px 2px rgba(0, 0, 0, 0.8)',
                        }}
                      >
                        Experience the future of education with our cutting-edge AI-powered assessment system that adapts to every student's unique learning style.
                      </Typography>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: 0.8 }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        onClick={handleSignUp}
                        sx={{
                          borderRadius: '30px',
                          px: 4,
                          py: 1.5,
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '1.1rem',
                          background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
                          color: 'white',
                          boxShadow: '0 8px 32px rgba(0, 212, 255, 0.3)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #0099cc, #00d4ff)',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 12px 40px rgba(0, 212, 255, 0.4)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      >
                        Get Started
                        <ArrowForward sx={{ ml: 1 }} />
                      </Button>
                    </motion.div>
                  </Box>
                </Fade>
              </Grid>
              <Grid item xs={12} md={6}>
                <Slide direction="left" in timeout={1000}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '100%',
                    }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 1, delay: 0.5 }}
                    >
                      <Box
                        sx={{
                          width: { xs: 300, md: 400 },
                          height: { xs: 300, md: 400 },
                          background: 'rgba(0, 212, 255, 0.1)',
                          borderRadius: '30px',
                          backdropFilter: 'blur(20px)',
                          border: '2px solid rgba(0, 212, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 20px 60px rgba(0, 212, 255, 0.2)',
                        }}
                      >
                        <Rocket sx={{ fontSize: 80, color: '#00d4ff' }} />
                      </Box>
                    </motion.div>
                  </Box>
                </Slide>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Box
          component="section"
          sx={{
            py: 8,
            background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h3"
                sx={{
                  textAlign: 'center',
                  fontWeight: 700,
                  mb: 6,
                  color: 'white',
                  textShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
                }}
              >
                Why Choose Our Platform?
              </Typography>
            </motion.div>
            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: '0 16px 48px rgba(0, 212, 255, 0.2)',
                          border: '1px solid rgba(0, 212, 255, 0.4)',
                        },
                      }}
                    >
                      <CardContent sx={{ textAlign: 'center', p: 4 }}>
                        <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 600, mb: 2, color: 'white' }}
                        >
                          {feature.title}
                        </Typography>
                        <Typography
                          variant="body1"
                          sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.6 }}
                        >
                          {feature.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Unique Features Section */}
        <Box
          component="section"
          sx={{
            py: 8,
            background: 'linear-gradient(135deg, #000000 0%, #0a0a0a 100%)',
            position: 'relative',
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
          }}
        >
          <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h3"
                sx={{
                  textAlign: 'center',
                  fontWeight: 700,
                  mb: 2,
                  color: 'white',
                  textShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
                }}
              >
                Unique Features
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  textAlign: 'center',
                  mb: 6,
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 300,
                }}
              >
                Cutting-edge technology that sets us apart
              </Typography>
            </motion.div>

            {/* AI Powered Insights Feature */}
            <Box sx={{ mb: 8 }}>
              <Grid container spacing={6} alignItems="center">
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 204, 0.1) 100%)',
                        borderRadius: '30px',
                        p: 4,
                        border: '2px solid rgba(0, 212, 255, 0.3)',
                        backdropFilter: 'blur(20px)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -50,
                          right: -50,
                          width: 100,
                          height: 100,
                          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
                          borderRadius: '50%',
                          animation: 'pulse 3s ease-in-out infinite',
                        },
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          mb: 3,
                          color: 'white',
                          textShadow: '0 2px 8px rgba(0, 212, 255, 0.3)',
                        }}
                      >
                        AI-Powered Insights
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          mb: 3,
                          lineHeight: 1.8,
                          fontSize: '1.1rem',
                        }}
                      >
                        Our advanced AI system analyzes student performance patterns in real-time, providing personalized insights and recommendations for improvement.
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {['Performance Analytics', 'Learning Patterns', 'Predictive Insights', 'Personalized Recommendations'].map((item, index) => (
                          <Chip
                            key={index}
                            label={item}
                            sx={{
                              background: 'rgba(0, 212, 255, 0.2)',
                              color: 'white',
                              border: '1px solid rgba(0, 212, 255, 0.4)',
                              '&:hover': {
                                background: 'rgba(0, 212, 255, 0.3)',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        minHeight: 400,
                      }}
                    >
                      <Box
                        sx={{
                          width: 300,
                          height: 300,
                          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 204, 0.1) 100%)',
                          borderRadius: '50%',
                          border: '3px solid rgba(0, 212, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            height: '80%',
                            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
                            borderRadius: '50%',
                            animation: 'rotate 10s linear infinite',
                          },
                        }}
                      >
                        <Psychology sx={{ fontSize: 80, color: '#00d4ff', zIndex: 1, position: 'relative' }} />
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>

            {/* Anti-Cheating Interface Feature */}
            <Box>
              <Grid container spacing={6} alignItems="center" direction="row-reverse">
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                  >
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 204, 0.1) 100%)',
                        borderRadius: '30px',
                        p: 4,
                        border: '2px solid rgba(0, 212, 255, 0.3)',
                        backdropFilter: 'blur(20px)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          bottom: -50,
                          left: -50,
                          width: 100,
                          height: 100,
                          background: 'radial-gradient(circle, rgba(0, 212, 255, 0.2) 0%, transparent 70%)',
                          borderRadius: '50%',
                          animation: 'pulse 3s ease-in-out infinite 1.5s',
                        },
                      }}
                    >
                      <Typography
                        variant="h4"
                        sx={{
                          fontWeight: 700,
                          mb: 3,
                          color: 'white',
                          textShadow: '0 2px 8px rgba(0, 212, 255, 0.3)',
                        }}
                      >
                        Highly Secure Anti-Cheating Interface
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'rgba(255, 255, 255, 0.8)',
                          mb: 3,
                          lineHeight: 1.8,
                          fontSize: '1.1rem',
                        }}
                      >
                        Advanced security measures including facial recognition, screen monitoring, and AI-powered behavior analysis to ensure exam integrity.
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {['Facial Recognition', 'Screen Monitoring', 'Behavior Analysis', 'Real-time Alerts'].map((item, index) => (
                          <Chip
                            key={index}
                            label={item}
                            sx={{
                              background: 'rgba(0, 212, 255, 0.2)',
                              color: 'white',
                              border: '1px solid rgba(0, 212, 255, 0.4)',
                              '&:hover': {
                                background: 'rgba(0, 212, 255, 0.3)',
                              },
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
                <Grid item xs={12} md={6}>
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    viewport={{ once: true }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        minHeight: 400,
                      }}
                    >
                      <Box
                        sx={{
                          width: 300,
                          height: 300,
                          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 204, 0.1) 100%)',
                          borderRadius: '20px',
                          border: '3px solid rgba(0, 212, 255, 0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '80%',
                            height: '80%',
                            background: 'radial-gradient(circle, rgba(0, 212, 255, 0.1) 0%, transparent 70%)',
                            borderRadius: '20px',
                            animation: 'pulse 2s ease-in-out infinite',
                          },
                        }}
                      >
                        <Security sx={{ fontSize: 80, color: '#00d4ff', zIndex: 1, position: 'relative' }} />
                      </Box>
                    </Box>
                  </motion.div>
                </Grid>
              </Grid>
            </Box>
          </Container>
        </Box>

        {/* Testimonials Section */}
        <Box
          component="section"
          sx={{
            py: 8,
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Typography
                variant="h3"
                sx={{
                  textAlign: 'center',
                  fontWeight: 700,
                  mb: 6,
                  color: 'white',
                  textShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
                }}
              >
                What Our Users Say
              </Typography>
            </motion.div>
            <Grid container spacing={4}>
              {testimonials.map((testimonial, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: index * 0.2 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      sx={{
                        height: '100%',
                        borderRadius: '20px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(0, 212, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <CardContent sx={{ p: 4 }}>
                        <Box sx={{ display: 'flex', mb: 2 }}>
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} sx={{ color: '#00d4ff', fontSize: 20 }} />
                          ))}
                        </Box>
                        <Typography
                          variant="body1"
                          sx={{
                            mb: 3,
                            fontStyle: 'italic',
                            color: 'rgba(255, 255, 255, 0.8)',
                            lineHeight: 1.6,
                          }}
                        >
                          "{testimonial.content}"
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box
                            sx={{
                              width: 50,
                              height: 50,
                              borderRadius: '50%',
                              background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          >
                            {testimonial.avatar}
                          </Box>
                          <Box>
                            <Typography
                              variant="h6"
                              sx={{ fontWeight: 600, color: 'white' }}
                            >
                              {testimonial.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: 'rgba(255, 255, 255, 0.6)' }}
                            >
                              {testimonial.role}
                            </Typography>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Newsletter Section */}
        <Box
          component="section"
          sx={{
            py: 8,
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
          }}
        >
          <Container maxWidth="md">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
            >
              <Box
                sx={{
                  textAlign: 'center',
                  background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(0, 153, 204, 0.1) 100%)',
                  borderRadius: '30px',
                  p: 6,
                  border: '2px solid rgba(0, 212, 255, 0.3)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                    color: 'white',
                    textShadow: '0 4px 20px rgba(0, 212, 255, 0.3)',
                  }}
                >
                  Stay Updated
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 4,
                    color: 'rgba(255, 255, 255, 0.8)',
                  }}
                >
                  Subscribe to our newsletter for the latest updates and educational insights
                </Typography>
                <Box
                  component="form"
                  onSubmit={handleNewsletterSubmit}
                  sx={{
                    display: 'flex',
                    gap: 2,
                    maxWidth: 400,
                    mx: 'auto',
                    flexDirection: { xs: 'column', sm: 'row' },
                  }}
                >
                  <TextField
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    sx={{
                      flex: 1,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '25px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        color: 'white',
                        '& fieldset': {
                          border: '1px solid rgba(0, 212, 255, 0.3)',
                        },
                        '&:hover fieldset': {
                          border: '1px solid rgba(0, 212, 255, 0.5)',
                        },
                        '&.Mui-focused fieldset': {
                          border: '1px solid rgba(0, 212, 255, 0.7)',
                        },
                        '& input': {
                          color: 'white',
                          '&::placeholder': {
                            color: 'rgba(255, 255, 255, 0.5)',
                          },
                        },
                      },
                    }}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{
                      borderRadius: '25px',
                      px: 3,
                      py: 1.5,
                      textTransform: 'none',
                      fontWeight: 600,
                      background: 'linear-gradient(45deg, #00d4ff, #0099cc)',
                      color: 'white',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #0099cc, #00d4ff)',
                      },
                    }}
                  >
                    Subscribe
                    <Email sx={{ ml: 1 }} />
                  </Button>
                </Box>
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* Footer */}
        <Box
          component="footer"
          sx={{
            py: 4,
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
            borderTop: '1px solid rgba(0, 212, 255, 0.2)',
          }}
        >
          <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
                justifyContent: 'space-between',
          alignItems: 'center',
                flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <School sx={{ fontSize: 24, color: '#00d4ff' }} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'white' }}>
                  OctaMind
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                © 2024 OctaMind. All rights reserved.
        </Typography>
            </Box>
          </Container>
        </Box>
      </Box>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }
        
        @keyframes rotate {
          from {
            transform: translate(-50%, -50%) rotate(0deg);
          }
          to {
            transform: translate(-50%, -50%) rotate(360deg);
          }
        }
      `}</style>
    </Box>
  );
}
