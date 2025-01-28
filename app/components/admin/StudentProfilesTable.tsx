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
} from '@mui/material';
import { Delete, Visibility, VisibilityOff } from '@mui/icons-material';
import { useState, useEffect } from 'react';

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
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {profiles.map((profile) => (
              <TableRow key={profile._id}>
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
                <TableCell align="right">
                  <Button
                    variant="contained"
                    size="small"
                    color={profile.isApproved ? 'error' : 'success'}
                    onClick={() => handleToggleVisibility(profile._id)}
                    startIcon={profile.isApproved ? <VisibilityOff /> : <Visibility />}
                    sx={{ mr: 1 }}
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
} 