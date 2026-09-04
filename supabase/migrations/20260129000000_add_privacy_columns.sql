-- Add privacy control columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS hide_email BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hide_location BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hide_graduation_year BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS hide_businesses BOOLEAN DEFAULT false;

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.hide_email IS 'When true, email is hidden from other alumni';
COMMENT ON COLUMN public.profiles.hide_location IS 'When true, location fields are hidden from other alumni';
COMMENT ON COLUMN public.profiles.hide_graduation_year IS 'When true, graduation year is hidden from other alumni';
COMMENT ON COLUMN public.profiles.hide_businesses IS 'When true, businesses are hidden from business directory for other alumni';
