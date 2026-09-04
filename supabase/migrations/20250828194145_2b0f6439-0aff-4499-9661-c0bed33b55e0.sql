-- Create business_team_members table for multiple users per business
CREATE TABLE public.business_team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.user_businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL,
  is_business_admin BOOLEAN NOT NULL DEFAULT false,
  added_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

-- Enable Row Level Security
ALTER TABLE public.business_team_members ENABLE ROW LEVEL SECURITY;

-- Create policies for business_team_members

-- Users can view team members of businesses they're part of or visible profiles
CREATE POLICY "Users can view team members of accessible businesses" 
ON public.business_team_members 
FOR SELECT 
USING (
  -- User is part of this business team
  auth.uid() = user_id OR
  -- User owns the business
  EXISTS (
    SELECT 1 FROM public.user_businesses ub 
    WHERE ub.id = business_id AND ub.user_id = auth.uid()
  ) OR
  -- User is a business admin for this business
  EXISTS (
    SELECT 1 FROM public.business_team_members btm 
    WHERE btm.business_id = business_team_members.business_id 
    AND btm.user_id = auth.uid() 
    AND btm.is_business_admin = true
  ) OR
  -- Business is visible to alumni (checking via business owner's profile visibility)
  (
    has_role(auth.uid(), 'alumni'::user_role) AND
    EXISTS (
      SELECT 1 FROM public.user_businesses ub
      JOIN public.profiles p ON p.user_id = ub.user_id
      WHERE ub.id = business_id 
      AND (p.profile_visibility = 'public'::profile_visibility 
           OR p.profile_visibility = 'alumni_only'::profile_visibility)
    )
  ) OR
  -- Portal admins can view all
  has_role(auth.uid(), 'admin'::user_role)
);

-- Business owners and business admins can add team members
CREATE POLICY "Business owners and admins can add team members" 
ON public.business_team_members 
FOR INSERT 
WITH CHECK (
  -- User owns the business
  EXISTS (
    SELECT 1 FROM public.user_businesses ub 
    WHERE ub.id = business_id AND ub.user_id = auth.uid()
  ) OR
  -- User is a business admin for this business
  EXISTS (
    SELECT 1 FROM public.business_team_members btm 
    WHERE btm.business_id = business_team_members.business_id 
    AND btm.user_id = auth.uid() 
    AND btm.is_business_admin = true
  ) OR
  -- Portal admins can add anyone
  has_role(auth.uid(), 'admin'::user_role)
);

-- Business owners, business admins, and portal admins can update team members
CREATE POLICY "Business owners and admins can update team members" 
ON public.business_team_members 
FOR UPDATE 
USING (
  -- User owns the business
  EXISTS (
    SELECT 1 FROM public.user_businesses ub 
    WHERE ub.id = business_id AND ub.user_id = auth.uid()
  ) OR
  -- User is a business admin for this business
  EXISTS (
    SELECT 1 FROM public.business_team_members btm 
    WHERE btm.business_id = business_team_members.business_id 
    AND btm.user_id = auth.uid() 
    AND btm.is_business_admin = true
  ) OR
  -- Portal admins can update anything
  has_role(auth.uid(), 'admin'::user_role)
);

-- Business owners, business admins, and portal admins can remove team members
CREATE POLICY "Business owners and admins can remove team members" 
ON public.business_team_members 
FOR DELETE 
USING (
  -- User owns the business
  EXISTS (
    SELECT 1 FROM public.user_businesses ub 
    WHERE ub.id = business_id AND ub.user_id = auth.uid()
  ) OR
  -- User is a business admin for this business
  EXISTS (
    SELECT 1 FROM public.business_team_members btm 
    WHERE btm.business_id = business_team_members.business_id 
    AND btm.user_id = auth.uid() 
    AND btm.is_business_admin = true
  ) OR
  -- Users can remove themselves from teams
  auth.uid() = user_id OR
  -- Portal admins can remove anyone
  has_role(auth.uid(), 'admin'::user_role)
);

-- Portal admins can manage all team members
CREATE POLICY "Admins can manage all business team members" 
ON public.business_team_members 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_business_team_members_updated_at
BEFORE UPDATE ON public.business_team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance on business lookups
CREATE INDEX idx_business_team_members_business_id ON public.business_team_members(business_id);
CREATE INDEX idx_business_team_members_user_id ON public.business_team_members(user_id);