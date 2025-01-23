import mongoose from 'mongoose';

const studentProfileSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  schoolName: { type: String, required: true },
  gpa: { type: Number, required: true, min: 1.0, max: 4.04 },
  yearsOfExperience: { type: Number, required: true, min: 0 },
  graduationDate: { type: String, required: true },
  linkedinUrl: { type: String },
  bio: { type: String, maxlength: 100 },
  resumeUrl: { type: String },
  profilePictureUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

studentProfileSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export const StudentProfile = mongoose.models.StudentProfile || mongoose.model('StudentProfile', studentProfileSchema); 