'use client';

import {
  Drawer,
  IconButton,
  Typography,
  Switch,
  Box,
  Divider,
} from '@mui/material';
import { Brightness4, Brightness7, Close } from '@mui/icons-material';
import { useSettingsContext } from '@/context/settings-context';
import { useColorScheme } from '@mui/material/styles';

export const SettingsDrawer = () => {
  const { state, setState, openDrawer, onCloseDrawer } = useSettingsContext();
  const { mode, setMode } = useColorScheme();

  const handleToggleDarkMode = () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    setState({ colorScheme: newMode });
  };

  return (
    <Drawer anchor="right" open={openDrawer} onClose={onCloseDrawer}>
      <Box sx={{ width: 300, p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Settings</Typography>
          <IconButton onClick={onCloseDrawer}>
            <Close />
          </IconButton>
        </Box>
        <Divider sx={{ my: 2 }} />

        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography>Dark Mode</Typography>
          <Switch checked={mode === 'dark'} onChange={handleToggleDarkMode} />
        </Box>
      </Box>
    </Drawer>
  );
};
