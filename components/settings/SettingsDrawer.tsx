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

};
