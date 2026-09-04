import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useEducationLevel } from '@/hooks/useDropdownData';
import { EducationLevel } from '@/constants/dropdowns';

interface EducationLevelSelectProps {
  value?: EducationLevel;
  onValueChange?: (value: EducationLevel) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function EducationLevelSelect({
  value,
  onValueChange,
  placeholder = 'Select education level',
  disabled = false,
  required = false,
  className
}: EducationLevelSelectProps) {
  const options = useEducationLevel();

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