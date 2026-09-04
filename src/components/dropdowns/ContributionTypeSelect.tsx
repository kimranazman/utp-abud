import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContributionType } from '@/hooks/useDropdownData';
import { ContributionType } from '@/constants/dropdowns';

interface ContributionTypeSelectProps {
  value?: ContributionType;
  onValueChange?: (value: ContributionType) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function ContributionTypeSelect({
  value,
  onValueChange,
  placeholder = 'Select contribution type',
  disabled = false,
  required = false,
  className
}: ContributionTypeSelectProps) {
  const options = useContributionType();

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