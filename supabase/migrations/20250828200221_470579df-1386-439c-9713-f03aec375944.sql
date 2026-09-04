-- Add services table for businesses
CREATE TABLE IF NOT EXISTS public.business_services (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id uuid NOT NULL REFERENCES public.user_businesses(id) ON DELETE CASCADE,
  service_name text NOT NULL,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on business_services
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;

-- Create policies for business_services
CREATE POLICY "Users can view services of accessible businesses"
ON public.business_services
FOR SELECT
USING (
  -- Users can see their own business services
  EXISTS (
    SELECT 1 FROM public.user_businesses ub
    WHERE ub.id = business_services.business_id 
    AND ub.user_id = auth.uid()
  )
  OR
  -- Alumni can see services of visible businesses
  (
    has_role(auth.uid(), 'alumni'::user_role) AND
    EXISTS (
      SELECT 1 FROM public.user_businesses ub
      JOIN public.profiles p ON p.user_id = ub.user_id
      WHERE ub.id = business_services.business_id
      AND (p.profile_visibility = 'public'::profile_visibility OR p.profile_visibility = 'alumni_only'::profile_visibility)
      AND p.is_verified = true
    )
  )
  OR
  -- Admins can see all services
  has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Business owners can manage their services"
ON public.business_services
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_businesses ub
    WHERE ub.id = business_services.business_id 
    AND ub.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::user_role)
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_businesses ub
    WHERE ub.id = business_services.business_id 
    AND ub.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::user_role)
);

-- Add trigger for updated_at
CREATE TRIGGER update_business_services_updated_at
BEFORE UPDATE ON public.business_services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();