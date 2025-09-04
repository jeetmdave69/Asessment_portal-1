'use client';

import { Fragment } from 'react';
import Portal from '@mui/material/Portal';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface LoadingScreenProps {
  portal?: boolean;
  sx?: object;
  [key: string]: any;
}

export default function LoadingScreen({ portal = false, sx = {}, ...other }: LoadingScreenProps) {
  const PortalWrapper = portal ? Portal : Fragment;

  return (
    <PortalWrapper>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(255, 255, 255, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          ...sx
        }}
        {...other}
      >
        <CircularProgress size={40} />
      </Box>
    </PortalWrapper>
  );
}