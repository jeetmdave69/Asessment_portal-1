import React from 'react';
import { Box, Typography, IconButton, Tooltip } from '@mui/material';

interface BaseOptionProps {
  label: string;
  selected: boolean;
  icon: React.ReactNode;
  onChangeOption: () => void;
  tooltip?: string;
}

export const BaseOption: React.FC<BaseOptionProps> = ({ label, selected, icon, onChangeOption, tooltip }) => (
  <Tooltip title={tooltip || label}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        bgcolor: selected ? 'primary.light' : 'background.paper',
        borderRadius: 1,
        p: 1,
        border: selected ? '2px solid' : '1px solid',
        borderColor: selected ? 'primary.main' : 'grey.300',
      }}
      onClick={onChangeOption}
      tabIndex={0}
      role="button"
      aria-pressed={selected}
      aria-label={label}
      onKeyPress={e => { if (e.key === 'Enter') onChangeOption(); }}
    >
      <IconButton>{icon}</IconButton>
      <Typography variant="body2" sx={{ ml: 1 }}>{label}</Typography>
    </Box>
  </Tooltip>
); 