import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProfileVisibility } from '@/hooks/useDropdownData';
import { ProfileVisibility } from '@/constants/dropdowns';

interface ProfileVisibilitySelectProps {
  value?: ProfileVisibility;
  onValueChange?: (value: ProfileVisibility) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function ProfileVisibilitySelect({
  value,
  onValueChange,
  placeholder = 'Select visibility',
  disabled = false,
  required = false,
  className
}: ProfileVisibilitySelectProps) {
  const options = useProfileVisibility();

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