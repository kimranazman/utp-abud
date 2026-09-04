-- Fix infinite recursion in business_team_members RLS policies
-- Drop the problematic policies
DROP POLICY IF EXISTS "Users can view team members of accessible businesses" ON public.business_team_members;
DROP POLICY IF EXISTS "Business owners and admins can add team members" ON public.business_team_members;
DROP POLICY IF EXISTS "Business owners and admins can update team members" ON public.business_team_members;
DROP POLICY IF EXISTS "Business owners and admins can remove team members" ON public.business_team_members;

-- Create simplified, non-recursive policies
CREATE POLICY "Users can view their own team memberships"
ON public.business_team_members
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Business owners can view all team members"
ON public.business_team_members
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_businesses ub
    WHERE ub.id = business_team_members.business_id 
    AND ub.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all team members"
ON public.business_team_members
FOR SELECT
USING (has_role(auth.uid(), 'admin'::user_role));

CREATE POLICY "Alumni can view team members of visible businesses"
ON public.business_team_members
FOR SELECT
USING (
  has_role(auth.uid(), 'alumni'::user_role) AND
  EXISTS (
    SELECT 1 FROM public.user_businesses ub
    JOIN public.profiles p ON p.user_id = ub.user_id
    WHERE ub.id = business_team_members.business_id
    AND (p.profile_visibility = 'public'::profile_visibility OR p.profile_visibility = 'alumni_only'::profile_visibility)
  )
);

-- Insert policies
CREATE POLICY "Business owners can add team members"
ON public.business_team_members
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_businesses ub
    WHERE ub.id = business_team_members.business_id 
    AND ub.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::user_role)
);

-- Update policies
CREATE POLICY "Business owners can update team members"
ON public.business_team_members
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_businesses ub
    WHERE ub.id = business_team_members.business_id 
    AND ub.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::user_role)
);

-- Delete policies
CREATE POLICY "Business owners and team members can remove memberships"
ON public.business_team_members
FOR DELETE
USING (
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.user_businesses ub
    WHERE ub.id = business_team_members.business_id 
    AND ub.user_id = auth.uid()
  ) OR has_role(auth.uid(), 'admin'::user_role)
);