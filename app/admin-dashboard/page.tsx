'use client';

import { Box, Container, Typography, Paper } from '@mui/material';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function AdminDashboardContent() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Welcome to the admin dashboard
          </Typography>
          <Typography>
            Here you can manage users, review profiles, and handle system settings.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
} 