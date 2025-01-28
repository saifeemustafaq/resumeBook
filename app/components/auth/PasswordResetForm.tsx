'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  LinearProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';

const FormContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  maxWidth: 400,
  margin: '0 auto',
  marginTop: theme.spacing(8),
}));

interface PasswordResetFormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordStrength {
  score: number;
  message: string;
  color: string;
}

export default function PasswordResetForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<PasswordResetFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    score: 0,
    message: '',
    color: 'error',
  });

  const validatePasswordStrength = (password: string): PasswordStrength => {
    let score = 0;
    let message = '';
    let color = 'error';

    if (password.length >= 12) score += 2;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    switch (score) {
      case 0:
      case 1:
        message = 'Very Weak';
        color = 'error';
        break;
      case 2:
        message = 'Weak';
        color = 'error';
        break;
      case 3:
        message = 'Fair';
        color = 'warning';
        break;
      case 4:
        message = 'Good';
        color = 'info';
        break;
      case 5:
      case 6:
        message = 'Strong';
        color = 'success';
        break;
    }

    return { score: (score / 6) * 100, message, color };
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (name === 'newPassword') {
      setPasswordStrength(validatePasswordStrength(value));
    }
    setError(null);
  };

  const validateForm = (): boolean => {
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (passwordStrength.score < 50) {
      setError('Password is not strong enough');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Password reset failed');
      }

      // Get user role from verification endpoint
      const verifyResponse = await fetch('/api/auth/verify', {
        credentials: 'include'
      });
      
      if (!verifyResponse.ok) {
        throw new Error('Failed to verify user role');
      }
      
      const verifyData = await verifyResponse.json();
      const userRole = verifyData.user.role;

      // Redirect based on user role
      router.push(userRole === 'admin' ? '/admin-dashboard' : '/student-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <FormContainer elevation={3}>
      <Typography variant="h5" component="h1" gutterBottom align="center">
        Reset Password
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="Current Password"
            name="currentPassword"
            type="password"
            value={formData.currentPassword}
            onChange={handleChange}
            required
            error={Boolean(error)}
            disabled={loading}
          />
        </Box>

        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            label="New Password"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            required
            error={Boolean(error)}
            disabled={loading}
            helperText="Minimum 12 characters, including uppercase, lowercase, numbers, and special characters"
          />
          {formData.newPassword && (
            <Box sx={{ mt: 1 }}>
              <LinearProgress 
                variant="determinate" 
                value={passwordStrength.score}
                color={passwordStrength.color as any}
              />
              <Typography variant="caption" color={passwordStrength.color}>
                Password Strength: {passwordStrength.message}
              </Typography>
            </Box>
          )}
        </Box>

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            error={Boolean(error)}
            disabled={loading}
          />
        </Box>

        {error && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
          sx={{ mb: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Reset Password'}
        </Button>
      </form>
    </FormContainer>
  );
} 