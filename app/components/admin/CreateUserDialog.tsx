'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

interface FormData {
  name: string;
  email: string;
  role: 'student' | 'admin';
}

interface CreateUserResponse {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  temporaryPassword: string;
}

export default function CreateUserDialog({ open, onClose, onUserCreated }: CreateUserDialogProps) {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreateUserResponse | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleRoleChange = (e: SelectChangeEvent) => {
    setFormData(prev => ({
      ...prev,
      role: e.target.value as 'student' | 'admin'
    }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          // Initialize with empty/default values for student profile fields
          school: '',
          gpa: null,
          yearsOfExperience: null,
          graduationDate: '',
          linkedinUrl: '',
          bio: '',
          isFirstLogin: true,
          status: 'active',
          passwordResetRequired: true
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      const data = await response.json();
      setCreatedUser(data);
      onUserCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setCreatedUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ name: '', email: '', role: 'student' });
    setError(null);
    setCreatedUser(null);
    setCopySuccess(false);
    onClose();
  };

  const handleCopyPassword = async () => {
    if (createdUser?.temporaryPassword) {
      try {
        await navigator.clipboard.writeText(createdUser.temporaryPassword);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      } catch (err) {
        console.error('Failed to copy password:', err);
      }
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {createdUser ? 'User Created Successfully' : 'Create New User'}
      </DialogTitle>
      {!createdUser ? (
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                required
                fullWidth
                autoFocus
              />
              <TextField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleTextChange}
                required
                fullWidth
              />
              <FormControl fullWidth required>
                <InputLabel id="role-label">Role</InputLabel>
                <Select
                  labelId="role-label"
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleRoleChange}
                >
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Create User
            </Button>
          </DialogActions>
        </form>
      ) : (
        <>
          <DialogContent>
            <Alert severity="success" sx={{ mb: 3 }}>
              User account has been created successfully!
            </Alert>
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                User Details:
              </Typography>
              <Typography variant="body1">
                <strong>Name:</strong> {createdUser.name}
              </Typography>
              <Typography variant="body1">
                <strong>Email:</strong> {createdUser.email}
              </Typography>
              <Typography variant="body1">
                <strong>Role:</strong> {createdUser.role}
              </Typography>
            </Box>
            <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="subtitle2" color="error" gutterBottom>
                    Temporary Password (copy this now):
                  </Typography>
                  <Typography variant="body1" fontFamily="monospace">
                    {createdUser.temporaryPassword}
                  </Typography>
                </Box>
                <Tooltip title={copySuccess ? 'Copied!' : 'Copy to clipboard'}>
                  <IconButton onClick={handleCopyPassword} size="small">
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Please provide these credentials to the user securely. They will be required to change their password upon first login.
              {createdUser.role === 'student' && (
                <> The user will need to complete their profile with additional information when they first log in.</>
              )}
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} variant="contained">
              Close
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
} 