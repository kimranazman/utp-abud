-- Create user_education table for multiple education entries per user
CREATE TABLE public.user_education (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  programme_level TEXT NOT NULL CHECK (programme_level IN ('undergraduate', 'postgraduate')),
  programme_name TEXT NOT NULL,
  graduation_year INTEGER NOT NULL CHECK (graduation_year >= 1980 AND graduation_year <= EXTRACT(YEAR FROM NOW()) + 10),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_education ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own education" 
ON public.user_education 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own education" 
ON public.user_education 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education" 
ON public.user_education 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education" 
ON public.user_education 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view education of visible profiles" 
ON public.user_education 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM profiles p 
  WHERE p.user_id = user_education.user_id 
  AND auth.uid() IS NOT NULL 
  AND (p.profile_visibility = 'public'::profile_visibility OR p.profile_visibility = 'alumni_only'::profile_visibility)
));

CREATE POLICY "Admins can manage all education" 
ON public.user_education 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::user_role));

-- Add trigger for updated_at
CREATE TRIGGER update_user_education_updated_at
BEFORE UPDATE ON public.user_education
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add unique constraint to ensure only one primary education per user
CREATE UNIQUE INDEX idx_user_education_primary 
ON public.user_education (user_id) 
WHERE is_primary = true;