-- Update locations for seed profiles to use proper location structure from locations.ts
-- And add comprehensive seed data with correct values

-- First, update profile locations to match locations.ts structure
UPDATE public.profiles SET 
  location = 'Singapore',
  location_city = 'Singapore', 
  location_state = NULL, 
  location_country = 'Singapore'
WHERE email = 'sarah.chen.demo@email.com' AND is_seed_data = true;

UPDATE public.profiles SET 
  location = 'Austin, Texas, USA',
  location_city = 'Austin', 
  location_state = 'Texas', 
  location_country = 'United States'
WHERE email = 'marcus.j.demo@email.com' AND is_seed_data = true;

UPDATE public.profiles SET 
  location = 'Mumbai, India',
  location_city = 'Mumbai', 
  location_state = 'Maharashtra', 
  location_country = 'India'
WHERE email = 'priya.sharma.demo@email.com' AND is_seed_data = true;

UPDATE public.profiles SET 
  location = 'Dubai, UAE',
  location_city = 'Dubai', 
  location_state = NULL, 
  location_country = 'United Arab Emirates'
WHERE email = 'ahmed.hassan.demo@email.com' AND is_seed_data = true;

UPDATE public.profiles SET 
  location = 'Barcelona, Spain',
  location_city = 'Barcelona', 
  location_state = 'Catalonia', 
  location_country = 'Spain'
WHERE email = 'elena.rodriguez.demo@email.com' AND is_seed_data = true;

UPDATE public.profiles SET 
  location = 'Vancouver, Canada',
  location_city = 'Vancouver', 
  location_state = 'British Columbia', 
  location_country = 'Canada'
WHERE email = 'james.wilson.demo@email.com' AND is_seed_data = true;

UPDATE public.profiles SET 
  location = 'Seoul, South Korea',
  location_city = 'Seoul', 
  location_state = NULL, 
  location_country = 'South Korea'
WHERE email = 'lisa.kim.demo@email.com' AND is_seed_data = true;

UPDATE public.profiles SET 
  location = 'São Paulo, Brazil',
  location_city = 'São Paulo', 
  location_state = 'São Paulo', 
  location_country = 'Brazil'
WHERE email = 'roberto.silva.demo@email.com' AND is_seed_data = true;

-- Add education data with correct programme_level values
INSERT INTO public.user_education (
  user_id, programme_level, programme_name, graduation_year, is_primary
) 
SELECT 
  p.user_id,
  CASE 
    WHEN p.course LIKE 'Master%' THEN 'Postgraduate'
    WHEN p.course LIKE 'Bachelor%' THEN 'Undergraduate'
    ELSE 'Undergraduate'
  END as programme_level,
  p.course as programme_name,
  p.graduation_year,
  true as is_primary
FROM public.profiles p 
WHERE p.is_seed_data = true;