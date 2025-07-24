import { Box, Typography, CircularProgress } from "@mui/material";
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';

export default function PageTransitionLoader() {
  return (
    <Box
      sx={{
        position: 'fixed',
        zIndex: 2000,
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(245,247,250,0.96)',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <Box
        sx={{
          background: '#fff',
          borderRadius: 4,
          boxShadow: 6,
          px: { xs: 5, sm: 8 },
          py: { xs: 5, sm: 7 },
          minWidth: 600,
          maxWidth: 900,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          border: '1px solid #e3e6ef',
        }}
      >
        <ShieldOutlinedIcon sx={{ color: "#2563eb", fontSize: 38, mb: 1 }} />
        <CircularProgress size={40} sx={{ color: "#1a237e", mb: 2 }} />
        <Typography variant="h6" fontWeight={600} sx={{ color: "#1a237e", textAlign: 'center', fontSize: '2rem' }}>
          Please wait…
        </Typography>
        <Typography variant="body2" sx={{ color: "#4b5563", textAlign: 'center', mt: 1 }}>
          This will only take a moment. <br />
          Your session is secure.
        </Typography>
      </Box>
    </Box>
  );
} 