import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X } from 'lucide-react';
import { AlumniFilters as AlumniFiltersType } from '@/hooks/useAlumniManagement';

interface AlumniFiltersProps {
  filters: AlumniFiltersType;
  filterOptions: {
    locations: string[];
    programs: string[];
    yearRange: { min: number; max: number };
  };
  updateFilter: <K extends keyof AlumniFiltersType>(key: K, value: AlumniFiltersType[K]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  totalCount: number;
}

export function AlumniFilters({
  filters,
  filterOptions,
  updateFilter,
  resetFilters,
  hasActiveFilters,
  totalCount
}: AlumniFiltersProps) {
  // Generate year options
  const yearOptions: number[] = [];
  for (let y = filterOptions.yearRange.max; y >= filterOptions.yearRange.min; y--) {
    yearOptions.push(y);
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Toggle Button (for mobile) */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalCount} alumni found
          </span>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="gap-1 text-muted-foreground"
            >
              <X className="h-3 w-3" />
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap gap-3">
        {/* Graduation Year Min */}
        <Select
          value={filters.yearMin?.toString() || 'all'}
          onValueChange={(value) => updateFilter('yearMin', value === 'all' ? null : parseInt(value))}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Year from" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Year from</SelectItem>
            {yearOptions.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Graduation Year Max */}
        <Select
          value={filters.yearMax?.toString() || 'all'}
          onValueChange={(value) => updateFilter('yearMax', value === 'all' ? null : parseInt(value))}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue placeholder="Year to" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Year to</SelectItem>
            {yearOptions.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Location Filter */}
        <Select
          value={filters.location || 'all'}
          onValueChange={(value) => updateFilter('location', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {filterOptions.locations.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Program Filter */}
        <Select
          value={filters.program || 'all'}
          onValueChange={(value) => updateFilter('program', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All programs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All programs</SelectItem>
            {filterOptions.programs.map(prog => (
              <SelectItem key={prog} value={prog}>{prog}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Profile Completion Filter */}
        <Select
          value={filters.completionTier}
          onValueChange={(value) => updateFilter('completionTier', value as AlumniFiltersType['completionTier'])}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Completion" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All completion</SelectItem>
            <SelectItem value="0-24">0-24% (Low)</SelectItem>
            <SelectItem value="25-49">25-49%</SelectItem>
            <SelectItem value="50-74">50-74%</SelectItem>
            <SelectItem value="75-100">75-100% (High)</SelectItem>
          </SelectContent>
        </Select>

        {/* Account Status Filter */}
        <Select
          value={filters.status}
          onValueChange={(value) => updateFilter('status', value as AlumniFiltersType['status'])}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All status</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="secondary" className="gap-1">
              Search: {filters.search}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('search', '')}
              />
            </Badge>
          )}
          {filters.yearMin !== null && (
            <Badge variant="secondary" className="gap-1">
              From: {filters.yearMin}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('yearMin', null)}
              />
            </Badge>
          )}
          {filters.yearMax !== null && (
            <Badge variant="secondary" className="gap-1">
              To: {filters.yearMax}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('yearMax', null)}
              />
            </Badge>
          )}
          {filters.location && (
            <Badge variant="secondary" className="gap-1">
              {filters.location}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('location', null)}
              />
            </Badge>
          )}
          {filters.program && (
            <Badge variant="secondary" className="gap-1">
              {filters.program}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('program', null)}
              />
            </Badge>
          )}
          {filters.completionTier !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.completionTier}% complete
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('completionTier', 'all')}
              />
            </Badge>
          )}
          {filters.status !== 'all' && (
            <Badge variant="secondary" className="gap-1">
              {filters.status === 'verified' ? 'Verified' : 'Pending'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('status', 'all')}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
