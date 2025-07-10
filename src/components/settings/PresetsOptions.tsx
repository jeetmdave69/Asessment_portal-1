import React from 'react';
import { Box, IconButton } from '@mui/material';

interface PresetsOptionsProps {
  options: { name: string; value: string }[];
  value: string;
  onChangeOption: (val: string) => void;
  icon: React.ReactNode;
}

export const PresetsOptions: React.FC<PresetsOptionsProps> = ({ options, value, onChangeOption, icon }) => (
  <Box sx={{ display: 'flex', gap: 2 }}>
    {options.map(opt => (
      <IconButton
        key={opt.name}
        onClick={() => onChangeOption(opt.value)}
        sx={{
          bgcolor: value === opt.value ? 'primary.main' : 'grey.200',
          color: value === opt.value ? 'primary.contrastText' : 'text.primary',
        }}
        aria-label={opt.name}
      >
        {icon}
      </IconButton>
    ))}
  </Box>
); 