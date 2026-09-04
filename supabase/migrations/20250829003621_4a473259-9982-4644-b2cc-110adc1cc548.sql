-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);

-- Add image URL fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN avatar_url TEXT,
ADD COLUMN avatar_thumbnail_url TEXT;

-- Add image URL fields to user_businesses table  
ALTER TABLE public.user_businesses
ADD COLUMN logo_url TEXT,
ADD COLUMN logo_thumbnail_url TEXT,
ADD COLUMN featured_image_url TEXT;

-- Create business_images table for additional business photos
CREATE TABLE public.business_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on business_images
ALTER TABLE public.business_images ENABLE ROW LEVEL SECURITY;

-- RLS policies for business_images
CREATE POLICY "Users can view images of accessible businesses" 
ON public.business_images 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_businesses ub 
    WHERE ub.id = business_images.business_id 
    AND ub.user_id = auth.uid()
  ) OR 
  has_role(auth.uid(), 'alumni'::user_role) AND EXISTS (
    SELECT 1 FROM user_businesses ub 
    JOIN profiles p ON p.user_id = ub.user_id 
    WHERE ub.id = business_images.business_id 
    AND (p.profile_visibility = 'public'::profile_visibility OR p.profile_visibility = 'alumni_only'::profile_visibility)
    AND p.is_verified = true
  ) OR 
  has_role(auth.uid(), 'admin'::user_role)
);

CREATE POLICY "Business owners can manage their images" 
ON public.business_images 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM user_businesses ub 
    WHERE ub.id = business_images.business_id 
    AND ub.user_id = auth.uid()
  ) OR 
  has_role(auth.uid(), 'admin'::user_role)
) 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_businesses ub 
    WHERE ub.id = business_images.business_id 
    AND ub.user_id = auth.uid()
  ) OR 
  has_role(auth.uid(), 'admin'::user_role)
);

-- Add trigger for business_images updated_at
CREATE TRIGGER update_business_images_updated_at
BEFORE UPDATE ON public.business_images
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage policies for images bucket
CREATE POLICY "Images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'images');

CREATE POLICY "Authenticated users can upload images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'images' AND auth.uid()::text = (storage.foldername(name))[1]);