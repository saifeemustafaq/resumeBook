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
  Avatar
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Delete as DeleteIcon } from '@mui/icons-material';

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

export default function ProfileForm() {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    schoolName: '',
    gpa: 0,
    yearsOfExperience: 0,
    graduationDate: '',
    linkedinUrl: '',
    bio: '',
    resumeUrl: '',
    profilePictureUrl: '',
    resume: null,
    profilePicture: null,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [previewUrls, setPreviewUrls] = useState({
    profilePicture: '',
    resume: '',
  });

  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProfileFormData, string>> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.schoolName) newErrors.schoolName = 'School name is required';
    if (formData.gpa < 1.0 || formData.gpa > 4.04) newErrors.gpa = 'GPA must be between 1.0 and 4.04';
    if (formData.yearsOfExperience < 0) newErrors.yearsOfExperience = 'Years of experience must be positive';
    if (!formData.graduationDate) newErrors.graduationDate = 'Graduation date is required';
    if (formData.linkedinUrl && !formData.linkedinUrl.includes('linkedin.com')) {
      newErrors.linkedinUrl = 'Invalid LinkedIn URL';
    }
    if (formData.bio && formData.bio.length > 100) newErrors.bio = 'Bio must be 100 characters or less';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'resume' | 'profilePicture') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      if (type === 'resume' && !file.type.includes('pdf')) {
        setErrors(prev => ({ ...prev, resume: 'Only PDF files are allowed' }));
        return;
      }

      if (type === 'profilePicture' && !file.type.includes('image')) {
        setErrors(prev => ({ ...prev, profilePicture: 'Only image files are allowed' }));
        return;
      }

      // Upload to Azure Storage
      const url = await uploadFile(
        file,
        type === 'resume' ? 'resumes' : 'profiles',
        'user@example.com' // Replace with actual user email from session
      );

      // If there was a previous file, delete it
      if (type === 'resume' && formData.resumeUrl) {
        await deleteFile(formData.resumeUrl);
      } else if (type === 'profilePicture' && formData.profilePictureUrl) {
        await deleteFile(formData.profilePictureUrl);
      }

      setFormData(prev => ({
        ...prev,
        [type]: file,
        [`${type}Url`]: url
      }));

      // Set preview for UI
      const previewUrl = URL.createObjectURL(file);
      setPreviewUrls(prev => ({ ...prev, [type]: previewUrl }));

      // Clear any previous errors
      setErrors(prev => ({ ...prev, [type]: undefined }));
    } catch (error) {
      if (error instanceof Error) {
        setErrors(prev => ({ ...prev, [type]: error.message }));
      } else {
        setErrors(prev => ({ ...prev, [type]: 'Failed to upload file' }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const profileData = {
        name: formData.name,
        schoolName: formData.schoolName,
        gpa: formData.gpa,
        yearsOfExperience: formData.yearsOfExperience,
        graduationDate: formData.graduationDate,
        linkedinUrl: formData.linkedinUrl,
        bio: formData.bio,
        resumeUrl: formData.resumeUrl,
        profilePictureUrl: formData.profilePictureUrl,
      };

      const response = await fetch('/api/student/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (!response.ok) throw new Error('Failed to save profile');
      // Handle success (e.g., show success message)
    } catch (error) {
      console.error('Error saving profile:', error);
      // Handle error (e.g., show error message)
    }
  };

  const handleDelete = async () => {
    try {
      // Delete files from Azure Storage
      if (formData.resumeUrl) {
        await deleteFile(formData.resumeUrl);
      }
      if (formData.profilePictureUrl) {
        await deleteFile(formData.profilePictureUrl);
      }

      const response = await fetch('/api/student/profile', {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete profile');
      
      // Reset form
      setFormData({
        name: '',
        schoolName: '',
        gpa: 0,
        yearsOfExperience: 0,
        graduationDate: '',
        linkedinUrl: '',
        bio: '',
        resumeUrl: '',
        profilePictureUrl: '',
        resume: null,
        profilePicture: null,
      });
      setPreviewUrls({ profilePicture: '', resume: '' });
    } catch (error) {
      console.error('Error deleting profile:', error);
      // Handle error
    }
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={2} sx={{ p: 4, mt: 4 }}>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              error={!!errors.name}
              helperText={errors.name}
              fullWidth
              required
            />

            <TextField
              label="School Name"
              name="schoolName"
              value={formData.schoolName}
              onChange={handleInputChange}
              error={!!errors.schoolName}
              helperText={errors.schoolName}
              fullWidth
              required
            />

            <TextField
              label="GPA"
              name="gpa"
              type="number"
              inputProps={{ step: "0.01", min: "1.0", max: "4.04" }}
              value={formData.gpa}
              onChange={handleInputChange}
              error={!!errors.gpa}
              helperText={errors.gpa}
              fullWidth
              required
            />

            <TextField
              label="Years of Experience"
              name="yearsOfExperience"
              type="number"
              inputProps={{ min: "0" }}
              value={formData.yearsOfExperience}
              onChange={handleInputChange}
              error={!!errors.yearsOfExperience}
              helperText={errors.yearsOfExperience}
              fullWidth
              required
            />

            <TextField
              label="Graduation Date"
              name="graduationDate"
              type="month"
              value={formData.graduationDate}
              onChange={handleInputChange}
              error={!!errors.graduationDate}
              helperText={errors.graduationDate}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="LinkedIn URL"
              name="linkedinUrl"
              value={formData.linkedinUrl}
              onChange={handleInputChange}
              error={!!errors.linkedinUrl}
              helperText={errors.linkedinUrl}
              fullWidth
            />

            <TextField
              label="Bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              error={!!errors.bio}
              helperText={errors.bio ? errors.bio : `${formData.bio.length}/100 characters`}
              multiline
              rows={4}
              fullWidth
            />

            <Box>
              <input
                type="file"
                accept="image/*"
                id="profile-picture-input"
                onChange={(e) => handleFileChange(e, 'profilePicture')}
                style={{ display: 'none' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {previewUrls.profilePicture ? (
                  <Avatar
                    src={previewUrls.profilePicture}
                    sx={{ width: 100, height: 100 }}
                  />
                ) : (
                  <Avatar sx={{ width: 100, height: 100 }} />
                )}
                <Box>
                  <Button
                    component="label"
                    htmlFor="profile-picture-input"
                    variant="outlined"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Profile Picture
                  </Button>
                  {errors.profilePicture && (
                    <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                      {errors.profilePicture}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Box>

            <Box>
              <input
                type="file"
                accept=".pdf"
                id="resume-input"
                onChange={(e) => handleFileChange(e, 'resume')}
                style={{ display: 'none' }}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  component="label"
                  htmlFor="resume-input"
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                >
                  Upload Resume (PDF)
                </Button>
                {formData.resume && (
                  <Typography variant="body2">
                    {formData.resume.name}
                  </Typography>
                )}
              </Box>
              {errors.resume && (
                <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>
                  {errors.resume}
                </Typography>
              )}
            </Box>
          </Stack>

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              Save Profile
            </Button>
            <Button
              type="button"
              variant="outlined"
              color="error"
              size="large"
              onClick={handleDelete}
              startIcon={<DeleteIcon />}
            >
              Delete Profile
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
} 