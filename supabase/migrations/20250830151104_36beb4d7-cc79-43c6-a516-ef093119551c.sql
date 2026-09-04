-- Add structured location fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN location_city text,
ADD COLUMN location_state text,
ADD COLUMN location_country text;

-- Create an index for better performance on location queries
CREATE INDEX idx_profiles_location_country ON public.profiles(location_country);
CREATE INDEX idx_profiles_location_city ON public.profiles(location_city);

-- Update existing location data by parsing the location field
-- This will handle common formats like "City, State", "City, Country", etc.
UPDATE public.profiles 
SET 
  location_country = CASE 
    WHEN location LIKE '%USA' OR location LIKE '%United States%' THEN 'USA'
    WHEN location LIKE '%Australia%' THEN 'Australia'
    WHEN location LIKE '%Canada%' THEN 'Canada'
    WHEN location LIKE '%Malaysia%' THEN 'Malaysia'
    WHEN location LIKE '%Singapore%' THEN 'Singapore'
    WHEN location LIKE '%UK%' OR location LIKE '%United Kingdom%' THEN 'United Kingdom'
    ELSE NULL
  END,
  location_state = CASE 
    WHEN location LIKE '%CA' OR location LIKE '%California%' THEN 'California'
    WHEN location LIKE '%NY' OR location LIKE '%New York%' THEN 'New York'
    WHEN location LIKE '%TX' OR location LIKE '%Texas%' THEN 'Texas'
    WHEN location LIKE '%WA' OR location LIKE '%Washington%' THEN 'Washington'
    WHEN location LIKE '%MA' OR location LIKE '%Massachusetts%' THEN 'Massachusetts'
    WHEN location LIKE '%IL' OR location LIKE '%Illinois%' THEN 'Illinois'
    ELSE NULL
  END,
  location_city = CASE 
    WHEN location LIKE 'San Francisco%' THEN 'San Francisco'
    WHEN location LIKE 'New York%' THEN 'New York'
    WHEN location LIKE 'Austin%' THEN 'Austin'
    WHEN location LIKE 'Boston%' THEN 'Boston'
    WHEN location LIKE 'Seattle%' THEN 'Seattle'
    WHEN location LIKE 'Chicago%' THEN 'Chicago'
    ELSE SPLIT_PART(location, ',', 1)
  END
WHERE location IS NOT NULL;