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
    setFilters(prev => {
      const newFilters = { ...prev };
      if (newFilters[category].includes(value)) {
        newFilters[category] = newFilters[category].filter(v => v !== value);
      } else {
        newFilters[category] = [...newFilters[category], value];
      }
      return newFilters;
    });
  };

  const clearFilters = () => {
    setFilters({
      gpa: [],
      experience: [],
      graduationYear: []
    });
  };

  // Notify parent component whenever filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Close dropdowns when clicking outside
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

  const toggleDropdown = (category: keyof typeof isOpen, event: React.MouseEvent) => {
    event.stopPropagation();
    setIsOpen(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex gap-6">
        {/* GPA Filter */}
        <div className="flex-1 filter-dropdown relative">
          <label className="block text-sm font-medium text-foreground mb-2">GPA Range</label>
          <button
            onClick={(e) => toggleDropdown('gpa', e)}
            className="w-full bg-card text-card-foreground rounded-lg shadow-sm border border-border p-3 text-left flex justify-between items-center hover:bg-accent hover:text-accent-foreground"
          >
            <span className="text-sm">
              {filters.gpa.length ? `${filters.gpa.length} selected` : 'Select GPA ranges'}
            </span>
            <svg className={`w-4 h-4 transition-transform ${isOpen.gpa ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen.gpa && (
            <div className="absolute z-10 mt-1 w-full bg-card text-card-foreground rounded-lg shadow-lg border border-border py-1">
              {GPA_RANGES.map((range) => (
                <label key={range} className="flex items-center px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                  <input
                    type="checkbox"
                    checked={filters.gpa.includes(range)}
                    onChange={() => handleFilterChange('gpa', range)}
                    className="mr-2"
                  />
                  <span className="text-sm">{range}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Experience Filter */}
        <div className="flex-1 filter-dropdown relative">
          <label className="block text-sm font-medium text-foreground mb-2">Years of Experience</label>
          <button
            onClick={(e) => toggleDropdown('experience', e)}
            className="w-full bg-card text-card-foreground rounded-lg shadow-sm border border-border p-3 text-left flex justify-between items-center hover:bg-accent hover:text-accent-foreground"
          >
            <span className="text-sm">
              {filters.experience.length ? `${filters.experience.length} selected` : 'Select experience ranges'}
            </span>
            <svg className={`w-4 h-4 transition-transform ${isOpen.experience ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen.experience && (
            <div className="absolute z-10 mt-1 w-full bg-card text-card-foreground rounded-lg shadow-lg border border-border py-1">
              {EXPERIENCE_RANGES.map((range) => (
                <label key={range} className="flex items-center px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                  <input
                    type="checkbox"
                    checked={filters.experience.includes(range)}
                    onChange={() => handleFilterChange('experience', range)}
                    className="mr-2"
                  />
                  <span className="text-sm">{range} years</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Graduation Year Filter */}
        <div className="flex-1 filter-dropdown relative">
          <label className="block text-sm font-medium text-foreground mb-2">Graduation Year</label>
          <button
            onClick={(e) => toggleDropdown('graduationYear', e)}
            className="w-full bg-card text-card-foreground rounded-lg shadow-sm border border-border p-3 text-left flex justify-between items-center hover:bg-accent hover:text-accent-foreground"
          >
            <span className="text-sm">
              {filters.graduationYear.length ? `${filters.graduationYear.length} selected` : 'Select graduation years'}
            </span>
            <svg className={`w-4 h-4 transition-transform ${isOpen.graduationYear ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen.graduationYear && (
            <div className="absolute z-10 mt-1 w-full bg-card text-card-foreground rounded-lg shadow-lg border border-border py-1">
              {graduationYears.map((year) => (
                <label key={year} className="flex items-center px-3 py-2 hover:bg-accent hover:text-accent-foreground">
                  <input
                    type="checkbox"
                    checked={filters.graduationYear.includes(year)}
                    onChange={() => handleFilterChange('graduationYear', year)}
                    className="mr-2"
                  />
                  <span className="text-sm">{year}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={clearFilters}
        className="self-end px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        Clear Filters
      </button>
    </div>
  );
} 