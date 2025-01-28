'use client';

import { Box, Container, Typography, Paper } from '@mui/material';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import UserManagementTable from '../components/admin/UserManagementTable';

function AdminDashboardContent() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin Dashboard
        </Typography>
        <Paper sx={{ p: 3, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            User Management
          </Typography>
          <UserManagementTable />
        </Paper>
      </Box>
    </Container>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute userType="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
} 