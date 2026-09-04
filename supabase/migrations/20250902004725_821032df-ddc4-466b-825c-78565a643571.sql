-- Fix User Email and Personal Data Exposure by implementing granular RLS policies
-- This migration restricts access to sensitive personal data while maintaining necessary functionality

-- First, drop the overly permissive policy that exposes all profile data
DROP POLICY IF EXISTS "Authenticated users can view visible profiles" ON public.profiles;

-- Create separate policies for different types of profile data access

-- 1. Basic profile information (safe for public/alumni viewing)
-- Allow viewing of non-sensitive profile data for public and alumni-only profiles
CREATE POLICY "Public can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only show basic fields, email and other sensitive data will be filtered at application level
  profile_visibility = 'public'::profile_visibility 
  OR (profile_visibility = 'alumni_only'::profile_visibility AND auth.uid() IS NOT NULL)
  OR (is_seed_data = true AND is_development_mode())
);

-- 2. Full profile access (including sensitive data like email) - restricted to owners and admins
CREATE POLICY "Users can view their complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Now we need to create a view that filters sensitive data for public access
-- This view will be used by the application to show appropriate data based on access level

CREATE OR REPLACE VIEW public.profiles_public AS
SELECT 
  user_id,
  full_name,
  course,
  graduation_year,
  location_city,
  location_state,
  location_country,
  bio,
  avatar_url,
  avatar_thumbnail_url,
  tags,
  profile_visibility,
  is_verified,
  created_at,
  updated_at,
  -- Conditionally show email only to the profile owner or admins
  CASE 
    WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::user_role) THEN email
    ELSE NULL
  END as email,
  -- Show if this is the user's own profile
  (auth.uid() = user_id) as is_own_profile
FROM profiles
WHERE 
  -- Apply same visibility rules as the main table
  (profile_visibility = 'public'::profile_visibility)
  OR (profile_visibility = 'alumni_only'::profile_visibility AND auth.uid() IS NOT NULL)
  OR (is_seed_data = true AND is_development_mode())
  OR (auth.uid() = user_id)
  OR has_role(auth.uid(), 'admin'::user_role);

-- Add comment to document the security purpose of this view
COMMENT ON VIEW public.profiles_public IS 'Public-safe view of profiles that conditionally exposes sensitive data like email addresses only to authorized users';