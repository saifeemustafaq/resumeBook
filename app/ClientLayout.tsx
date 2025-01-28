'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main style={{ minHeight: '100vh', backgroundColor: theme.palette.background.default }}>
        {children}
      </main>
    </ThemeProvider>
  );
} 