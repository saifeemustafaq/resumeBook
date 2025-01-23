import { useState, useEffect } from 'react';

interface FilterSectionProps {
  onFilterChange: (filters: FilterState) => void;
  students: Array<{
    gpa: number;
    experience: number;
    graduationDate: string;
  }>;
}

export interface FilterState {
  gpa: string[];
  experience: string[];
  graduationYear: string[];
}

const GPA_RANGES = [
  '1.0-2.0',
  '2.0-3.0',
  '3.0-3.5',
  '3.5-4.0'
];

const EXPERIENCE_RANGES = [
  '0-1',
  '1-3',
  '3-6',
  '6+'
];

export default function FilterSection({ onFilterChange, students }: FilterSectionProps) {
  const [filters, setFilters] = useState<FilterState>({
    gpa: [],
    experience: [],
    graduationYear: []
  });
  
  const [isOpen, setIsOpen] = useState({
    gpa: false,
    experience: false,
    graduationYear: false
  });

  // Extract unique graduation years from students
  const graduationYears = Array.from(
    new Set(
      students.map(s => {
        const date = s.graduationDate.split(' ');
        return date[1]; // Gets the year part
      })
    )
  ).sort();

  const handleFilterChange = (category: keyof FilterState, value: string) => {
    const newFilters = { ...filters };
    if (newFilters[category].includes(value)) {
      newFilters[category] = newFilters[category].filter(v => v !== value);
    } else {
      newFilters[category] = [...newFilters[category], value];
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      gpa: [],
      experience: [],
      graduationYear: []
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.filter-dropdown')) {
        setIsOpen({
          gpa: false,
          experience: false,
          graduationYear: false
        });
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleDropdown = (category: keyof typeof isOpen) => {
    setIsOpen(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        {/* GPA Filter */}
        <div className="relative filter-dropdown">
          <button
            onClick={() => toggleDropdown('gpa')}
            className="btn btn-secondary"
          >
            GPA Range
          </button>
          {isOpen.gpa && (
            <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {GPA_RANGES.map((range) => (
                  <label
                    key={range}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.gpa.includes(range)}
                      onChange={() => handleFilterChange('gpa', range)}
                      className="mr-2"
                    />
                    {range}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Experience Filter */}
        <div className="relative filter-dropdown">
          <button
            onClick={() => toggleDropdown('experience')}
            className="btn btn-secondary"
          >
            Years of Experience
          </button>
          {isOpen.experience && (
            <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {EXPERIENCE_RANGES.map((range) => (
                  <label
                    key={range}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.experience.includes(range)}
                      onChange={() => handleFilterChange('experience', range)}
                      className="mr-2"
                    />
                    {range}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Graduation Year Filter */}
        <div className="relative filter-dropdown">
          <button
            onClick={() => toggleDropdown('graduationYear')}
            className="btn btn-secondary"
          >
            Graduation Year
          </button>
          {isOpen.graduationYear && (
            <div className="absolute z-10 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
              <div className="py-1">
                {graduationYears.map((year) => (
                  <label
                    key={year}
                    className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={filters.graduationYear.includes(year)}
                      onChange={() => handleFilterChange('graduationYear', year)}
                      className="mr-2"
                    />
                    {year}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={clearFilters}
          className="btn btn-secondary"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
} 