'use client';

import { IconButton, Tooltip } from '@mui/material';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useThemeMode } from '../providers/ThemeModeProvider';
import { useTheme } from '@mui/material/styles';

export function ThemeToggleButton() {
  const { mode, toggleMode } = useThemeMode();
  const theme = useTheme();

  return (
    <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
      <IconButton 
        onClick={toggleMode} 
        sx={{
          color: theme.palette.text.primary,
          backgroundColor: theme.palette.action.hover,
          border: `1px solid ${theme.palette.divider}`,
          width: 40,
          height: 40,
          '&:hover': {
            backgroundColor: theme.palette.action.selected,
            transform: 'scale(1.05)',
          },
          transition: 'all 0.2s ease',
        }}
      >
        {mode === 'dark' ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );
}
