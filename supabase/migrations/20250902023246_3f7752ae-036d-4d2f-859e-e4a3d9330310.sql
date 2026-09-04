-- Fix security vulnerabilities by dropping insecure views and replacing with secure functions

-- 1. Drop the insecure profiles_public view that exposes user data
DROP VIEW IF EXISTS public.profiles_public;

-- 2. Drop the contribution_analytics view and replace with a secure function
DROP VIEW IF EXISTS public.contribution_analytics;

CREATE OR REPLACE FUNCTION public.get_contribution_analytics()
RETURNS TABLE(
  user_id uuid,
  full_name text,
  course text,
  graduation_year integer,
  total_contributions bigint,
  monetary_contributions bigint,
  non_monetary_contributions bigint,
  total_contribution_value_all numeric,
  total_monetary_all numeric,
  total_non_monetary_all numeric,
  total_contribution_value_public numeric,
  total_monetary_public numeric,
  total_non_monetary_public numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only admins can access analytics data
  SELECT 
    p.user_id,
    p.full_name,
    p.course,
    p.graduation_year,
    COUNT(c.id) as total_contributions,
    COUNT(c.id) FILTER (WHERE c.contribution_type = 'monetary') as monetary_contributions,
    COUNT(c.id) FILTER (WHERE c.contribution_type = 'non_monetary') as non_monetary_contributions,
    COALESCE(SUM(c.value_amount), 0) as total_contribution_value_all,
    COALESCE(SUM(c.value_amount) FILTER (WHERE c.contribution_type = 'monetary'), 0) as total_monetary_all,
    COALESCE(SUM(c.value_amount) FILTER (WHERE c.contribution_type = 'non_monetary'), 0) as total_non_monetary_all,
    COALESCE(SUM(c.value_amount) FILTER (WHERE NOT c.value_private), 0) as total_contribution_value_public,
    COALESCE(SUM(c.value_amount) FILTER (WHERE c.contribution_type = 'monetary' AND NOT c.value_private), 0) as total_monetary_public,
    COALESCE(SUM(c.value_amount) FILTER (WHERE c.contribution_type = 'non_monetary' AND NOT c.value_private), 0) as total_non_monetary_public
  FROM profiles p
  LEFT JOIN contributions c ON p.user_id = c.user_id
  WHERE has_role(auth.uid(), 'admin'::user_role)
  GROUP BY p.user_id, p.full_name, p.course, p.graduation_year
  ORDER BY total_contribution_value_all DESC;
$$;

-- 3. Drop the development_status view and replace with a secure function
DROP VIEW IF EXISTS public.development_status;

CREATE OR REPLACE FUNCTION public.get_development_status()
RETURNS TABLE(
  is_enabled boolean,
  real_profiles_count integer,
  seed_profiles_count integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Only admins can access development status
  SELECT 
    is_development_mode() as is_enabled,
    (SELECT COUNT(*)::integer FROM profiles WHERE NOT is_seed_data) as real_profiles_count,
    (SELECT COUNT(*)::integer FROM profiles WHERE is_seed_data = true) as seed_profiles_count
  WHERE has_role(auth.uid(), 'admin'::user_role);
$$;

-- 4. Create a secure function to check if financial data should be visible
CREATE OR REPLACE FUNCTION public.can_view_financial_data(_user_id uuid, _requester_id uuid, _is_private boolean)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Financial data is visible if:
  -- 1. It's not marked as private, OR
  -- 2. The requester is the owner, OR  
  -- 3. The requester is an admin
  SELECT (
    NOT COALESCE(_is_private, false) OR 
    _requester_id = _user_id OR 
    has_role(_requester_id, 'admin'::user_role)
  );
$$;

-- 5. Update contributions RLS policies to respect value_private flag
DROP POLICY IF EXISTS "Authenticated users can view contributions of visible profiles" ON public.contributions;

CREATE POLICY "Users can view contributions respecting privacy settings"
ON public.contributions
FOR SELECT
USING (
  -- Users can view their own contributions
  (auth.uid() = user_id) OR
  -- Admins can view all contributions
  has_role(auth.uid(), 'admin'::user_role) OR
  -- Authenticated users can view contributions of visible profiles, but only if financial data is not private
  (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.user_id = contributions.user_id
        AND (p.profile_visibility = 'public'::profile_visibility OR p.profile_visibility = 'alumni_only'::profile_visibility)
    ) AND
    can_view_financial_data(contributions.user_id, auth.uid(), contributions.value_private)
  )
);

-- 6. Create a secure function for business data visibility
CREATE OR REPLACE FUNCTION public.can_view_business_data(_business_user_id uuid, _requester_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  -- Business data is visible if:
  -- 1. The requester is the business owner, OR
  -- 2. The requester is an admin, OR
  -- 3. The business owner has a public profile AND the requester is authenticated
  SELECT (
    _requester_id = _business_user_id OR
    has_role(_requester_id, 'admin'::user_role) OR
    (
      _requester_id IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.user_id = _business_user_id
          AND p.profile_visibility = 'public'::profile_visibility
      )
    )
  );
$$;

-- 7. Update user_businesses RLS policies to better protect sensitive business data
DROP POLICY IF EXISTS "Authenticated users can view businesses of visible profiles" ON public.user_businesses;

CREATE POLICY "Users can view businesses with appropriate access controls"
ON public.user_businesses
FOR SELECT
USING (
  -- Users can view their own businesses
  (auth.uid() = user_id) OR
  -- Admins can view all businesses
  has_role(auth.uid(), 'admin'::user_role) OR
  -- Check if business data should be visible based on profile visibility
  can_view_business_data(user_id, auth.uid())
);

-- 8. Grant execute permissions on the new functions
GRANT EXECUTE ON FUNCTION public.get_contribution_analytics() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_development_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_financial_data(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_business_data(uuid, uuid) TO authenticated;