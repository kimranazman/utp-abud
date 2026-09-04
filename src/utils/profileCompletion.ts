interface ProfileData {
  // Basic profile fields
  full_name?: string | null;
  bio?: string | null;
  avatar_url?: string | null;
  birthday?: string | null;
  location_city?: string | null;
  location_country?: string | null;
  tags?: string[] | null;
  graduation_year?: number | null;
  course?: string | null;

  // Counts from related tables
  education_count?: number;
  business_count?: number;
  career_count?: number;
  achievement_count?: number;
  links_count?: number;
  contribution_count?: number;

  // Flags
  required_steps_completed?: boolean;
  profile_completed?: boolean;
}

interface CompletionBreakdown {
  category: string;
  weight: number;
  completed: number;
  total: number;
  items: {
    name: string;
    completed: boolean;
    weight: number;
  }[];
}

export interface ProfileCompletionResult {
  percentage: number;
  breakdown: CompletionBreakdown[];
  message: string;
  color: 'red' | 'amber' | 'yellow' | 'green';
  isComplete: boolean;
}

export function calculateProfileCompletion(profile: ProfileData): ProfileCompletionResult {
  const breakdown: CompletionBreakdown[] = [];

  // 1. Basic Requirements (30% weight)
  const basicRequirements: CompletionBreakdown = {
    category: 'Basic Requirements',
    weight: 30,
    completed: 0,
    total: 3,
    items: [
      {
        name: 'Full Name',
        completed: !!(profile.full_name && profile.full_name.trim()),
        weight: 10
      },
      {
        name: 'Education Entry',
        completed: (profile.education_count || 0) > 0,
        weight: 10
      },
      {
        name: 'Business Entry',
        completed: (profile.business_count || 0) > 0,
        weight: 10
      }
    ]
  };
  basicRequirements.completed = basicRequirements.items.filter(item => item.completed).length;
  breakdown.push(basicRequirements);

  // 2. Core Profile (25% weight)
  const coreProfile: CompletionBreakdown = {
    category: 'Core Profile',
    weight: 25,
    completed: 0,
    total: 5,
    items: [
      {
        name: 'Bio/Description',
        completed: !!(profile.bio && profile.bio.trim().length > 20),
        weight: 5
      },
      {
        name: 'Profile Photo',
        completed: !!profile.avatar_url,
        weight: 5
      },
      {
        name: 'Location',
        completed: !!(profile.location_city && profile.location_country),
        weight: 5
      },
      {
        name: 'Birthday',
        completed: !!profile.birthday,
        weight: 5
      },
      {
        name: 'Skills/Tags',
        completed: !!(profile.tags && profile.tags.length >= 3),
        weight: 5
      }
    ]
  };
  coreProfile.completed = coreProfile.items.filter(item => item.completed).length;
  breakdown.push(coreProfile);

  // 3. Professional Info (25% weight)
  const professionalInfo: CompletionBreakdown = {
    category: 'Professional Experience',
    weight: 25,
    completed: 0,
    total: 4,
    items: [
      {
        name: 'Career History',
        completed: (profile.career_count || 0) > 0,
        weight: 10
      },
      {
        name: 'Multiple Businesses',
        completed: (profile.business_count || 0) > 1,
        weight: 5
      },
      {
        name: 'Graduation Details',
        completed: !!(profile.graduation_year && profile.course),
        weight: 5
      },
      {
        name: 'Multiple Education Entries',
        completed: (profile.education_count || 0) > 1,
        weight: 5
      }
    ]
  };
  professionalInfo.completed = professionalInfo.items.filter(item => item.completed).length;
  breakdown.push(professionalInfo);

  // 4. Extended Profile (20% weight)
  const extendedProfile: CompletionBreakdown = {
    category: 'Extended Profile',
    weight: 20,
    completed: 0,
    total: 4,
    items: [
      {
        name: 'Achievements',
        completed: (profile.achievement_count || 0) > 0,
        weight: 5
      },
      {
        name: 'Social Links',
        completed: (profile.links_count || 0) >= 2,
        weight: 5
      },
      {
        name: 'Contributions',
        completed: (profile.contribution_count || 0) > 0,
        weight: 5
      },
      {
        name: 'Rich Professional Data',
        completed: ((profile.career_count || 0) + (profile.business_count || 0)) >= 3,
        weight: 5
      }
    ]
  };
  extendedProfile.completed = extendedProfile.items.filter(item => item.completed).length;
  breakdown.push(extendedProfile);

  // Calculate total percentage
  let totalPercentage = 0;
  breakdown.forEach(category => {
    const categoryPercentage = (category.completed / category.total) * category.weight;
    totalPercentage += categoryPercentage;
  });

  // Round to nearest integer
  const percentage = Math.round(totalPercentage);

  // Determine color based on percentage
  let color: 'red' | 'amber' | 'yellow' | 'green';
  if (percentage < 30) {
    color = 'red';
  } else if (percentage < 60) {
    color = 'amber';
  } else if (percentage < 80) {
    color = 'yellow';
  } else {
    color = 'green';
  }

  // Generate appropriate message
  let message: string;
  if (percentage === 100) {
    message = 'Congratulations! Your profile is complete.';
  } else if (percentage >= 80) {
    message = `Almost there! Your profile is ${percentage}% complete.`;
  } else if (percentage >= 60) {
    message = `Great progress! Your profile is ${percentage}% complete.`;
  } else if (percentage >= 30) {
    message = `Your profile is ${percentage}% complete. Add more details to stand out!`;
  } else {
    message = `Complete your required profile sections (${percentage}% complete)`;
  }

  return {
    percentage,
    breakdown,
    message,
    color,
    isComplete: percentage === 100
  };
}

// Helper function to get missing items for user guidance
export function getMissingProfileItems(breakdown: CompletionBreakdown[]): string[] {
  const missing: string[] = [];

  breakdown.forEach(category => {
    category.items.forEach(item => {
      if (!item.completed) {
        missing.push(item.name);
      }
    });
  });

  return missing;
}

// Helper function to get next recommended action
export function getNextProfileAction(breakdown: CompletionBreakdown[]): string {
  // Priority: Basic Requirements > Core Profile > Professional > Extended
  for (const category of breakdown) {
    for (const item of category.items) {
      if (!item.completed) {
        switch (item.name) {
          case 'Full Name':
            return 'Add your full name';
          case 'Education Entry':
            return 'Add your education history';
          case 'Business Entry':
            return 'Add your business information';
          case 'Bio/Description':
            return 'Write a brief bio about yourself';
          case 'Profile Photo':
            return 'Upload a profile photo';
          case 'Location':
            return 'Add your location details';
          case 'Skills/Tags':
            return 'Add at least 3 skills or interests';
          case 'Career History':
            return 'Add your work experience';
          case 'Achievements':
            return 'Add your achievements and awards';
          case 'Social Links':
            return 'Connect your social profiles';
          default:
            return 'Complete your profile for better visibility';
        }
      }
    }
  }

  return 'Your profile is complete!';
}