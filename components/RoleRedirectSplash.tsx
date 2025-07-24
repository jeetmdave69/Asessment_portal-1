import { Box, Typography, LinearProgress } from "@mui/material";
import { useEffect, useState } from "react";

interface RoleRedirectSplashProps {
  name: string;
  redirectUrl: string;
}

export default function RoleRedirectSplash({ name, redirectUrl }: RoleRedirectSplashProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2500; // 2.5 seconds
    const interval = 25;
    let current = 0;
    const step = 100 / (duration / interval);
    const timer = setInterval(() => {
      current += step;
      setProgress((prev) => {
        const next = Math.min(100, prev + step);
        return next;
      });
      if (current >= 100) clearInterval(timer);
    }, interval);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (progress >= 100) {
      window.location.href = redirectUrl;
    }
  }, [progress, redirectUrl]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e3e6ef 100%)",
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <Box
        sx={{
          background: '#fff',
          borderRadius: 4,
          boxShadow: 6,
          px: { xs: 3, sm: 6 },
          py: { xs: 4, sm: 5 },
          minWidth: 480,
          maxWidth: 700,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid #e3e6ef',
          position: 'relative',
        }}
      >
        {/* Accent bar */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 6,
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
          background: 'linear-gradient(90deg, #2563eb 0%, #1a237e 100%)',
        }} />
        <Box width={180} mb={2} mt={2}>
          <Typography variant="body2" sx={{ color: '#1a237e', fontWeight: 600, mb: 0.5, textAlign: 'center' }}>
            {Math.round(progress)}%
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progress}
            color="primary"
            sx={{ height: 8, borderRadius: 4, background: '#e3e6ef' }}
            aria-label="Loading progress"
          />
        </Box>
        <Typography
          component="h1"
          variant="h6"
          fontWeight={600}
          mb={2}
          sx={{ color: "#1a237e", letterSpacing: "0.5px", fontFamily: 'Poppins, sans-serif', textAlign: 'center' }}
        >
          Please wait while we securely redirect you to your dashboard, {name}.
        </Typography>
      </Box>
    </Box>
  );
}