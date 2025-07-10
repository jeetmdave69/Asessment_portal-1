import React from 'react';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';

interface FontSizeOptionsProps {
  options: number[];
  value: number;
  onChangeOption: (val: number) => void;
}

export const FontSizeOptions: React.FC<FontSizeOptionsProps> = ({ options, value, onChangeOption }) => (
  <ToggleButtonGroup
    value={value}
    exclusive
    onChange={(_, newValue) => { if (newValue !== null) onChangeOption(newValue); }}
    aria-label="font size"
  >
    {options.map(size => (
      <ToggleButton key={size} value={size} aria-label={`Font size ${size}`}>
        {size}
      </ToggleButton>
    ))}
  </ToggleButtonGroup>
); 