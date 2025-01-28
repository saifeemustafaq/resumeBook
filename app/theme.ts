import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#3B82F6', // Blue color similar to Tailwind's blue-500
    },
    secondary: {
      main: '#6B7280', // Gray color similar to Tailwind's gray-500
    },
    error: {
      main: '#EF4444', // Red color similar to Tailwind's red-500
    },
    background: {
      default: '#F9FAFB', // Similar to Tailwind's gray-50
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111827', // Similar to Tailwind's gray-900
      secondary: '#6B7280', // Similar to Tailwind's gray-500
    },
  },
  typography: {
    fontFamily: '"Inter", "system-ui", "-apple-system", "sans-serif"',
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Prevents automatic uppercase transformation
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
      styleOverrides: {
        root: {
          '& .MuiInputLabel-root': {
            transform: 'translate(14px, -9px) scale(0.75)',
            '&.Mui-focused': {
              transform: 'translate(14px, -9px) scale(0.75)',
            },
            '&[data-shrink="true"]': {
              transform: 'translate(14px, -9px) scale(0.75)',
            },
            backgroundColor: '#FFFFFF',
            padding: '0 4px',
          },
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: '#E5E7EB',
              borderWidth: '1px',
              top: 0,
              '& legend': {
                display: 'none',
              },
            },
            '&:hover fieldset': {
              borderColor: '#3B82F6',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#3B82F6',
              borderWidth: '1px',
            },
          },
          '& .MuiInputBase-input': {
            padding: '10px 14px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});

export default theme; 