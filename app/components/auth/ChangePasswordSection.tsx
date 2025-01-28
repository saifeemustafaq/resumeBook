'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  LinearProgress,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface PasswordStrength {
  score: number;
  message: string;
  color: string;
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordSection() {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [expanded, setExpanded] = useState<boolean>(false);
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
    setSuccess(false);
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
    setSuccess(false);

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
        throw new Error(data.error || 'Password change failed');
      }

      setSuccess(true);
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
    if (!isExpanded) {
      // Reset form when accordion is collapsed
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setError(null);
      setSuccess(false);
    }
  };

  return (
    <Accordion 
      expanded={expanded} 
      onChange={handleAccordionChange}
      sx={{ mt: 3 }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="change-password-content"
        id="change-password-header"
      >
        <Typography variant="h6">
          Change Password
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
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
              size="small"
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
              size="small"
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
              size="small"
            />
          </Box>

          {error && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          )}

          {success && (
            <Box sx={{ mb: 2 }}>
              <Alert severity="success">Password changed successfully!</Alert>
            </Box>
          )}

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={loading}
            sx={{ mb: 1 }}
          >
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </form>
      </AccordionDetails>
    </Accordion>
  );
} 