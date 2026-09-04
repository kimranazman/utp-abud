/**
 * Centralized dropdown constants for the entire application
 * Single source of truth for all dropdown options
 */

// Profile Visibility Options
export const PROFILE_VISIBILITY_OPTIONS = [
  { value: 'public', label: 'Public - Anyone can see' },
  { value: 'alumni_only', label: 'Alumni Only - Only verified alumni' },
  { value: 'private', label: 'Private - Only you' }
] as const;

export type ProfileVisibility = typeof PROFILE_VISIBILITY_OPTIONS[number]['value'];

// Education Level Options
export const EDUCATION_LEVEL_OPTIONS = [
  { value: 'undergraduate', label: 'Undergraduate' },
  { value: 'postgraduate', label: 'Postgraduate' }
] as const;

export type EducationLevel = typeof EDUCATION_LEVEL_OPTIONS[number]['value'];

// Business Size Options
export const BUSINESS_SIZE_OPTIONS = [
  { value: 'startup', label: 'Startup (Pre-revenue)' },
  { value: 'small', label: 'Small (1-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-500 employees)' },
  { value: 'enterprise', label: 'Enterprise (500+ employees)' }
] as const;

export type BusinessSize = typeof BUSINESS_SIZE_OPTIONS[number]['value'];

// Employee Count Range Options
export const EMPLOYEE_COUNT_OPTIONS = [
  { value: '1-10', label: '1-10 employees' },
  { value: '11-50', label: '11-50 employees' },
  { value: '51-200', label: '51-200 employees' },
  { value: '201-500', label: '201-500 employees' },
  { value: '500+', label: '500+ employees' }
] as const;

export type EmployeeCountRange = typeof EMPLOYEE_COUNT_OPTIONS[number]['value'];

// Price Range Options
export const PRICE_RANGE_OPTIONS = [
  { value: '$', label: '$ - Budget friendly' },
  { value: '$$', label: '$$ - Mid-range' },
  { value: '$$$', label: '$$$ - Premium' },
  { value: '$$$$', label: '$$$$ - Luxury' }
] as const;

export type PriceRange = typeof PRICE_RANGE_OPTIONS[number]['value'];

// Business Ownership Type Options
export const OWNERSHIP_TYPE_OPTIONS = [
  { value: 'founder', label: 'Founder' },
  { value: 'co-founder', label: 'Co-Founder' },
  { value: 'ceo', label: 'CEO' },
  { value: 'director', label: 'Director' },
  { value: 'partner', label: 'Partner' },
  { value: 'owner', label: 'Owner' },
  { value: 'executive', label: 'Executive' },
  { value: 'board_member', label: 'Board Member' },
  { value: 'investor', label: 'Investor' },
  { value: 'advisor', label: 'Advisor' },
  { value: 'employee', label: 'Employee' },
  { value: 'team_member', label: 'Team Member' },
  { value: 'aspiring_entrepreneur', label: 'Aspiring Entrepreneur' },
  { value: 'network_only', label: 'Network Only' }
] as const;

export type OwnershipType = typeof OWNERSHIP_TYPE_OPTIONS[number]['value'];

// Business Intent Options (for non-business owners)
export const BUSINESS_INTENT_OPTIONS = [
  { value: 'owner', label: 'Business Owner/Manager' },
  { value: 'aspiring', label: 'Aspiring Entrepreneur' },
  { value: 'networking', label: 'Networking Only' },
  { value: 'team_member', label: 'Team Member' }
] as const;

export type BusinessIntent = typeof BUSINESS_INTENT_OPTIONS[number]['value'];

