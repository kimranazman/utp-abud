-- Migration: Add average profile completion function
-- Purpose: Calculate average weighted profile completion for admin dashboard
-- Dependency: Requires calculate_profile_completion(UUID) from Phase 9

-- Create function to get average completion across all profiles
CREATE OR REPLACE FUNCTION public.get_average_profile_completion()
RETURNS INTEGER
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(AVG(calculate_profile_completion(user_id))::INTEGER, 0)
  FROM profiles;
$$;

-- Grant execute permission to authenticated users (admins use this)
GRANT EXECUTE ON FUNCTION public.get_average_profile_completion() TO authenticated;

-- Add documentation
COMMENT ON FUNCTION public.get_average_profile_completion() IS
'Returns average weighted profile completion (0-100) across all profiles.
Used by admin dashboard for overview statistics.';
