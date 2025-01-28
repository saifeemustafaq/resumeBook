import { useState, useEffect } from 'react';
import Image from 'next/image';
import { uploadFile, deleteFile } from '../../lib/storage';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Stack,
  Alert,
  IconButton,
  Avatar,
  CircularProgress
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

interface ProfileFormData {
  name: string;
  schoolName: string;
  gpa: number;
  yearsOfExperience: number;
  graduationDate: string;
  linkedinUrl: string;
  bio: string;
  resumeUrl: string;
  profilePictureUrl: string;
  resume: File | null;
  profilePicture: File | null;
}

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  schoolName: yup.string().required('School name is required'),
  gpa: yup.number()
    .required('GPA is required')
    .min(1.0, 'GPA must be at least 1.0')
    .max(4.04, 'GPA cannot exceed 4.04'),
  yearsOfExperience: yup.number()
    .required('Years of experience is required')
    .min(0, 'Years cannot be negative'),
  graduationDate: yup.date().required('Graduation date is required'),
  linkedinUrl: yup.string()
    .required('LinkedIn URL is required')
    .url('Must be a valid URL')
    .matches(/linkedin\.com/, 'Must be a LinkedIn URL'),
  bio: yup.string()
    .required('Bio is required')
    .max(100, 'Bio cannot exceed 100 characters'),
});

export default function ProfileForm() {
  const [loading, setLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [resume, setResume] = useState<File | null>(null);

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      schoolName: '',
      gpa: '',
      yearsOfExperience: '',
      graduationDate: null,
      linkedinUrl: '',
      bio: '',
    }
  });

  // Auto-save functionality
  const formValues = watch();
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleAutoSave();
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [formValues]);

  const handleAutoSave = async () => {
    try {
      setAutoSaveStatus('Saving...');
      // TODO: Implement auto-save API call
      setAutoSaveStatus('Saved');
    } catch (error) {
      setAutoSaveStatus('Error saving');
    }
  };

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Implement profile picture upload
      // Validate 1:1 aspect ratio
      const img = new Image();
      img.onload = () => {
        if (img.width !== img.height) {
          alert('Please upload an image with 1:1 aspect ratio');
          return;
        }
        // TODO: Upload to Azure Blob Storage
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleResumeChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.includes('pdf')) {
        alert('Please upload a PDF file');
        return;
      }
      setResume(file);
      // TODO: Upload to Azure Blob Storage
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      // TODO: Implement form submission
      console.log(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      try {
        // TODO: Implement profile deletion
      } catch (error) {
        console.error(error);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Typography variant="h5" gutterBottom>
            Student Profile
          </Typography>

          <Stack spacing={3}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={profilePicture || ''}
                sx={{ width: 100, height: 100 }}
              />
              <Button variant="contained" component="label">
                Upload Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Button variant="contained" component="label">
                Upload Resume (PDF)
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleResumeChange}
                />
              </Button>
              {resume && <Typography variant="caption" display="block">{resume.name}</Typography>}
            </Box>

            <Controller
              name="name"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Name"
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Controller
              name="schoolName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="School Name"
                  error={!!errors.schoolName}
                  helperText={errors.schoolName?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Controller
              name="gpa"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="GPA"
                  type="number"
                  inputProps={{ step: "0.01", min: "1.0", max: "4.04" }}
                  error={!!errors.gpa}
                  helperText={errors.gpa?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Controller
              name="yearsOfExperience"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Years of Experience"
                  type="number"
                  error={!!errors.yearsOfExperience}
                  helperText={errors.yearsOfExperience?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="graduationDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    {...field}
                    label="Graduation Date"
                    views={['year', 'month']}
                    sx={{ mb: 2, width: '100%' }}
                  />
                )}
              />
            </LocalizationProvider>

            <Controller
              name="linkedinUrl"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="LinkedIn URL"
                  error={!!errors.linkedinUrl}
                  helperText={errors.linkedinUrl?.message}
                  sx={{ mb: 2 }}
                />
              )}
            />

            <Controller
              name="bio"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label="Bio"
                  multiline
                  rows={3}
                  error={!!errors.bio}
                  helperText={errors.bio?.message ? errors.bio.message : `${field.value?.length || 0}/100`}
                  inputProps={{ maxLength: 100 }}
                  sx={{ mb: 2 }}
                />
              )}
            />
          </Stack>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Profile'}
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="error"
              size="large"
              onClick={handleDelete}
              startIcon={<DeleteIcon />}
              disabled={loading}
            >
              Delete Profile
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary">
            {autoSaveStatus}
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
} 