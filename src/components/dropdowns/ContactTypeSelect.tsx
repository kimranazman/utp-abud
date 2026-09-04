import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useContactType } from '@/hooks/useDropdownData';
import { ContactType } from '@/constants/dropdowns';
import { Phone, Mail, MessageSquare, Globe, Send, Linkedin } from 'lucide-react';

interface ContactTypeSelectProps {
  value?: ContactType;
  onValueChange?: (value: ContactType) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

const iconMap: Record<string, React.ElementType> = {
  phone: Phone,
  email: Mail,
  whatsapp: MessageSquare,
  telegram: Send,
  linkedin: Linkedin,
  website: Globe,
};

export function ContactTypeSelect({
  value,
  onValueChange,
  placeholder = 'Select contact type',
  disabled = false,
  required = false,
  className
}: ContactTypeSelectProps) {
  const options = useContactType();

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
        {options.map((option) => {
          const Icon = iconMap[option.value] || Globe;
          return (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {option.label}
              </div>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}