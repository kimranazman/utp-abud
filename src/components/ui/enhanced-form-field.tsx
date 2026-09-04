import { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertCircle, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCharacterCounter } from '@/hooks/useFormAutoSave';

interface EnhancedFormFieldProps {
  label: string;
  name: string;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  helperText?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  type?: 'text' | 'email' | 'password' | 'textarea' | 'url' | 'tel';
  validate?: (value: string) => Promise<string | true>;
  showSuccessState?: boolean;
  autoComplete?: string;
  className?: string;
}

export function EnhancedFormField({
  label,
  name,
  value = '',
  onChange,
  onBlur,
  error,
  helperText,
  placeholder,
  required = false,
  maxLength,
  type = 'text',
  validate,
  showSuccessState = true,
  autoComplete,
  className
}: EnhancedFormFieldProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouched, setIsTouched] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);

  const characterCounter = maxLength
    ? useCharacterCounter({
        maxLength,
        currentLength: localValue.length,
        showWarningAt: 0.8
      })
    : null;

  // Sync with external value
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Validate field
  const validateField = useCallback(async () => {
    if (!validate || !localValue) {
      setIsValid(false);
      setValidationError(null);
      return;
    }

    setIsValidating(true);
    try {
      const result = await validate(localValue);
      if (result === true) {
        setIsValid(true);
        setValidationError(null);
      } else {
        setIsValid(false);
        setValidationError(result);
      }
    } catch (err) {
      setIsValid(false);
      setValidationError('Validation failed');
    } finally {
      setIsValidating(false);
    }
  }, [localValue, validate]);

  // Debounced validation on change
  useEffect(() => {
    if (!isTouched) return;

    const timer = setTimeout(() => {
      validateField();
    }, 500);

    return () => clearTimeout(timer);
  }, [localValue, isTouched, validateField]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    setIsTouched(true);

    if (onChange) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setIsTouched(true);
    validateField();

    if (onBlur) {
      onBlur();
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const showError = (error || validationError) && isTouched && !isFocused;
  const showSuccess = isValid && showSuccessState && isTouched && !isValidating;

  const fieldClasses = cn(
    'w-full px-3 py-2 border rounded-lg transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-1',
    {
      'border-gray-300 focus:border-blue-500 focus:ring-blue-200': !showError && !showSuccess,
      'border-red-500 focus:ring-red-200': showError,
      'border-green-500 focus:ring-green-200': showSuccess,
      'pr-10': showError || showSuccess || isValidating
    },
    className
  );

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="space-y-2">
      {/* Label */}
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Input container */}
      <div className="relative">
        <InputComponent
          id={name}
          name={name}
          type={type === 'textarea' ? undefined : type}
          value={localValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          maxLength={maxLength}
          autoComplete={autoComplete}
          className={fieldClasses}
          aria-invalid={showError}
          aria-describedby={`${name}-error ${name}-helper`}
          rows={type === 'textarea' ? 4 : undefined}
        />

        {/* Status icon */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <AnimatePresence mode="wait">
            {isValidating && (
              <motion.div
                key="validating"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              </motion.div>
            )}

            {showSuccess && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Check className="h-4 w-4 text-green-500" />
              </motion.div>
            )}

            {showError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <AlertCircle className="h-4 w-4 text-red-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Focus indicator */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="w-full h-full rounded-lg ring-2 ring-blue-500 ring-opacity-20" />
          </motion.div>
        )}
      </div>

      {/* Helper text and errors */}
      <AnimatePresence mode="wait">
        {showError && (
          <motion.p
            key="error-message"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            id={`${name}-error`}
            className="text-sm text-red-600 flex items-center gap-1"
          >
            <AlertCircle className="h-3 w-3" />
            {error || validationError}
          </motion.p>
        )}

        {!showError && helperText && (
          <motion.p
            key="helper-text"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            id={`${name}-helper`}
            className="text-sm text-gray-500 flex items-center gap-1"
          >
            <Info className="h-3 w-3" />
            {helperText}
          </motion.p>
        )}

        {characterCounter && isFocused && (
          <motion.p
            key="character-counter"
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className={cn('text-xs text-right', characterCounter.counterColor)}
          >
            {characterCounter.counterText}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Progress bar for character count */}
      {characterCounter && maxLength && (
        <div className="relative h-1 bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className={cn(
              'absolute top-0 left-0 h-full rounded-full',
              characterCounter.isOverLimit
                ? 'bg-red-500'
                : characterCounter.showWarning
                ? 'bg-amber-500'
                : 'bg-blue-500'
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(characterCounter.percentage * 100, 100)}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      )}
    </div>
  );
}

// Preset validation functions
export const validators = {
  email: async (value: string): Promise<string | true> => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return 'Please enter a valid email address';
    }
    return true;
  },

  url: async (value: string): Promise<string | true> => {
    try {
      new URL(value);
      return true;
    } catch {
      return 'Please enter a valid URL';
    }
  },

  phone: async (value: string): Promise<string | true> => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10) {
      return 'Please enter a valid phone number';
    }
    return true;
  },

  minLength: (min: number) => async (value: string): Promise<string | true> => {
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return true;
  },

  maxLength: (max: number) => async (value: string): Promise<string | true> => {
    if (value.length > max) {
      return `Must be no more than ${max} characters`;
    }
    return true;
  },

  pattern: (regex: RegExp, message: string) => async (value: string): Promise<string | true> => {
    if (!regex.test(value)) {
      return message;
    }
    return true;
  }
};