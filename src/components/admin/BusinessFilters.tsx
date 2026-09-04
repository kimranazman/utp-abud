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
import { BusinessFilters as BusinessFiltersType } from '@/hooks/useBusinessManagement';

interface BusinessFiltersProps {
  filters: BusinessFiltersType;
  filterOptions: {
    categories: { id: string; name: string }[];
    locations: string[];
    ownerYearRange: { min: number; max: number };
  };
  updateFilter: <K extends keyof BusinessFiltersType>(key: K, value: BusinessFiltersType[K]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  totalCount: number;
}

export function BusinessFilters({
  filters,
  filterOptions,
  updateFilter,
  resetFilters,
  hasActiveFilters,
  totalCount
}: BusinessFiltersProps) {
  // Generate year options
  const yearOptions: number[] = [];
  for (let y = filterOptions.ownerYearRange.max; y >= filterOptions.ownerYearRange.min; y--) {
    yearOptions.push(y);
  }

  // Get category name for badge display
  const getCategoryName = (categoryId: string | null) => {
    if (!categoryId) return null;
    const category = filterOptions.categories.find(c => c.id === categoryId);
    return category?.name || null;
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by business name or owner..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Count and Clear */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {totalCount} businesses found
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
        {/* Category Filter */}
        <Select
          value={filters.category || 'all'}
          onValueChange={(value) => updateFilter('category', value === 'all' ? null : value)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {filterOptions.categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
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

        {/* Owner Graduation Year Min */}
        <Select
          value={filters.ownerYearMin?.toString() || 'all'}
          onValueChange={(value) => updateFilter('ownerYearMin', value === 'all' ? null : parseInt(value))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Owner year from" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Owner year from</SelectItem>
            {yearOptions.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Owner Graduation Year Max */}
        <Select
          value={filters.ownerYearMax?.toString() || 'all'}
          onValueChange={(value) => updateFilter('ownerYearMax', value === 'all' ? null : parseInt(value))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Owner year to" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Owner year to</SelectItem>
            {yearOptions.map(year => (
              <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
            ))}
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
          {filters.category && (
            <Badge variant="secondary" className="gap-1">
              {getCategoryName(filters.category) || 'Category'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('category', null)}
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
          {filters.ownerYearMin !== null && (
            <Badge variant="secondary" className="gap-1">
              Owner from: {filters.ownerYearMin}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('ownerYearMin', null)}
              />
            </Badge>
          )}
          {filters.ownerYearMax !== null && (
            <Badge variant="secondary" className="gap-1">
              Owner to: {filters.ownerYearMax}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => updateFilter('ownerYearMax', null)}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
