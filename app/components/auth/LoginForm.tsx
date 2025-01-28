'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
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

  const verifyAndRedirect = async (redirectPath: string) => {
    try {
      console.log('=== Verification Step ===');
      console.log('Attempting to verify session...');
      
      // Verify that we're actually logged in
      const verifyResponse = await fetch('/api/auth/verify', {
        credentials: 'include'
      });
      
      console.log('Verify response status:', verifyResponse.status);
      const verifyData = await verifyResponse.json();
      console.log('Verify response data:', verifyData);
      
      if (verifyResponse.ok) {
        console.log('✅ Verification successful');
        console.log('Redirecting to:', redirectPath);
        window.location.href = redirectPath;
      } else {
        console.log('❌ Verification failed');
        throw new Error('Login succeeded but verification failed');
      }
    } catch (err) {
      console.error('❌ Verification error:', err);
      setError('Login succeeded but session verification failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log('=== Login Attempt ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('User type:', userType);
    console.log('Email:', email);
    
    setError('');
    setLoading(true);

    try {
      console.log('Making login API request...');
      const response = await fetch(`/api/auth/${userType}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      console.log('Login response status:', response.status);
      const data = await response.json();
      console.log('Login response data:', data);

      if (!response.ok) {
        console.log('❌ Login failed:', data.error);
        throw new Error(data.error || 'Login failed');
      }

      console.log('✅ Login successful');
      
      // Always redirect to dashboard
      const redirectPath = `/${userType}-dashboard`;
      console.log('Redirecting to:', redirectPath);
      
      // Verify auth and redirect
      await verifyAndRedirect(redirectPath);
      
    } catch (err) {
      console.error('❌ Login error:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs">
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          mt: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 2
        }}
      >
        {error && <Alert severity="error">{error}</Alert>}
        
        <TextField
          required
          fullWidth
          id="email"
          label="Email Address"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
        />
        
        <TextField
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={loading}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ mt: 3, mb: 2 }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>

        <NextLink href="/reset-password" passHref>
          <MuiLink component="span" variant="body2">
            Forgot password?
          </MuiLink>
        </NextLink>
      </Box>
    </Container>
  );
} 