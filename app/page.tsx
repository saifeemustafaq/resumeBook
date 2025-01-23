'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { students } from './data/students';
import StudentCard from './components/StudentCard';
import FilterSection, { FilterState } from './components/FilterSection';

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
    <div className="min-h-screen">
      {/* Header with login buttons */}
      <header className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <button 
            onClick={() => router.push('/student-login')}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-6"
          >
            Student Login
          </button>
          <h1 className="text-3xl font-bold text-foreground">CMU Resume Book</h1>
          <button 
            onClick={() => router.push('/admin-login')}
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-6"
          >
            Admin Login
          </button>
        </div>
      </header>

      {/* Divider */}
      <div className="container mx-auto">
        <div className="h-px bg-border"></div>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <FilterSection 
          students={students}
          onFilterChange={setFilters}
        />
      </div>

      {/* Grid of student cards */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} {...student} />
          ))}
        </div>
      </div>
    </div>
  );
}
