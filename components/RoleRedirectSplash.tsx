import { Box, Typography, CircularProgress } from "@mui/material";
import Image from 'next/image';

interface RoleRedirectSplashProps {
  name: string;
  role: "admin" | "teacher" | "student" | string;
}

export default function RoleRedirectSplash({ name, role }: RoleRedirectSplashProps) {
  const roleDisplayMap = {
    admin: "Administrator",
    teacher: "Educator",
    student: "Student",
    default: "User"
  };

  const roleDisplay = roleDisplayMap[role as keyof typeof roleDisplayMap] || roleDisplayMap.default;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: `
          linear-gradient(120deg, #0f172a 0%, #2563eb 100%),
          radial-gradient(circle at 20% 30%, rgba(56, 189, 248, 0.10) 0%, transparent 25%)
        `,
        color: "#f8fafc",
        textAlign: "center",
        padding: 4,
        position: "relative",
        overflow: "hidden"
      }}
    >
      {/* Subtle grid overlay */}
      <Box 
        sx={{
          position: "absolute",
          width: "100%",
          height: "100%",
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.03) 1px, transparent 0)",
          backgroundSize: "24px 24px",
          pointerEvents: "none"
        }} 
      />

      <Box 
        sx={{ 
          position: "relative",
          zIndex: 1,
          maxWidth: "800px",
          width: "100%"
        }}
      >
        {/* Modern Illustration */}
        <Box mb={3} display="flex" justifyContent="center">
          <Box sx={{
            width: { xs: 120, sm: 180 },
            height: { xs: 32, sm: 48 },
            position: 'relative',
            mx: 'auto',
            filter: 'drop-shadow(0 4px 24px rgba(56,189,248,0.18))',
            animation: 'shimmer 2.2s infinite linear',
            '@keyframes shimmer': {
              '0%': { filter: 'drop-shadow(0 4px 24px rgba(56,189,248,0.18)) brightness(1)' },
              '50%': { filter: 'drop-shadow(0 8px 32px rgba(56,189,248,0.32)) brightness(1.08)' },
              '100%': { filter: 'drop-shadow(0 4px 24px rgba(56,189,248,0.18)) brightness(1)' },
            }
          }}>
            <Image
              src="/assets/illustrations/loading-bar.png"
              alt="Loading bar"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </Box>
        </Box>

        <Typography 
          component="h1"
          variant="h3"
          fontWeight={800}
          mb={2}
          sx={{
            color: "#ffffff",
            letterSpacing: "0.5px",
            lineHeight: 1.2,
            textShadow: '0 2px 16px rgba(30,64,175,0.13)'
          }}
        >
          Welcome, {name}
        </Typography>

        <Typography
          component="p"
          variant="h5"
          mb={4}
          sx={{
            color: "#e0e7ef",
            fontWeight: 400,
            letterSpacing: 0.2,
            mb: 3,
            '& strong': {
              color: "#38bdf8",
              fontWeight: 600
            }
          }}
        >
          Loading <strong>{roleDisplay}</strong> dashboard...
        </Typography>

        <Box mb={5} display="flex" justifyContent="center">
          <CircularProgress 
            size={64}
            thickness={4.5}
            sx={{ 
              color: "#38bdf8",
              '& .MuiCircularProgress-circle': {
                strokeLinecap: "round"
              }
            }} 
          />
        </Box>

        <Typography 
          component="p"
          variant="body1"
          sx={{
            color: "#b6c2d6",
            fontStyle: "italic",
            maxWidth: "600px",
            mx: "auto",
            fontWeight: 500,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            letterSpacing: 0.1,
            '&::before': { content: '"“"', mr: 0.5 },
            '&::after': { content: '"”"', ml: 0.5 }
          }}
        >
          Please wait while we prepare your workspace
        </Typography>
      </Box>
    </Box>
  );
}