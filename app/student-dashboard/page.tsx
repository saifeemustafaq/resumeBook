'use client';

import { Container, Paper, Typography, Box } from '@mui/material';
import ProfileForm from '../components/student/ProfileForm';
import ChangePasswordSection from '../components/auth/ChangePasswordSection';
import Header from '../components/layout/Header';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Check authentication status
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify');
        const data = await response.json();
        
        if (!response.ok || data.user?.role !== 'student') {
          router.push('/student-login');
          return;
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        router.push('/student-login');
      }
    };
    checkAuth();
  }, [router]);

  return (
    <>
      <Header userType="student" />
      <Box sx={{ py: 4 }}>
        <Container maxWidth="md">
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Student Dashboard
            </Typography>
            <Typography variant="body1" paragraph align="center" color="text.secondary">
              Manage your profile and resume information
            </Typography>
            <ProfileForm />
          </Paper>
          <ChangePasswordSection />
        </Container>
      </Box>
    </>
  );
} 