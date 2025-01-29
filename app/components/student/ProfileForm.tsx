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
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop/types';

interface ProfileFormData {
  name: string;
  schoolName: string;
  gpa: number;
  yearsOfExperience: typeof EXPERIENCE_RANGES[number];
  graduationDate: Date;
  linkedinUrl: string;
  bio: string;
  resumeUrl?: string;
  profilePictureUrl?: string;
}

const EXPERIENCE_RANGES = ['0-1', '1-3', '3-6', '6+'] as const;

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  schoolName: yup.string()
    .required('School name is required')
    .max(55, 'School name cannot exceed 55 characters'),
  gpa: yup.number()
    .required('GPA is required')
    .min(1.0, 'GPA must be at least 1.0')
    .max(4.04, 'GPA cannot exceed 4.04'),
  yearsOfExperience: yup.string()
    .required('Years of experience is required')
    .oneOf(EXPERIENCE_RANGES, 'Please select a valid experience range'),
  graduationDate: yup.date().required('Graduation date is required'),
  linkedinUrl: yup.string()
    .required('LinkedIn URL is required')
    .url('Must be a valid URL')
    .matches(/linkedin\.com/, 'Must be a LinkedIn URL'),
  bio: yup.string()
    .required('Bio is required')
    .max(100, 'Bio cannot exceed 100 characters'),
});

// Base API URL - makes it easier to change the API path in one place
const API_BASE = '../api';

// Function to create image from crop
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = document.createElement('img');
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error: ErrorEvent) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');  // Handle CORS
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  // Set canvas size to desired dimensions (400x400 for profile pictures)
  canvas.width = 400;
  canvas.height = 400;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        resolve(blob);
      },
      'image/png',
      1
    );
  });
}

