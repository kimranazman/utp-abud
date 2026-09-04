import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

export interface FilterGroup {
  id: string;
  label: string;
  options: FilterOption[];
  maxVisible?: number; // Show "More" after this many
  multiSelect?: boolean;
}

interface FilterPillsProps {
  filters: FilterGroup[];
  activeFilters: Record<string, string[]>; // { groupId: [selectedValues] }
  onFilterChange: (groupId: string, values: string[]) => void;
  onClearAll?: () => void;
  className?: string;
}

export function FilterPills({
  filters,
  activeFilters,
  onFilterChange,
  onClearAll,
  className,
}: FilterPillsProps) {
  const hasActiveFilters = Object.values(activeFilters).some(
    (values) => values.length > 0
  );

  const toggleFilter = (groupId: string, value: string, multiSelect = false) => {
    const currentValues = activeFilters[groupId] || [];
    let newValues: string[];

    if (currentValues.includes(value)) {
      // Remove value
      newValues = currentValues.filter((v) => v !== value);
    } else if (multiSelect) {
      // Add to existing values
      newValues = [...currentValues, value];
    } else {
      // Replace with new value (single select)
      newValues = [value];
    }

    onFilterChange(groupId, newValues);
  };

  const clearFilter = (groupId: string) => {
    onFilterChange(groupId, []);
  };

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {filters.map((group, groupIndex) => {
        const activeValues = activeFilters[group.id] || [];
        const visibleOptions = group.maxVisible
          ? group.options.slice(0, group.maxVisible)
          : group.options;
        const hiddenOptions = group.maxVisible
          ? group.options.slice(group.maxVisible)
          : [];

        return (
          <div key={group.id} className="flex flex-wrap items-center gap-1.5">
            {/* Group label */}
            <span className="text-xs text-muted-foreground font-medium mr-1">
              {group.label}:
            </span>

            {/* Visible pills */}
            {visibleOptions.map((option) => {
              const isActive = activeValues.includes(option.value);
              return (
                <Badge
                  key={option.value}
                  variant={isActive ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer transition-colors text-xs',
                    isActive && 'pr-1'
                  )}
                  onClick={() => toggleFilter(group.id, option.value, group.multiSelect)}
                >
                  {option.label}
                  {option.count !== undefined && (
                    <span className="ml-1 opacity-70">({option.count})</span>
                  )}
                  {isActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFilter(group.id, option.value, group.multiSelect);
                      }}
                      className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                      aria-label={`Remove ${option.label} filter`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              );
            })}

            {/* "More" popover for hidden options */}
            {hiddenOptions.length > 0 && (
              <Popover>
                <PopoverTrigger asChild>
                  <Badge
                    variant="outline"
                    className="cursor-pointer text-xs gap-1"
                  >
                    More
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2" align="start">
                  <ScrollArea className="max-h-48">
                    <div className="flex flex-col gap-1">
                      {hiddenOptions.map((option) => {
                        const isActive = activeValues.includes(option.value);
                        return (
                          <Badge
                            key={option.value}
                            variant={isActive ? 'default' : 'outline'}
                            className={cn(
                              'cursor-pointer transition-colors text-xs justify-between',
                              isActive && 'pr-1'
                            )}
                            onClick={() =>
                              toggleFilter(group.id, option.value, group.multiSelect)
                            }
                          >
                            <span>
                              {option.label}
                              {option.count !== undefined && (
                                <span className="ml-1 opacity-70">({option.count})</span>
                              )}
                            </span>
                            {isActive && (
                              <X className="h-3 w-3 ml-1" />
                            )}
                          </Badge>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </PopoverContent>
              </Popover>
            )}

            {/* Clear group button */}
            {activeValues.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => clearFilter(group.id)}
              >
                Clear
              </Button>
            )}

            {/* Separator between groups */}
            {groupIndex < filters.length - 1 && (
              <span className="text-muted-foreground/30 mx-2">|</span>
            )}
          </div>
        );
      })}

      {/* Clear all button */}
      {hasActiveFilters && onClearAll && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
          onClick={onClearAll}
        >
          Clear All
        </Button>
      )}
    </div>
  );
}

// Helper to generate graduation era options
export function getGraduationEraOptions(): FilterOption[] {
  const currentYear = new Date().getFullYear();
  const startDecade = 1990;
  const eras: FilterOption[] = [];

  for (let decade = startDecade; decade <= currentYear; decade += 10) {
    const endYear = Math.min(decade + 9, currentYear);
    eras.push({
      value: `${decade}-${endYear}`,
      label: `${decade}s`,
    });
  }

  return eras.reverse(); // Most recent first
}

// Helper to check if year falls in an era
export function isYearInEra(year: number, era: string): boolean {
  const [start, end] = era.split('-').map(Number);
  return year >= start && year <= end;
}
