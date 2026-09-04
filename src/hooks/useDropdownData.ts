import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import {
  DROPDOWN_OPTIONS,
  ProfileVisibility,
  EducationLevel,
  BusinessSize,
  EmployeeCountRange,
  PriceRange,
  OwnershipType,
  ContactType,
  ContributionType,
  Currency,
  AchievementIconType,
  MetricType,
  MetricPeriod,
  SocialPlatform,
  UserRole
} from '@/constants/dropdowns';

/**
 * Custom hook for static dropdown data
 * Returns consistent dropdown options from centralized constants
 */
export function useStaticDropdown<T extends keyof typeof DROPDOWN_OPTIONS>(
  dropdownKey: T
): typeof DROPDOWN_OPTIONS[T] {
  return DROPDOWN_OPTIONS[dropdownKey];
}

/**
 * Custom hook for profile visibility dropdown
 */
export function useProfileVisibility() {
  return useStaticDropdown('profileVisibility');
}

/**
 * Custom hook for education level dropdown
 */
export function useEducationLevel() {
  return useStaticDropdown('educationLevel');
}

/**
 * Custom hook for business size dropdown
 */
export function useBusinessSize() {
  return useStaticDropdown('businessSize');
}

/**
 * Custom hook for employee count dropdown
 */
export function useEmployeeCount() {
  return useStaticDropdown('employeeCount');
}

/**
 * Custom hook for price range dropdown
 */
export function usePriceRange() {
  return useStaticDropdown('priceRange');
}

/**
 * Custom hook for ownership type dropdown
 */
export function useOwnershipType() {
  return useStaticDropdown('ownershipType');
}

/**
 * Custom hook for contact type dropdown
 */
export function useContactType() {
  return useStaticDropdown('contactType');
}

/**
 * Custom hook for contribution type dropdown
 */
export function useContributionType() {
  return useStaticDropdown('contributionType');
}

/**
 * Custom hook for currency dropdown
 */
export function useCurrency() {
  return useStaticDropdown('currency');
}

/**
 * Custom hook for achievement icon type dropdown
 */
export function useAchievementIconType() {
  return useStaticDropdown('achievementIcon');
}

/**
 * Custom hook for metric type dropdown
 */
export function useMetricType() {
  return useStaticDropdown('metricType');
}

/**
 * Custom hook for metric period dropdown
 */
export function useMetricPeriod() {
  return useStaticDropdown('metricPeriod');
}

/**
 * Custom hook for social platform dropdown
 */
export function useSocialPlatform() {
  return useStaticDropdown('socialPlatform');
}

/**
 * Custom hook for user role dropdown
 */
export function useUserRole() {
  return useStaticDropdown('userRole');
}