// Contact Type Options
export const CONTACT_TYPE_OPTIONS = [
  { value: 'phone', label: 'Phone', icon: 'phone' },
  { value: 'email', label: 'Email', icon: 'mail' },
  { value: 'whatsapp', label: 'WhatsApp', icon: 'message-square' },
  { value: 'telegram', label: 'Telegram', icon: 'send' },
  { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { value: 'website', label: 'Website', icon: 'globe' }
] as const;

export type ContactType = typeof CONTACT_TYPE_OPTIONS[number]['value'];

// Contribution Type Options
export const CONTRIBUTION_TYPE_OPTIONS = [
  { value: 'monetary', label: 'Monetary Donation' },
  { value: 'non_monetary', label: 'Non-Monetary (Volunteer/Service)' }
] as const;

export type ContributionType = typeof CONTRIBUTION_TYPE_OPTIONS[number]['value'];

// Currency Options
export const CURRENCY_OPTIONS = [
  { value: 'MYR', label: 'MYR - Malaysian Ringgit', symbol: 'RM' },
  { value: 'USD', label: 'USD - US Dollar', symbol: '$' },
  { value: 'EUR', label: 'EUR - Euro', symbol: '€' },
  { value: 'GBP', label: 'GBP - British Pound', symbol: '£' },
  { value: 'SGD', label: 'SGD - Singapore Dollar', symbol: 'S$' },
  { value: 'AUD', label: 'AUD - Australian Dollar', symbol: 'A$' },
  { value: 'CAD', label: 'CAD - Canadian Dollar', symbol: 'C$' }
] as const;

export type Currency = typeof CURRENCY_OPTIONS[number]['value'];

// Achievement Icon Type Options
export const ACHIEVEMENT_ICON_OPTIONS = [
  { value: 'award', label: 'Award', icon: 'trophy' },
  { value: 'certificate', label: 'Certificate', icon: 'award' },
  { value: 'milestone', label: 'Milestone', icon: 'flag' }
] as const;

export type AchievementIconType = typeof ACHIEVEMENT_ICON_OPTIONS[number]['value'];

// Metric Type Options
export const METRIC_TYPE_OPTIONS = [
  // Operational Metrics
  { value: 'employees', label: 'Number of Employees' },
  { value: 'projects', label: 'Projects Completed' },
  { value: 'clients', label: 'Total Clients' },
  { value: 'active_clients', label: 'Active Clients' },

  // Growth Metrics
  { value: 'growth_rate', label: 'Growth Rate' },
  { value: 'revenue_growth', label: 'Revenue Growth' },
  { value: 'customer_retention', label: 'Customer Retention Rate' },

  // Performance Metrics
  { value: 'customer_satisfaction', label: 'Customer Satisfaction Score' },
  { value: 'delivery_time', label: 'Average Delivery Time' },
  { value: 'success_rate', label: 'Project Success Rate' },

  // Recognition
  { value: 'awards_won', label: 'Awards & Recognition' },
  { value: 'certifications', label: 'Certifications Achieved' },

  // User/Customer Metrics
  { value: 'users_served', label: 'Users Served' },
  { value: 'products_sold', label: 'Products Sold' },
  { value: 'services_delivered', label: 'Services Delivered' }
] as const;

export type MetricType = typeof METRIC_TYPE_OPTIONS[number]['value'];

// Metric Period Options
export const METRIC_PERIOD_OPTIONS = [
  { value: 'current', label: 'Current' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'all_time', label: 'All Time' }
] as const;

export type MetricPeriod = typeof METRIC_PERIOD_OPTIONS[number]['value'];

// Metric Unit Options
export const METRIC_UNIT_OPTIONS = [
  { value: 'count', label: 'Count' },
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'currency', label: 'Currency (RM)' },
  { value: 'days', label: 'Days' },
  { value: 'hours', label: 'Hours' },
  { value: 'rating', label: 'Rating (1-5)' }
] as const;

export type MetricUnit = typeof METRIC_UNIT_OPTIONS[number]['value'];

// Social Platform Options
export const SOCIAL_PLATFORM_OPTIONS = [
  { value: 'linkedin', label: 'LinkedIn', icon: 'linkedin' },
  { value: 'facebook', label: 'Facebook', icon: 'facebook' },
  { value: 'instagram', label: 'Instagram', icon: 'instagram' },
  { value: 'twitter', label: 'Twitter/X', icon: 'twitter' },
  { value: 'youtube', label: 'YouTube', icon: 'youtube' },
  { value: 'tiktok', label: 'TikTok', icon: 'music' },
  { value: 'github', label: 'GitHub', icon: 'github' },
  { value: 'website', label: 'Website', icon: 'globe' },
  { value: 'other', label: 'Other', icon: 'link' }
] as const;

export type SocialPlatform = typeof SOCIAL_PLATFORM_OPTIONS[number]['value'];

// User Role Options
export const USER_ROLE_OPTIONS = [
  { value: 'admin', label: 'Administrator' },
  { value: 'alumni', label: 'Alumni' },
  { value: 'pending', label: 'Pending Verification' }
] as const;

export type UserRole = typeof USER_ROLE_OPTIONS[number]['value'];

// Helper function to get option by value
export function getOptionByValue<T extends { value: string; label: string }>(
  options: readonly T[],
  value: string
): T | undefined {
  return options.find(option => option.value === value);
}

// Helper function to get label by value
export function getLabelByValue<T extends { value: string; label: string }>(
  options: readonly T[],
  value: string
): string {
  const option = getOptionByValue(options, value);
  return option?.label ?? value;
}

// Export all dropdown options as a single object for easy access
export const DROPDOWN_OPTIONS = {
  profileVisibility: PROFILE_VISIBILITY_OPTIONS,
  educationLevel: EDUCATION_LEVEL_OPTIONS,
  businessSize: BUSINESS_SIZE_OPTIONS,
  employeeCount: EMPLOYEE_COUNT_OPTIONS,
  priceRange: PRICE_RANGE_OPTIONS,
  ownershipType: OWNERSHIP_TYPE_OPTIONS,
  contactType: CONTACT_TYPE_OPTIONS,
  contributionType: CONTRIBUTION_TYPE_OPTIONS,
  currency: CURRENCY_OPTIONS,
  achievementIcon: ACHIEVEMENT_ICON_OPTIONS,
  metricType: METRIC_TYPE_OPTIONS,
  metricPeriod: METRIC_PERIOD_OPTIONS,
  socialPlatform: SOCIAL_PLATFORM_OPTIONS,
  userRole: USER_ROLE_OPTIONS
} as const;