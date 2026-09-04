import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCurrency } from '@/hooks/useDropdownData';
import { Currency } from '@/constants/dropdowns';

interface CurrencySelectProps {
  value?: Currency;
  onValueChange?: (value: Currency) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function CurrencySelect({
  value,
  onValueChange,
  placeholder = 'Select currency',
  disabled = false,
  required = false,
  className
}: CurrencySelectProps) {
  const options = useCurrency();

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
            <span className="flex items-center gap-2">
              <span className="font-semibold">{option.symbol}</span>
              <span>{option.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}