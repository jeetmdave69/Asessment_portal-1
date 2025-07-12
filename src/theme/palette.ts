import { PaletteOptions } from '@mui/material/styles';

const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: '#2065D1',
  },
};

const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#2065D1',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: '#aaaaaa',
  },
};

export const palette = {
  light: lightPalette,
  dark: darkPalette,
};

export default lightPalette; // 👈 used by default in createTheme()
