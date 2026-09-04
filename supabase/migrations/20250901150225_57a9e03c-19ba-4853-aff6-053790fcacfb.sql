-- Create business_links table
CREATE TABLE public.business_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.user_businesses(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  display_text TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.business_links ENABLE ROW LEVEL SECURITY;

-- Create policies for business links
CREATE POLICY "Business owners can manage their business links"
ON public.business_links
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_businesses ub
    WHERE ub.id = business_links.business_id 
    AND ub.user_id = auth.uid()
  )
  OR has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Users can view business links of accessible businesses"
ON public.business_links
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_businesses ub
    WHERE ub.id = business_links.business_id 
    AND ub.user_id = auth.uid()
  )
  OR (
    auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.user_businesses ub
      JOIN public.profiles p ON p.user_id = ub.user_id
      WHERE ub.id = business_links.business_id
      AND (p.profile_visibility = 'public'::profile_visibility OR p.profile_visibility = 'alumni_only'::profile_visibility)
      AND p.is_verified = true
    )
  )
  OR has_role(auth.uid(), 'admin'::user_role)
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_business_links_updated_at
BEFORE UPDATE ON public.business_links
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();