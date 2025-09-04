import { Box, Typography, CircularProgress } from "@mui/material";

interface SimpleLoaderProps {
  message?: string;
  size?: number;
}

export default function SimpleLoader({ message = "Loading...", size = 40 }: SimpleLoaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        py: 4
      }}
    >
      <CircularProgress size={size} />
      <Typography variant="body2" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );
}
