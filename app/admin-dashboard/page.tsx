'use client';

import { Box, Container, Typography, Paper } from '@mui/material';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import UserManagementTable from '../components/admin/UserManagementTable';
import StudentProfilesTable from '../components/admin/StudentProfilesTable';
import ChangePasswordSection from '../components/auth/ChangePasswordSection';
import Header from '../components/layout/Header';

function AdminDashboardContent() {
  return (
    <>
      <Header userType="admin" />
      <Box sx={{ py: 4 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h1" gutterBottom>
            Admin Dashboard
          </Typography>
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Admin & User Account Management
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Manage user accounts, credentials, and access control for both admins and students.
            </Typography>
            <UserManagementTable />
          </Paper>
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Student Resume Profiles
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Review and manage student resume profiles. Enable or disable their visibility on the main dashboard.
            </Typography>
            <StudentProfilesTable />
          </Paper>
          <Paper sx={{ p: 3, mt: 2 }}>
            <ChangePasswordSection />
          </Paper>
        </Container>
      </Box>
    </>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute userType="admin">
      <AdminDashboardContent />
    </ProtectedRoute>
  );
} 