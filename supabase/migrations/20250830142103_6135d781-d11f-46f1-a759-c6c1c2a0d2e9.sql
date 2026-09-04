-- Fix critical security issues

-- 1. Add RLS policies to contribution_analytics table
ALTER TABLE public.contribution_analytics ENABLE ROW LEVEL SECURITY;

-- Policy for admins to view analytics data
CREATE POLICY "Admins can view all contribution analytics" 
ON public.contribution_analytics 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::user_role));

-- 2. Fix profiles table visibility - remove public access to sensitive data
-- Update the existing policy to require authentication for all profile visibility
DROP POLICY IF EXISTS "Authenticated users can view visible profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view visible profiles" 
ON public.profiles 
FOR SELECT 
USING (
  (auth.uid() IS NOT NULL) AND (
    (profile_visibility = 'public'::profile_visibility) OR 
    (profile_visibility = 'alumni_only'::profile_visibility)
  )
);

-- 3. Create a view for public profile access with limited fields (no sensitive data)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  user_id,
  full_name,
  course,
  graduation_year,
  bio,
  avatar_url,
  avatar_thumbnail_url,
  tags,
  location,
  created_at,
  updated_at,
  is_verified
FROM public.profiles 
WHERE profile_visibility = 'public'::profile_visibility 
  AND is_verified = true;

-- Grant access to public profiles view
GRANT SELECT ON public.public_profiles TO anon, authenticated;