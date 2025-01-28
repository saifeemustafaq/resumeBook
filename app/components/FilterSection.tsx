import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Button,
  Popover,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Stack,
  Paper
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface FilterSectionProps {
  onFilterChange: (filters: FilterState) => void;
  students: Array<{
    gpa: number;
    yearsOfExperience: number;
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

  const [anchorEl, setAnchorEl] = useState<{
    gpa: HTMLElement | null;
    experience: HTMLElement | null;
    graduationYear: HTMLElement | null;
  }>({
    gpa: null,
    experience: null,
    graduationYear: null
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
    setAnchorEl({
      gpa: null,
      experience: null,
      graduationYear: null
    });
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>, category: keyof typeof anchorEl) => {
    setAnchorEl(prev => ({
      ...prev,
      [category]: event.currentTarget
    }));
  };

  const handleClose = (category: keyof typeof anchorEl) => {
    setAnchorEl(prev => ({
      ...prev,
      [category]: null
    }));
  };

  return (
    <Box sx={{ mb: 4 }}>
      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        {/* GPA Filter */}
        <Box>
          <Button
            variant="outlined"
            onClick={(e) => handleClick(e, 'gpa')}
            startIcon={<FilterListIcon />}
            size="small"
          >
            GPA Range {filters.gpa.length > 0 && `(${filters.gpa.length})`}
          </Button>
          <Popover
            open={Boolean(anchorEl.gpa)}
            anchorEl={anchorEl.gpa}
            onClose={() => handleClose('gpa')}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Paper sx={{ p: 2 }}>
              <FormGroup>
                {GPA_RANGES.map((range) => (
                  <FormControlLabel
                    key={range}
                    control={
                      <Checkbox
                        checked={filters.gpa.includes(range)}
                        onChange={() => handleFilterChange('gpa', range)}
                        size="small"
                      />
                    }
                    label={range}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Popover>
        </Box>

        {/* Experience Filter */}
        <Box>
          <Button
            variant="outlined"
            onClick={(e) => handleClick(e, 'experience')}
            startIcon={<FilterListIcon />}
            size="small"
          >
            Experience {filters.experience.length > 0 && `(${filters.experience.length})`}
          </Button>
          <Popover
            open={Boolean(anchorEl.experience)}
            anchorEl={anchorEl.experience}
            onClose={() => handleClose('experience')}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Paper sx={{ p: 2 }}>
              <FormGroup>
                {EXPERIENCE_RANGES.map((range) => (
                  <FormControlLabel
                    key={range}
                    control={
                      <Checkbox
                        checked={filters.experience.includes(range)}
                        onChange={() => handleFilterChange('experience', range)}
                        size="small"
                      />
                    }
                    label={range}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Popover>
        </Box>

        {/* Graduation Year Filter */}
        <Box>
          <Button
            variant="outlined"
            onClick={(e) => handleClick(e, 'graduationYear')}
            startIcon={<FilterListIcon />}
            size="small"
          >
            Graduation Year {filters.graduationYear.length > 0 && `(${filters.graduationYear.length})`}
          </Button>
          <Popover
            open={Boolean(anchorEl.graduationYear)}
            anchorEl={anchorEl.graduationYear}
            onClose={() => handleClose('graduationYear')}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'left',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'left',
            }}
          >
            <Paper sx={{ p: 2 }}>
              <FormGroup>
                {graduationYears.map((year) => (
                  <FormControlLabel
                    key={year}
                    control={
                      <Checkbox
                        checked={filters.graduationYear.includes(year)}
                        onChange={() => handleFilterChange('graduationYear', year)}
                        size="small"
                      />
                    }
                    label={year}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Popover>
        </Box>

        {/* Clear Filters Button */}
        <Button
          variant="outlined"
          onClick={clearFilters}
          size="small"
          disabled={!Object.values(filters).some(arr => arr.length > 0)}
        >
          Clear Filters
        </Button>
      </Stack>
    </Box>
  );
} 