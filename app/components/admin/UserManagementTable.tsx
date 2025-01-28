import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TextField,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import { Delete, Edit, Lock, LockOpen } from '@mui/icons-material';
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'disabled';
  lastLogin: string;
}

export default function UserManagementTable() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reset password');
      // Handle success (e.g., show notification)
    } catch (error) {
      console.error('Error resetting password:', error);
      // Handle error (e.g., show error message)
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete user');
      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) throw new Error('Failed to update user status');
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus as 'active' | 'disabled' } : user
      ));
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleBulkImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/admin/users/bulk', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) throw new Error('Failed to import users');
      // Refresh users list
    } catch (error) {
      console.error('Error importing users:', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          label="Search users"
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearch}
          sx={{ width: 300 }}
        />
        <Box>
          <Button
            variant="contained"
            component="label"
            sx={{ mr: 1 }}
          >
            Import Users
            <input
              type="file"
              hidden
              accept=".csv"
              onChange={handleBulkImport}
            />
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const csvContent = "data:text/csv;charset=utf-8," + 
                "Name,Email,Status,Last Login\n" +
                users.map(user => 
                  `${user.name},${user.email},${user.status},${user.lastLogin}`
                ).join("\n");
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement("a");
              link.setAttribute("href", encodedUri);
              link.setAttribute("download", "users.csv");
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Export Users
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users
              .filter(user => 
                user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip 
                      label={user.status}
                      color={user.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(user.lastLogin).toLocaleString()}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleResetPassword(user.id)}
                      title="Reset Password"
                      size="small"
                    >
                      <Lock />
                    </IconButton>
                    <IconButton
                      onClick={() => handleToggleStatus(user.id, user.status)}
                      title={user.status === 'active' ? 'Disable User' : 'Enable User'}
                      size="small"
                    >
                      {user.status === 'active' ? <LockOpen /> : <Lock />}
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteUser(user.id)}
                      title="Delete User"
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