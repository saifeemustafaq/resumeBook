'use client';

import PasswordResetForm from '@/app/components/auth/PasswordResetForm';
import { Box, Container, Typography, Paper } from '@mui/material';

export default function StudentChangePassword() {
  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            p: 4, 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            Change Student Password
          </Typography>
          <PasswordResetForm />
        </Paper>
      </Box>
    </Container>
  );
} 