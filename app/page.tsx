'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import StudentCard from './components/StudentCard';
import FilterSection, { FilterState } from './components/FilterSection';
import { Button, Container, Box, Typography, CircularProgress } from '@mui/material';

interface StudentProfile {
  _id: string;
  name: string;
  schoolName: string;
  gpa: number;
  yearsOfExperience: number;
  graduationDate: string;
  linkedinUrl: string;
  bio: string;
  profilePictureUrl?: string;
  resumeUrl?: string;
}

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    gpa: [],
    experience: [],
    graduationYear: []
  });

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/student/profiles');
        if (response.ok) {
          const data = await response.json();
          setStudents(data);
        } else {
          console.error('Failed to fetch student profiles');
        }
      } catch (error) {
        console.error('Error fetching student profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(student => {
      // If no filters are selected in a category, don't filter by that category
      const hasGpaFilter = filters.gpa.length > 0;
      const hasExpFilter = filters.experience.length > 0;
      const hasYearFilter = filters.graduationYear.length > 0;

      // GPA filter
      const gpaPass = !hasGpaFilter || filters.gpa.some(range => {
        const [min, max] = range.split('-').map(Number);
        return student.gpa >= min && student.gpa <= max;
      });

      // Experience filter
      const expPass = !hasExpFilter || filters.experience.some(range => {
        if (range === '6+') return student.yearsOfExperience >= 6;
        const [min, max] = range.split('-').map(Number);
        return student.yearsOfExperience >= min && student.yearsOfExperience <= max;
      });

      // Graduation year filter
      const yearPass = !hasYearFilter || filters.graduationYear.includes(
        new Date(student.graduationDate).getFullYear().toString()
      );

      return gpaPass && expPass && yearPass;
    });
  }, [filters, students]);

  return (
    <Box component="main" sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header with login buttons */}
      <Box component="header" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg" sx={{ py: 3 }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: { xs: 2, sm: 3 }
          }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => router.push('/student-login')}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Student Login
            </Button>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              CMU Resume Book
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => router.push('/admin-login')}
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Admin Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Filter Section */}
      <Box component="section" sx={{ py: 4 }}>
        <Container maxWidth="lg">
          <FilterSection 
            students={students}
            onFilterChange={setFilters}
          />
        </Container>
      </Box>

      {/* Grid of student cards */}
      <Box component="section" sx={{ pb: 8 }}>
        <Container maxWidth="lg">
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredStudents.length > 0 ? (
            <Box sx={{ 
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(4, 1fr)'
              },
              gap: 3,
              justifyItems: 'center'
            }}>
              {filteredStudents.map((student) => (
                <StudentCard 
                  key={student._id}
                  profilePic={student.profilePictureUrl || '/dummy-profile.png'}
                  name={student.name}
                  school={student.schoolName}
                  gpa={student.gpa}
                  experience={student.yearsOfExperience}
                  graduationDate={new Date(student.graduationDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  linkedinUrl={student.linkedinUrl}
                  bio={student.bio}
                  resumeLink={student.resumeUrl || '#'}
                />
              ))}
            </Box>
          ) : (
            <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ py: 4 }}>
              No students found matching the selected filters
            </Typography>
          )}
        </Container>
      </Box>
    </Box>
  );
}
