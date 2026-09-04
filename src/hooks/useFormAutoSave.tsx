import { useEffect, useRef, useCallback } from 'react';
import { UseFormWatch, FieldValues, Path, PathValue } from 'react-hook-form';
import { debounce } from 'lodash';

interface UseFormAutoSaveOptions<T extends FieldValues> {
  watch: UseFormWatch<T>;
  onSave: (data: Partial<T>) => void | Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
  excludeFields?: (Path<T>)[];
}

export function useFormAutoSave<T extends FieldValues>({
  watch,
  onSave,
  debounceMs = 1500,
  enabled = true,
  excludeFields = []
}: UseFormAutoSaveOptions<T>) {
  const lastSavedData = useRef<Partial<T>>({});
  const saveInProgress = useRef(false);

  // Create debounced save function
  const debouncedSave = useCallback(
    debounce(async (data: Partial<T>) => {
      if (!enabled || saveInProgress.current) return;

      // Check if data has actually changed
      const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSavedData.current);
      if (!hasChanged) return;

      try {
        saveInProgress.current = true;
        await onSave(data);
        lastSavedData.current = { ...data };
      } catch (error) {
        console.error('Auto-save error:', error);
      } finally {
        saveInProgress.current = false;
      }
    }, debounceMs),
    [enabled, onSave, debounceMs]
  );

  // Watch all form fields
  useEffect(() => {
    if (!enabled) return;

    const subscription = watch((data) => {
      // Filter out excluded fields
      const filteredData = Object.entries(data as T).reduce((acc, [key, value]) => {
        if (!excludeFields.includes(key as Path<T>)) {
          acc[key as keyof T] = value;
        }
        return acc;
      }, {} as Partial<T>);

      debouncedSave(filteredData);
    });

    return () => {
      subscription.unsubscribe();
      debouncedSave.cancel();
    };
  }, [watch, debouncedSave, enabled, excludeFields]);

  // Save immediately when component unmounts
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
      if (enabled && !saveInProgress.current) {
        const currentData = watch();
        if (JSON.stringify(currentData) !== JSON.stringify(lastSavedData.current)) {
          onSave(currentData as Partial<T>);
        }
      }
    };
  }, []);

  // Force save function
  const forceSave = useCallback(() => {
    debouncedSave.cancel();
    const currentData = watch();
    onSave(currentData as Partial<T>);
    lastSavedData.current = { ...currentData as Partial<T> };
  }, [watch, onSave, debouncedSave]);

  return {
    forceSave,
    isSaving: saveInProgress.current
  };
}

// Hook for field-level validation feedback
interface UseFieldValidationOptions {
  validateOnBlur?: boolean;
  validateOnChange?: boolean;
  showSuccessState?: boolean;
  debounceMs?: number;
}

export function useFieldValidation({
  validateOnBlur = true,
  validateOnChange = false,
  showSuccessState = true,
  debounceMs = 300
}: UseFieldValidationOptions = {}) {
  const validatedFields = useRef<Set<string>>(new Set());
  const fieldStates = useRef<Map<string, 'validating' | 'valid' | 'invalid'>>(new Map());

  const validateField = useCallback(
    debounce(async (
      fieldName: string,
      value: any,
      validator?: (value: any) => Promise<boolean | string>
    ) => {
      if (!validator) return;

      fieldStates.current.set(fieldName, 'validating');

      try {
        const result = await validator(value);

        if (result === true) {
          fieldStates.current.set(fieldName, 'valid');
          validatedFields.current.add(fieldName);
        } else {
          fieldStates.current.set(fieldName, 'invalid');
          validatedFields.current.delete(fieldName);
        }
      } catch (error) {
        fieldStates.current.set(fieldName, 'invalid');
        validatedFields.current.delete(fieldName);
      }
    }, debounceMs),
    [debounceMs]
  );

  const getFieldState = (fieldName: string) => {
    return fieldStates.current.get(fieldName) || null;
  };

  const isFieldValid = (fieldName: string) => {
    return validatedFields.current.has(fieldName);
  };

  const resetFieldValidation = (fieldName: string) => {
    validatedFields.current.delete(fieldName);
    fieldStates.current.delete(fieldName);
  };

  const resetAllValidation = () => {
    validatedFields.current.clear();
    fieldStates.current.clear();
  };

  return {
    validateField,
    getFieldState,
    isFieldValid,
    resetFieldValidation,
    resetAllValidation,
    validatedFields: Array.from(validatedFields.current)
  };
}

// Character counter hook
interface UseCharacterCounterOptions {
  maxLength: number;
  currentLength: number;
  showWarningAt?: number;
}

export function useCharacterCounter({
  maxLength,
  currentLength,
  showWarningAt = 0.9
}: UseCharacterCounterOptions) {
  const remaining = maxLength - currentLength;
  const percentage = currentLength / maxLength;
  const showWarning = percentage >= showWarningAt;
  const isOverLimit = currentLength > maxLength;

  const getCounterColor = () => {
    if (isOverLimit) return 'text-red-500';
    if (showWarning) return 'text-amber-500';
    return 'text-gray-500';
  };

  const getCounterText = () => {
    if (isOverLimit) {
      return `${Math.abs(remaining)} characters over limit`;
    }
    return `${remaining} characters remaining`;
  };

  return {
    remaining,
    percentage,
    showWarning,
    isOverLimit,
    counterColor: getCounterColor(),
    counterText: getCounterText()
  };
}