export default function ProfileForm() {
  const [loading, setLoading] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<ProfileFormData>({
    resolver: yupResolver(schema),
    mode: 'onChange',
    defaultValues: {
      graduationDate: new Date(),
      name: '',
      schoolName: '',
      gpa: 0,
      yearsOfExperience: '0-1',
      linkedinUrl: '',
      bio: ''
    }
  });

  const bio = watch('bio');

  useEffect(() => {
    // Load existing profile data
    const loadProfile = async () => {
      try {
        console.log('Fetching profile data...');
        const response = await fetch(`${API_BASE}/student/profile`);
        console.log('Profile response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Profile data received:', data);
          // Type-safe setting of form values
          const formFields: Array<keyof ProfileFormData> = ['name', 'schoolName', 'gpa', 'yearsOfExperience', 'graduationDate', 'linkedinUrl', 'bio'];
          formFields.forEach(field => {
            if (field === 'graduationDate' && data[field]) {
              setValue(field, new Date(data[field]));
            } else if (data[field] !== undefined) {
              setValue(field, data[field]);
            }
          });
          
          // Handle file URLs separately
          if (data.profilePictureUrl) {
            setProfilePicture(data.profilePictureUrl);
          }
          if (data.resumeUrl) {
            // Just store the URL, we don't need to set it in the form
            setValue('resumeUrl', data.resumeUrl);
          }
        } else {
          console.error('Failed to fetch profile:', response.statusText);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, [setValue]);

  const handleProfilePictureChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        alert('Please upload a JPG or PNG image');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Create URL for cropper
      const imageUrl = URL.createObjectURL(file);
      setTempImageSrc(imageUrl);
      setCropperOpen(true);
    }
  };

  const handleCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropCancel = () => {
    setCropperOpen(false);
    setTempImageSrc(null);
  };

  const handleCropSave = async () => {
    try {
      if (!tempImageSrc || !croppedAreaPixels) {
        throw new Error('No image to crop');
      }

      setLoading(true);
      const croppedImage = await getCroppedImg(tempImageSrc, croppedAreaPixels);
      
      // Create a new file from the blob with a unique name
      const fileName = `profile-${Date.now()}.png`;
      const croppedFile = new File([croppedImage], fileName, { 
        type: 'image/png',
        lastModified: Date.now()
      });
      
      const formData = new FormData();
      formData.append('file', croppedFile);

      const response = await fetch(`${API_BASE}/student/upload?type=profile`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setProfilePicture(data.url);
        setValue('profilePictureUrl', data.url);
        setAutoSaveStatus('Profile picture updated successfully');
        setCropperOpen(false);
        setTempImageSrc(null);
        
        // Clean up the object URL
        if (tempImageSrc) {
          URL.revokeObjectURL(tempImageSrc);
        }
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Upload failed' }));
        throw new Error(errorData.error || 'Failed to upload profile picture');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setAutoSaveStatus(error instanceof Error ? error.message : 'Failed to upload profile picture');
    } finally {
      setLoading(false);
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
      const formData = new FormData();
      formData.append('file', file);
      try {
        const response = await fetch(`${API_BASE}/student/upload?type=resume`, {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });
        if (response.ok) {
          const data = await response.json();
          setValue('resumeUrl', data.url);
          setAutoSaveStatus('Resume uploaded successfully');
        } else {
          throw new Error('Failed to upload resume');
        }
      } catch (error) {
        console.error('Error uploading resume:', error);
        setAutoSaveStatus('Failed to upload resume');
      }
    }
  };

  const handleRemoveResume = () => {
    setResume(null);
    setValue('resumeUrl', '');
    setAutoSaveStatus('Resume removed');
  };

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/student/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      if (response.ok) {
        setAutoSaveStatus('Saved successfully');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setAutoSaveStatus('Error saving');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete your profile?')) {
      try {
        await fetch(`${API_BASE}/student/profile`, { method: 'DELETE' });
        // Reset form
        window.location.reload();
      } catch (error) {
        console.error('Error deleting profile:', error);
      }
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Stack spacing={3}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Avatar
                src={profilePicture || ''}
                sx={{ width: 100, height: 100, margin: 'auto' }}
              />
              <Button component="label" variant="contained" sx={{ mt: 2 }}>
                Upload Profile Picture
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleProfilePictureChange}
                />
              </Button>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Button component="label" variant="contained" fullWidth>
                {resume ? 'Change Resume' : 'Upload Resume (PDF)'}
                <input
                  type="file"
                  hidden
                  accept=".pdf"
                  onChange={handleResumeChange}
                />
              </Button>
              {resume && (
                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" sx={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {resume.name}
                  </Typography>
                  <IconButton onClick={handleRemoveResume} size="small" color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              )}
            </Box>

            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              {...register('name')}
              error={!!errors.name}
              helperText={errors.name?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="School Name"
              variant="outlined"
              {...register('schoolName')}
              error={!!errors.schoolName}
              helperText={errors.schoolName?.message}
              inputProps={{ maxLength: 55 }}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="GPA"
              variant="outlined"
              type="number"
              inputProps={{ step: 0.01 }}
              {...register('gpa')}
              error={!!errors.gpa}
              helperText={errors.gpa?.message}
              sx={{ mb: 2 }}
            />

            <FormControl 
              fullWidth 
              error={!!errors.yearsOfExperience}
              sx={{ mb: 2 }}
            >
              <InputLabel>Years of Experience</InputLabel>
              <Controller
                name="yearsOfExperience"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    label="Years of Experience"
                  >
                    {EXPERIENCE_RANGES.map((range) => (
                      <MenuItem key={range} value={range}>
                        {range} {range === '6+' ? 'years' : 'years'}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.yearsOfExperience && (
                <FormHelperText>{errors.yearsOfExperience.message}</FormHelperText>
              )}
            </FormControl>

            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Controller
                name="graduationDate"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    label="Graduation Date"
                    {...field}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        variant: "outlined",
                        error: !!errors.graduationDate,
                        helperText: errors.graduationDate?.message,
                        sx: { mb: 2 }
                      }
                    }}
                  />
                )}
              />
            </LocalizationProvider>

            <TextField
              fullWidth
              label="LinkedIn URL"
              variant="outlined"
              {...register('linkedinUrl')}
              error={!!errors.linkedinUrl}
              helperText={errors.linkedinUrl?.message}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Bio"
              variant="outlined"
              multiline
              rows={3}
              {...register('bio')}
              error={!!errors.bio}
              helperText={errors.bio?.message || `${bio?.length || 0}/100 characters`}
              sx={{ mb: 2 }}
            />
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
            <Button
              variant="contained"
              color="error"
              onClick={handleDelete}
            >
              Delete Profile
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
          </Box>

          {autoSaveStatus && (
            <Typography sx={{ mt: 2, textAlign: 'center' }} color="text.secondary">
              {autoSaveStatus}
            </Typography>
          )}
        </Box>

        {/* Image Cropper Dialog */}
        <Dialog
          open={cropperOpen}
          onClose={handleCropCancel}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Crop Profile Picture</DialogTitle>
          <DialogContent>
            <Box sx={{ position: 'relative', height: 400, width: '100%', background: '#333' }}>
              {tempImageSrc && (
                <Cropper
                  image={tempImageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCropCancel}>Cancel</Button>
            <Button 
              onClick={handleCropSave}
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
} 