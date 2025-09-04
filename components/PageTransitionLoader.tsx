import { Box, CircularProgress } from "@mui/material";

export default function PageTransitionLoader() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
      }}
    >
      <CircularProgress size={40} />
    </Box>
  );
}