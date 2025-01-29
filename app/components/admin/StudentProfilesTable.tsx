'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Button,
  Box,
  Typography,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from '@mui/material';
import { Delete, Visibility, VisibilityOff, LockReset } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import React from 'react';

interface StudentProfile {
  _id: string;
  name: string;
  email: string;
  schoolName: string;
  gpa: number;
  yearsOfExperience: number;
  graduationDate: string;
  isApproved: boolean;
}

export default function StudentProfilesTable() {
  const [profiles, setProfiles] = useState<StudentProfile[]>([]);
  const [resetPasswordDialog, setResetPasswordDialog] = useState<{ open: boolean; userId: string | null; tempPassword: string | null; }>({
    open: false,
    userId: null,
    tempPassword: null
  });

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/admin/profiles');
      if (!response.ok) throw new Error('Failed to fetch profiles');
      const data = await response.json();
      setProfiles(data);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const handleToggleVisibility = async (profileId: string) => {
    try {
      const response = await fetch(`/api/admin/profiles/${profileId}`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error('Failed to update profile visibility');
      const { isApproved } = await response.json();
      setProfiles(profiles.map(profile => 
        profile._id === profileId ? { ...profile, isApproved } : profile
      ));
    } catch (error) {
      console.error('Error updating profile visibility:', error);
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      const response = await fetch(`/api/admin/profiles/${profileId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete profile');
      setProfiles(profiles.filter(profile => profile._id !== profileId));
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reset password');
      const { temporaryPassword } = await response.json();
      setResetPasswordDialog({
        open: true,
        userId,
        tempPassword: temporaryPassword
      });
    } catch (error) {
      console.error('Error resetting password:', error);
    }
  };

  const handleCloseResetDialog = () => {
    setResetPasswordDialog({
      open: false,
      userId: null,
      tempPassword: null
    });
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Student Profiles
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>School</TableCell>
              <TableCell>GPA</TableCell>
              <TableCell>Experience</TableCell>
              <TableCell>Graduation</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profiles.map((profile) => (
              <React.Fragment key={profile._id}>
                <TableRow>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell>{profile.email}</TableCell>
                  <TableCell>{profile.schoolName}</TableCell>
                  <TableCell>{profile.gpa}</TableCell>
                  <TableCell>{profile.yearsOfExperience} years</TableCell>
                  <TableCell>{new Date(profile.graduationDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Chip 
                      label={profile.isApproved ? 'Visible' : 'Hidden'}
                      color={profile.isApproved ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell />
                </TableRow>
                <TableRow sx={{ '& > td': { borderBottom: 'none', py: 1 } }}>
                  <TableCell colSpan={8}>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => handleResetPassword(profile._id)}
                        startIcon={<LockReset />}
                      >
                        Reset Password
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        color={profile.isApproved ? 'error' : 'success'}
                        onClick={() => handleToggleVisibility(profile._id)}
                        startIcon={profile.isApproved ? <VisibilityOff /> : <Visibility />}
                      >
                        {profile.isApproved ? 'Disable' : 'Enable'}
                      </Button>
                      <IconButton
                        onClick={() => handleDeleteProfile(profile._id)}
                        title="Delete Profile"
                        size="small"
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog 
        open={resetPasswordDialog.open} 
        onClose={handleCloseResetDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Temporary Password Generated</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            Please provide this temporary password to the user securely. They will be able to use it to log in and change their password.
          </Alert>
          <Typography variant="body1" sx={{ mt: 2, fontFamily: 'monospace', fontWeight: 'bold' }}>
            {resetPasswordDialog.tempPassword}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseResetDialog} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 