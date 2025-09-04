import { Box, Typography, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";

interface ModernRedirectLoaderProps {
  name: string;
  redirectUrl: string;
}

export default function ModernRedirectLoader({ name, redirectUrl }: ModernRedirectLoaderProps) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 1200; // 1.2 seconds - much faster
    const interval = 30; // Update every 30ms for smoother progress
    const totalSteps = duration / interval;
    
    let currentStep = 0;
    const timer = setInterval(() => {
      currentStep++;
      const newProgress = Math.min(100, (currentStep / totalSteps) * 100);
      setProgress(newProgress);
      
      if (currentStep >= totalSteps) {
        clearInterval(timer);
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 200);
      }
    }, interval);
    
    return () => clearInterval(timer);
  }, [redirectUrl]);

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          background: '#ffffff',
          borderRadius: 4,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
          px: { xs: 6, sm: 8 },
          py: { xs: 6, sm: 8 },
          minWidth: { xs: 400, sm: 500 },
          maxWidth: 600,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          border: '1px solid #e2e8f0'
        }}
      >
        <CircularProgress
          variant="determinate"
          value={progress}
          size={100}
          thickness={4}
          sx={{ mb: 4, color: '#2563eb' }}
        />
        
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#1e293b', fontSize: { xs: '1.5rem', sm: '2rem' } }}>
          Redirecting to Dashboard
        </Typography>
        
        <Typography variant="h6" sx={{ color: '#64748b', mb: 4, fontWeight: 400, maxWidth: 400, lineHeight: 1.5 }}>
          Please wait while we prepare your workspace, {name}.
        </Typography>
        
        <Box sx={{ width: '100%', mb: 2 }}>
          <Box sx={{ width: '100%', height: 6, background: '#f1f5f9', borderRadius: 3, overflow: 'hidden' }}>
            <Box
              sx={{
                width: `${progress}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #2563eb 0%, #3b82f6 100%)',
                borderRadius: 3,
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
          <Typography
            variant="body1"
            sx={{
              color: '#64748b',
              textAlign: 'center',
              mt: 2,
              fontWeight: 600,
              fontSize: '1.1rem'
            }}
          >
            {Math.round(progress)}% Complete
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 2s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { opacity: 1 },
                '50%': { opacity: 0.5 }
              }
            }}
          />
          <Typography
            variant="body2"
            sx={{
              color: '#64748b',
              fontWeight: 500
            }}
          >
            Secure Connection Active
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}