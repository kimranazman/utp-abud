import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { usePriceRange } from '@/hooks/useDropdownData';
import { PriceRange } from '@/constants/dropdowns';

interface PriceRangeSelectProps {
  value?: PriceRange;
  onValueChange?: (value: PriceRange) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function PriceRangeSelect({
  value,
  onValueChange,
  placeholder = 'Select price range',
  disabled = false,
  required = false,
  className
}: PriceRangeSelectProps) {
  const options = usePriceRange();

  return (
    <Select
      value={value}
      onValueChange={onValueChange as (value: string) => void}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}