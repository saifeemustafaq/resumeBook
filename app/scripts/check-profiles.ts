import connectDB from '../lib/db';
import { StudentProfile } from '../models/StudentProfile';

async function checkProfiles() {
  try {
    console.log('Connecting to database...');
    await connectDB();
    console.log('Connected to database successfully');

    console.log('\nFetching all student profiles...');
    const profiles = await StudentProfile.find({});
    console.log(`Found ${profiles.length} profiles\n`);

    if (profiles.length === 0) {
      console.log('No profiles found in the database');
    } else {
      profiles.forEach((profile, index) => {
        console.log(`Profile ${index + 1}:`);
        console.log('Email:', profile.email);
        console.log('Name:', profile.name);
        console.log('School:', profile.schoolName);
        console.log('GPA:', profile.gpa);
        console.log('Experience:', profile.yearsOfExperience, 'years');
        console.log('Graduation:', new Date(profile.graduationDate).toLocaleDateString());
        console.log('Approved:', profile.isApproved);
        console.log('Created:', profile.createdAt);
        console.log('Updated:', profile.updatedAt);
        console.log('-------------------\n');
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkProfiles(); 