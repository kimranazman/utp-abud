import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBusinessSize } from '@/hooks/useDropdownData';
import { BusinessSize } from '@/constants/dropdowns';

interface BusinessSizeSelectProps {
  value?: BusinessSize;
  onValueChange?: (value: BusinessSize) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function BusinessSizeSelect({
  value,
  onValueChange,
  placeholder = 'Select business size',
  disabled = false,
  required = false,
  className
}: BusinessSizeSelectProps) {
  const options = useBusinessSize();

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