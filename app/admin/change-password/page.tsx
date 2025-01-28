import { Box, Container, Typography, Paper } from '@mui/material';
import PasswordResetForm from '../../components/auth/PasswordResetForm';

export default function AdminPasswordChangePage() {
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
            Change Admin Password
          </Typography>
          <PasswordResetForm />
        </Paper>
      </Box>
    </Container>
  );
} 