-- Completely lock down the profiles table and create proper security for the public view
-- This ensures no direct access to sensitive data in the profiles table

-- Step 1: Remove the overly permissive policy that allows public access to profiles table
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Step 2: Remove duplicate policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Step 3: Ensure only authenticated users can see their own data or admins can see all
-- The remaining policies should be:
-- - "Users can view their complete profile" (for own data)
-- - "Admins can view all profiles" (for admin access)
-- - User insert/update policies (for profile management)

-- Step 4: Enable RLS on the profiles_public view and create proper policies
-- Note: Views can't have RLS enabled directly, but we can control access through policies

-- Step 5: Create a function to safely query public profile data
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE (
  user_id uuid,
  full_name text,
  course text,
  graduation_year integer,
  location_city text,
  location_state text,
  location_country text,
  bio text,
  avatar_url text,
  avatar_thumbnail_url text,
  tags text[],
  profile_visibility profile_visibility,
  is_verified boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  -- Email is only shown to the profile owner or admins
  email text,
  is_own_profile boolean
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    p.course,
    p.graduation_year,
    p.location_city,
    p.location_state,
    p.location_country,
    p.bio,
    p.avatar_url,
    p.avatar_thumbnail_url,
    p.tags,
    p.profile_visibility,
    p.is_verified,
    p.created_at,
    p.updated_at,
    -- Conditionally show email only to the profile owner or admins
    CASE 
      WHEN auth.uid() = p.user_id OR has_role(auth.uid(), 'admin'::user_role) THEN p.email
      ELSE NULL
    END as email,
    -- Show if this is the user's own profile
    (auth.uid() = p.user_id) as is_own_profile
  FROM profiles p
  WHERE 
    -- Apply visibility rules
    (p.profile_visibility = 'public'::profile_visibility)
    OR (p.profile_visibility = 'alumni_only'::profile_visibility AND auth.uid() IS NOT NULL)
    OR (p.is_seed_data = true AND is_development_mode())
    OR (auth.uid() = p.user_id)
    OR has_role(auth.uid(), 'admin'::user_role);
$$;

-- Step 6: Create a safe public profile access function that doesn't expose sensitive data for general queries
CREATE OR REPLACE FUNCTION public.search_public_profiles(search_term text DEFAULT '', limit_count integer DEFAULT 50)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  course text,
  graduation_year integer,
  location_city text,
  location_state text,
  location_country text,
  bio text,
  avatar_url text,
  avatar_thumbnail_url text,
  tags text[],
  is_verified boolean
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.user_id,
    p.full_name,
    p.course,
    p.graduation_year,
    p.location_city,
    p.location_state,
    p.location_country,
    p.bio,
    p.avatar_url,
    p.avatar_thumbnail_url,
    p.tags,
    p.is_verified
  FROM profiles p
  WHERE 
    -- Only show public profiles or alumni_only to authenticated users
    (
      (p.profile_visibility = 'public'::profile_visibility)
      OR (p.profile_visibility = 'alumni_only'::profile_visibility AND auth.uid() IS NOT NULL)
      OR (p.is_seed_data = true AND is_development_mode())
    )
    AND p.is_verified = true
    AND (
      search_term = '' 
      OR p.full_name ILIKE '%' || search_term || '%'
      OR p.course ILIKE '%' || search_term || '%'
      OR p.bio ILIKE '%' || search_term || '%'
    )
  ORDER BY p.created_at DESC
  LIMIT limit_count;
$$;

-- Step 7: Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_public_profiles(text, integer) TO authenticated;

-- Step 8: Add comment explaining the security model
COMMENT ON FUNCTION public.get_public_profiles() IS 'Secure function to access profile data with email protection - only shows emails to profile owners and admins';
COMMENT ON FUNCTION public.search_public_profiles(text, integer) IS 'Secure function to search profiles without exposing sensitive data like email addresses';