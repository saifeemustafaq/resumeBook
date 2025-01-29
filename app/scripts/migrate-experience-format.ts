import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../lib/db';
import { StudentProfile } from '../models/StudentProfile';

const EXPERIENCE_RANGES = ['0-1', '1-3', '3-6', '6+'] as const;

function getExperienceRange(years: number): typeof EXPERIENCE_RANGES[number] {
  if (years >= 6) return '6+';
  if (years >= 3) return '3-6';
  if (years >= 1) return '1-3';
  return '0-1';
}

async function migrateExperienceFormat() {
  try {
    await connectDB();
    console.log('Connected to MongoDB Atlas');

    // Find all student profiles
    const profiles = await StudentProfile.find({});
    console.log(`Found ${profiles.length} profiles to update`);

    let updatedCount = 0;
    let skippedCount = 0;

    // Update each profile
    for (const profile of profiles) {
      const currentExp = profile.yearsOfExperience;
      
      // Skip if already in the correct format
      if (typeof currentExp === 'string' && EXPERIENCE_RANGES.includes(currentExp as any)) {
        console.log(`Skipping profile ${profile.email}: already in correct format`);
        skippedCount++;
        continue;
      }

      // Convert numeric experience to range format
      const newExpRange = getExperienceRange(Number(currentExp));
      
      // Update the profile
      await StudentProfile.updateOne(
        { _id: profile._id },
        { $set: { yearsOfExperience: newExpRange } }
      );
      
      console.log(`Updated profile ${profile.email}: ${currentExp} -> ${newExpRange}`);
      updatedCount++;
    }

    console.log('\nMigration completed successfully!');
    console.log(`Updated ${updatedCount} profiles`);
    console.log(`Skipped ${skippedCount} profiles`);

    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error migrating experience format:', error);
    process.exit(1);
  }
}

migrateExperienceFormat(); 