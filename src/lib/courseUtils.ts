/**
 * Utility functions for formatting course names
 */

/**
 * Formats a course name to a shorter, more readable version
 * @param course - The full course name
 * @returns The formatted course name
 * 
 * Examples:
 * - "Bachelor of Business Administration" -> "B. Business Administration"
 * - "Bachelor of Chemical Engineering" -> "B. Chemical Engineering"
 * - "Master of Science in Computer Science" -> "MSc Computer Science"
 * - "Master of Business Administration" -> "MBA"
 * - "Doctor of Philosophy in Chemical Engineering" -> "PhD Chemical Engineering"
 */
export function formatCourseName(course: string | null | undefined): string {
  if (!course) return '';
  
  // First remove "with Honours" from the course name
  let cleanedCourse = course.replace(/ with Honours/gi, '');
  
  // Common course abbreviations
  const abbreviations: Record<string, string> = {
    'Master of Business Administration': 'MBA',
    'Master of Science': 'MSc',
    'Master of Arts': 'MA',
    'Master of Engineering': 'MEng',
    'Master of Technology': 'MTech',
    'Doctor of Philosophy': 'PhD',
    'Doctor of Engineering': 'EngD',
    'Doctor of Business Administration': 'DBA',
  };
  
  // Check for exact matches first
  for (const [fullName, abbr] of Object.entries(abbreviations)) {
    if (cleanedCourse === fullName) {
      return abbr;
    }
  }
  
  // Handle Bachelor degrees
  if (cleanedCourse.startsWith('Bachelor of ') || cleanedCourse.startsWith('Bachelor in ')) {
    return cleanedCourse.replace(/^Bachelor (of|in) /, 'B. ');
  }
  
  // Handle Master degrees with field specification
  if (cleanedCourse.startsWith('Master of Science in ')) {
    return cleanedCourse.replace('Master of Science in ', 'MSc ');
  }
  if (cleanedCourse.startsWith('Master of Arts in ')) {
    return cleanedCourse.replace('Master of Arts in ', 'MA ');
  }
  if (cleanedCourse.startsWith('Master of Engineering in ')) {
    return cleanedCourse.replace('Master of Engineering in ', 'MEng ');
  }
  if (cleanedCourse.startsWith('Master of Technology in ')) {
    return cleanedCourse.replace('Master of Technology in ', 'MTech ');
  }
  if (cleanedCourse.startsWith('Master of ')) {
    const field = cleanedCourse.replace('Master of ', '');
    // Check if it's a known abbreviation
    if (field === 'Business Administration') return 'MBA';
    if (field === 'Science') return 'MSc';
    if (field === 'Arts') return 'MA';
    if (field === 'Engineering') return 'MEng';
    if (field === 'Technology') return 'MTech';
    // Otherwise return M. + field
    return `M. ${field}`;
  }
  
  // Handle PhD/Doctorate degrees
  if (cleanedCourse.startsWith('Doctor of Philosophy in ')) {
    return cleanedCourse.replace('Doctor of Philosophy in ', 'PhD ');
  }
  if (cleanedCourse.startsWith('Doctor of Philosophy')) {
    return 'PhD';
  }
  if (cleanedCourse.startsWith('Doctor of Engineering in ')) {
    return cleanedCourse.replace('Doctor of Engineering in ', 'EngD ');
  }
  if (cleanedCourse.startsWith('Doctor of Business Administration')) {
    return 'DBA';
  }
  if (cleanedCourse.startsWith('Doctor of ')) {
    return cleanedCourse.replace('Doctor of ', 'Dr. ');
  }
  
  // Handle Diploma
  if (cleanedCourse.startsWith('Diploma in ')) {
    return cleanedCourse.replace('Diploma in ', 'Dip. ');
  }
  
  // Handle Certificate
  if (cleanedCourse.startsWith('Certificate in ')) {
    return cleanedCourse.replace('Certificate in ', 'Cert. ');
  }
  
  // Handle Foundation
  if (cleanedCourse.startsWith('Foundation in ')) {
    return cleanedCourse.replace('Foundation in ', 'Found. ');
  }
  
  // If no pattern matches, return the cleaned course name (without "with Honours")
  return cleanedCourse;
}

/**
 * Gets the degree level from a course name
 * @param course - The full course name
 * @returns The degree level (Bachelor, Master, PhD, etc.)
 */
export function getDegreeLevelAbbreviation(course: string | null | undefined): string {
  if (!course) return '';
  
  if (course.startsWith('Bachelor')) return 'B.';
  if (course.startsWith('Master of Business Administration')) return 'MBA';
  if (course.startsWith('Master')) return 'M.';
  if (course.startsWith('Doctor of Philosophy')) return 'PhD';
  if (course.startsWith('Doctor')) return 'Dr.';
  if (course.startsWith('Diploma')) return 'Dip.';
  if (course.startsWith('Certificate')) return 'Cert.';
  if (course.startsWith('Foundation')) return 'Found.';
  
  return '';
}