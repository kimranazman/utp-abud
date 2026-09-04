import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useMetricPeriod } from '@/hooks/useDropdownData';
import { MetricPeriod } from '@/constants/dropdowns';

interface MetricPeriodSelectProps {
  value?: MetricPeriod;
  onValueChange?: (value: MetricPeriod) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function MetricPeriodSelect({
  value,
  onValueChange,
  placeholder = 'Select period',
  disabled = false,
  required = false,
  className
}: MetricPeriodSelectProps) {
  const options = useMetricPeriod();

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