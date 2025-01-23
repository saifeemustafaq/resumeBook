import { useState, useEffect } from 'react';
import Image from 'next/image';
import { uploadFile, deleteFile } from '../../lib/storage';

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
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">School Name</label>
          <input
            type="text"
            name="schoolName"
            value={formData.schoolName}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.schoolName && <p className="text-red-500 text-sm">{errors.schoolName}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">GPA</label>
          <input
            type="number"
            name="gpa"
            step="0.01"
            min="1.0"
            max="4.04"
            value={formData.gpa}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.gpa && <p className="text-red-500 text-sm">{errors.gpa}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Years of Experience</label>
          <input
            type="number"
            name="yearsOfExperience"
            min="0"
            value={formData.yearsOfExperience}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.yearsOfExperience && <p className="text-red-500 text-sm">{errors.yearsOfExperience}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Graduation Date</label>
          <input
            type="month"
            name="graduationDate"
            value={formData.graduationDate}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.graduationDate && <p className="text-red-500 text-sm">{errors.graduationDate}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">LinkedIn URL</label>
          <input
            type="url"
            name="linkedinUrl"
            value={formData.linkedinUrl}
            onChange={handleInputChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          {errors.linkedinUrl && <p className="text-red-500 text-sm">{errors.linkedinUrl}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            maxLength={100}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <p className="text-sm text-gray-500">{formData.bio.length}/100 characters</p>
          {errors.bio && <p className="text-red-500 text-sm">{errors.bio}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Resume (PDF only)</label>
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => handleFileChange(e, 'resume')}
            className="mt-1 block w-full"
          />
          {errors.resume && <p className="text-red-500 text-sm">{errors.resume}</p>}
          {previewUrls.resume && <p className="text-sm text-gray-500">Resume uploaded</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(e, 'profilePicture')}
            className="mt-1 block w-full"
          />
          {errors.profilePicture && <p className="text-red-500 text-sm">{errors.profilePicture}</p>}
          {previewUrls.profilePicture && (
            <div className="mt-2">
              <Image
                src={previewUrls.profilePicture}
                alt="Profile preview"
                width={100}
                height={100}
                className="rounded-full object-cover"
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Save Profile
        </button>
        <button
          type="button"
          onClick={handleDelete}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete Profile
        </button>
      </div>
    </form>
  );
} 