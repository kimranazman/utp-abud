-- Migration: Add profile completion calculation function
-- Purpose: Enable admin dashboard to query/filter/sort users by profile completion percentage
-- Requirements: COMP-01, COMP-02 (weighted profile completion calculation)

-- Drop function if exists (for idempotency)
DROP FUNCTION IF EXISTS public.calculate_profile_completion(UUID);

-- Create the profile completion calculation function
-- Weights per COMP-02:
--   Photo (avatar_url): 20%
--   Name (full_name): 15%
--   Graduation Year (graduation_year): 15%
--   Location (location_city AND location_country): 15%
--   Program (course): 15%
--   Bio (bio): 10%
--   Company (career_history current_position OR user_businesses): 10%
CREATE OR REPLACE FUNCTION public.calculate_profile_completion(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile RECORD;
  v_score INTEGER := 0;
  v_has_company BOOLEAN := FALSE;
BEGIN
  -- Get profile data
  SELECT
    avatar_url,
    full_name,
    graduation_year,
    location_city,
    location_country,
    course,
    bio
  INTO v_profile
  FROM public.profiles
  WHERE user_id = p_user_id;

  -- Return 0 if no profile found
  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Photo: 20%
  IF v_profile.avatar_url IS NOT NULL AND v_profile.avatar_url <> '' THEN
    v_score := v_score + 20;
  END IF;

  -- Name: 15%
  IF v_profile.full_name IS NOT NULL AND TRIM(v_profile.full_name) <> '' THEN
    v_score := v_score + 15;
  END IF;

  -- Graduation Year: 15%
  IF v_profile.graduation_year IS NOT NULL THEN
    v_score := v_score + 15;
  END IF;

  -- Location: 15% (requires BOTH city AND country)
  IF v_profile.location_city IS NOT NULL AND v_profile.location_city <> ''
     AND v_profile.location_country IS NOT NULL AND v_profile.location_country <> '' THEN
    v_score := v_score + 15;
  END IF;

  -- Program (course): 15%
  IF v_profile.course IS NOT NULL AND TRIM(v_profile.course) <> '' THEN
    v_score := v_score + 15;
  END IF;

  -- Bio: 10%
  IF v_profile.bio IS NOT NULL AND TRIM(v_profile.bio) <> '' THEN
    v_score := v_score + 10;
  END IF;

  -- Company: 10% (from career_history current_position OR user_businesses)
  SELECT EXISTS(
    SELECT 1 FROM public.career_history
    WHERE user_id = p_user_id AND current_position = true
  ) OR EXISTS(
    SELECT 1 FROM public.user_businesses
    WHERE user_id = p_user_id
  ) INTO v_has_company;

  IF v_has_company THEN
    v_score := v_score + 10;
  END IF;

  RETURN v_score;
END;
$$;

-- Grant execute permission to authenticated users (admins use this for dashboard)
GRANT EXECUTE ON FUNCTION public.calculate_profile_completion(UUID) TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.calculate_profile_completion(UUID) IS
'Calculates profile completion percentage (0-100) based on weighted fields.
Weights: photo 20%, name 15%, grad year 15%, location 15%, program 15%, bio 10%, company 10%.
Used by admin dashboard for filtering and sorting alumni by profile completion.';

-- ============================================================
-- VERIFICATION QUERIES (for testing and documentation)
-- ============================================================

-- 1. Get completion for a single user:
-- SELECT calculate_profile_completion('user-uuid-here');

-- 2. Get all users with completion below 50%:
-- SELECT p.user_id, p.full_name, calculate_profile_completion(p.user_id) as completion
-- FROM profiles p
-- WHERE calculate_profile_completion(p.user_id) < 50
-- ORDER BY completion ASC;

-- 3. Calculate average completion across all profiles:
-- SELECT AVG(calculate_profile_completion(user_id))::INTEGER as avg_completion
-- FROM profiles;

-- 4. Filter profiles by completion range (50-80%):
-- SELECT p.user_id, p.full_name, calculate_profile_completion(p.user_id) as completion
-- FROM profiles p
-- WHERE calculate_profile_completion(p.user_id) BETWEEN 50 AND 80
-- ORDER BY completion DESC;

-- 5. Count profiles by completion tier:
-- SELECT
--   CASE
--     WHEN calculate_profile_completion(user_id) < 25 THEN '0-24%'
--     WHEN calculate_profile_completion(user_id) < 50 THEN '25-49%'
--     WHEN calculate_profile_completion(user_id) < 75 THEN '50-74%'
--     ELSE '75-100%'
--   END as completion_tier,
--   COUNT(*) as profile_count
-- FROM profiles
-- GROUP BY completion_tier
-- ORDER BY completion_tier;
