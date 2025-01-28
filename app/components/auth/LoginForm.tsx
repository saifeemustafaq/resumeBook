'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  TextField, 
  Button, 
  Alert, 
  Box, 
  Typography, 
  Container,
  Link as MuiLink
} from '@mui/material';

interface LoginFormProps {
  userType: 'student' | 'admin';
}

export default function LoginForm({ userType }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/auth/${userType}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.success) {
        if (data.isFirstLogin || data.requiresPasswordReset) {
          router.push(`/${userType}/change-password`);
        } else {
          router.push(`/${userType}-dashboard`);
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          width: '100%'
        }}
      >
        {error && (
          <Alert severity="error" sx={{ width: '100%' }}>
            {error}
          </Alert>
        )}
        
        <TextField
          id="email"
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          variant="outlined"
        />

        <TextField
          id="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          fullWidth
          variant="outlined"
        />

        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Link href="/reset-password" passHref>
            <MuiLink>
              Forgot password?
            </MuiLink>
          </Link>
        </Box>

        <Button
          type="submit"
          disabled={loading}
          variant="contained"
          fullWidth
          sx={{ mt: 1 }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </Box>
    </Container>
  );
} 