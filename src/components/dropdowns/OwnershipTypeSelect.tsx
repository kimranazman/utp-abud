import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useOwnershipType } from '@/hooks/useDropdownData';
import { OwnershipType } from '@/constants/dropdowns';

interface OwnershipTypeSelectProps {
  value?: OwnershipType;
  onValueChange?: (value: OwnershipType) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function OwnershipTypeSelect({
  value,
  onValueChange,
  placeholder = 'Select ownership type',
  disabled = false,
  required = false,
  className
}: OwnershipTypeSelectProps) {
  const options = useOwnershipType();

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