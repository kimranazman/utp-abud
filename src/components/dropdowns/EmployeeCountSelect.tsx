import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEmployeeCount } from '@/hooks/useDropdownData';
import { EmployeeCountRange } from '@/constants/dropdowns';

interface EmployeeCountSelectProps {
  value?: EmployeeCountRange;
  onValueChange?: (value: EmployeeCountRange) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function EmployeeCountSelect({
  value,
  onValueChange,
  placeholder = 'Select employee count',
  disabled = false,
  required = false,
  className
}: EmployeeCountSelectProps) {
  const options = useEmployeeCount();

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