-- Fix security vulnerabilities by dropping insecure view and creating proper RLS policies

-- 1. Drop the insecure profiles_public view that exposes user data
DROP VIEW IF EXISTS public.profiles_public;

-- 2. Add RLS policies for contribution_analytics view to restrict access to admins only
ALTER TABLE public.contribution_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view contribution analytics"
ON public.contribution_analytics
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

-- 3. Add RLS policies for development_status view to restrict access to admins only  
ALTER TABLE public.development_status ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view development status"
ON public.development_status
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

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
GRANT EXECUTE ON FUNCTION public.can_view_financial_data(uuid, uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_view_business_data(uuid, uuid) TO authenticated;