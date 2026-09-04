import { useState, useEffect } from 'react';
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ModernDatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  minYear?: number;
  maxYear?: number;
  placeholder?: string;
}

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const monthsShort = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function ModernDatePicker({ 
  value, 
  onChange, 
  disabled = false,
  minYear = 1900,
  maxYear = new Date().getFullYear(),
  placeholder = "Select date"
}: ModernDatePickerProps) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number>(value?.getMonth() ?? new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(value?.getFullYear() ?? new Date().getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(value?.getDate() ?? null);
  const [viewMode, setViewMode] = useState<'calendar' | 'years' | 'months'>('calendar');
  const [yearRangeStart, setYearRangeStart] = useState(Math.floor(selectedYear / 12) * 12);

  // Update internal state when value prop changes
  useEffect(() => {
    if (value) {
      setSelectedMonth(value.getMonth());
      setSelectedYear(value.getFullYear());
      setSelectedDay(value.getDate());
    } else {
      setSelectedDay(null);
    }
  }, [value]);

  // Generate years array
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  // Get days in month
  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(selectedMonth, selectedYear);
  const firstDay = getFirstDayOfMonth(selectedMonth, selectedYear);

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(i);
  }

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    const newDate = new Date(selectedYear, selectedMonth, day);
    onChange?.(newDate);
    setOpen(false);
  };

  const handleMonthChange = (monthStr: string) => {
    const month = months.indexOf(monthStr);
    setSelectedMonth(month);
    // If a day was selected and it's invalid for the new month, adjust it
    if (selectedDay && selectedDay > getDaysInMonth(month, selectedYear)) {
      setSelectedDay(getDaysInMonth(month, selectedYear));
    }
  };

  const handleYearChange = (yearStr: string) => {
    const year = parseInt(yearStr);
    setSelectedYear(year);
    // If a day was selected and it's invalid for the new year/month, adjust it
    if (selectedDay && selectedDay > getDaysInMonth(selectedMonth, year)) {
      setSelectedDay(getDaysInMonth(selectedMonth, year));
    }
  };

  const displayValue = value ? format(value, 'MMM dd, yyyy') : '';

  // Check if device is mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  // Generate year grid (12 years at a time)
  const yearGrid = [];
  for (let i = 0; i < 12; i++) {
    const year = yearRangeStart + i;
    if (year >= minYear && year <= maxYear) {
      yearGrid.push(year);
    }
  }

  const handleYearGridClick = (year: number) => {
    setSelectedYear(year);
    setViewMode('calendar');
    // If a day was selected and it's invalid for the new year/month, adjust it
    if (selectedDay && selectedDay > getDaysInMonth(selectedMonth, year)) {
      setSelectedDay(getDaysInMonth(selectedMonth, year));
    }
  };

  const handleMonthGridClick = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    setViewMode('calendar');
    // If a day was selected and it's invalid for the new month, adjust it
    if (selectedDay && selectedDay > getDaysInMonth(monthIndex, selectedYear)) {
      setSelectedDay(getDaysInMonth(monthIndex, selectedYear));
    }
  };

  const navigateYearRange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setYearRangeStart(Math.max(minYear, yearRangeStart - 12));
    } else {
      setYearRangeStart(Math.min(Math.floor(maxYear / 12) * 12, yearRangeStart + 12));
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="w-full justify-between text-left font-normal hover:bg-accent/50"
        >
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className={!value ? "text-muted-foreground" : ""}>
              {displayValue || placeholder}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          {viewMode === 'calendar' ? (
            <>
              {/* Year and Month Selectors */}
              <div className="flex gap-2 mb-3">
                {isMobile ? (
                  // Mobile: Use dropdown for year
                  <Select value={selectedYear.toString()} onValueChange={handleYearChange}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {years.map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  // Desktop: Clickable year button that opens grid
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-[100px] font-medium"
                    onClick={() => setViewMode('years')}
                  >
                    {selectedYear}
                  </Button>
                )}
                
                {isMobile ? (
                  // Mobile: Use dropdown for month
                  <Select value={months[selectedMonth]} onValueChange={handleMonthChange}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map(month => (
                        <SelectItem key={month} value={month}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  // Desktop: Clickable month button that opens grid
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-medium"
                    onClick={() => setViewMode('months')}
                  >
                    {months[selectedMonth]}
                  </Button>
                )}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {/* Day headers */}
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                  <div key={day} className="text-xs font-medium text-muted-foreground p-1">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div key={index} className="aspect-square">
                    {day ? (
                      <button
                        onClick={() => handleDayClick(day)}
                        className={cn(
                          "w-full h-full text-sm rounded-md transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          selectedDay === day && "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
                          day === new Date().getDate() && 
                          selectedMonth === new Date().getMonth() && 
                          selectedYear === new Date().getFullYear() && 
                          "font-semibold ring-1 ring-primary/20"
                        )}
                        disabled={disabled}
                      >
                        {day}
                      </button>
                    ) : (
                      <div />
                    )}
                  </div>
                ))}
              </div>

              {/* Today button */}
              <div className="pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const today = new Date();
                    setSelectedMonth(today.getMonth());
                    setSelectedYear(today.getFullYear());
                    setSelectedDay(today.getDate());
                    onChange?.(today);
                    setOpen(false);
                  }}
                >
                  Today
                </Button>
              </div>
            </>
          ) : viewMode === 'years' ? (
            // Year Grid View (Desktop only)
            <div className="w-[280px]">
              <div className="flex items-center justify-between mb-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateYearRange('prev')}
                  disabled={yearRangeStart <= minYear}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                  {yearRangeStart} - {Math.min(yearRangeStart + 11, maxYear)}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateYearRange('next')}
                  disabled={yearRangeStart + 12 > maxYear}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {yearGrid.map(year => (
                  <Button
                    key={year}
                    variant={year === selectedYear ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-10",
                      year === new Date().getFullYear() && "font-semibold"
                    )}
                    onClick={() => handleYearGridClick(year)}
                  >
                    {year}
                  </Button>
                ))}
              </div>
              
              <div className="pt-2 border-t mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setViewMode('calendar')}
                >
                  Back to Calendar
                </Button>
              </div>
            </div>
          ) : (
            // Month Grid View (Desktop only)
            <div className="w-[280px]">
              <div className="flex items-center justify-center mb-3">
                <span className="text-sm font-medium">
                  Select Month for {selectedYear}
                </span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {monthsShort.map((month, index) => (
                  <Button
                    key={month}
                    variant={index === selectedMonth ? "default" : "outline"}
                    size="sm"
                    className={cn(
                      "h-10",
                      index === new Date().getMonth() && 
                      selectedYear === new Date().getFullYear() && 
                      "font-semibold ring-1 ring-primary/20"
                    )}
                    onClick={() => handleMonthGridClick(index)}
                  >
                    {month}
                  </Button>
                ))}
              </div>
              
              <div className="pt-2 border-t mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() => setViewMode('calendar')}
                >
                  Back to Calendar
                </Button>
              </div>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}