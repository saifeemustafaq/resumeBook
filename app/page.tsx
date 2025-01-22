'use client';

import { useState, useMemo } from 'react';
import { students } from './data/students';
import StudentCard from './components/StudentCard';
import FilterSection, { FilterState } from './components/FilterSection';

export default function Home() {
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
    <div className="min-h-screen p-6">
      {/* Header with login buttons */}
      <header className="max-w-[1200px] mx-auto flex justify-between items-center mb-12">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Student Login
        </button>
        <h1 className="text-3xl font-bold text-center">CMU Resume Book</h1>
        <button className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900 transition-colors">
          Admin Login
        </button>
      </header>

      {/* Divider */}
      <div className="max-w-[1200px] mx-auto w-full h-px bg-gray-200 dark:bg-gray-700 mb-12"></div>

      {/* Filter Section */}
      <div className="max-w-[1200px] mx-auto">
        <FilterSection 
          students={students}
          onFilterChange={setFilters}
        />
      </div>

      {/* Grid of student cards */}
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-[repeat(auto-fit,250px)] gap-5 justify-center">
          {filteredStudents.map((student) => (
            <StudentCard key={student.id} {...student} />
          ))}
        </div>
      </div>
    </div>
  );
}
