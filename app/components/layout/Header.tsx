'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Link as MuiLink
} from '@mui/material';

interface HeaderProps {
  userType: 'student' | 'admin';
}

export default function Header({ userType }: HeaderProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <AppBar position="sticky" color="default" elevation={1} sx={{ bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        <Toolbar sx={{ justifyContent: 'space-between', px: { xs: 2, sm: 3, lg: 4 } }}>
          <Link href="/" passHref style={{ textDecoration: 'none' }}>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                color: 'text.primary',
                '&:hover': { color: 'primary.main' },
                transition: 'color 0.2s'
              }}
            >
              CMU Resume Book
            </Typography>
          </Link>
          
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {userType === 'student' && (
              <Link href="/student-dashboard" passHref style={{ textDecoration: 'none' }}>
                <Button
                  color="inherit"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary' }
                  }}
                >
                  Dashboard
                </Button>
              </Link>
            )}
            
            {userType === 'admin' && (
              <Link href="/admin-dashboard" passHref style={{ textDecoration: 'none' }}>
                <Button
                  color="inherit"
                  sx={{
                    color: 'text.secondary',
                    '&:hover': { color: 'text.primary' }
                  }}
                >
                  Dashboard
                </Button>
              </Link>
            )}
            
            <Button
              variant="contained"
              onClick={handleLogout}
              sx={{
                textTransform: 'none',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
} 