import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  schoolName: {
    type: String,
    required: true,
  },
  gpa: {
    type: Number,
    required: true,
    min: 1.0,
    max: 4.04,
  },
  yearsOfExperience: {
    type: Number,
    required: true,
    min: 0,
  },
  graduationDate: {
    type: Date,
    required: true,
  },
  linkedinUrl: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => v.includes('linkedin.com'),
      message: 'Must be a valid LinkedIn URL',
    },
  },
  bio: {
    type: String,
    required: true,
    maxlength: 100,
  },
  resumeUrl: {
    type: String,
  },
  profilePictureUrl: {
    type: String,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create indexes
studentProfileSchema.index({ email: 1 });
studentProfileSchema.index({ isApproved: 1 });
studentProfileSchema.index({ gpa: 1 });
studentProfileSchema.index({ yearsOfExperience: 1 });
studentProfileSchema.index({ graduationDate: 1 });

studentProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const StudentProfile = mongoose.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema); 