import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMetricType } from '@/hooks/useDropdownData';
import { MetricType } from '@/constants/dropdowns';

interface MetricTypeSelectProps {
  value?: MetricType;
  onValueChange?: (value: MetricType) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function MetricTypeSelect({
  value,
  onValueChange,
  placeholder = 'Select metric type',
  disabled = false,
  required = false,
  className
}: MetricTypeSelectProps) {
  const options = useMetricType();

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