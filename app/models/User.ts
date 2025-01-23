import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  email: string;
  passwordHash: string;
  role: 'student' | 'admin';
  isFirstLogin: boolean;
  status: 'active' | 'disabled';
  name: string;
  school: string;
  gpa: number;
  yearsOfExperience: number;
  graduationDate: string;
  linkedinUrl: string;
  bio: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  lastLogin: Date;
  passwordResetRequired: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['student', 'admin'],
    required: true,
  },
  isFirstLogin: {
    type: Boolean,
    default: true,
  },
  status: {
    type: String,
    enum: ['active', 'disabled'],
    default: 'active',
  },
  name: String,
  school: String,
  gpa: {
    type: Number,
    min: 1.0,
    max: 4.04,
  },
  yearsOfExperience: Number,
  graduationDate: String,
  linkedinUrl: String,
  bio: {
    type: String,
    maxlength: 100,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastLogin: {
    type: Date,
    default: null,
  },
  passwordResetRequired: {
    type: Boolean,
    default: false,
  },
});

// Add method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Skip hashing if passwordHash hasn't changed or if it's already hashed
  if (!this.isModified('passwordHash') || this.passwordHash.startsWith('$2')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema); 