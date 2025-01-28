'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { students } from './data/students';
import StudentCard from './components/StudentCard';
import FilterSection, { FilterState } from './components/FilterSection';
import { Button, Container, Box, Typography } from '@mui/material';

export default function Home() {
  const router = useRouter();
  const [filters, setFilters] = useState<FilterState>({
    gpa: [],
    experience: [],
    graduationYear: []
  });

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
        if (range === '6+') return student.experience >= 6;
        const [min, max] = range.split('-').map(Number);
        return student.experience >= min && student.experience <= max;
      });

      // Graduation year filter
      const yearPass = !hasYearFilter || filters.graduationYear.includes(student.graduationDate.split(' ')[1]);

      return gpaPass && expPass && yearPass;
    });
  }, [filters]);

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
              <StudentCard key={student.id} {...student} />
            ))}
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
